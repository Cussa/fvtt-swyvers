import SwyversActorBase from "./actor-base.mjs";

export default class SwyversCharacter extends SwyversActorBase {

  static requiredInteger = { required: true, nullable: false, integer: true };

  static attributeProperty(fields) {
    return {
      value: new fields.NumberField({ ...SwyversCharacter.requiredInteger, initial: 10, min: 0, max: 18 }),
      max: new fields.NumberField({ ...SwyversCharacter.requiredInteger, initial: 10, min: 0, max: 18 })
    };
  };

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 })
      }),
      con: new fields.SchemaField({ ...SwyversCharacter.attributeProperty(fields) }),
      dex: new fields.SchemaField({ ...SwyversCharacter.attributeProperty(fields) }),
      str: new fields.SchemaField({ ...SwyversCharacter.attributeProperty(fields) }),
      hp: new fields.SchemaField({ ...SwyversCharacter.attributeProperty(fields) }),
      fighting: new fields.NumberField({ ...SwyversCharacter.requiredInteger, initial: 0, min: 0, max: 6 }),
      literated: new fields.BooleanField({ initial: false }),
      literatedReason: new fields.StringField({ required: false, blank: true }),
    });

    schema.special = new fields.StringField({ required: false, blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.SWYVERS.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}