import SwyversItemBase from "./item-base.mjs";
import { SWYVERS } from "../config/swyvers.mjs";
import SpellHandler from "../helpers/spell-handler.mjs";

export default class SwyversSpell extends SwyversItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.suit = new fields.StringField({ required: true, blank: false, choices: SWYVERS.SPELL.SUIT, initial: SWYVERS.SPELL.SUIT.hearts.id });
    schema.success = new fields.StringField({ required: true, blank: false, initial: "17-20: " });
    schema.empoweredSuccess = new fields.StringField({ required: true, blank: false, initial: "21: " });
    schema.suitSuccess = new fields.StringField({ required: true, blank: false, initial: "SUIT: " });
    schema.available = new fields.BooleanField({ initial: true });

    delete schema.container;

    return schema;
  }

  async getCardData() {
    let html = [];
    html.push(this.description);
    html.push(this.success.replace("<p>", "<p>17-20: "));
    html.push(this.empoweredSuccess.replace("<p>", "<p>21: "));
    html.push(this.suitSuccess.replace("<p>", `<p>${game.i18n.localize(`SWYVERS.Spell.SuitSymbol.${i.system.suit}`)}: `));

    return await TextEditor.enrichHTML(html.join(""), { async: true });
  }

  async castSpell(){
    await new SpellHandler().startCasting(this.parent);
  }
}