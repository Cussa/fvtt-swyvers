import SwyversActorBase from "./actor-base.mjs";

export default class SwyversNPC extends SwyversActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.attributes.fields = foundry.utils.mergeObject(schema.attributes.fields, {
      appearing: new fields.StringField({ required: true, blank: false, initial: "1" }),
      hd: new fields.StringField({ required: true, blank: false, initial: "1" }),
      fighting: new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 0, min: 0, max: 20 }),
      morale: new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 0, min: 0, max: 20 }),
      movement: new fields.StringField({ required: true, blank: true }),
    });

    schema.defenseBonus = new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 0, min: -20, max: 20 });
    schema.initiativeBonus = new fields.NumberField({ ...SwyversActorBase.requiredInteger, initial: 0, min: 0, max: 20 });

    schema.attributes.fields.hp.fields.max.max = 100;
    schema.attributes.fields.hp.fields.value.max = 100;

    return schema
  }

  prepareDerivedData() {
  }
}