# web-tools — サクッとツール箱

登録不要・無料で使える日本語ミニツール集（静的サイト）。
GitHub Pages（`main` / `(root)`）から公開している。

## ツール（v1）

- 文字数カウント（`chars.html`）
- 西暦⇔和暦変換（`wareki.html`）
- 消費税計算（`tax.html`）

すべてクライアントサイドで完結。入力データはサーバーに送らない。

## リポジトリ構成

```
index.html chars.html wareki.html tax.html privacy.html style.css   ← Pages が root から配信
js/copy-ui.mjs                                                       ← UI 補助
js/lib/{tax,wareki,textstats}.mjs                                    ← 純粋関数ロジック
test/{tax,wareki,textstats}.test.mjs                                ← node --test
package.json                                                        ← "test": "node --test"
.github/workflows/ci.yml                                            ← push/PR でテスト
```

ロジックは `js/lib/*.mjs` の純粋関数に分離し、UI と分離して `test/` で単体テスト済み。

## 開発・テスト

```bash
node --test        # 単体テスト（Node 18+ / 依存パッケージなし、30 件）
```

ページの動作確認はビルド不要。`index.html` をブラウザで開くだけ
（ES Modules を使っているため、`npx serve .` などのローカルサーバー経由を推奨）。

## 公開フロー

- 作業ブランチ → PR → 人がレビュー → `main` に merge で Pages 公開。
- AI は `main` へ直 push しない。PR が公開前の最後のレビュー関門。
- 端数処理・和暦の改元境界はテストで固定済み。挙動を変える時はテストも更新すること。

## オーナーの作業（収益化までの残タスク）

1. （推奨）独自ドメインを設定（AdSense はサブパスのままだと申請できない）。
2. AdSense に申請。承認後、各ページの `<!-- ▼ AdSense -->` 位置に広告コードを貼り、
   ドメイン直下に `ads.txt` を置く。
3. `privacy.html` のお問い合わせ先を記載する（AdSense 審査で必要）。
