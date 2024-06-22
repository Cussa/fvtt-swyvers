/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/swyvers/templates/actor/parts/actor-features.hbs',
    'systems/swyvers/templates/actor/parts/actor-items.hbs',
    'systems/swyvers/templates/actor/parts/actor-inventory.hbs',
    'systems/swyvers/templates/actor/parts/actor-skills.hbs',
    'systems/swyvers/templates/actor/parts/actor-spells.hbs',
    'systems/swyvers/templates/actor/parts/actor-effects.hbs',
    'systems/swyvers/templates/actor/parts/actor-info.hbs',
    // Item partials
    'systems/swyvers/templates/item/parts/item-effects.hbs',
    'systems/swyvers/templates/item/parts/item-carry-options.hbs',
  ]);
};


export function selectOptionsWithDisabled(choices, options) {
  let { localize = false, selected = null, blank = null, sort = false, nameAttr, labelAttr, inverted, disabled = null } = options.hash;
  selected = selected instanceof Array ? selected.map(String) : [String(selected)];
  disabled = disabled ?? {};

  // Prepare the choices as an array of objects
  const selectOptions = [];
  if (choices instanceof Array) {
    for (const choice of choices) {
      const name = String(choice[nameAttr]);
      let label = choice[labelAttr];
      if (localize) label = game.i18n.localize(label);
      selectOptions.push({ name, label });
    }
  }
  else {
    for (const choice of Object.entries(choices)) {
      const [key, value] = inverted ? choice.reverse() : choice;
      const name = String(nameAttr ? value[nameAttr] : key);
      let label = labelAttr ? value[labelAttr] : value;
      if (localize) label = game.i18n.localize(label);
      selectOptions.push({ name, label });
    }
  }

  // Sort the array of options
  if (sort) selectOptions.sort((a, b) => a.label.localeCompare(b.label));

  // Prepend a blank option
  if (blank !== null) {
    const label = localize ? game.i18n.localize(blank) : blank;
    selectOptions.unshift({ name: "", label });
  }

  // Create the HTML
  let html = "";
  for (const option of selectOptions) {
    const label = Handlebars.escapeExpression(option.label);
    const isSelected = selected.includes(option.name);
    const disabledText = disabled[option.name] != undefined ? game.i18n.localize(disabled[option.name]) : "";
    html += `<option value="${option.name}" ${isSelected ? "selected" : ""} ${disabledText ? "disabled" : ""}>${label}${disabledText}</option>`;
  }
  return new Handlebars.SafeString(html);
}

export function selectOptions(categories) {
  const returnObject = Object.keys(categories).reduce((result, key) => {
    result[key] = categories[key].label;
    return result;
  }, {});
  return returnObject;
}