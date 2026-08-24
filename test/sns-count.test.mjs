import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";
import { graphemeLength } from "../js/lib/text-count.mjs";
import {
  analyze,
  hasOfficialXParser,
  PLATFORMS,
  REFERENCES,
  SPEC_CHECKED_DATE,
  xWeightedLength,
} from "../js/lib/sns-count.mjs";

const charsHtml = readFileSync(new URL("../chars.html", import.meta.url), "utf8");
const twitterTextCode = readFileSync(
  new URL("../js/vendor/twitter-text-3.1.0.min.js", import.meta.url),
  "utf8"
);
const twitterTextContext = {};
vm.runInNewContext(twitterTextCode, twitterTextContext);
globalThis.twttr = twitterTextContext.twttr;

test("公式twitter-textをテストでも使用する", () => {
  assert.equal(hasOfficialXParser(), true);
});

test("画面上の文字数は結合絵文字を1文字として数える", () => {
  assert.equal(graphemeLength("あいうえお"), 5);
  assert.equal(graphemeLength("Hello"), 5);
  assert.equal(graphemeLength("👨‍👩‍👧‍👦"), 1);
  assert.equal(graphemeLength("👍🏽"), 1);
  assert.equal(graphemeLength(""), 0);
});

test("X方式は日本語を2、ラテン文字を1として数える", () => {
  assert.equal(xWeightedLength("あ"), 2);
  assert.equal(xWeightedLength("a"), 1);
  assert.equal(xWeightedLength("あa1"), 4);
});

test("X方式は公式の重み範囲を使う", () => {
  assert.equal(xWeightedLength("！"), 2);
  assert.equal(xWeightedLength("ｱ"), 2);
  assert.equal(xWeightedLength("—"), 1);
  assert.equal(xWeightedLength("…"), 2);
});

test("X方式は複雑な絵文字も2として数える", () => {
  assert.equal(xWeightedLength("😀"), 2);
  assert.equal(xWeightedLength("👍🏽"), 2);
  assert.equal(xWeightedLength("👨‍👩‍👧‍👦"), 2);
  assert.equal(xWeightedLength("🇯🇵"), 2);
  assert.equal(xWeightedLength("1️⃣"), 2);
});

test("X方式は同じ見た目の文字をNFC方式へそろえる", () => {
  assert.equal(xWeightedLength("é"), 1);
  assert.equal(xWeightedLength("e\u0301"), 1);
});

test("X方式は公式twitter-textと同じURL判定を使う", () => {
  assert.equal(xWeightedLength("https://example.com/very/long/path/to/page"), 23);
  assert.equal(xWeightedLength("example.com"), 23);
  assert.equal(xWeightedLength("(example.com)"), 25);
  assert.equal(xWeightedLength("テスト https://t.co/abc"), 30);
  assert.equal(xWeightedLength("https://example.com。"), 25);
});

test("仕様確認日と上限のHTML初期表示は設定値と一致する", () => {
  assert.equal(SPEC_CHECKED_DATE, "2026-08-19");
  const [year, month, day] = SPEC_CHECKED_DATE.split("-");
  assert.match(charsHtml, new RegExp(`${year}年${Number(month)}月${Number(day)}日`));
  for (const platform of PLATFORMS) {
    assert.match(
      charsHtml,
      new RegExp(`data-platform-limit="${platform.id}">${platform.limit}<`)
    );
  }
});

test("対象は根拠を確認できた3サービスだけ", () => {
  assert.deepEqual(PLATFORMS.map(({ id }) => id), ["x", "threads", "bluesky"]);
  assert.deepEqual(PLATFORMS.map(({ limit }) => limit), [280, 500, 300]);
  for (const platform of PLATFORMS) {
    assert.match(platform.source, /^https:\/\//);
    assert.ok(platform.sourceLabel);
  }
  assert.equal(REFERENCES.length, 4);
});

test("Xは重み付き、ThreadsとBlueskyは画面上の文字数で計算する", () => {
  const text = "あ".repeat(150);
  const result = analyze(text);
  const x = result.find(({ id }) => id === "x");
  const threads = result.find(({ id }) => id === "threads");
  const bluesky = result.find(({ id }) => id === "bluesky");
  assert.equal(x.used, 300);
  assert.equal(x.over, true);
  assert.equal(threads.used, 150);
  assert.equal(threads.over, false);
  assert.equal(bluesky.used, 150);
  assert.equal(bluesky.over, false);
});

test("各サービスは上限ちょうどを許可し、1文字超過を検出する", () => {
  for (const platform of PLATFORMS) {
    const atLimit = analyze("a".repeat(platform.limit)).find(({ id }) => id === platform.id);
    const overLimit = analyze("a".repeat(platform.limit + 1)).find(({ id }) => id === platform.id);
    assert.equal(atLimit.over, false, platform.id);
    assert.equal(atLimit.remaining, 0, platform.id);
    assert.equal(overLimit.over, true, platform.id);
    assert.equal(overLimit.remaining, -1, platform.id);
  }
});

test("空文字は使用0・残りは上限のまま", () => {
  for (const platform of analyze("")) {
    assert.equal(platform.used, 0);
    assert.equal(platform.remaining, platform.limit);
    assert.equal(platform.over, false);
    assert.equal(platform.ratio, 0);
  }
});

test("文字列以外はエラー", () => {
  assert.throws(() => graphemeLength(123), TypeError);
  assert.throws(() => xWeightedLength(null), TypeError);
  assert.throws(() => analyze(undefined), TypeError);
});
