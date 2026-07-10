# web-tools — サクッとツール箱

登録不要・無料で使える日本語ミニツール集（静的サイト）。
GitHub Pages（`main` / `(root)`）から公開。

**公開中の全ページの URL 台帳は `LINKS.md`（正本）**。ツールを追加/削除したら
`LINKS.md`・`sitemap.xml`・トップ(`index.html`)の一覧を三点セットで更新すること。

## ツール(公開中・厳選6本)

- あなたが生まれた年の日本は？（`birth-year.html`）… 1950〜2024年の公的統計10項目を今と比較。静的データ収録・グラフ・URLシェア付き
- SNS文字数チェッカー（`sns.html`）… X の全角2/URL23 など日本語特有の数え方に対応
- 文字数カウント（`chars.html`）… 文字数・行数・バイト数・原稿用紙換算。絵文字の数え方も解説
- 西暦⇔和暦 変換（`wareki.html`）… 改元日も正確に判定。全期間の早見表つき
- 個人情報チェッカー（`pii.html`）… AIに貼る前の検出・伏字化。端末内で完結
- AIプロンプト トークン概算・軽量化（`prompt.html`）

## 一時非公開のツール(2026-07 AdSense対策で退避。git履歴に保存)

tax / age / case / text / zenhan / diff / regex / json / slug / size / recipe / timestamp / timezone の13本。
「量産テンプレページ」シグナルを避けるため一時退避した。**1本ずつ個別の解説・独自要素を満たす形に改善してから順次復帰**させる(一括復帰はしない)。ロジック(`js/lib/`)とテストは残してある。

## 構成

```
index.html + 公開6ツール(birth-year/sns/chars/wareki/pii/prompt).html
about.html contact.html privacy.html 404.html style.css   ← Pages が root から配信
js/copy-ui.mjs                                            ← UI 補助
js/lib/*.mjs                                              ← 純粋関数ロジック(退避ツール分も保持)
test/*.test.mjs                                           ← 単体テスト(退避ツール分も保持)
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
