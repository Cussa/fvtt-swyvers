import { SWYVERS } from "../config/swyvers.mjs";

const ascending = function (a, b) { return a.initiative - b.initiative };
const descending = function (a, b) { return b.initiative - a.initiative };

const casterTemplate = "systems/swyvers/templates/dialog/casters.hbs";

export default class SwyversCombat extends Combat {
  async startCombat() {
    await this.showCasters();
    return super.startCombat();
  }

  async nextRound() {
    await this.showCasters();
    return super.nextRound();
  }

  async showCasters() {
    const casters = [];
    let willCast = [];
    for (const combatant of this.combatants) {
      const spells = combatant.actor.items.filter(it => it.type == "spell" && it.system.available);
      if (spells.length == 0)
        continue;

      casters.push(combatant);
    }
    if (casters.length > 0) {
      casters.sort(function (a, b) {
        var x = a.actor.name.toLowerCase();
        var y = b.actor.name.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
      });
      console.log(casters);
      willCast = await Dialog.prompt({
        title: game.i18n.localize("SWYVERS.Initiative.Casters.Title"),
        content: await renderTemplate(casterTemplate, { casters }),
        callback: async (html) => {
          const checked = [];
          html.find("[name=willCast]:checked").each(function () {
            checked.push($(this).val());
          });
          return checked;
        },
        rejectClose: false
      }) || [];
    }
    await this.orderTurns(willCast);
  }

  async orderTurns(willCast) {
    for (const combatant of this.combatants) {

      let initiativeConfig = SWYVERS.COMBAT.INITIATIVE.unarmed;
      if (willCast.indexOf(combatant.id) > -1) {
        initiativeConfig = SWYVERS.COMBAT.INITIATIVE.casting;
      }
      else {
        let weapons = combatant.actor.items.filter(it => it.type == "weapon");
        if (combatant.actor.type == "character")
          weapons = weapons.filter(it => it.system.equipped);

        for (const weapon of weapons) {
          const currentInitiativeConfig = SWYVERS.COMBAT.INITIATIVE[weapon.system.initiative];
          if (initiativeConfig.id == SWYVERS.COMBAT.INITIATIVE.unarmed.id)
            initiativeConfig = currentInitiativeConfig;
          else if (currentInitiativeConfig.order > initiativeConfig.order)
            initiativeConfig = currentInitiativeConfig;
        }

        if (combatant.actor.type == "npc" && combatant.actor.system.initiativeBonus != 0) {
          let order = initiativeConfig.order + combatant.actor.system.initiativeBonus;
          order = Math.min(order, SWYVERS.COMBAT.INITIATIVE.last.order);
          order = Math.max(order, SWYVERS.COMBAT.INITIATIVE.first.order);
          initiativeConfig = Object.entries(SWYVERS.COMBAT.INITIATIVE).filter(it => it[1].order == order)[0][1];
        }
      }

      if (combatant.initiativeType != initiativeConfig.id) {
        combatant.update({ initiative: initiativeConfig.order })
        await combatant.setFlag("swyvers", "initiativeType", game.i18n.localize(initiativeConfig.label));
      }
    }

    this.turns = this.turns.sort(this.round == 0 ? descending : ascending);
  }
}