import assert from "node:assert/strict";
import test from "node:test";

import { formatMoney, parseUserPrice, sumPrices } from "./money.ts";

test("formats the currencies the form offers", () => {
  assert.equal(formatMoney(1299.9, "BRL"), "R$ 1.299,90");
  assert.equal(formatMoney(12.5, "USD"), "US$ 12.50");
  assert.equal(formatMoney(12.5, "EUR"), "€ 12,50");
});

test("reads Brazilian and plain prices", () => {
  assert.equal(parseUserPrice("1.299,90"), 1299.9);
  assert.equal(parseUserPrice("12,5"), 12.5);
  assert.equal(parseUserPrice("1,299.90"), 1299.9);
  assert.equal(parseUserPrice("abc"), null);
});

test("sums pending prices with BRL first", () => {
  const totals = sumPrices([
    { price: 10, currency: "USD" },
    { price: 5, currency: "BRL" },
    { price: null, currency: "BRL" },
  ]);
  assert.deepEqual(totals, [
    { currency: "BRL", amount: 5 },
    { currency: "USD", amount: 10 },
  ]);
});
