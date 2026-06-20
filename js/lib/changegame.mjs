// 変化検出ゲーム(チェンジ・ブラインドネス)のロジック — ブラウザ・Node 共用の純粋関数。
//
// 設計の肝: 「1箇所だけ変わる・他は変わらない」を構造的に保証するため、
// 2枚の画像を別々に作らず、1つの "シーン定義(データ)" を持ち、
// そのうち 1 オブジェクトだけ change を適用して "変化後" を描く。
// ベースが同一なので、差分は必ずその 1 箇所だけになる。
// v1 の素材は絵文字を canvas に描画(画像ファイル不要・組合せで量産可能)。

/**
 * シーン定義の形:
 * {
 *   id, w, h, bg,
 *   objects: [{ id, emoji, x, y, size }, ...],
 *   changeIndex,                 // 変化するオブジェクトの index
 *   change: { emoji? , hidden? , x? , y? }  // 適用する差分(部分プロパティ)
 * }
 */

/** オブジェクトの当たり判定矩形(絵文字は中心 (x,y) に size で描画)。 */
export function objectBBox(obj) {
  const half = obj.size / 2;
  return { x0: obj.x - half, y0: obj.y - half, x1: obj.x + half, y1: obj.y + half };
}

/** 変化するオブジェクト(変化前の状態)を返す。 */
export function changedObject(scene) {
  const obj = scene.objects[scene.changeIndex];
  if (!obj) throw new RangeError(`changeIndex が不正です: ${scene.changeIndex}`);
  return obj;
}

/** change を適用した "変化後" の objects 配列を返す(元配列は変更しない)。 */
export function applyChange(scene) {
  return scene.objects.map((obj, i) =>
    i === scene.changeIndex ? { ...obj, ...scene.change } : obj
  );
}

/** 2 つの矩形を内包する最小矩形(変化前後で位置が動く change にも対応)。 */
function unionBBox(a, b) {
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
  };
}

/**
 * (px, py) が変化箇所をタップできているか判定する。
 * 変化前・変化後の両方の位置を内包する矩形 + 余白(tolerance)で寛容に判定する。
 */
export function isHit(scene, px, py, tolerance = 0) {
  const before = objectBBox(changedObject(scene));
  const afterObj = applyChange(scene)[scene.changeIndex];
  // hidden(消える)変化では変化後の矩形は無いので変化前のみ使う。
  const area = afterObj.hidden ? before : unionBBox(before, objectBBox(afterObj));
  return (
    px >= area.x0 - tolerance &&
    px <= area.x1 + tolerance &&
    py >= area.y0 - tolerance &&
    py <= area.y1 + tolerance
  );
}

/** 標準正規分布の累積分布関数(erf 近似)。percentile 算出用。 */
function normalCdf(z) {
  // Abramowitz & Stegun 7.1.26 による erf 近似
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-(z * z) / 2);
  const cdf = 0.5 * (1 + (z < 0 ? -y : y));
  return cdf;
}

/**
 * ラウンド結果から「IQ風スコア(エンタメ)」を算出する。決定論的。
 * ※臨床的な IQ ではなく、正答率と速さから出す遊び用スコア。
 *
 * @param {{correct:boolean, ms:number}[]} rounds 各ラウンドの結果
 * @param {{timeLimitMs?:number}} [opts]
 * @returns {number} 70〜150 のスコア
 */
export function computeIqScore(rounds, opts = {}) {
  if (!Array.isArray(rounds) || rounds.length === 0) {
    throw new RangeError("rounds は 1 件以上必要です");
  }
  const timeLimitMs = opts.timeLimitMs ?? 15000;
  const n = rounds.length;
  const correctRounds = rounds.filter((r) => r.correct);
  const accuracy = correctRounds.length / n; // 0..1
  // 速さ: 正答ラウンドの「残り時間の割合」の平均(0..1)。正答 0 なら 0。
  const speed =
    correctRounds.length > 0
      ? correctRounds.reduce(
          (s, r) => s + clamp01((timeLimitMs - r.ms) / timeLimitMs),
          0
        ) / correctRounds.length
      : 0;
  const skill = 0.7 * accuracy + 0.3 * speed; // 0..1
  return Math.round(70 + skill * 80); // 70..150
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/**
 * IQ風スコアから「上位約X%」のラベルを返す(平均100・標準偏差15の正規分布近似)。
 * @returns {{ percentile:number, label:string }} percentile は上位%(小さいほど上位)
 */
export function percentileLabel(iqScore) {
  const z = (iqScore - 100) / 15;
  const top = (1 - normalCdf(z)) * 100; // 上位 top %
  const percentile = Math.max(0.1, Math.round(top * 10) / 10);
  return { percentile, label: `上位 約${percentile}%` };
}

/** 結果からシェア用テキストを生成する。 */
export function buildShareText({ iqScore, correct, total }) {
  const { label } = percentileLabel(iqScore);
  return (
    `IQ風スコア ${iqScore}（${label}）！\n` +
    `変化検出チャレンジで ${total}問中 ${correct}問正解 👀\n` +
    `あなたは気づける？ #変化検出 #脳トレ #IQ風診断`
  );
}

/**
 * サンプルシーン(手書き)。背景色 + 絵文字オブジェクト + 1 箇所の変化。
 * 変化タイプ: emoji 差し替え / hidden(消える) / 位置移動 を網羅。
 */
export const SAMPLE_SCENES = [
  {
    id: "park",
    w: 360,
    h: 480,
    bg: "#bfe3b0",
    objects: [
      { id: "tree", emoji: "🌳", x: 70, y: 90, size: 56 },
      { id: "bird", emoji: "🐦", x: 290, y: 110, size: 36 },
      { id: "apple", emoji: "🍎", x: 180, y: 300, size: 44 },
      { id: "flower", emoji: "🌷", x: 110, y: 400, size: 40 },
      { id: "sun", emoji: "☀️", x: 300, y: 360, size: 44 },
    ],
    changeIndex: 2,
    change: { emoji: "🍊" }, // 🍎 → 🍊
  },
  {
    id: "room",
    w: 360,
    h: 480,
    bg: "#f0e3d0",
    objects: [
      { id: "clock", emoji: "🕐", x: 80, y: 80, size: 44 },
      { id: "book", emoji: "📕", x: 280, y: 130, size: 40 },
      { id: "cat", emoji: "🐈", x: 160, y: 320, size: 48 },
      { id: "lamp", emoji: "💡", x: 300, y: 380, size: 40 },
    ],
    changeIndex: 1,
    change: { hidden: true }, // 📕 が消える
  },
  {
    id: "sky",
    w: 360,
    h: 480,
    bg: "#cfe8ff",
    objects: [
      { id: "cloud1", emoji: "☁️", x: 100, y: 100, size: 48 },
      { id: "plane", emoji: "✈️", x: 200, y: 200, size: 44 },
      { id: "cloud2", emoji: "☁️", x: 290, y: 300, size: 48 },
      { id: "balloon", emoji: "🎈", x: 120, y: 380, size: 40 },
    ],
    changeIndex: 1,
    change: { x: 280, y: 160 }, // ✈️ が移動
  },
];

// ---- ここから「問題の自動量産」用ロジック ----
// AI 画像を使わず、絵文字シーンをプログラムで無限に生成する。
// これにより「量産」を実証でき、後で素材を AI 透過画像に差し替えられる。

/** 出題に使う絵文字プール。 */
export const EMOJI_POOL = [
  "🍎", "🍊", "🍋", "🍇", "🍓", "🍄", "🌳", "🌷", "🌻", "⭐",
  "🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐢", "🐸", "🦋",
  "🚗", "✈️", "⚽", "🎈", "🎁", "☂️", "🔔", "💡", "🕐", "📕",
];

/** 背景色プール。 */
export const BG_POOL = ["#bfe3b0", "#f0e3d0", "#cfe8ff", "#fde2e4", "#e7e0ff", "#fff3c4"];

/** 適用可能な変化タイプ。 */
export const CHANGE_TYPES = ["swap", "hidden", "appear", "move", "resize"];

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

/**
 * 絵文字シーンを 1 つ自動生成する(純粋関数・乱数は注入可能でテスト可能)。
 *
 * @param {{w?:number,h?:number,count?:number,size?:number,palette?:string[],
 *          changeType?:string, bg?:string}} [opts]
 * @param {() => number} [rng] 0..1 を返す乱数(既定 Math.random)。テストでは固定 rng を注入。
 * @returns {object} シーン定義(SAMPLE_SCENES と同形 + changeType)
 */
export function generateScene(opts = {}, rng = Math.random) {
  const w = opts.w ?? 360;
  const h = opts.h ?? 480;
  const count = Math.max(2, opts.count ?? 6);
  const size = opts.size ?? 40;
  const pool = opts.palette ?? EMOJI_POOL;
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  // グリッドにジッターを足して配置(重なりを抑える)。
  const margin = 56;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellW = (w - margin) / cols;
  const cellH = (h - margin) / rows;
  const objects = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = Math.round(margin / 2 + cellW * (c + 0.5) + (rng() - 0.5) * cellW * 0.4);
    const y = Math.round(margin / 2 + cellH * (r + 0.5) + (rng() - 0.5) * cellH * 0.4);
    objects.push({ id: `o${i}`, emoji: pick(pool), x, y, size });
  }

  const changeIndex = Math.floor(rng() * count);
  const target = objects[changeIndex];
  const type = opts.changeType ?? pick(CHANGE_TYPES);
  let change;
  switch (type) {
    case "hidden": // 消える
      change = { hidden: true };
      break;
    case "appear": // 現れる(変化前は隠しておく)
      target.hidden = true;
      change = { hidden: false };
      break;
    case "move": { // 動く
      const dx = (rng() < 0.5 ? -1 : 1) * Math.round(22 + rng() * 22);
      const dy = (rng() < 0.5 ? -1 : 1) * Math.round(22 + rng() * 22);
      change = {
        x: clamp(target.x + dx, margin / 2, w - margin / 2),
        y: clamp(target.y + dy, margin / 2, h - margin / 2),
      };
      break;
    }
    case "resize": // 大きさが変わる
      change = { size: Math.round(size * 1.7) };
      break;
    case "swap": // 別物に変わる
    default: {
      let e = pick(pool);
      for (let guard = 0; e === target.emoji && guard < 10; guard++) e = pick(pool);
      change = { emoji: e };
      break;
    }
  }
  return { id: `gen-${type}`, w, h, bg: opts.bg ?? pick(BG_POOL), objects, changeIndex, change, changeType: type };
}

/**
 * ラウンド番号から難易度パラメータを返す(易→難)。
 * 後半ほどオブジェクトが増え、制限時間が短くなる。
 * @returns {{count:number, timeLimitMs:number}}
 */
export function difficultyForRound(round) {
  const r = Math.max(0, round);
  return {
    count: Math.min(4 + r * 2, 18), // 4,6,8,... 上限18
    timeLimitMs: Math.max(7000, 15000 - r * 1500), // 15s から短縮、下限7s
  };
}
