# Add a Situation

## AIでDraft作成

GitHub ActionsからBriefと新規Slugを指定します。最初は必ず `draft`。

## 手動またはAI PRで必要なファイル

```text
content/situations/<slug>.md
content/approaches/*.yml
content/evidence/*.yml
content/rules/*.yml
content/resources/*.yml
content/decisions/*.yml（代表Presetがある場合）
```

## 作成順

1. Situationを一文で定義。
2. ユーザーの目的に合う既存 `category` を選ぶ。
3. Answerを変えるConditionを挙げる。
4. 2〜4のApproachを、提案書一行の粒度で作る。
5. 各Approachの向く・向かない条件を書く。
6. Current factを一次情報で調査し、Claim単位のEvidenceを作る。
7. Condition単位の単純Ruleを先に作る。複合Ruleは単純Ruleだけで説明できない場合のみ。
8. Defaultと代表Presetを計算し、期待順位をDecisionへ保存。
9. 必要ならBenchmark Planを作る。Resultは書かない。
10. `pnpm check`。
11. PRでVercel Previewを確認。

## Category

`category` は技術名ではなく、利用者が達成したい目的で選びます。

```text
sites        サイトをつくる
products     商品を見せる
performance  表示を速くする
apps         アプリ・機能をつくる
operations   開発・運用を整える
quality      品質・使いやすさを高める
security     安全性を高める
data-ai      データ・生成AIを活用する
measurement  計測して改善する
```

SEO、モバイル、React、納期などの横断要件はCategoryを増やさずConditionとして扱います。既存Categoryで目的が説明できず、同種のSituationを複数追加する計画がある場合だけ新Categoryを検討します。

## 完了条件

- 近似Situationがない。
- ユーザーの目的に合うCategoryへ分類されている。
- すべてのApproachにNegative recommendationがある。
- すべてのRuleに、Reasonを支持するEvidenceがある。
- Default条件で候補がゼロにならない。
- 矛盾ConditionでWarningが出る。
- Preset DecisionがUnit TestまたはValidationで固定されている。
- Page冒頭だけで2026年時点の条件付き結論が理解できる。
