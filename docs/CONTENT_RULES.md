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
- Amazonや楽天の画像・価格・Reviewを利用する場合は、その時点の各Program規約を確認し、無断保存・転載をしない。

## 7. AI生成

AIによる下書きは `draft` です。公開Contentに移すには、独立Reviewer、Fact Checker、Publisher Gate、CI、Pull Request Reviewを通します。AIの文章品質はFactの正しさを意味しません。
