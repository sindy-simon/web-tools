import { test } from "node:test";
import assert from "node:assert/strict";
import {
  convertVolume,
  convertWeight,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
} from "../js/lib/recipe.mjs";

test("tsp → ml", () => {
  assert.equal(convertVolume(1, "tsp"), 4.9);
});

test("1 cup → ml", () => {
  assert.equal(convertVolume(1, "cup"), 236.6);
});

test("2 cups → ml", () => {
  assert.equal(convertVolume(2, "cup"), 473.2);
});

test("1 tbsp → ml", () => {
  assert.equal(convertVolume(1, "tbsp"), 14.8);
});

test("1 fl oz → ml", () => {
  assert.equal(convertVolume(1, "floz"), 29.6);
});

test("1 oz → g", () => {
  assert.equal(convertWeight(1, "oz"), 28.3);
});

test("1 lb → g", () => {
  assert.equal(convertWeight(1, "lb"), 453.6);
});

test("℉100 → ℃", () => {
  assert.equal(fahrenheitToCelsius(100), 37.8);
});

test("℃0 → ℉", () => {
  assert.equal(celsiusToFahrenheit(0), 32);
});

test("℉32 → ℃0（境界値）", () => {
  assert.equal(fahrenheitToCelsius(32), 0);
});

test("体積: 負の値は RangeError", () => {
  assert.throws(() => convertVolume(-1, "cup"), RangeError);
});

test("体積: 不明な単位は TypeError", () => {
  assert.throws(() => convertVolume(1, "gallon"), TypeError);
});

test("重量: 非数値は TypeError", () => {
  assert.throws(() => convertWeight("abc", "oz"), TypeError);
});
