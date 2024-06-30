export async function checkCardsSetup() {
  await checkMagicDeckSetup();
  await checkMagicPileSetup();
  await adjustPermissions();
  await checkMacroResetDay();
}

async function checkMagicDeckSetup() {
  const magicDeckId = game.settings.get('swyvers', 'magicDeckId');
  const magicDeck = game.cards?.get(magicDeckId);
  //return early if both the deck and the ID exist in the world
  if (magicDeckId && magicDeck)
    return;
  const preset = CONFIG.Cards.presets.pokerDark;
  let data = await foundry.utils.fetchJsonWithTimeout(preset.src);
  data = foundry.utils.mergeObject(data, {
    name: game.i18n.localize("SWYVERS.Spell.MagicDeck"),
  });
  const cardsCls = getDocumentClass('Cards');
  const newDeck = await cardsCls.create(data);
  await game.settings.set('swyvers', 'magicDeckId', newDeck?.id);
  await newDeck?.shuffle({ chatNotification: false });
}

async function checkMagicPileSetup() {
  const magicPileId = game.settings.get('swyvers', 'magicPileId');
  const magicPile = game.cards?.get(magicPileId);
  //return early if both the deck and the ID exist in the world
  if (magicPileId && magicPile)
    return;
  const data = {
    name: game.i18n.localize("SWYVERS.Spell.MagicPile"),
    preset: "",
    type: "pile"
  };
  const cardsCls = getDocumentClass('Cards');
  const newDeck = await cardsCls.create(data);
  await game.settings.set('swyvers', 'magicPileId', newDeck?.id);
  await newDeck?.shuffle({ chatNotification: false });
}

async function adjustPermissions() {
  let permissions = await game.settings.get("core", "permissions");

  permissions.CARDS_CREATE = [1, 2, 3, 4];

  await game.settings.set("core", "permissions", permissions);
}

async function checkMacroResetDay() {
  let existingMacro = await game.macros.getName("Reset Day");
  if (existingMacro)
    return;

  await Macro.create({
    name: "Reset Day",
    type: 'script',
    command: "await game.swyvers.SpellHandler.resetDay();",
  });
}