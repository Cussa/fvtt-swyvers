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

  async startCasting(spell) {
    const actor = spell.actor;
    let hand = await fromUuid(actor.system.handId);

    const deck = await this._getDeck();

    await deck.deal([hand], 2, { how: CONST.CARD_DRAW_MODES.RANDOM, chatNotification: false });

    const content = await this._processResult(spell, hand, false);

    const chatData = {
      speaker: ChatMessage.getSpeaker(),
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

    console.log(newContent, newContent[0].outerHTML);

    await message.update({ content: newContent });
  }

  async _hit(spell, hand) {
    const deck = await this._getDeck();
    await deck.deal([hand], 1, { how: CONST.CARD_DRAW_MODES.RANDOM, chatNotification: false });

    return this._processResult(spell, hand, false);
  }

  async _stand(spell, hand) {
    const content = this._processResult(spell, hand, true);
    await this._finishCasting(hand);
    return content;
  }

  async _processResult(spell, hand, stand = false) {
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

    if (total > 21) {
      await this._finishCasting(hand);
      stand = true;
    }

    if (stand && total < 17) {
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
      message
    });
  }

  async _finishCasting(hand) {
    const pile = await this._getPile();
    await hand.deal([pile], Array.from(hand.cards).length, { chatNotification: false });
  }

  async resetDay() {
    const deck = await this._getDeck();
    deck.recall({ chatNotification: false });

    for (const actor of game.actors) {
      for (const spell of actor.items.filter(it => it.type == "spell" && !it.system.available)) {
        console.log(spell);
        await spell.update({ "system.available": true });
      }
    }
  }
}