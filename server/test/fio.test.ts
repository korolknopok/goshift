import { test } from "node:test";
import assert from "node:assert/strict";
import { genitiveFullName } from "../src/domain/fio";

test("Воронцов Пётр Аркадьевич -> родительный", () => {
  assert.equal(
    genitiveFullName({ lastName: "Воронцов", firstName: "Пётр", middleName: "Аркадьевич" }).text,
    "Воронцова Петра Аркадьевича"
  );
});

test("Седых — несклоняемая фамилия", () => {
  assert.equal(
    genitiveFullName({ lastName: "Седых", firstName: "Вера", middleName: "Павловна" }).text,
    "Седых Веры Павловны"
  );
});

test("Коваленко — несклоняемая фамилия на -ко", () => {
  assert.equal(
    genitiveFullName({ lastName: "Коваленко", firstName: "Тарас", middleName: "Игоревич" }).text,
    "Коваленко Тараса Игоревича"
  );
});