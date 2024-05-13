import SpellHandler from "../../helpers/spell-handler.mjs";
import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversSpellComponentSheet extends SwyversItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['swyvers', 'sheet', 'item', "spell-component"],
      width: 620,
    });
  }
  get template() {
    return `systems/swyvers/templates/item/item-spell-component-sheet.hbs`;
  }

  /** @override **/
  async _prepareData(context) {
    super._prepareData(context);

    let shouldSeeCardInfo = false;
    let img = context.item.img;
    if (game.user.isGM || (this.item.isEmbedded && this.item.actor.system.magicKnowledge >= 2 && this.item.system.showInfo)) {
      shouldSeeCardInfo = true;
      const deck = await SpellHandler.getDeck();
      context.suitChoice = deck.cards.filter(it => it.value <= 10).map(it => ({ id: `${it.value}-${it.suit}`, label: it.name }));

      if (context.item.system.cardInfo) {
        const selectedId = context.item.system.cardInfo.split("-");
        const selectedCard = deck.cards.filter(it => it.value == selectedId[0] && it.suit == selectedId[1])[0];
        img = selectedCard.faces[0].img;
      }
    }
    context.img = img;
    context.shouldSeeCardInfo = shouldSeeCardInfo;
    context.isGM = game.user.isGM;
  }
}