const ACTION = {
  hit: "hit",
  stand: "stand"
};

export default class SpellHandler {
  static chatTemplate = "systems/swyvers/templates/chat/spell.hbs";

  static async getDeck() {
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
    const deck = await SpellHandler.getDeck();
    await deck.deal([hand], Math.min(deck.availableCards.length, numberOfCards), { how: CONST.CARD_DRAW_MODES.RANDOM, chatNotification: false });
    return deck.availableCards.length;
  }

  async _getExtraCards(actor) {
    if (actor.system.magicKnowledge < 2)
      return [null, null];

    const deck = await SpellHandler.getDeck();

    const allCards = deck.cards.map(it => ({ id: it._id, info: `${it.value}-${it.suit}`, label: `${it.name}` }));
    const components = actor.items.filter(sc => sc.type == "spellComponent" && sc.system.showInfo);
    const spellComponents = components.map(it => {
      let currentCard = allCards.filter(c => c.info == it.system.cardInfo)[0];
      return {
        id: currentCard.id,
        label: `${it.name} - ${currentCard.label}`,
        itemId: it._id
      }
    });

    let actorItems = actor.items.filter(it => it.type == "despot");
    let actorDespot = actorItems.length > 0 ? actorItems[0] : null;
    let deckDespotCard = null;
    if (actor.system.magicKnowledge == 3 && actorDespot) {
      deckDespotCard = allCards.filter(c => c.info == actorDespot.system.cardInfo)[0];
      deckDespotCard.itemName = `${deckDespotCard.label} <em>${actorDespot.name}</em>`;
    }

    if (spellComponents.length == 0 && deckDespotCard == null)
      return [null, null];

    const showSeparator = spellComponents.length > 0 && deckDespotCard;
    const content = await renderTemplate("systems/swyvers/templates/dialog/spell-extra-cards.hbs", {
      spellComponents,
      deckDespotCard,
      showSeparator
    });

    let extraCards = await Dialog.wait({
      title: game.i18n.localize("SWYVERS.Spell.ExtraCards"),
      content: content,
      buttons: {
        select: {
          label: "Select", callback: async (html) => {

            let spellComponentSelected = null;

            let spellComponentSelect = html.find("#spellComponent");
            if (spellComponentSelect.length) {
              spellComponentSelect = spellComponentSelect[0];

              spellComponentSelected = spellComponentSelect.value ? deck.cards.get(spellComponentSelect.value) : null;
              if (spellComponentSelected) {
                const backImg = spellComponentSelected.back.img;
                spellComponentSelected = spellComponentSelected.toObject();
                spellComponentSelected.back.img = backImg;


                const selectedValueFromDrop = spellComponents.filter(it => it.id == spellComponentSelect.value)[0]
                const spellComponentItem = actor.items.get(selectedValueFromDrop.itemId);

                spellComponentSelected.itemName = selectedValueFromDrop.label;
                await spellComponentItem.delete();
              }
            }

            const deckDespotItemName = deckDespotCard?.itemName;
            const checkboxDespot = html.find("#despot")?.is(":checked");
            deckDespotCard = checkboxDespot ? deck.cards.get(deckDespotCard.id) : null;
            if (deckDespotCard) {
              const backImg = deckDespotCard.back.img;
              deckDespotCard = deckDespotCard.toObject();
              deckDespotCard.back.img = backImg;

              deckDespotCard.itemName = deckDespotItemName;
            }

            return [deckDespotCard, spellComponentSelected];
          }
        },
      },
      close: () => [null, null]
    });

    return extraCards;
  }

  async startCasting(spell) {
    const hand = await this._createHandForSpell(spell);
    let cardsToBuy = 2;
    const extraCards = await this._getExtraCards(spell.actor);

    for (const card of extraCards) {
      if (card == null)
        continue;

      console.log(card);
      const newCard = await Card.create(card, { parent: hand });
      await newCard.setFlag("swyvers", "itemName", card.itemName);
      cardsToBuy--;
    }

    const availableCards = await this._buyCard(hand, cardsToBuy);

    const [content, description] = await this._processResult(spell, hand, availableCards, false);

    const chatData = {
      speaker: {
        actor: spell.actor
      },
      user: game.user.id,
      content: content,
      flags: {
        swyvers: {
          spellId: spell.uuid,
          handId: hand.uuid,
          description: description
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
    let discard = undefined;

    const dataset = element.dataset;
    if (dataset.action == ACTION.hit)
      [newContent, discard] = await this._hit(spell, hand, data.description);
    else if (dataset.action == ACTION.stand)
      [newContent, discard] = await this._stand(spell, hand, data.description);

    await message.update({ content: newContent });
  }

  async _hit(spell, hand, description) {
    const availableCards = await this._buyCard(hand, 1);
    return this._processResult(spell, hand, availableCards, false, description);
  }

  async _stand(spell, hand, description) {
    const deck = await SpellHandler.getDeck();
    const content = this._processResult(spell, hand, deck.availableCards.length, true, description);
    return content;
  }

  async _processResult(spell, hand, availableCards, stand = false, description = undefined) {
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
    let suitSuccess = [];

    const cardImages = allCards.map(it => it.card.faces[0].img);
    const extraCards = hand.cards.filter(it => it.flags.swyvers?.itemName).map(it => it.flags.swyvers?.itemName);

    if (stand) {
      suitSuccess = this._getSuitSuccess(allCards, spell, numberOfAces, total);
      await this._finishCasting(hand);
      if (total < 17)
        await spell.update({ "system.available": false });
    }

    const message = game.i18n.format(!stand && total < 22 ? "SWYVERS.Spell.CurrentTotal" : "SWYVERS.Spell.FinalTotal", { total: total });
    const enriched = {
      description: description || await TextEditor.enrichHTML(spell.system.description, { async: true }),
      success: await TextEditor.enrichHTML(spell.system.success, { async: true }),
      empoweredSuccess: await TextEditor.enrichHTML(spell.system.empoweredSuccess, { async: true })
    };

    let suitSuccessList = [];
    for (const suit of suitSuccess) {
      const suitInfo = {
        symbol: game.i18n.localize(`SWYVERS.Spell.SuitSymbol.${suit}`),
        effect: await TextEditor.enrichHTML(spell.system[suit], { async: true }),
      }
      suitSuccessList.push(suitInfo);
    }

    return [await renderTemplate(SpellHandler.chatTemplate, {
      spell,
      total,
      cardImages,
      failure: stand && total < 17,
      success: stand && total >= 17 && total < 21,
      criticalSuccess: stand && total == 21,
      suitSuccessList,
      criticalFailure: stand && total > 21,
      continue: !stand,
      magicDepleted: availableCards == 0,
      enriched,
      extraCards,
      message
    }), enriched.description];
  }

  async _finishCasting(hand) {
    if (hand.availableCards.length == 0)
      return;

    const extraCards = hand.cards.filter(it => it.origin == null);
    for (const card of extraCards) {
      await card.delete();
    }

    const pile = await this._getPile();
    await hand.deal([pile], hand.availableCards.length, { chatNotification: false });
    await hand.delete({ chatNotification: false });
  }

  async resetDay() {
    const deck = await SpellHandler.getDeck();
    deck.recall({ chatNotification: false });

    for (const actor of game.actors) {
      for (const spell of actor.items.filter(it => it.type == "spell" && !it.system.available)) {
        await spell.update({ "system.available": true });
      }
    }
  }

  _getSuitSuccess(cards, spell, numberOfAces, total) {
    if (spell.actor.system.magicKnowledge == 0 || total >= 22)
      return [];

    const sortedValues = new Set(cards.sort((a, b) => b.value - a.value).map(it => it.value));
    let [highest] = sortedValues;
    if (highest == 11 && numberOfAces == 0)
      sortedValues.delete(11);

    [highest] = sortedValues;
    const highestSuit = cards.filter(it => it.value == highest).map(it => it.card.suit);

    let availableSuits = [];
    if (spell.system.hearts)
      availableSuits.push("hearts");
    if (spell.system.spades)
      availableSuits.push("spades");
    if (spell.system.diamonds)
      availableSuits.push("diamonds");
    if (spell.system.clubs)
      availableSuits.push("clubs");

    const intersection = highestSuit.filter(value => availableSuits.includes(value));
    console.log(intersection);
    return intersection;
  }
}