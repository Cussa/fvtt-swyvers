export async function chooseCharacterOptions(optionName) {
  const actor = this.actor || game.user.character || canvas.tokens.controlled[0]?.actor;
  if (!actor) {
    ui.notifications.error('SWYVERS.NoActorError', { localize: true });
    return;
  }

  const data = CONFIG.SWYVERS.STARTERS[optionName];

  let animations = [];
  let conRoll = await createRoll(`${data.con}[black]`, animations);
  let dexRoll = await createRoll(`${data.dex}[red]`, animations);
  let strRoll = await createRoll(`${data.str}[yellow]`, animations);
  let litRoll = await createRoll(`${data.lit}[white]`, animations);
  let pouchRoll = await createRoll(`${data.pouch.formula}[blue]`, animations);

  let trinketDraw = await (await fromUuid(data.trinket)).draw();
  let traitDraw = await (await fromUuid(data.trait)).draw();

  animations.push(game.dice3d?.showForRoll(trinketDraw.roll));
  animations.push(game.dice3d?.showForRoll(traitDraw.roll));

  let description = [];
  description.push(game.i18n.format("SWYVERS.Biography.Starter", { starter: optionName }));
  description.push(game.i18n.localize("SWYVERS.Biography.Trinket"));
  for (const result of trinketDraw.results) {
    description.push(result.text);
  }
  description.push(game.i18n.localize("SWYVERS.Biography.Trait"));
  for (const result of traitDraw.results) {
    description.push(result.text);
  }

  if (data.description) {
    description.push(data.description);
  }

  await Promise.all(animations);

  console.log("Option", data, conRoll, dexRoll, strRoll, litRoll, pouchRoll, trinketDraw, traitDraw);

  let updates = {
    "system.attributes.con.max": conRoll.total,
    "system.attributes.con.value": conRoll.total,
    "system.attributes.hp.max": conRoll.total,
    "system.attributes.hp.value": conRoll.total,
    "system.attributes.dex.max": dexRoll.total,
    "system.attributes.dex.value": dexRoll.total,
    "system.attributes.str.max": strRoll.total,
    "system.attributes.str.value": strRoll.total,
    "system.attributes.literated": !!litRoll.total,
    [`system.pouch.${data.pouch.coin}`]: pouchRoll.total,
    "system.biography": `${actor.system.biography}${description.join("")}`
  };
  await actor.update(updates);

  let itemList = [];
  for (const id of data.items) {
    let quantity = 1;
    let currentId = id;
    const index = currentId.indexOf("_");
    if (index > -1) {
      quantity = parseInt(currentId.substring(0, index));
      currentId = currentId.substring(index + 1);
    }
    let currentItem = (await fromUuid(currentId)).toObject();
    currentItem.system.quantity = currentItem.system.quantity * quantity;
    itemList.push(currentItem);
  }
  await actor.createEmbeddedDocuments("Item", itemList);

  if (data.handler)
    await data.handler(actor);

  ui.notifications.info(game.i18n.format("SWYVERS.CharacterOption", {
    actor: actor.name,
    starter: optionName
  }));
}

async function createRoll(formula, animations) {
  let roll = await new Roll(formula).roll();
  animations.push(game.dice3d?.showForRoll(roll));
  return roll;
}