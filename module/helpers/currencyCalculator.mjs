import { SWYVERS } from "../config/swyvers.mjs";

export default class CurrencyCalculator {

  static async spendCurrency_not_working(actor, price) {
    const actorPouch = actor.system.pouch;

    let realPrice = 0;
    let actorRealPouch = 0;

    let updates = {};

    for (const [id, element] of Object.entries(SWYVERS.CURRENCY.CONFIGURATION)) {
      actorRealPouch += actorPouch[id] * element.value;
      realPrice += price[id] * element.value;
    }

    if (actorRealPouch < realPrice) {
      ui.notifications.error('SWYVERS.Currency.Insufficient', { localize: true });
      return false;
    }

    actorRealPouch -= realPrice;

    for (const [id, element] of Object.entries(SWYVERS.CURRENCY.CONFIGURATION)) {
      updates[`system.pouch.${id}`] = Math.floor(Math.min(actorPouch[id], actorRealPouch / element.value));
      actorRealPouch -= updates[`system.pouch.${id}`] * element.value;
      console.log(id, updates[`system.pouch.${id}`], actorPouch[id]);
    }

    await actor.update(updates);
    return true;
  }

  static async spendCurrency(actor, price) {
    const actorPouch = actor.system.pouch;

    let realPrice = 0;
    let actorRealPouch = 0;

    let updates = {};

    for (const [id, element] of Object.entries(SWYVERS.CURRENCY.CONFIGURATION)) {
      actorRealPouch += actorPouch[id] * element.value;
      realPrice += price[id] * element.value;
    }

    if (actorRealPouch < realPrice) {
      ui.notifications.error('SWYVERS.Currency.Insufficient', { localize: true });
      return false;
    }

    actorRealPouch -= realPrice;

    let diff = actorPouch["pence"] - realPrice;

    if (diff >= 0) {
      updates[`system.pouch.pound`] = actorPouch["pound"];
      updates[`system.pouch.shilling`] = actorPouch["shilling"];
      updates[`system.pouch.pence`] = diff;
      await actor.update(updates);
      return true;
    }

    updates[`system.pouch.pence`] = 0;
    realPrice = -diff;
    diff = actorPouch[`shilling`] * SWYVERS.CURRENCY.CONFIGURATION.shilling.value - realPrice;
    if (diff >= 0) {
      updates[`system.pouch.pound`] = actorPouch["pound"];
      updates[`system.pouch.shilling`] = Math.floor(diff / SWYVERS.CURRENCY.CONFIGURATION.shilling.value);
      updates[`system.pouch.pence`] = diff - updates[`system.pouch.shilling`] * SWYVERS.CURRENCY.CONFIGURATION.shilling.value;

      await actor.update(updates);
      return true;
    }

    updates[`system.pouch.shilling`] = 0;
    realPrice = -diff;
    diff = actorPouch[`pound`] * SWYVERS.CURRENCY.CONFIGURATION.pound.value - realPrice;
    updates[`system.pouch.pound`] = Math.floor(diff / SWYVERS.CURRENCY.CONFIGURATION.pound.value);

    updates[`system.pouch.shilling`] = Math.floor(
      (diff - updates[`system.pouch.pound`] * SWYVERS.CURRENCY.CONFIGURATION.pound.value)
      / SWYVERS.CURRENCY.CONFIGURATION.shilling.value);

    updates[`system.pouch.pence`] = diff
      - updates[`system.pouch.shilling`] * SWYVERS.CURRENCY.CONFIGURATION.shilling.value
      - updates[`system.pouch.pound`] * SWYVERS.CURRENCY.CONFIGURATION.pound.value;

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