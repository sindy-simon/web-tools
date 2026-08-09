import { test } from "node:test";
import assert from "node:assert/strict";
import { copyRows } from "../js/copy-ui.mjs";

test("コピー結果へ埋め込む文字列をHTMLとして解釈させない", () => {
  const html = copyRows([["入力", '"><img src=x onerror=alert(1)>']]);
  assert.equal(html.includes("<img"), false);
  assert.match(html, /&lt;img/);
  assert.match(html, /&quot;&gt;/);
});
