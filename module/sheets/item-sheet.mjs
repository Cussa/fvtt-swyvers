import CurrencyCalculator from '../helpers/currencyCalculator.mjs';
import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SwyversItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['swyvers', 'sheet', 'item'],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'attributes',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/swyvers/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = this.item.getRollData();

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    let priceInfo = [];
    if (context.system.price.pound > 0)
      priceInfo.push(`L${context.system.price.pound}`);
    if (context.system.price.shilling > 0)
      priceInfo.push(`${context.system.price.shilling}s`);
    if (context.system.price.pence > 0)
      priceInfo.push(`${context.system.price.pence}d`);

    context.priceInfo = priceInfo.join(" ");

    if (this.item.isEmbedded) {
      let inventory = { ...CONFIG.SWYVERS.CONTAINER.CONFIGURATIONS };
      let disabled = {};
      const full = "SWYVERS.Container.Full";
      if (this.item.actor.items.filter(it => it.name == "Backpack").length == 0) {
        delete inventory.backpack;
        delete inventory.backpackExternal;
      }
      else if (!this.item.system.containerOptions.backpackExternal) {
        delete inventory.backpackExternal;
      }
      else if (this._getUsedSlots("backpackExternal") + this.item.system.slots > 3)
        disabled["backpackExternal"] = full;

      if (!this.item.system.containerOptions.backpack)
        delete inventory.backpack;

      if (!this.item.system.containerOptions.belt) {
        delete inventory.belt;
      }
      else if (this._getUsedSlots("belt") + this.item.system.slots > 3)
        disabled["belt"] = full;

      if (!this.item.system.containerOptions.sack ||
        this.item.actor.items.filter(it => it.name == "Sack").length == 0)
        delete inventory.sack;
      else if (this._getUsedSlots("sack") + this.item.system.slots > 4)
        disabled["sack"] = full;
      context.containerChoices = this._labelOptions(inventory);
      context.containerDisabled = disabled;
      context.canBeEquipped = context.system.containerOptions.equipped;
    }
    context.isGM = game.user.isGM;

    await this._prepareData(context);

    console.log(context, this.item);
    return context;
  }

  async _prepareData(context) {
    context.enriched = {};
    context.enriched.description = await TextEditor.enrichHTML(context.system.description, { async: true });
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);


    // Roll handlers, click handlers, etc. would go here.
    html.on('click', '.item-purchase', this._onItemPurchase.bind(this));

    html.on('click', '.accordion', this._onAccordionClick.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );
  }

  // Convert CATEGORIES({id: "id", label: "label"}) to a selectOptions-compatible object
  _labelOptions(categories) {
    const returnObject = Object.keys(categories).reduce((result, key) => {
      result[key] = categories[key].label;
      return result;
    }, {});
    return returnObject;
  }

  _getSubmitData(updateData = {}) {
    const data = super._getSubmitData(updateData);
    // Prevent submitting overridden values
    // const overrides = foundry.utils.flattenObject(this.actor.overrides);
    // for ( let k of Object.keys(overrides) ) {
    //   if ( k.startsWith("system.") ) delete data[`data.${k.slice(7)}`]; // Band-aid for < v10 data
    //   delete data[k];
    // }
    const priceData = data.priceInfo?.split(" ").filter(i => i);
    data["system.price.pound"] = 0;
    data["system.price.shilling"] = 0;
    data["system.price.pence"] = 0;
    priceData?.forEach(element => {
      if (element.startsWith("L"))
        data["system.price.pound"] = parseInt(element.replace("L", ""));
      else if (element.endsWith("s"))
        data["system.price.shilling"] = parseInt(element.replace("s", ""));
      else if (element.endsWith("d"))
        data["system.price.pence"] = parseInt(element.replace("d", ""));
      else
        console.warn("Wrong price info", priceData);
    });

    let realPrice = data["system.price.pound"] * 240 + data["system.price.shilling"] * 12 + data["system.price.pence"];
    data["system.price.pound"] = Math.floor(realPrice / 240);
    realPrice -= data["system.price.pound"] * 240;
    data["system.price.shilling"] = Math.floor(realPrice / 12);
    realPrice -= data["system.price.shilling"] * 12;
    data["system.price.pence"] = realPrice;

    return data;
  }

  _getUsedSlots(itemType) {
    return this.item.actor.items
      .filter(it => it.system.container == itemType && !it.system.equipped && it._id != this.item._id)
      .map(it => it.system.slots)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue
      }, 0);
  }

  async _onItemPurchase(event) {
    event.preventDefault();

    const actor = game.user.character || canvas.tokens.controlled[0]?.actor;

    if (!actor) {
      ui.notifications.error('SWYVERS.NoActorError', { localize: true });
      return;
    }

    const item = this.item;
    const success = await CurrencyCalculator.spendCurrency(actor, item.system.price);
    if (success) {
      const newItem = item.toObject();
      const itemInActor = actor.items.filter(it =>
        it.name == newItem.name &&
        it.system.category == newItem.system.category &&
        it.system.slots == newItem.system.slots &&
        it.system.maxStack == newItem.system.maxStack)[0];
      if (itemInActor)
        itemInActor[0].update({ "system.quantity": itemInActor[0].system.quantity + 1 });
      else
        actor.createEmbeddedDocuments("Item", [item.toObject()]);
      ui.notifications.info(game.i18n.format("SWYVERS.ItemPurchased", { item: item.name, actor: actor.name }));
    }
  }


  async _onAccordionClick(event) {
    event.preventDefault();
    const accordion = event.target;
    accordion.classList.toggle("active");
    const panel = accordion.nextElementSibling;
    panel.classList.toggle("active");
    if (panel.style.maxHeight)
      panel.style.maxHeight = null;
    else
      panel.style.maxHeight = panel.scrollHeight + "px";
  }
}
