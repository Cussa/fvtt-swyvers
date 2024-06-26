import SwyversItemBase from "./item-base.mjs";
import { SWYVERS } from "../config/swyvers.mjs";
import { rollDamage } from "../helpers/rolls.mjs";

export default class SwyversWeapon extends SwyversItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.damage = new fields.StringField({ required: true, nullable: false, blank: false, initial: "1d4" });

    schema.length = new fields.StringField({ required: true, blank: false, choices: SWYVERS.WEAPON.LENGTH, initial: SWYVERS.WEAPON.LENGTH.short.id });
    schema.quality = new fields.StringField({ required: true, blank: false, choices: SWYVERS.WEAPON.QUALITY, initial: SWYVERS.WEAPON.QUALITY.ropey.id });

    schema.ammoType = new fields.StringField({ required: true, choices: SWYVERS.WEAPON.AMMO_TYPES, initial: "none" });

    schema.twoHands = new fields.BooleanField({ initial: false });
    schema.set = new fields.BooleanField({ initial: false });
    schema.reach = new fields.BooleanField({ initial: false });
    schema.halfswording = new fields.BooleanField({ initial: false });
    schema.armourPiercing = new fields.BooleanField({ initial: false });
    schema.thrust = new fields.BooleanField({ initial: false });
    schema.defense = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 1 });
    schema.initiative = new fields.StringField({ required: true, choices: SWYVERS.COMBAT.INITIATIVE, initial: SWYVERS.COMBAT.INITIATIVE.shortWeapon.id });

    return schema;
  }

  async roll(_) {
    await rollDamage(this.parent);
  }

  async getCardData() {
    let cardData = `<p class="item-name">${this.parent.name}</p>${this.description}`;
    cardData += `<p><strong>Quality: </strong>${game.i18n.localize(SWYVERS.WEAPON.QUALITY[this.quality].label)}</p>`;
    cardData += `<p><strong>Damage: </strong>${this.damage}</p>`;
    return await TextEditor.enrichHTML(cardData, { async: true });
  }
}