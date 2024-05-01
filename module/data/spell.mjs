import SwyversItemBase from "./item-base.mjs";
import { SWYVERS } from "../config/swyvers.mjs";

export default class SwyversSpell extends SwyversItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.suit = new fields.StringField({ required: true, blank: false, choices: SWYVERS.SPELL.SUIT, initial: SWYVERS.SPELL.SUIT.hearts.id });
    schema.success = new fields.StringField({ required: true, blank: false, initial: "17-20: " });
    schema.empoweredSuccess = new fields.StringField({ required: true, blank: false, initial: "21: " });
    schema.suitSuccess = new fields.StringField({ required: true, blank: false, initial: "SUIT: " });
    schema.available = new fields.BooleanField({ initial: true });

    return schema;
  }
}