# Issue #13: プロンプトのトークン概算・正規化の根拠監査

調査日: 2026-08-23  
対象: `sindy-simon/web-tools` のプロンプト用ツールにあるトークン概算、コンテキスト長、文字列正規化の説明  
調査方針: ベンダー公式文書・公式実装・仕様だけを使用

## 結論

**現状のままでは保留（hold）を推奨する。**

「漢字≒1トークン、かな≒0.67トークン、ASCII≒4文字/トークン」というモデル非依存の計算式、「GPT 128K・Claude 200K・Gemini 1M」というベンダー単位の上限表示、「全角→半角と空白圧縮では意味が変わらない」という説明は、いずれも一般的な事実としては支持できない。モデルIDを明記した概算へ変更し、正規化を任意操作にして危険性を表示するまでは公開候補にしない方がよい。

## 1. 日本語の固定トークン比率

判定: **モデル非依存の比率としては根拠不足。**

- OpenAI公式の `tiktoken` は、平均では1トークンがおよそ4**バイト**に相当すると説明している。これは「どのモデル・言語でも4文字」という保証ではない。また、モデルに対応するトークナイザーを `encoding_for_model()` で選ぶ設計になっている。[OpenAI tiktoken](https://github.com/openai/tiktoken)
- OpenAI公式Cookbookでは、同じ日本語9文字「お誕生日おめでとう」が、エンコーディングによって14、9、8トークンになる。日本語の文字数から単一の係数で正確に求められないことを公式例自体が示している。[OpenAI Cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb)
- Anthropicは、渡した`model`のトークナイザーで数えるAPIを提供している。さらに新旧トークナイザーでは同一内容でもおよそ30%変わり得るため、以前の計測値を再利用しないよう案内している。[Anthropic token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting)
- GoogleはGeminiについて「およそ4文字/トークン」とする一方、正確な入力数にはモデルを指定する`count_tokens`の利用を案内している。この近似をOpenAI・Claudeを含む共通式にはできない。[Gemini token counting](https://ai.google.dev/gemini-api/docs/tokens)

したがって、漢字・かな・ASCIIの固定比率を使う場合でも、表示名は「独自の簡易概算」とし、料金計算や上限判定には使えないと明記する必要がある。より望ましいのは、対象モデルを選択させ、公式トークナイザーまたは各社のtoken-count APIで数えること。

## 2. 「GPT 128K・Claude 200K・Gemini 1M」

判定: **特定モデルには合うが、ベンダー全体の上限としては不正確。**

| 表示案 | 公式資料で確認できる差 | 判定 |
|---|---|---|
| GPT 128K | GPT-4oは128,000だが、GPT-5.6 Solは1,050,000。 | `GPT`全体の値として不可 |
| Claude 200K | Anthropic公式は、現行モデルを1Mと200Kに分けている。 | `Claude`全体の値として不可 |
| Gemini 1M | Gemini 2.5 Flashなどは入力1,048,576だが、画像生成系には65,536、Live系には131,072のモデルもある。 | `Gemini`全体の値として不可 |

根拠:

- [OpenAI GPT-4o: 128,000](https://developers.openai.com/api/docs/models/gpt-4o)
- [OpenAI GPT-5.6 Sol: 1,050,000](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [Anthropic context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Gemini 2.5 Flash: input 1,048,576](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)
- [Gemini 2.5 Flash Image: input 65,536](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image)
- [Geminiのモデル別上限取得方法](https://ai.google.dev/gemini-api/docs/tokens)

表示するなら、ベンダー名ではなく正確なモデルID、入力上限と出力上限の別、公式URL、確認日を併記する。値は更新されるため、モデル名のない固定バッジは避ける。

## 3. 「全角→半角・空白圧縮で意味は変わらない」

判定: **支持できず、反例が仕様上存在する。**

- Unicodeは、互換正規化（NFKC/NFKD）を任意の文章へ無条件に適用してはならないとしている。半角・全角などの区別を消し、文章の意味に重要な差まで失う場合があるためである。[Unicode Standard Annex #15](https://unicode.org/reports/tr15/)
- 空白はコードでは構文になり得る。Python公式仕様では、行頭の空白からインデントレベルを計算し、文のグループ分けを決める。改行と空白を1個へ圧縮すると、正常なコードを別の処理または構文エラーへ変え得る。[Python lexical analysis: Indentation](https://docs.python.org/3/reference/lexical_analysis.html#indentation)
- Markdownでも空白と改行は構文になり得る。CommonMark仕様では、行末の2個以上の空白が強制改行を表す。空白圧縮はレンダリング結果を変える。[CommonMark: Hard line breaks](https://spec.commonmark.org/0.31.2/#hard-line-breaks)

よって「意味は変わらない」は削除する。正規化機能を残す場合は、(1) 初期状態はOFF、(2) 原文を保持、(3) 変更前後の差分を表示、(4) 「コード・Markdown・表・固有表記では意味や動作が変わる場合がある」と警告、(5) 元に戻す操作を用意するのが妥当。

## 公開可能にする最低条件

1. モデル非依存の固定係数を「正確なトークン数」として扱わない。
2. 対象モデルを明記し、可能なら公式トークナイザーまたは公式token-count APIを使う。
3. コンテキスト長はモデルID・入力/出力の区別・確認日・出典とセットで表示する。
4. 正規化は任意操作にし、原文保持・差分・警告・取り消しを備える。
5. 日本語、ASCII、Python、Markdown、全角記号、連続空白を含む回帰テストを追加する。

この修正後に再監査し、説明と動作が一致すれば公開候補へ戻せる。
