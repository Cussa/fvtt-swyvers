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

    schema.clubs = new fields.StringField({ required: false, blank: true });
    schema.hearts = new fields.StringField({ required: false, blank: true });
    schema.diamonds = new fields.StringField({ required: false, blank: true });
    schema.spades = new fields.StringField({ required: false, blank: true });

    schema.available = new fields.BooleanField({ initial: true });

    return schema;
  }

  async pushSuidData(suit, html) {
    if (this[suit]) {
      html.push(this[suit].replace("<p>", `<p>${game.i18n.localize(`SWYVERS.Spell.SuitSymbol.${suit}`)}: `))
    }
  }

  async getCardData() {
    let html = [];
    html.push(this.description);
    html.push(this.success.replace("<p>", "<p>17-20: "));
    html.push(this.empoweredSuccess.replace("<p>", "<p>21: "));

    await this.pushSuidData("clubs", html);
    await this.pushSuidData("hearts", html);
    await this.pushSuidData("diamonds", html);
    await this.pushSuidData("spades", html);

    return await TextEditor.enrichHTML(html.join(""), { async: true });
  }

  async roll() {
    await new SpellHandler().startCasting(this.parent);
  }
}