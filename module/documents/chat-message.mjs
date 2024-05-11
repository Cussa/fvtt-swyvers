import SpellHandler from "../helpers/spell-handler.mjs";

export default class SwyversChatMessage extends ChatMessage {
  async getHTML(...args) {
    const html = await super.getHTML();

    if (!this.flags?.swyvers?.spellId)
      return html;

    let actor = game.actors.get(this.speaker.actor);
    if (game.user.isGM || actor?.isOwner || (this.user.id === game.user.id)) {
      html.find(".spell-chat-click").each((_, bt) => {
        bt.addEventListener("click", async (event) => await new SpellHandler().processEvent(event));
      });
      return html;
    }

    html.find(".spell .buttons").hide();
    return html;
  }
}