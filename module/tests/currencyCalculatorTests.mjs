import { SWYVERS } from "../config/swyvers.mjs";
import CurrencyCalculator from "../helpers/currencyCalculator.mjs";
import { cases } from "./currencyCalculatorTestCases.mjs";

class mockActor {
  constructor(pound, shilling, pence) {
    this.system = {
      pouch: {
        pound,
        shilling,
        pence
      }
    }
  }

  update(newUpdates) {
    this.system.pouch.pound = newUpdates["system.pouch.pound"];
    this.system.pouch.shilling = newUpdates["system.pouch.shilling"];
    this.system.pouch.pence = newUpdates["system.pouch.pence"];
  }

  equals(expected) {
    return expected[0] == this.system.pouch.pound &&
      expected[1] == this.system.pouch.shilling &&
      expected[2] == this.system.pouch.pence;
  }
}

export class CurrencyCalculatorTests {
  static async runTests() {
    SWYVERS.CURRENCY.CONFIGURATION.shilling.value = 10;
    SWYVERS.CURRENCY.CONFIGURATION.pound.value = 100;

    let success = true;
    let index = 0;
    while (success && index < cases.length) {
      const current = cases[index];
      success = await this._runTest(index, current);
      index++;
    }
    if (success) {
      console.info(`All tests (${cases.length}) passed`);
    }

    SWYVERS.CURRENCY.CONFIGURATION.shilling.value = 12;
    SWYVERS.CURRENCY.CONFIGURATION.pound.value = 240;
  }

  static async _runTest(index, { pouch, price, expectedResult, expectedPouch }) {
    const actor = new mockActor(pouch[0], pouch[1], pouch[2]);
    const realPrice = { pound: price[0], shilling: price[1], pence: price[2] };
    const result = await CurrencyCalculator.spendCurrency(actor, realPrice);
    let errors = []
    if (result != expectedResult)
      errors.push({ error: "WRONG RESULT", result, expectedResult });

    if (!actor.equals(expectedPouch))
      errors.push({ error: "WRONG POUCH VALUE", aPouch: pouch, bPrice: price, cExpPo: expectedPouch, dPouch: actor.system.pouch });
    if (errors.length > 0)
      console.error({ index, errors });
    return errors.length == 0;
  }
}