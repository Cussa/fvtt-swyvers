import { SwyversItemSheet } from "../item-sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {SwyversItemSheet}
 */
export default class SwyversWeaponSheet extends SwyversItemSheet {
  /** @override **/
  _prepareData(context) {
    super._prepareData(context);
    context.weaponLength = this._labelOptions(CONFIG.SWYVERS.WEAPON.LENGTH);
    context.weaponAmmoType = this._labelOptions(CONFIG.SWYVERS.WEAPON.AMMO_TYPES);
    context.weaponQuality = this._labelOptions(CONFIG.SWYVERS.WEAPON.QUALITY);
    context.hands = {
      groupName: "system.twoHands",
      choices: { false: "SWYVERS.Weapon.OneHand", true: "SWYVERS.Weapon.TwoHands" },
      selected: String(context.system.twoHands)
    };
  }
}