import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversSkillSheet extends SwyversItemSheet {
  /** @override **/
  _prepareData(context) {
    context.skillAttribute = this._labelOptions(CONFIG.SWYVERS.SKILL.ATTRIBUTES);
  }
}