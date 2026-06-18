import { test } from "node:test";
import assert from "node:assert/strict";
import { diffLines, diffStats } from "../js/lib/diff.mjs";

test("同一テキストはすべて equal", () => {
  const d = diffLines("a\nb\nc", "a\nb\nc");
  assert.deepEqual(d.map((p) => p.type), ["equal", "equal", "equal"]);
});

test("行の追加を検出する", () => {
  const d = diffLines("x", "x\ny");
  assert.deepEqual(d, [
    { type: "equal", line: "x" },
    { type: "add", line: "y" },
  ]);
});

test("行の削除を検出する", () => {
  const d = diffLines("x\ny", "x");
  assert.deepEqual(d, [
    { type: "equal", line: "x" },
    { type: "remove", line: "y" },
  ]);
});

test("行の変更は remove + add で表す", () => {
  const d = diffLines("a\nb\nc", "a\nB\nc");
  const s = diffStats(d);
  assert.equal(s.equal, 2);
  assert.equal(s.add, 1);
  assert.equal(s.remove, 1);
  assert.ok(d.some((p) => p.type === "remove" && p.line === "b"));
  assert.ok(d.some((p) => p.type === "add" && p.line === "B"));
});

test("diffStats は件数を集計する", () => {
  const d = diffLines("1\n2\n3", "1\n3\n4");
  const s = diffStats(d);
  assert.equal(s.equal, 2); // 1 と 3
  assert.equal(s.remove, 1); // 2
  assert.equal(s.add, 1); // 4
});

test("空文字どうしは1つの空行 equal", () => {
  assert.deepEqual(diffLines("", ""), [{ type: "equal", line: "" }]);
});

test("文字列以外はエラー", () => {
  assert.throws(() => diffLines(1, "a"), TypeError);
  assert.throws(() => diffLines("a", null), TypeError);
});
