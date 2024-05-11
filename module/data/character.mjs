import SwyversActorBase from "./actor-base.mjs";

export default class SwyversCharacter extends SwyversActorBase {


  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.attributes.fields = foundry.utils.mergeObject(schema.attributes.fields, {
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 0 })
      }),
      con: new fields.SchemaField({ ...SwyversActorBase.attributeProperty(fields) }),
      dex: new fields.SchemaField({ ...SwyversActorBase.attributeProperty(fields) }),
      str: new fields.SchemaField({ ...SwyversActorBase.attributeProperty(fields) }),
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