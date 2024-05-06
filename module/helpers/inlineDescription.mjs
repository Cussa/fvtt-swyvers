import { SWYVERS } from "../config/swyvers.mjs";

export function getInlineDescriptor(item) {
  switch (item.type) {
    case "weapon":
      return _getInlineDescriptorWeapon(item);
    case "armour":
      return _getInlineDescriptorArmour(item);
    default:
      return "";
  }
}

function _getInlineDescriptorWeapon(weapon) {
  let info = [];
  info.push(game.i18n.localize(SWYVERS.WEAPON.QUALITY[weapon.system.quality].label));
  info.push(weapon.system.damage);
  info.push(game.i18n.localize(SWYVERS.WEAPON.LENGTH[weapon.system.length].label));
  info.push(weapon.system.twoHands ? "2h" : "1h");
  if (weapon.system.set)
    info.push(game.i18n.localize("SWYVERS.Weapon.Set"));
  if (weapon.system.reach)
    info.push(game.i18n.localize("SWYVERS.Weapon.Reach"));
  if (weapon.system.halfswording)
    info.push(game.i18n.localize("SWYVERS.Weapon.Halfswording"));
  if (weapon.system.armourPiercing)
    info.push(game.i18n.localize("SWYVERS.Weapon.ArmourPiercing"));
  if (weapon.system.thrust)
    info.push(game.i18n.localize("SWYVERS.Weapon.Thrust"));
  return `${info.join(", ")}`;
}

function _getInlineDescriptorArmour(armour) {
  let info = [];
  info.push(game.i18n.localize(SWYVERS.ARMOUR.QUALITY[armour.system.quality].label));
  info.push(armour.system.damageSoak);
  return `${info.join(", ")}`;
}