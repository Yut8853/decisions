# Content and editorial rules

## 1. 一つのページで答える範囲

Situationは「条件を変えると候補が変わるが、同じ目的として比較できる」範囲です。ConditionごとのURLや近似記事を量産しません。

良い例：

- 3D商品ビューアを作りたい
- Three.jsで大量オブジェクトを表示すると重い

広すぎる例：

- Webサイトを作りたい
- Performanceを改善したい

細かすぎる例：

- Reactあり・ARあり・短納期の3D商品ビューア

Categoryは技術名ではなく利用者の目的で分類し、一つのSituationに一つだけ設定します。SEO、モバイル、React、納期などは横断Conditionとして扱い、Categoryを増やしません。

## 2. Evidence First

- Current API、Version、Support、Deprecationは公式一次情報を優先。
- Vendor DocsはCapabilityを証明できますが、他方式より優れていることは単独では証明できません。
- Performance比較は再現可能なBenchmarkが必要。
- Forum、Issue、Qiita、Zenn、個人Blogは現場の論点や反例発見に使い、仕様確定には一次情報を追加。
- SourceがClaimを部分的にしか支持しない場合は、Claimを狭める。

## 3. Negative recommendation

各Approachは最低一つの「向いていない条件」を持ちます。競合技術を貶す文章は禁止です。対象要件との不一致を説明します。

## 4. 数値

ユーザーへ0〜100の総合点を表示しません。内部Weightは -10〜10の整数に制限されています。理由のないWeightは禁止です。

## 5. 鮮度

- Evidenceは `verifiedAt` を持つ。
- 6か月以上未確認のEvidenceはValidation Warningになる。
- 高変動Technologyは月次Release観測と四半期の意味レビューを行う。
- URLが生きていても内容が変わっている可能性があるため、URL監査だけで確認日を更新しない。

## 6. 書籍

- 書名・著者・ISBNなどを自動取得する場合も、現在のTechnology Versionとの対応を別途確認。
- 古い本を出版年だけで排除しない。
- 現在のAPIに使える部分と、普遍的Conceptに使える部分を区別。
- 書籍ページまたは出版社の商品ページへ直接つなぎ、検索結果ページを掲載しない。
- 本は「その実装案で何かを作る人が、実際に手に取る理由があるか」で選ぶ。件数や日本語の本の有無を満たすために、関係の薄い本を紐づけない。
- 紐づけには必ず、その実装案で読む理由（`reason`）を書く。理由が書けない本は紐づけない。
- 本は対象バージョンと刊行年を記録し、現行と比べる。初学者が古い本を買って、今は使われない書き方から覚えることを防ぐ。
- 新しい版や、技術の新しいメジャーバージョンが出たら、`editionNote` / `outdatedNote` に書くか差し替える。
- 資格は「取得を勧める」のではなく、出題範囲を学ぶ順番の地図として載せる。
- ISBNは出版社・書店のページから写し、`pnpm books:verify` で書誌データと照合する。AIが作ったISBNを確認せずに載せない。

## Amazonアソシエイト

- 本の選定は、報酬の有無や料率と関係なく、学ぶ順番・内容・バージョンの基準で行う。報酬を理由に本を足したり順番を変えたりしない。
- Amazonのリンクは手で書かず、ISBNから商品ページのURLを作る（`src/lib/affiliate.ts`）。検索結果ページへのリンクは作らない。
- リンクには「（広告）」と `rel="sponsored"` を付け、ページ内とフッターに広告表記を出す（景品表示法のステルスマーケティング規制と、Amazonアソシエイトの規約に沿うため）。
- 価格と表紙画像はAmazonから取得しない（規約上、PA-APIを使わない価格・画像の表示はできない）。
- 表紙を表示する場合は、画像の代替テキストと出典名・出典URLを記録する。
- 表紙画像は外部の参照元を明示し、利用条件を確認せずリポジトリへ複製しない。
- Amazonや楽天の画像・価格・Reviewを利用する場合は、その時点の各Program規約を確認し、無断保存・転載をしない。

## 7. AI生成

AIによる下書きは `draft` です。公開Contentに移すには、独立Reviewer、Fact Checker、Publisher Gate、CI、Pull Request Reviewを通します。AIの文章品質はFactの正しさを意味しません。
