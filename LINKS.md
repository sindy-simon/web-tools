# LINKS.md — mini-tools.net URL台帳（正本）

> 公開中の全ページのURL一覧。ツール・ページを追加、保留、復帰したら
> `sitemap.xml`・トップ（`index.html`）と三点セットで更新する。

- 本番: https://mini-tools.net/
- `main` へのpushでGitHub Pagesへ公開される。

## 公開候補のツール（3本）

| ツール | URL |
|---|---|
| 文字数・SNS投稿チェック | https://mini-tools.net/chars.html |
| 和暦・西暦・年齢計算 | https://mini-tools.net/wareki.html |
| 個人情報候補チェッカー（伏字化） | https://mini-tools.net/pii.html |

> 上記も品質監査中の候補。根拠が不足する場合は公開対象から外す。

## 旧URLの案内ページ

| ページ | URL | 扱い |
|---|---|---|
| 旧SNS文字数チェッカー | https://mini-tools.net/sns.html | `chars.html#sns` への noindex 案内。公開ツール数・サイトマップには含めない |

## サイト共通ページ

| ページ | URL |
|---|---|
| トップ | https://mini-tools.net/ |
| 運営者情報・このサイトについて | https://mini-tools.net/about.html |
| お問い合わせ | https://mini-tools.net/contact.html |
| プライバシーポリシー | https://mini-tools.net/privacy.html |

## 機械向け

| ファイル | URL |
|---|---|
| sitemap | https://mini-tools.net/sitemap.xml |
| robots.txt | https://mini-tools.net/robots.txt |
| ads.txt（AdSense） | https://mini-tools.net/ads.txt |

## 保留中（15本）

`prompt` / `birth-year` / `tax` / `age` / `case` / `text` / `zenhan` / `diff` / `regex` / `json` / `slug` / `size` / `recipe` / `timestamp` / `timezone`

`prompt` はモデル別の実測と誤差分布がなく、正規化が意味を変える反例もあるため公開保留。`birth-year` は一次情報との対応を再構築するまで公開しない。コードとテストは保持し、個別の品質条件を満たしたものだけ1本ずつ復帰を検討する。
