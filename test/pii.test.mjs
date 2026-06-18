import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPII, maskPII } from "../js/lib/pii.mjs";

function types(text) {
  return detectPII(text).map((f) => f.type);
}

test("メールアドレスを検出する", () => {
  const f = detectPII("連絡は taro@example.com まで");
  assert.equal(f.length, 1);
  assert.equal(f[0].type, "email");
  assert.equal(f[0].value, "taro@example.com");
});

test("電話番号を検出する(ハイフンあり/なし)", () => {
  assert.deepEqual(types("090-1234-5678"), ["phone"]);
  assert.deepEqual(types("09012345678"), ["phone"]);
});

test("Luhn が通るカード番号を検出する", () => {
  assert.deepEqual(types("4242 4242 4242 4242"), ["creditcard"]);
});

test("Luhn が通らない16桁はカードとして検出しない", () => {
  assert.equal(types("1234 5678 9012 3456").includes("creditcard"), false);
});

test("マイナンバー(12桁)を検出する", () => {
  assert.deepEqual(types("123456789012"), ["mynumber"]);
});

test("IPアドレスと郵便番号を検出する", () => {
  assert.deepEqual(types("192.168.0.1"), ["ip"]);
  assert.deepEqual(types("〒100-0001"), ["postal"]);
});

test("通常の文章では誤検出しない", () => {
  assert.deepEqual(detectPII("今日は2024年で価格は1000円です"), []);
});

test("複数のPIIを出現順で返す", () => {
  const f = detectPII("a@b.com と 090-1234-5678");
  assert.deepEqual(f.map((x) => x.type), ["email", "phone"]);
  assert.ok(f[0].start < f[1].start);
});

test("maskPII は検出箇所を[ラベル]に置換する", () => {
  const { masked, found } = maskPII("a@b.com / 090-1234-5678");
  assert.equal(masked, "[メールアドレス] / [電話番号]");
  assert.equal(found.length, 2);
});

test("PIIが無ければ原文のまま", () => {
  assert.equal(maskPII("ふつうの文章").masked, "ふつうの文章");
});

test("文字列以外はエラー", () => {
  assert.throws(() => detectPII(123), TypeError);
});
