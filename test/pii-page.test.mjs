import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageHtml = readFileSync(new URL("../pii.html", import.meta.url), "utf8");
const pageScript = readFileSync(new URL("../js/pages/pii-page.mjs", import.meta.url), "utf8");

test("PIIページは第三者スクリプトと入力送信用の接続APIを許可しない", () => {
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

test("正規名称をページ内で一貫して使う", () => {
  assert.match(pageHtml, /個人情報候補チェッカーの目的/);
  assert.doesNotMatch(pageHtml, /<h2>個人情報チェッカーの目的<\/h2>/);
});
