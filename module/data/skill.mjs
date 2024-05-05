import SwyversItemBase from "./item-base.mjs";
import { SWYVERS } from "../config/swyvers.mjs";
import { roll } from "../helpers/rolls.mjs";

export default class SwyversSkill extends SwyversItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.value = new fields.NumberField({ ...SwyversItemBase.requiredInteger, initial: 0, min: 0 });
    schema.attribute = new fields.StringField({ required: true, blank: false, choices: SWYVERS.SKILL.ATTRIBUTES, initial: SWYVERS.SKILL.ATTRIBUTES.uncertain.id });

    delete schema.container;

    return schema;
  }

  async roll(under) {
    await roll(this.parent, under);
  }

  async getCardData() {
    return await TextEditor.enrichHTML(`<p class="item-name">${this.parent.name}</p>${this.description}`, { async: true });
  }
}