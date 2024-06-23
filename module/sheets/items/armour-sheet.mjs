import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversArmourSheet extends SwyversItemSheet {
  /** @override **/
  _prepareData(context) {
    context.armourType = this._labelOptions(CONFIG.SWYVERS.ARMOUR.TYPE);
    context.armourQuality = this._labelOptions(CONFIG.SWYVERS.ARMOUR.QUALITY);
    context.canBeEquipped = context.system.containerOptions.equipped;
  }
}