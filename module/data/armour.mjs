import SwyversItemBase from "./item-base.mjs";
import { SWYVERS } from "../config/swyvers.mjs";
import { rollSoakDamage } from "../helpers/rolls.mjs";

export default class SwyversArmour extends SwyversItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.damageSoak = new fields.StringField({ required: true, nullable: true, blank: true, initial: "1d4" });

    schema.type = new fields.StringField({ required: true, blank: false, choices: SWYVERS.ARMOUR.TYPE, initial: SWYVERS.ARMOUR.TYPE.light.id });
    schema.quality = new fields.StringField({
      required: true, blank: false, choices: SWYVERS.ARMOUR.QUALITY,
      initial: SWYVERS.ARMOUR.QUALITY.patchwork.id
    });

    schema.broken = new fields.BooleanField({ initial: false });
    
    /**@override */
    schema.slots = new fields.NumberField({ ...SwyversItemBase.requiredInteger, initial: 2, min: 1 });

    return schema;
  }

  async roll(_) {
    await rollSoakDamage(this.parent);
  }

  async getCardData() {
    let cardData = `<p class="item-name">${this.parent.name}</p>${this.description}`;
    cardData += `<p><strong>Quality: </strong>${game.i18n.localize(SWYVERS.ARMOUR.QUALITY[this.quality].label)}</p>`;
    cardData += `<p><strong>Soak Dice (Damage Soak): </strong>${this.damageSoak}</p>`;
    return await TextEditor.enrichHTML(cardData, { async: true });
  }
}