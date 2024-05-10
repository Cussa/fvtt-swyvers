const ACTION = {
  hit: "hit",
  stand: "stand"
};

export default class SpellHandler {

  static chatTemplate = "systems/swyvers/templates/chat/spell.hbs";

  async _getDeck() {
    return await fromUuid("Cards.puTA3BOlSa44JiR2");
  }
  async _getPile() {
    return await fromUuid("Cards.ETF01kryKUF8iIg1");
  }

  async _buyCard(hand, numberOfCards) {
    const deck = await this._getDeck();
    await deck.deal([hand], Math.min(deck.availableCards.length, numberOfCards), { how: CONST.CARD_DRAW_MODES.RANDOM, chatNotification: false });
    return deck.availableCards.length;
  }

  async startCasting(spell) {
    const actor = spell.actor;
    let hand = await fromUuid(actor.system.handId);

    const availableCards = await this._buyCard(hand, 2);

    const content = await this._processResult(spell, hand, availableCards, false);

    const chatData = {
      speaker: {
        actor: spell.actor
      },
      user: game.user.id,
      content: content,
      flags: {
        swyvers: {
          spellId: spell.uuid,
          handId: actor.system.handId
        }
      }
    };
    await ChatMessage.create(chatData);
  }

  async processEvent(event) {
    event.preventDefault();

    const element = event.currentTarget;
    const messageDiv = $(element).closest(".chat-message.message");
    const message = await game.messages.get(messageDiv.data("messageId"));
    const data = message.flags.swyvers;
    const spell = await fromUuid(data.spellId);
    const hand = await fromUuid(data.handId);

    let newContent = $(message.content);

    const dataset = element.dataset;
    if (dataset.action == ACTION.hit)
      newContent = await this._hit(spell, hand);
    else if (dataset.action == ACTION.stand)
      newContent = await this._stand(spell, hand);

    await message.update({ content: newContent });
  }

  async _hit(spell, hand) {
    const availableCards = await this._buyCard(hand, 1);
    return this._processResult(spell, hand, availableCards, false);
  }

  async _stand(spell, hand) {
    const deck = await this._getDeck();
    const content = this._processResult(spell, hand, deck.availableCards.length, true);
    return content;
  }

  async _processResult(spell, hand, availableCards, stand = false) {
    let total = 0;
    let numberOfAces = 0;
    let cardImages = [];

    for (const card of hand.cards) {
      let value = Math.min(card.value, 10);
      if (value == 1) {
        numberOfAces++;
        value = 11;
      }
      total += value;
      cardImages.push(card.faces[0].img);
    }

    while (total > 21 && numberOfAces > 0) {
      total -= 10;
      numberOfAces--;
    }

    stand = stand || total > 21 || availableCards == 0;

    if (stand) {
      await this._finishCasting(hand);
      if (total < 17)
        await spell.update({ "system.available": false });
    }

    const message = game.i18n.format(!stand && total < 22 ? "SWYVERS.Spell.CurrentTotal" : "SWYVERS.Spell.FinalTotal", { total: total });

    return await renderTemplate(SpellHandler.chatTemplate, {
      spell,
      total,
      cardImages,
      failure: stand && total < 17,
      success: stand && total >= 17 && total < 21,
      criticalSuccess: stand && total == 21,
      criticalFailure: stand && total > 21,
      continue: !stand,
      magicDepleted: availableCards == 0,
      message
    });
  }

  async _finishCasting(hand) {
    if (hand.availableCards.length == 0)
      return;
    const pile = await this._getPile();
    await hand.deal([pile], hand.availableCards.length, { chatNotification: false });
  }

  async resetDay() {
    const deck = await this._getDeck();
    deck.recall({ chatNotification: false });

    for (const actor of game.actors) {
      for (const spell of actor.items.filter(it => it.type == "spell" && !it.system.available)) {
        await spell.update({ "system.available": true });
      }
    }
  }
}