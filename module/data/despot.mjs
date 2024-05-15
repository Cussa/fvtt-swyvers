import SwyversItemBase from "./item-base.mjs";
export default class SwyversDespot extends SwyversItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.cardInfo = new fields.StringField({ required: true, blank: true });

    return schema;
  }
}