import * as ARMOUR from "./armour.mjs";
import * as CHARACTER from "./character.mjs";
import * as COMBAT from "./combat.mjs";
import * as SKILL from "./skill.mjs";
import * as SPELL from "./spell.mjs";
import * as WEAPON from "./weapon.mjs";
import * as CONTAINER from "./container.mjs";
import * as CURRENCY from "./currency.mjs";

export const SWYVERS = {
  ARMOUR,
  CHARACTER,
  COMBAT,
  CONTAINER,
  CURRENCY,
  SKILL,
  SPELL,
  WEAPON
}

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
SWYVERS.abilities = {
  str: 'SWYVERS.Ability.Str.long',
  dex: 'SWYVERS.Ability.Dex.long',
  con: 'SWYVERS.Ability.Con.long',
  int: 'SWYVERS.Ability.Int.long',
  wis: 'SWYVERS.Ability.Wis.long',
  cha: 'SWYVERS.Ability.Cha.long',
};

SWYVERS.abilityAbbreviations = {
  str: 'SWYVERS.Ability.Str.abbr',
  dex: 'SWYVERS.Ability.Dex.abbr',
  con: 'SWYVERS.Ability.Con.abbr',
  int: 'SWYVERS.Ability.Int.abbr',
  wis: 'SWYVERS.Ability.Wis.abbr',
  cha: 'SWYVERS.Ability.Cha.abbr',
};