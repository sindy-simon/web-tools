# web-tools — サクッとツール箱

登録不要・無料で使える日本語ミニツール集（静的サイト）。
GitHub Pages（`main` / `(root)`）から公開。

**公開中の全ページの URL 台帳は `LINKS.md`（正本）**。ツールを追加/削除したら
`LINKS.md`・`sitemap.xml`・トップ(`index.html`)の一覧を三点セットで更新すること。

## ツール

- 文字数カウント（`chars.html`）
- 西暦⇔和暦変換（`wareki.html`）
- 消費税計算（`tax.html`）
- 海外サイズ→日本サイズ変換（`size.html`）… 靴・服を US/UK/EU→日本サイズの目安に変換
- 海外レシピ単位変換（`recipe.html`）… カップ/oz/℉→ml/g/℃
- Unixタイムスタンプ変換（`timestamp.html`）… 秒・ms自動判別・JST↔Unix往復
- 時差計算・海外時刻→JST変換（`timezone.html`）… 主要14都市・夏時間自動対応
- 年齢・日数計算（`age.html`）… 満年齢・和暦表示・2日付の日数差
- テキストケース変換（`case.html`）… camel/Pascal/snake/CONSTANT/kebab/dot の6形式一括変換
- テキスト整形・改行コード変換（`text.html`）… CRLF⇔LF・全角スペース正規化・空行圧縮
- あなたが生まれた年の日本は？（`birth-year.html`）… 1950〜2024年の統計10項目を今と比較。Chart.js グラフ・URLシェア付き
- ほか（`slug` / `prompt` / `diff` / `regex` / `pii` / `json` / `sns` / `zenhan`）

すべてクライアントサイドで完結。入力データはサーバーに送らない。

## 構成

```
index.html chars.html wareki.html tax.html size.html recipe.html
timestamp.html timezone.html age.html case.html text.html birth-year.html
privacy.html style.css                                 ← Pages が root から配信
js/copy-ui.mjs                                         ← UI 補助
js/lib/{tax,wareki,textstats,size,recipe,timestamp,timezone,age,case,text,birth-year,birth-year-data}.mjs  ← 純粋関数ロジック
test/{tax,wareki,textstats,size,recipe,timestamp,timezone,age,case,text,birth-year}.test.mjs  ← 単体テスト
```

ロジックは `js/lib/*.mjs` の純粋関数に分離し、UI と切り離して `test/` でテストしている。
端数処理・和暦の改元境界・サイズ換算表はテストで固定済み。挙動を変える時はテストも更新すること。

## 開発・テスト

```bash
node --test        # 単体テスト（Node 18+ / 依存パッケージなし）
```

ページの動作確認はビルド不要。`index.html` をブラウザで開くだけ
（ES Modules のため `npx serve .` などローカルサーバー経由を推奨）。
push / PR で CI（`node --test`）が走る。
