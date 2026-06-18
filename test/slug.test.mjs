import { test } from "node:test";
import assert from "node:assert/strict";
import { kanaToRomaji, slugify } from "../js/lib/slug.mjs";

test("ひらがなをヘボン式ローマ字にする", () => {
  assert.equal(kanaToRomaji("こんにちは"), "konnichiha");
  assert.equal(kanaToRomaji("せかい"), "sekai");
});

test("拗音(きょ・しゃ)を変換する", () => {
  assert.equal(kanaToRomaji("きょう"), "kyou");
  assert.equal(kanaToRomaji("しゃしん"), "shashin");
});

test("促音(っ)は子音を重ねる", () => {
  assert.equal(kanaToRomaji("がっこう"), "gakkou");
  assert.equal(kanaToRomaji("マッチ"), "matchi"); // っ+ち → tchi
});

test("カタカナも変換し、長音は省略する", () => {
  assert.equal(kanaToRomaji("タワー"), "tawa");
});

test("かな以外(英数字)はそのまま通す", () => {
  assert.equal(kanaToRomaji("abc123"), "abc123");
});

test("slugify: かなのタイトルをスラッグにする", () => {
  assert.equal(slugify("こんにちは せかい"), "konnichiha-sekai");
});

test("slugify: 英数字混在を小文字ハイフン区切りに", () => {
  assert.equal(slugify("Hello World 2026"), "hello-world-2026");
});

test("slugify: 連続記号は1つの区切りにまとめ、前後の区切りは除く", () => {
  assert.equal(slugify("  あい！！うえ  "), "ai-ue");
});

test("slugify: 区切り文字を変更できる", () => {
  assert.equal(slugify("Hello World", "_"), "hello_world");
});

test("文字列以外はエラー", () => {
  assert.throws(() => kanaToRomaji(123), TypeError);
  assert.throws(() => slugify(null), TypeError);
});
