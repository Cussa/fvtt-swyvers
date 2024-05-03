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


    await this._prepareData(context);

    console.log(context);
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

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

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
    console.log(data);
    return data;
  }
}
