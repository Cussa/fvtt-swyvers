export default class SwyversActorBase extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    //TODO: remove
    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 })
    });
    schema.power = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 5 })
    });
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields
    schema.handId = new fields.StringField({ required: false, blank: true });

    return schema;
  }

  async getAttributeModifier(attribute) {
    switch (attribute) {
      case "dex":
        return this.getDexModifier();
      case "con":
        return this.getConModifier();
      case "str":
        return this.getStrModifier();
      default:
        return 0;
    }
  }

  async getDexModifier() {
    let dexModifier = this.attributes.dex.mod ?? 0;
    dexModifier += -Math.max(this.parent.items.filter(it => !it.system.equipped && it.system.container == "backpack").length - 10, 0);
    return dexModifier;
  }

  async getConModifier() {
    return this.attributes.con.mod ?? 0;
  }

  async getStrModifier() {
    return this.attributes.str.mod ?? 0;
  }
}