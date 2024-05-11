export default class SwyversToken extends TokenDocument {
  async _preCreate(_data, _options, _user) {
    if (this.actor.type == "character")
      return;

    const roll = await new Roll(this.actor.system.attributes.hd).roll({ async: true });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    }, { rollMode: CONST.DICE_ROLL_MODES.PRIVATE });
    console.log(roll);

    await this.updateSource({ "delta.system.attributes.hp.max": roll.total, "delta.system.attributes.hp.value": roll.total, });
  }
}