# web-tools — サクッとツール箱

登録不要・無料で使える日本語ミニツール集（静的サイト）。
GitHub Pages（`main` / `(root)`）から公開。

## ツール

- 文字数カウント（`chars.html`）
- 西暦⇔和暦変換（`wareki.html`）
- 消費税計算（`tax.html`）

すべてクライアントサイドで完結。入力データはサーバーに送らない。

## 構成

```
index.html chars.html wareki.html tax.html privacy.html style.css   ← Pages が root から配信
js/copy-ui.mjs                                                       ← UI 補助
js/lib/{tax,wareki,textstats}.mjs                                    ← 純粋関数ロジック
test/{tax,wareki,textstats}.test.mjs                                ← 単体テスト
```

ロジックは `js/lib/*.mjs` の純粋関数に分離し、UI と切り離して `test/` でテストしている。
端数処理・和暦の改元境界はテストで固定済み。挙動を変える時はテストも更新すること。

## 開発・テスト

```bash
node --test        # 単体テスト（Node 18+ / 依存パッケージなし）
```

ページの動作確認はビルド不要。`index.html` をブラウザで開くだけ
（ES Modules のため `npx serve .` などローカルサーバー経由を推奨）。
push / PR で CI（`node --test`）が走る。
