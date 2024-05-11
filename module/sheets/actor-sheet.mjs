import { SWYVERS } from '../config/swyvers.mjs';
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
import { getInlineDescriptor } from '../helpers/inlineDescription.mjs';
import { rollAttack, rollUnderAttribute } from '../helpers/rolls.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SwyversActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['swyvers', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/swyvers/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    await this._prepareItems(context);
    await this._prepareCharacterData(context);

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );
    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  async _prepareCharacterData(context) {
    const dexModifier = Math.max(context.items.filter(it => it.system.container == "backpack").length - 10, 0);
    context.system.attributes.dex.mod = -dexModifier;
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
      },
      belt: {
        totalSlots: 3,
        usedSlots: 0,
        items: []
      },
      backpack: {
        totalSlots: 10,
        usedSlots: 0,
        items: []
      },
      backpackExternal: {
        totalSlots: 3,
        usedSlots: 0,
        items: []
      },
      sack: {
        totalSlots: 4,
        usedSlots: 0,
        items: []
      },
      notCarried: {
        items: []
      }
    };

    if (context.items.filter(it => it.name == "Backpack").length == 0) {
      delete inventory.backpack;
      delete inventory.backpackExternal;
    }

    if (context.items.filter(it => it.name == "Sack").length == 0)
      delete inventory.sack;

    const gear = [];
    const features = [];
    const spells = [];
    const skills = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      if (i.type === 'spell') {
        i.suitSymbol = game.i18n.localize(`SWYVERS.Spell.SuitSymbol.${i.system.suit}`);
        spells.push(i);
      }
      else if (i.type == "skill") {
        skills.push(i);
      }
      else {
        i.inlineDescriptor = getInlineDescriptor(i);
        i.rollable = ["weapon", "armour"].indexOf(i.type) > -1 && ["shield", "helmet"].indexOf(i.system.type) == -1;

        if (i.system.equipped && i.system.containerOptions.equipped) {
          if (i.type == "weapon")
            defense = i.system.defense;
          else if (i.type == "armour" && i.system.type == "shield" && i.system.equipped && !i.system.broken)
            defense += 2;

          inventory.equipped.items.push(i);
          continue;
        }

        let currentContainer = i.system.container ?? "notCarried";
        currentContainer = inventory[currentContainer] && i.system.containerOptions[currentContainer] ? currentContainer : "notCarried";
        inventory[currentContainer].usedSlots += i.system.slots;
        inventory[currentContainer].items.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.skills = skills;
    context.inventory = inventory;

    let containerOverflow = [];
    const containerToCheck = Object.entries(inventory).filter(it => it[1].totalSlots).map(it => it[1]);
    containerToCheck.forEach(element => {
      if (element.usedSlots > element.totalSlots) {
        containerOverflow.push(game.i18n.format("SWYVERS.Container.Overflow", {
          name: game.i18n.localize(SWYVERS.CONTAINER.CONFIGURATIONS[element].label),
          usedSlots: element.usedSlots,
          totalSlots: element.totalSlots,
        }));
      }
    });
    if (containerOverflow.length) {
      containerOverflow.unshift(`${this.actor.name}<br>`);
      const messageData = {
        type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
        from: game.user._id,
        content: containerOverflow.join("<br>"),
        whisper: game.users.filter(it=> it.isGM).map(it=>it._id),
        sound: CONFIG.sounds.notification
      };
      await ChatMessage.create(messageData);
    }

    context.system.attributes.defense = defense;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));
    html.on('click', '.litarated', this._onLiterateChange.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      await item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    let type = header.dataset.type;
    if (type == "generic") {
      type = await Dialog.wait({
        title: game.i18n.localize("SWYVERS.Item.ItemType"),
        content: game.i18n.localize("SWYVERS.Item.ChooseItemType"),
        buttons: {
          weapon: { label: "Weapon", callback: () => ('weapon') },
          armour: { label: "Armour", callback: () => ('armour') },
        },
        close: () => false
      });

      if (!type)
        return;
    }
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    const finalItem = await Item.create(itemData, { parent: this.actor });
    finalItem.sheet.render(true);
    return finalItem;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        const rollUnder = dataset.rollUnder;
        if (item) return item.system.roll(rollUnder);
      }
      if (dataset.rollType == "attribute") {
        return rollUnderAttribute(this.actor, dataset.attribute);
      }
      if (dataset.rollType == "attack") {
        return rollAttack(this.actor);
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label;
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  async _onLiterateChange(event) {
    event.preventDefault();
    console.log("SWYVERS", this.actor);

    await this.actor.update({ "system.attributes.literated": !this.actor.system.attributes.literated });
  }
}
