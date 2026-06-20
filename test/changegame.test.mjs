import { test } from "node:test";
import assert from "node:assert/strict";
import {
  objectBBox,
  changedObject,
  applyChange,
  isHit,
  computeIqScore,
  percentileLabel,
  buildShareText,
  SAMPLE_SCENES,
  generateScene,
  difficultyForRound,
  CHANGE_TYPES,
} from "../js/lib/changegame.mjs";

// テスト用の決定論的乱数(mulberry32)。同じ seed なら毎回同じ列。
function seededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const emojiScene = {
  id: "t",
  w: 200,
  h: 200,
  bg: "#fff",
  objects: [
    { id: "a", emoji: "🍎", x: 50, y: 50, size: 40 },
    { id: "b", emoji: "🐦", x: 150, y: 150, size: 40 },
  ],
  changeIndex: 1,
  change: { emoji: "🦅" },
};

test("objectBBox は中心 (x,y) と size から矩形を返す", () => {
  assert.deepEqual(objectBBox({ x: 100, y: 100, size: 40 }), {
    x0: 80,
    y0: 80,
    x1: 120,
    y1: 120,
  });
});

test("changedObject は changeIndex のオブジェクトを返す", () => {
  assert.equal(changedObject(emojiScene).id, "b");
});

test("applyChange は変化箇所だけ差し替え、他は変えない(他が変わらない保証)", () => {
  const after = applyChange(emojiScene);
  assert.equal(after[1].emoji, "🦅"); // 変化箇所
  assert.equal(after[0].emoji, "🍎"); // 他はそのまま
  // 元シーンは破壊されない
  assert.equal(emojiScene.objects[1].emoji, "🐦");
});

test("isHit: 変化箇所の中心はヒット、無関係な場所は外れ", () => {
  assert.equal(isHit(emojiScene, 150, 150), true);
  assert.equal(isHit(emojiScene, 10, 10), false);
  // 変化していない別オブジェクトの上は外れ
  assert.equal(isHit(emojiScene, 50, 50), false);
});

test("isHit: 端の外側は tolerance で寛容判定できる", () => {
  // bbox は 130..170。175 は範囲外だが tolerance=10 なら入る
  assert.equal(isHit(emojiScene, 175, 150), false);
  assert.equal(isHit(emojiScene, 175, 150, 10), true);
});

test("isHit: 移動する変化は変化前後どちらの位置でもヒット", () => {
  const moveScene = {
    objects: [{ id: "p", emoji: "✈️", x: 50, y: 50, size: 40 }],
    changeIndex: 0,
    change: { x: 150, y: 50 },
  };
  assert.equal(isHit(moveScene, 50, 50), true); // 変化前の位置
  assert.equal(isHit(moveScene, 150, 50), true); // 変化後の位置
  assert.equal(isHit(moveScene, 100, 50), true); // 間(union 矩形内)
  assert.equal(isHit(moveScene, 50, 150), false); // 上下に外れ
});

test("computeIqScore: 全問正解＋即答は高スコア、全問不正解は最低 70", () => {
  const perfect = computeIqScore(
    [
      { correct: true, ms: 0 },
      { correct: true, ms: 0 },
    ],
    { timeLimitMs: 15000 }
  );
  assert.equal(perfect, 150); // skill=1 → 70+80

  const allWrong = computeIqScore(
    [
      { correct: false, ms: 15000 },
      { correct: false, ms: 15000 },
    ],
    { timeLimitMs: 15000 }
  );
  assert.equal(allWrong, 70); // skill=0
});

test("computeIqScore: 正答率と速さで単調に上がる", () => {
  const slow = computeIqScore([{ correct: true, ms: 15000 }], { timeLimitMs: 15000 });
  const fast = computeIqScore([{ correct: true, ms: 0 }], { timeLimitMs: 15000 });
  assert.ok(fast > slow);
  // 正答(速度0)＝70+0.7*80=126、不正答=70
  assert.equal(slow, 126);
});

test("computeIqScore: 空配列はエラー", () => {
  assert.throws(() => computeIqScore([]), RangeError);
});

test("percentileLabel: スコアが高いほど上位%は小さい", () => {
  const avg = percentileLabel(100);
  const high = percentileLabel(140);
  assert.ok(Math.abs(avg.percentile - 50) < 1); // 平均は約50%
  assert.ok(high.percentile < 5); // 140 は上位数%
  assert.ok(high.percentile < avg.percentile);
});

test("buildShareText: スコアと正答数とハッシュタグを含む", () => {
  const txt = buildShareText({ iqScore: 134, correct: 4, total: 5 });
  assert.match(txt, /134/);
  assert.match(txt, /5問中 4問/);
  assert.match(txt, /#変化検出/);
});

test("SAMPLE_SCENES: 全シーンが妥当(changeIndex が範囲内・変化箇所がヒット可能)", () => {
  for (const scene of SAMPLE_SCENES) {
    assert.ok(scene.changeIndex >= 0 && scene.changeIndex < scene.objects.length);
    const c = changedObject(scene);
    // 変化箇所の中心は必ずヒットする(問題として成立)
    assert.equal(isHit(scene, c.x, c.y), true, `${scene.id} の中心がヒットしない`);
  }
});

test("generateScene: 指定した個数のオブジェクトを生成し、変化箇所はヒット可能", () => {
  const scene = generateScene({ count: 8 }, seededRng(42));
  assert.equal(scene.objects.length, 8);
  assert.ok(scene.changeIndex >= 0 && scene.changeIndex < 8);
  const c = changedObject(scene);
  assert.equal(isHit(scene, c.x, c.y), true);
});

test("generateScene: 変化は changeIndex の 1 箇所だけ(他は不変)", () => {
  const scene = generateScene({ count: 10 }, seededRng(7));
  const after = applyChange(scene);
  let diffs = 0;
  for (let i = 0; i < scene.objects.length; i++) {
    if (JSON.stringify(after[i]) !== JSON.stringify(scene.objects[i])) diffs++;
  }
  assert.equal(diffs, 1, "差分は 1 箇所だけであるべき");
});

test("generateScene: 各変化タイプが実際に何かを変える", () => {
  for (const type of CHANGE_TYPES) {
    const scene = generateScene({ count: 6, changeType: type }, seededRng(123));
    assert.equal(scene.changeType, type);
    const before = scene.objects[scene.changeIndex];
    const after = applyChange(scene)[scene.changeIndex];
    assert.notDeepEqual(after, before, `${type} が変化を生んでいない`);
  }
});

test("generateScene: swap は別の絵文字に変わる", () => {
  const scene = generateScene({ count: 6, changeType: "swap" }, seededRng(99));
  const before = scene.objects[scene.changeIndex];
  const after = applyChange(scene)[scene.changeIndex];
  assert.notEqual(after.emoji, before.emoji);
});

test("generateScene: 同じ seed なら同じシーン(決定論)", () => {
  const a = generateScene({ count: 6 }, seededRng(2024));
  const b = generateScene({ count: 6 }, seededRng(2024));
  assert.deepEqual(a, b);
});

test("generateScene: オブジェクトは盤面内に収まる", () => {
  const scene = generateScene({ count: 12 }, seededRng(555));
  for (const o of scene.objects) {
    assert.ok(o.x >= 0 && o.x <= scene.w, `x が範囲外: ${o.x}`);
    assert.ok(o.y >= 0 && o.y <= scene.h, `y が範囲外: ${o.y}`);
  }
});

test("difficultyForRound: 進むほど難しくなる(個数増・時間減)", () => {
  const d0 = difficultyForRound(0);
  const d3 = difficultyForRound(3);
  assert.ok(d3.count > d0.count);
  assert.ok(d3.timeLimitMs < d0.timeLimitMs);
  // 上限・下限が効く
  assert.ok(difficultyForRound(100).count <= 18);
  assert.ok(difficultyForRound(100).timeLimitMs >= 7000);
});
