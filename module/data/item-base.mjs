import { SWYVERS } from "../config/swyvers.mjs";

export default class SwyversItemBase extends foundry.abstract.TypeDataModel {

  static requiredInteger = { required: true, nullable: false, integer: true };

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    const coinInfo = { required: true, nullable: false, integer: true, initial: 0, min: 0 };
    schema.price = new fields.SchemaField({
      pound: new fields.NumberField({ ...coinInfo }),
      shilling: new fields.NumberField({ ...coinInfo }),
      pence: new fields.NumberField({ ...coinInfo }),
    });
    schema.quantity = new fields.NumberField({ ...SwyversItemBase.requiredInteger, initial: 1, min: 1 });
    schema.slots = new fields.NumberField({ ...SwyversItemBase.requiredInteger, initial: 1, min: 1 });

    schema.maxStack = new fields.NumberField({ ...SwyversItemBase.requiredInteger, initial: 1, min: 1 });

    schema.container = new fields.StringField({ required: true, blank: false, choices: SWYVERS.CONTAINER.CONFIGURATIONS, initial: SWYVERS.CONTAINER.CONFIGURATIONS.notCarried.id });

    return schema;
  }
}