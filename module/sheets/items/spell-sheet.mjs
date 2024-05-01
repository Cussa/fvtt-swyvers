import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversSpellSheet extends SwyversItemSheet {
  /** @override **/
  _prepareData(context) {
    context.spellSuit = this._labelOptions(CONFIG.SWYVERS.SPELL.SUIT);

    context.selectedSuit = game.i18n.localize(context.spellSuit[context.system.suit]);
  }
}