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
  const testName = game.i18n.localize("SWYVERS.TestTitle", { title: item.name });
  const originalContent = await item.system.getCardData();
  const [buttons, targetInfo] = await buttonsFunc(item, originalContent);

  const dialogContent = `${originalContent}<p class="item-target">${game.i18n.localize("SWYVERS.Target")}: ${targetInfo} + ${item.system.value}</p>`;
  new Dialog(
    {
      title: testName,
      content: dialogContent,
      buttons: buttons
    }).render(true);
}

async function _rollUnderNumberButtons(item, content) {
  const additionalFlavor = `<input type="text" id="target" value="10" data-dtype="Number">`;
  return [{
    roll: {
      icon: '<i class="fas fa-dice"></i>',
      label: `Roll`,
      callback: (html) => {
        const targetInfo = parseInt(html.find("#target")[0].value);
        _rollDiceUnder(item, 3, content, targetInfo, targetInfo);
      }
    }
  }, additionalFlavor];
}

async function _rollUnderAttributeButtons(item, content) {
  const rollData = item.getRollData();
  const target = rollData.actor.attributes[rollData.attribute].value;
  const targetInfo = `${game.i18n.localize(SWYVERS.SKILL.ATTRIBUTES[item.system.attribute].label)} (${item.actor.system.attributes[item.system.attribute].value})`;

  let buttons = {};
  for (let index = 2; index < 6; index++) {
    buttons[`button${index}d6`] = {
      icon: '<i class="fas fa-dice"></i>',
      label: `${index}d6`,
      callback: () => _rollDiceUnder(item, index, content, target, targetInfo)
    };
  }
  return [buttons, targetInfo];
}

async function _rollDiceUnder(item, dice, content, target, targetInfo) {
  let roll = await new Roll(`${dice}d6`).roll({ async: true });

  const additionalFlavor = `<p class="item-target">${game.i18n.localize("SWYVERS.Target")}: ${targetInfo} + ${item.system.value}</p>`;
  const finalTarget = target + item.system.value;
  const chatContent = await renderTemplate(rollTemplate, {
    flavor: content,
    additionalFlavor: additionalFlavor,
    formula: `${dice}d6 < ${finalTarget}`,
    tooltip: await roll.getTooltip(),
    total: `${roll.total}`,
    totalClass: roll.total < finalTarget ? "success" : "failure"
  })
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: item.actor }),
    content: chatContent
  });
}

export async function rollAsHigh(item) {
  const testName = game.i18n.localize("SWYVERS.TestTitle", { title: item.name });
  const content = await item.system.getCardData() + `<p class="item-target">${game.i18n.localize("SWYVERS.RollAsHigh")}</p>`;
  new Dialog(
    {
      title: testName,
      content: content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: `Roll`,
          callback: () => _rollDiceAsHigh(item, 3, content)
        }
      }
    }).render(true);
}

async function _rollDiceAsHigh(item, dice, content) {
  let roll = await new Roll(`${dice}d6 + @value`, item.getRollData()).roll({ async: true });

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