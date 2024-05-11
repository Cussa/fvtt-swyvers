import { SWYVERS } from '../config/swyvers.mjs';
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
import { getInlineDescriptor } from '../helpers/inlineDescription.mjs';
import { rollUnderMorale } from '../helpers/rolls.mjs';
import { SwyversActorSheet } from './actor-sheet.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {SwyversActorSheet}
 */
export default class SwyversActorNpcSheet extends SwyversActorSheet {

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = await super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      await this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    context.showNpcConfig = !this.actor.isToken;
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareItems(context) {
    // Initialize containers.

    let defense = 6;
    const inventory = {
      equipped: {
        items: []
      }
    };
    const gear = [];
    const features = [];
    const spells = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === 'spell') {
        i.suitSymbol = game.i18n.localize(`SWYVERS.Spell.SuitSymbol.${i.system.suit}`);
        spells.push(i);
      }
      else {
        i.inlineDescriptor = getInlineDescriptor(i);
        i.rollable = ["weapon", "armour"].indexOf(i.type) > -1 && ["shield", "helmet"].indexOf(i.system.type) == -1;
        i.system.equipped = true;

        if (i.type == "weapon")
          defense = Math.max(i.system.defense, defense);
        else if (i.type == "armour" && i.system.type == "shield" && i.system.equipped && !i.system.broken)
          defense += 2;

        inventory.equipped.items.push(i);
        continue;
      }
    }

    // Assign and return
    context.spells = spells;
    context.inventory = inventory;

    defense += context.system.defenseBonus;

    context.system.attributes.defense = defense;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  async _prepareCharacterData(context) {
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.rollType && dataset.rollType == "morale")
      return rollUnderMorale(this.actor);
    return super._onRoll(event);
  }
}
