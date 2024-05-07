import { SWYVERS } from "../config/swyvers.mjs";

const rollTemplate = "systems/swyvers/templates/dice/roll.hbs";

export async function roll(item, under) {
  await under ? rollUnder(item) : rollAsHigh(item);
}

export async function rollUnder(item) {
  await _rollUnder(item,
    item.system.attribute == SWYVERS.SKILL.ATTRIBUTES.uncertain.id ?
      _rollUnderNumberButtons :
      _rollUnderAttributeButtons
  );
}

async function _rollUnder(item, buttonsFunc) {
  const testName = game.i18n.format("SWYVERS.TestTitle", { title: item.name });
  const originalContent = await item.system.getCardData();
  const [buttons, targetInfo, additionalTargetInfo] = await buttonsFunc(item, originalContent);

  const dialogContent = `${originalContent}<p class="item-target">${game.i18n.localize("SWYVERS.Target")}: ${targetInfo} + ${item.system.value}${additionalTargetInfo}</p>`;
  new Dialog(
    {
      title: testName,
      content: dialogContent,
      buttons: buttons,
      default: Object.entries(buttons)[0][0]
    }).render(true);
}

async function _rollUnderNumberButtons(item, content) {
  const additionalFlavor = `<input type="number" id="target" value="10" step="1" data-dtype="Number">`;
  return [{
    roll: {
      icon: '<i class="fas fa-dice"></i>',
      label: `Roll`,
      callback: (html) => {
        const targetInfo = parseInt(html.find("#target")[0].value);
        _rollDiceUnder(item, 3, content, targetInfo, targetInfo, "");
      }
    }
  }, additionalFlavor, ""];
}

async function _rollUnderAttributeButtons(item, content) {
  const rollData = item.getRollData();
  let target = rollData.actor.attributes[rollData.attribute].value;
  let targetInfo = `${game.i18n.localize(SWYVERS.SKILL.ATTRIBUTES[item.system.attribute].label)} (${item.actor.system.attributes[item.system.attribute].value})`;
  let [mod, additionalTargetInfo] = await _getAttributeModifier(item);
  target += mod;

  let buttons = {};
  for (let index = 2; index < 6; index++) {
    buttons[`button${index}d6`] = {
      icon: '<i class="fas fa-dice"></i>',
      label: `${index}d6`,
      callback: () => _rollDiceUnder(item, index, content, target, targetInfo, additionalTargetInfo)
    };
  }
  return [buttons, targetInfo, additionalTargetInfo];
}

async function _rollDiceUnder(item, dice, content, target, targetInfo, additionalTargetInfo) {
  let roll = await new Roll(`${dice}d6`).roll({ async: true });

  const additionalFlavor = `<p class="item-target">${game.i18n.localize("SWYVERS.Target")}: ${targetInfo} + ${item.system.value}${additionalTargetInfo}</p>`;
  const finalTarget = target + item.system.value;
  const chatContent = await renderTemplate(rollTemplate, {
    flavor: content,
    additionalFlavor: additionalFlavor,
    formula: `${dice}d6 <= ${finalTarget}`,
    tooltip: await roll.getTooltip(),
    total: `${roll.total}`,
    totalClass: roll.total <= finalTarget ? "success" : "failure"
  })
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: item.actor }),
    content: chatContent
  });
}

export async function rollAsHigh(item) {
  let targetInfo = "";
  let attribute = 0;
  if (item.system.attribute != SWYVERS.SKILL.ATTRIBUTES.uncertain.id) {
    attribute = item.actor.system.attributes[item.system.attribute].value;
    targetInfo = `${game.i18n.localize(SWYVERS.SKILL.ATTRIBUTES[item.system.attribute].label)} (${attribute})`;
  }
  else {
    targetInfo = `${game.i18n.localize(SWYVERS.SKILL.ATTRIBUTES.uncertain.label)}`;
  }

  const testName = game.i18n.format("SWYVERS.TestTitle", { title: item.name });

  let [_, additionalTargetInfo] = await _getAttributeModifier(item);
  let content = await item.system.getCardData() + `<p class="item-target">${game.i18n.localize("SWYVERS.RollAsHigh")}: ${targetInfo} + ${item.system.value}${additionalTargetInfo}</p>`;

  new Dialog(
    {
      title: testName,
      content: content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: `Roll`,
          callback: async () => {
            let formula = `1d12 + ${attribute} + @value${additionalTargetInfo}`;
            let roll = await new Roll(formula, item.getRollData()).roll({ async: true });

            const chatContent = await renderTemplate(rollTemplate, {
              flavor: content,
              formula: roll.formula,
              tooltip: await roll.getTooltip(),
              total: `${roll.total}`
            })
            roll.toMessage({
              speaker: ChatMessage.getSpeaker({ actor: item.actor }),
              content: chatContent
            });
          }
        }
      },
      default: "roll"
    }).render(true);
}

async function _getAttributeModifierForActor(actor, attribute) {
  let mod = await actor.system.getAttributeModifier(attribute);
  let additionalTargetInfo = "";
  if (mod > 0)
    additionalTargetInfo = ` + ${mod}`;
  else if (mod < 0)
    additionalTargetInfo = ` - ${-mod}`;

  return [mod, additionalTargetInfo];
}

async function _getAttributeModifier(item) {
  return _getAttributeModifierForActor(item.actor, item.system.attribute);
}

export async function rollDamage(item) {

  const content = await item.system.getCardData();

  let formula = item.system.damage;
  if (item.system.quality == SWYVERS.WEAPON.QUALITY.ropey.id)
    formula = `{${formula}, ${formula}}kl`;
  else if (item.system.quality == SWYVERS.WEAPON.QUALITY.mint.id)
    formula = `{${formula}, ${formula}}kh`;

  let roll = await new Roll(formula, item.getRollData()).roll({ async: true });

  const chatContent = await renderTemplate(rollTemplate, {
    flavor: content,
    formula: roll.formula,
    tooltip: await roll.getTooltip(),
    total: `${roll.total}`
  })
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: item.actor }),
    content: chatContent
  });
}


export async function rollSoakDamage(item) {

  const content = await item.system.getCardData();

  let formula = item.system.damageSoak;
  if (item.system.quality == SWYVERS.ARMOUR.QUALITY.patchwork.id)
    formula = `{${formula}, ${formula}}kl`;
  else if (item.system.quality == SWYVERS.ARMOUR.QUALITY.swank.id)
    formula = `{${formula}, ${formula}}kh`;

  let roll = await new Roll(formula, item.getRollData()).roll({ async: true });

  const chatContent = await renderTemplate(rollTemplate, {
    flavor: content,
    formula: roll.formula,
    tooltip: await roll.getTooltip(),
    total: `${roll.total}`
  })
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: item.actor }),
    content: chatContent
  });
}

export async function rollUnderAttribute(actor, attribute) {
  let target = actor.system.attributes[attribute].value;
  let targetInfo = `${game.i18n.localize(SWYVERS.SKILL.ATTRIBUTES[attribute].label)} (${target})`;
  let [mod, additionalTargetInfo] = await _getAttributeModifierForActor(actor, attribute);
  target += mod;
  const content = `<p class="item-target">${game.i18n.localize("SWYVERS.Target")}: ${targetInfo}${additionalTargetInfo}</p>`;

  let buttons = {};
  for (let index = 2; index < 6; index++) {
    buttons[`button${index}d6`] = {
      icon: '<i class="fas fa-dice"></i>',
      label: `${index}d6`,
      callback: async () => {
        let roll = await new Roll(`${index}d6`).roll({ async: true });

        const chatContent = await renderTemplate(rollTemplate, {
          flavor: content,
          formula: `${index}d6 <= ${target}`,
          tooltip: await roll.getTooltip(),
          total: `${roll.total}`,
          totalClass: roll.total <= target ? "success" : "failure"
        })
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: actor }),
          content: chatContent
        });
      }
    };
  }
  const testName = game.i18n.format("SWYVERS.TestTitle", { title: targetInfo });
  new Dialog(
    {
      title: testName,
      content: content,
      buttons: buttons
    }).render(true);
}

export async function rollAttack(actor) {


  let content = `<p class="item-name">${game.i18n.localize("SWYVERS.Fighting")} (${actor.system.attributes.fighting})</p>`;
  content += `<p class="item-target">${game.i18n.localize("SWYVERS.Bonus")}: {{info}}</p>`;

  const bonusInput = `<input type="number" id="target" value="0" step="1" data-dtype="Number">`;

  const testName = game.i18n.format("SWYVERS.TestTitle", { title: game.i18n.localize("SWYVERS.Fighting") });
  new Dialog(
    {
      title: testName,
      content: content.replace("{{info}}", bonusInput),
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: `Roll`,
          callback: async (html) => {
            let targetInfo = parseInt(html.find("#target")[0].value);
            let mod = "";

            if (targetInfo) {
              if (targetInfo > 0)
                targetInfo = ` + ${targetInfo}`;
              else
                targetInfo = ` - ${-targetInfo}`;
              mod = targetInfo;
            }

            let roll = await new Roll(`2d10 + ${actor.system.attributes.fighting}${mod}`).roll({ async: true });

            console.log(roll, mod, targetInfo);

            const chatContent = await renderTemplate(rollTemplate, {
              flavor: content.replace("{{info}}", targetInfo),
              formula: roll.formula,
              tooltip: await roll.getTooltip(),
              total: `${roll.total}`
            })
            roll.toMessage({
              speaker: ChatMessage.getSpeaker({ actor: actor }),
              content: chatContent
            });
          }
        }
      },
      default: "roll"
    }).render(true);
}