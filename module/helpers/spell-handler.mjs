const ACTION = {
  hit: "hit",
  stand: "stand"
};

export default class SpellHandler {
  static chatTemplate = "systems/swyvers/templates/chat/spell.hbs";

  async _getDeck() {
    const magicDeckId = await game.settings.get("swyvers", "magicDeckId");
    return await game.cards?.get(magicDeckId);
  }
  async _getPile() {
    const magicPileId = await game.settings.get("swyvers", "magicPileId");
    return await game.cards?.get(magicPileId);
  }

  async _createHandForSpell(spell) {
    let data = {
      name: `${spell.actor.name} - ${spell.name}`,
      type: "hand"
    };
    const cardsCls = getDocumentClass('Cards');
    const newDeck = await cardsCls.create(data);
    return newDeck;
  }

  async _buyCard(hand, numberOfCards) {
    const deck = await this._getDeck();
    await deck.deal([hand], Math.min(deck.availableCards.length, numberOfCards), { how: CONST.CARD_DRAW_MODES.RANDOM, chatNotification: false });
    return deck.availableCards.length;
  }

  async startCasting(spell) {
    const hand = await this._createHandForSpell(spell);

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
          handId: hand.uuid
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
    let allCards = []

    for (const card of hand.cards) {
      let value = Math.min(card.value, 10);
      if (value == 1) {
        numberOfAces++;
        value = 11;
      }
      total += value;
      allCards.push({
        card,
        value
      })
    }

    while (total > 21 && numberOfAces > 0) {
      total -= 10;
      numberOfAces--;
    }

    stand = stand || total > 21 || availableCards == 0;
    let suitSuccess = false;

    const cardImages = allCards.map(it => it.card.faces[0].img);

    if (stand) {
      suitSuccess = this._getSuitSuccess(allCards, spell, numberOfAces);
      await this._finishCasting(hand);
      if (total < 17)
        await spell.update({ "system.available": false });
    }

    const message = game.i18n.format(!stand && total < 22 ? "SWYVERS.Spell.CurrentTotal" : "SWYVERS.Spell.FinalTotal", { total: total });
    const enriched = {
      description: await TextEditor.enrichHTML(spell.system.description, { async: true }),
      success: await TextEditor.enrichHTML(spell.system.success, { async: true }),
      empoweredSuccess: await TextEditor.enrichHTML(spell.system.empoweredSuccess, { async: true }),
      suitSuccess: await TextEditor.enrichHTML(spell.system.suitSuccess, { async: true }),
    };

    spell.suitSymbol = game.i18n.localize(`SWYVERS.Spell.SuitSymbol.${spell.system.suit}`);

    return await renderTemplate(SpellHandler.chatTemplate, {
      spell,
      total,
      cardImages,
      failure: stand && total < 17,
      success: stand && total >= 17 && total < 21,
      criticalSuccess: stand && total == 21,
      suitSuccess,
      criticalFailure: stand && total > 21,
      continue: !stand,
      magicDepleted: availableCards == 0,
      enriched,
      message
    });
  }

  async _finishCasting(hand) {
    if (hand.availableCards.length == 0)
      return;
    const pile = await this._getPile();
    await hand.deal([pile], hand.availableCards.length, { chatNotification: false });
    await hand.delete({ chatNotification: false });
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

  _getSuitSuccess(cards, spell, numberOfAces) {
    if (spell.actor.system.magicKnowledge == 0)
      return false;

    const sortedValues = new Set(cards.sort((a, b) => b.value - a.value).map(it => it.value));
    let [highest] = sortedValues;
    if (highest == 11 && numberOfAces == 0)
      sortedValues.delete(11);

    [highest] = sortedValues;
    const highestSuit = cards.filter(it => it.value == highest).map(it => it.card.suit);
    return highestSuit.indexOf(spell.system.suit) > -1;
  }
}