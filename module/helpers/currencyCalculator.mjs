import { SWYVERS } from "../config/swyvers.mjs";

export default class CurrencyCalculator {

  static async spendCurrency(actor, price) {
    const actorPouch = actor.system.pouch;

    let actorRealPouch = 0;

    let updates = {};

    for (const [id, element] of Object.entries(SWYVERS.CURRENCY.CONFIGURATION)) {
      updates[`system.pouch.${id}`] = actorPouch[id] - price[id];
      actorRealPouch += updates[`system.pouch.${id}`] * element.value;
    }

    if (actorRealPouch < 0) {
      ui.notifications.error('SWYVERS.Currency.Insufficient', { localize: true });
      return false;
    }

    let entries = Object.entries(SWYVERS.CURRENCY.CONFIGURATION).reverse();
    let hasNegative = false;
    for (let index = 0; index < entries.length; index++) {
      const element = entries[index][1];
      const currentValue = updates[`system.pouch.${element.id}`];
      if (currentValue == 0)
        continue;

      if (currentValue < 0 && index < 2) {
        const nextElement = entries[index + 1][1];
        const ratio = nextElement.value / element.value;
        const current = Math.ceil(-currentValue / ratio);
        updates[`system.pouch.${element.id}`] += current * ratio;
        updates[`system.pouch.${nextElement.id}`] -= current;
      }

      hasNegative = hasNegative || currentValue > 0;
    }

    if (hasNegative) {
      entries.reverse();
      for (let index = 0; index < entries.length; index++) {
        const element = entries[index][1];
        const currentValue = updates[`system.pouch.${element.id}`];
        if (currentValue == 0)
          continue;

        if (currentValue < 0 && index < 2) {
          const nextElement = entries[index + 1][1];
          const ratio = element.value / nextElement.value;
          const current = Math.floor(-currentValue * ratio);
          updates[`system.pouch.${element.id}`] += current / ratio ;
          updates[`system.pouch.${nextElement.id}`] -= current;
        }
      }
    }

    await actor.update(updates);
    return true;
  }

  static async addCurrency(actor, price) {
    const actorPouch = actor.system.pouch;
    let updates = {};

    Object.keys(SWYVERS.CURRENCY.CONFIGURATION).forEach(id => {
      updates[`system.pouch.${id}`] = actorPouch[id] + price[id];
    });

    console.log(updates);

    await actor.update(updates);
  }
}