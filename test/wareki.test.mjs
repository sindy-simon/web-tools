import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dateStringToWareki,
  seirekiToWareki,
  warekiToSeireki,
  warekiFormats,
} from "../js/lib/wareki.mjs";

test("改元日の前後で元号が切り替わる(平成→令和)", () => {
  assert.deepEqual(seirekiToWareki(2019, 4, 30), {
    era: "平成",
    year: 31,
    label: "平成31年",
  });
  assert.deepEqual(seirekiToWareki(2019, 5, 1), {
    era: "令和",
    year: 1,
    label: "令和元年",
  });
});

test("改元日の前後で元号が切り替わる(昭和→平成)", () => {
  assert.equal(seirekiToWareki(1989, 1, 7).label, "昭和64年");
  assert.equal(seirekiToWareki(1989, 1, 8).label, "平成元年");
});

test("月日を省略すると 7/1 とみなす", () => {
  // 1912 年は 7/30 に大正へ改元 → 7/1 時点ではまだ明治
  assert.equal(seirekiToWareki(1912).era, "明治");
  assert.equal(seirekiToWareki(2026).era, "令和");
});

test("明治より前は null", () => {
  assert.equal(seirekiToWareki(1867), null);
});

test("明治元年の開始日を新暦で判定する", () => {
  assert.equal(seirekiToWareki(1868, 10, 22), null);
  assert.equal(seirekiToWareki(1868, 10, 23).label, "明治元年");
});

test("和暦→西暦の基本変換", () => {
  assert.equal(warekiToSeireki("令和", 1), 2019);
  assert.equal(warekiToSeireki("令和", 8), 2026);
  assert.equal(warekiToSeireki("平成", 31), 2019);
  assert.equal(warekiToSeireki("昭和", 64), 1989);
  assert.equal(warekiToSeireki("明治", 45), 1912);
});

test("元号の範囲を超える年はエラー(昭和65年など)", () => {
  assert.throws(() => warekiToSeireki("昭和", 65), RangeError);
  assert.throws(() => warekiToSeireki("平成", 32), RangeError);
});

test("和暦の各種表記(コピペ用フォーマット)", () => {
  assert.deepEqual(warekiFormats("令和", 8), {
    standard: "令和8年",
    padded: "令和08年",
    initial: "R8",
  });
  assert.deepEqual(warekiFormats("平成", 1), {
    standard: "平成元年",
    padded: "平成01年",
    initial: "H1",
  });
  assert.equal(warekiFormats("昭和", 64).initial, "S64");
  assert.throws(() => warekiFormats("慶応", 1), RangeError);
  assert.throws(() => warekiFormats("令和", 0), RangeError);
});

test("不正な入力はエラー", () => {
  assert.throws(() => warekiToSeireki("慶応", 1), RangeError);
  assert.throws(() => warekiToSeireki("令和", 0), RangeError);
  assert.throws(() => seirekiToWareki("2024"), TypeError);
  assert.throws(() => seirekiToWareki(2024, 2, 30), RangeError);
  assert.throws(() => seirekiToWareki(2024, 13, 1), RangeError);
});

test("西暦の日付文字列を年月日付きの和暦へ変換する", () => {
  assert.deepEqual(dateStringToWareki("2019-05-01"), {
    era: "令和",
    year: 1,
    month: 5,
    day: 1,
    label: "令和元年5月1日",
  });
  assert.equal(dateStringToWareki("1989-01-07").label, "昭和64年1月7日");
  assert.throws(() => dateStringToWareki("1868-10-22"), RangeError);
  assert.throws(() => dateStringToWareki("2024-02-30"), RangeError);
});
