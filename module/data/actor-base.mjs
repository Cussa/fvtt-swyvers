export default class SwyversActorBase extends foundry.abstract.TypeDataModel {

  static requiredInteger = { required: true, nullable: false, integer: true };
  static attributeProperty(fields) {
    return {
      value: new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 10, min: 0, max: 18 }),
      max: new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 10, min: 0, max: 18 })
    };
  };

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    schema.attributes = new fields.SchemaField({
      hp: new fields.SchemaField({ ...SwyversActorBase.attributeProperty(fields) }),
      fighting: new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 0, min: 0, max: 6 }),
    });

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