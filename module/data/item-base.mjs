export default class SwyversItemBase extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    const requiredInteger = { required: true, nullable: false, integer: true };

    schema.description = new fields.StringField({ required: true, blank: true });

    const coinInfo = { required: true, nullable: false, integer: true, initial: 0, min: 0 };
    schema.price = new fields.SchemaField({
      pound: new fields.NumberField({ ...coinInfo }),
      shilling: new fields.NumberField({ ...coinInfo }),
      pence: new fields.NumberField({ ...coinInfo }),
    });
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.slots = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });

    schema.canStack = new fields.BooleanField({ initial: false });

    return schema;
  }
}