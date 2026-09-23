import { test } from "node:test";
import assert from "node:assert/strict";
import { calcLine, calcTotals } from "../src/domain/money";

test("заказ 101, строка 1: 3 x 1250, 22%, НДС сверху", () => {
  const r = calcLine({ article: "ДМ-0001", name: "", qty: 3, price: 1250, vatName: "22%", vatPercent: 22 }, false);
  assert.equal(r.amount, 3750);
  assert.equal(r.vatAmount, 825);
  assert.equal(r.amountWithVat, 4575);
});

test("заказ 102, строка 1: 4 x 2400, 22%, НДС в цене", () => {
  const r = calcLine({ article: "X", name: "", qty: 4, price: 2400, vatName: "22%", vatPercent: 22 }, true);
  assert.equal(r.amount, 9600);
  assert.equal(r.vatAmount, 1731.15);
  assert.equal(r.amountWithVat, 9600);
});

test("итоги заказа 101 совпадают с примером из ТЗ", () => {
  const lines = [
    calcLine({ article: "1", name: "", qty: 3, price: 1250, vatName: "22%", vatPercent: 22 }, false),
    calcLine({ article: "2", name: "", qty: 2, price: 990.5, vatName: "22/122", vatPercent: 22 }, false),
    calcLine({ article: "3", name: "", qty: 10, price: 45, vatName: "Без НДС", vatPercent: 0 }, false),
    calcLine({ article: "4", name: "", qty: 1, price: 15000, vatName: "13%", vatPercent: 13 }, false),
  ];
  const totals = calcTotals(lines);
  assert.deepEqual(totals, { amount: 21181, vatAmount: 3210.82, amountWithVat: 24391.82 });
});