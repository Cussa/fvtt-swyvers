export class SwyversCombatTracker extends CombatTracker {
  constructor(options) {
    super(options);
  }

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "combat",
      template: "systems/swyvers/templates/combat/combat-tracker.hbs",
      title: "Combat Tracker",
    });
  }

  /** @inheritdoc */
  async getData(options) {
    const context = await super.getData(options);
    for (const turn of context.turns) {
      turn.initiativeType = context.combat?.combatants.get(turn.id).getFlag("swyvers", "initiativeType");
    }
    return context;
  }
}