import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversSpellSheet extends SwyversItemSheet {
  /** @override **/
  async _prepareData(context) {
    super._prepareData(context);

    context.spellSuit = this._labelOptions(CONFIG.SWYVERS.SPELL.SUIT);

    context.selectedSuit = game.i18n.localize(context.spellSuit[context.system.suit]);

    context.enriched.success = await TextEditor.enrichHTML(context.system.success, { async: true });
    context.enriched.empoweredSuccess = await TextEditor.enrichHTML(context.system.empoweredSuccess, { async: true });
    context.enriched.suitSuccess = await TextEditor.enrichHTML(context.system.suitSuccess, { async: true });

    context.isGM = game.user.isGM;
  }
}