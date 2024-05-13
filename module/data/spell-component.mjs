import SwyversItemBase from "./item-base.mjs";
export default class SwyversSpellComponent extends SwyversItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.cardInfo = new fields.StringField({ required: true, blank: true });
    schema.showInfo = new fields.BooleanField({ initial: false });

    return schema;
  }
}