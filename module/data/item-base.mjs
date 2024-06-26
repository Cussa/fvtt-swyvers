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

    schema.containerOptions = new fields.SchemaField({
      equipped: new fields.BooleanField({ initial: false }),
      belt: new fields.BooleanField({ initial: false }),
      backpack: new fields.BooleanField({ initial: true }),
      backpackExternal: new fields.BooleanField({ initial: false }),
      sack: new fields.BooleanField({ initial: false }),
    });
    schema.equipped = new fields.BooleanField({ initial: false });

    schema.container = new fields.StringField({ required: true, blank: false, choices: SWYVERS.CONTAINER.CONFIGURATIONS, initial: SWYVERS.CONTAINER.CONFIGURATIONS.notCarried.id });

    schema.category = new fields.StringField({ required: false, blank: true });

    return schema;
  }

  async roll() {
    console.warn("Item-base should not use the roll. Check the implementation for the custom type");
  }

  async getCardData() {
    return await TextEditor.enrichHTML(`<p class="item-name">${this.parent.name}</p>${this.description}`, { async: true });
  }
}