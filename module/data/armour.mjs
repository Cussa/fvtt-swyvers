import SwyversItemBase from "./item-base.mjs";
import { SWYVERS } from "../config/swyvers.mjs";

export default class SwyversArmour extends SwyversItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.damageSoak = new fields.StringField({ required: true, nullable: false, blank: false, initial: "1d4" });

    schema.type = new fields.StringField({ required: true, blank: false, choices: SWYVERS.ARMOUR.TYPE, initial: SWYVERS.ARMOUR.TYPE.light.id });
    schema.quality = new fields.StringField({
      required: true, blank: false, choices: SWYVERS.ARMOUR.QUALITY,
      initial: SWYVERS.ARMOUR.QUALITY.patchwork.id
    });

    schema.broken = new fields.BooleanField({ initial: false });
    schema.equipped = new fields.BooleanField({ initial: false });
    
    /**@override */
    schema.slots = new fields.NumberField({ ...SwyversItemBase.requiredInteger, initial: 2, min: 1 });

    return schema;
  }
}