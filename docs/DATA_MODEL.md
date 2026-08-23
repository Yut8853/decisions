# Data model

## Situation

利用者が最初に選ぶ実務上の状況です。Technology名ではなく「3D商品ビューアを作りたい」の粒度にします。Condition違いの近似ページは作りません。

各Situationはユーザーの目的を表す `category` を一つ持ちます。ApproachにはCategoryを持たせず、所属Situationを通じて表示します。空のCategoryは一覧に表示しません。

## ConditionDefinition

サイト横断の条件辞書です。Condition自体をSEOページにせず、Situationページ内のToggleとして使います。矛盾しやすいConditionは `conflictsWith` を持ちます。

## Approach

提案書へ一行で書ける実現方法です。「Three.js」だけでなく「Three.js + glTFによる商品ビューア」のように、実務上の組み合わせを示します。

必須項目：

- `recommendedWhen`
- `notRecommendedWhen`
- `advantages`
- `disadvantages`
- `technologyIds`
- `concepts`
- `resourceIds`

## Rule

ConditionがApproachへ与える影響です。

```yaml
when:
  all: [ar-required]
  any: []
  none: []
effect:
  type: boost
  weight: 4
reason: AR導線を既成機能で提供できるため…
evidenceIds: [ev-model-viewer-ar]
```

Effect：

- `require`: 同じgroupで許可された候補だけを残す。MVPでは慎重に利用。
- `exclude`: 候補から外す。
- `boost`: 小さな整数で優先度を上げる。
- `penalize`: 小さな整数で優先度を下げる。
- `warn`: 順位を変えず、条件の緊張や判断不能を表示する。

## Evidence

Source URLではなく、Sourceが支持するClaimの記録です。

必須：

```text
claim
sourceType
sourceName
url
primary
verificationStatus
verifiedAt
```

## DecisionPreset

編集者が確認した代表Conditionセットです。自由なToggle操作は保存しません。PresetはRule Engineで再計算され、期待したTop Approachと一致しなければCIが失敗します。

## Benchmark

PlanとResultを分離します。Resultは `benchmark-runner` が生成したprovenance、run id、checksum、環境情報が必須です。AIや人間がYAMLへ数字を記入する運用は禁止です。

## Resource

公式Docs、Specification、書籍などの学習・確認導線です。

- 公式：現在のAPI・Support・Migration
- 書籍：原理・設計・体系的理解

書籍が現在の実装手順を扱わない場合は `limitations` に明記します。
