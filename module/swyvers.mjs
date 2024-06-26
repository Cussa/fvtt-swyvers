// Import document classes.
import { SwyversActor } from './documents/actor.mjs';
import { SwyversItem } from './documents/item.mjs';
import SwyversChatMessage from './documents/chat-message.mjs';
import SwyversCards from './documents/cards.mjs';
import SwyversToken from './documents/token.mjs';
// Import sheet classes.
import { SwyversActorSheet } from './sheets/actor-sheet.mjs';
import { SwyversItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates, selectOptionsWithDisabled } from './helpers/templates.mjs';
import { SWYVERS } from './config/swyvers.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
import * as items_sheets from './sheets/_items.mjs';
import SpellHandler from './helpers/spell-handler.mjs';
import { registerSettings } from './helpers/settings.mjs';
import { checkCardsSetup } from './helpers/cardDecks.mjs';
import SwyversActorNpcSheet from './sheets/actor-npc-sheet.mjs';
import { CurrencyCalculatorTests } from './tests/currencyCalculatorTests.mjs';
import SwyversCombat from './combat/swyvers-combat.mjs';
import { SwyversCombatTracker } from './combat/combat-tracker.mjs';
import CurrencyCalculator from './helpers/currencyCalculator.mjs';
import { chooseCharacterOptions } from './helpers/chooseCharacterOption.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.swyvers = {
    SwyversActor,
    SwyversItem,
    rollItemMacro,
    SpellHandler,
    CurrencyCalculator,
    CurrencyCalculatorTests,
    chooseCharacterOptions
  };

  // Add custom constants for configuration.
  CONFIG.SWYVERS = SWYVERS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = SwyversActor;

  CONFIG.Combat.documentClass = SwyversCombat;
  CONFIG.ui.combat = SwyversCombatTracker;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.SwyversCharacter,
    npc: models.SwyversNPC
  }
  CONFIG.Item.documentClass = SwyversItem;
  CONFIG.Item.dataModels = {
    item: models.SwyversItem,
    feature: models.SwyversFeature,
    spell: models.SwyversSpell,
    spellComponent: models.SwyversSpellComponent,
    despot: models.SwyversDespot,
    weapon: models.SwyversWeapon,
    armour: models.SwyversArmour,
    skill: models.SwyversSkill
  };

  CONFIG.ChatMessage.documentClass = SwyversChatMessage;
  CONFIG.Cards.documentClass = SwyversCards;
  CONFIG.Token.documentClass = SwyversToken;

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('swyvers', SwyversActorSheet, {
    types:["character"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Actor',
  });
  Actors.registerSheet('swyvers', SwyversActorNpcSheet, {
    types:["npc"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);

  Items.registerSheet('swyvers', SwyversItemSheet, {
    types: ["item"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Item',
  });
  Items.registerSheet('swyvers', items_sheets.SwyversArmourSheet, {
    types: ["armour"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Armour',
  });
  Items.registerSheet('swyvers', items_sheets.SwyversSkillSheet, {
    types: ["skill"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Skill',
  });
  Items.registerSheet('swyvers', items_sheets.SwyversSpellSheet, {
    types: ["spell"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Spell',
  });
  Items.registerSheet('swyvers', items_sheets.SwyversWeaponSheet, {
    types: ["weapon"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Weapon',
  });
  Items.registerSheet('swyvers', items_sheets.SwyversSpellComponentSheet, {
    types: ["spellComponent"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.SpellComponent',
  });
  Items.registerSheet('swyvers', items_sheets.SwyversDespotSheet, {
    types: ["despot"],
    makeDefault: true,
    label: 'SWYVERS.SheetLabels.Despot',
  });

  registerSettings();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper({
  selectOptionsWithDisabled: selectOptionsWithDisabled,
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
  if (game.user.isGM)
    await checkCardsSetup();
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.swyvers.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'swyvers.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
