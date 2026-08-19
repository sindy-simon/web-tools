import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPII, maskPII } from "../js/lib/pii.mjs";

const pageHtml = readFileSync(new URL("../pii.html", import.meta.url), "utf8");
const pageScript = readFileSync(new URL("../js/pages/pii-page.mjs", import.meta.url), "utf8");

function types(text) {
  return detectPII(text).map((f) => f.type);
}

test("メールアドレスを検出する", () => {
  const f = detectPII("連絡は taro@example.com まで");
  assert.equal(f.length, 1);
  assert.equal(f[0].type, "email");
  assert.equal(f[0].value, "taro@example.com");
});

test("国内電話番号を検出し、対象外形式は検出しない", () => {
  assert.deepEqual(types("090-1234-5678"), ["phone"]);
  assert.deepEqual(types("09012345678"), ["phone"]);
  assert.deepEqual(types("+81-90-1234-5678"), []);
});

test("Luhn が通る13〜19桁のカード番号候補を検出する", () => {
  assert.deepEqual(types("4242 4242 4242 4242"), ["creditcard"]);
  assert.deepEqual(types("4000000000000000006"), ["creditcard"]);
});

test("Luhn が通らない16桁はカードとして検出しない", () => {
  assert.equal(types("1234 5678 9012 3456").includes("creditcard"), false);
});

test("マイナンバー(12桁)を検出する", () => {
  assert.deepEqual(types("123456789012"), ["mynumber"]);
});

test("有効範囲のIPv4と独立した郵便番号候補だけを検出する", () => {
  assert.deepEqual(types("192.168.0.1"), ["ip"]);
  assert.deepEqual(types("255.255.255.255"), ["ip"]);
  assert.deepEqual(types("999.168.0.1"), []);
  assert.deepEqual(types("2001:db8::1"), []);
  assert.deepEqual(types("〒100-0001"), ["postal"]);
  assert.deepEqual(types("1100-0001"), []);
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
  assert.equal(masked, "[メールアドレス] / [国内電話番号候補]");
  assert.equal(found.length, 2);
});

test("PIIが無ければ原文のまま", () => {
  assert.equal(maskPII("ふつうの文章").masked, "ふつうの文章");
});

test("PIIページは第三者スクリプトと接続要求を許可しない", () => {
  assert.doesNotMatch(pageHtml, /<script[^>]+src="https?:/);
  assert.match(pageHtml, /connect-src 'none'/);
  assert.match(pageHtml, /src="\.\/js\/pages\/pii-page\.mjs"/);
  assert.doesNotMatch(pageScript, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/);
});

test("ページ上に検出対象外と誤検出の境界がある", () => {
  assert.match(pageHtml, /13〜19桁/);
  assert.match(pageHtml, /注文番号なども誤検出/);
  assert.match(pageHtml, /パスワード、APIキー/);
  assert.match(pageHtml, /結果が0件でも安全を意味しません/);
});

test("文字列以外はエラー", () => {
  assert.throws(() => detectPII(123), TypeError);
});
