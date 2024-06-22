import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversSpellSheet extends SwyversItemSheet {
  /** @override **/
  async _prepareData(context) {
    super._prepareData(context);

    context.enriched.success = await TextEditor.enrichHTML(context.system.success, { async: true });
    context.enriched.empoweredSuccess = await TextEditor.enrichHTML(context.system.empoweredSuccess, { async: true });
    context.enriched.hearts = await TextEditor.enrichHTML(context.system.hearts, { async: true });
    context.enriched.spades = await TextEditor.enrichHTML(context.system.spades, { async: true });
    context.enriched.diamonds = await TextEditor.enrichHTML(context.system.diamonds, { async: true });
    context.enriched.clubs = await TextEditor.enrichHTML(context.system.clubs, { async: true });

    context.isGM = game.user.isGM;
  }
}