# Data model

## 全体

初学者向けの「学ぶ順番」と、方向が決まった人向けの「技術の選び方」の2層があります。

```text
Goal（やりたいこと）
  └─ Skill（学ぶもの。prerequisitesで順番が決まる）
       └─ Resource（本・公式資料・講座・資格。対象バージョンつき）

Situation（技術の選び方）
  └─ Condition → Rule → Approach → Evidence
```

## Goal

`content/goals/*.md`。初学者の言葉で書いた目的です。`skillIds` には最後に必要な学ぶものだけを書き、前提は `buildGoalRoute` が前に並べます。`branches`（分かれ道）と `notNeededNow`（今は学ばなくていいもの、最低1件）を持ちます。`domainId` の分野が `schoolEligible` なら、運営元のスクールの案内が出ます。

## Skill

`content/skills/*.yml`。分野をまたいで使い回す学ぶものの単位です。

- `prerequisites`: 先に必要な学ぶもの。循環すると検証で失敗する。
- `volatility`: `high` / `medium` / `low`。本のバージョン基準が変わる（docs/ADDING_A_GOAL.md）。
- `resources`: `{ resourceId, level: intro | practice | reference, reason }`。入門（intro）を最低1件。
- `status: legacy` と `legacyNote`: jQueryのように、これから学ぶ順番に入れない技術。

## Domain

`content/domains.yml`。目標の分野。`schoolEligible` でスクールの案内を出すかを決めます。

## Technology registry

`content/technology-registry.yml`。`currentVersion` / `currentVersionCheckedAt` / `currentVersionSource` に現行バージョンを記録し、本の `targetVersions` と比べます。


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
- `learningPath`

### learningPath（この案を学ぶ資料）

実装案ごとに、本・公式資料・講座を「どの場面で使うか」と「この案でなぜ必要か」をつけて並べます。

```yaml
learningPath:
- resourceId: book-book-of-shaders
  stage: deepen            # start=最初に読む / stuck=困った時に引く / deepen=さらに深める
  reason: 独自の質感や演出をシェーダーで作る段階で、GLSLの考え方を小さな例から学べます。
  showWhenAny:             # 省略時は常に表示。指定時は、どれかの条件を選んだ時だけ表示
  - advanced-visuals
```

- `reason` は資料の一般的な紹介ではなく、「この実装案を選んだ人が、なぜこれを読むか」を書く（20文字以上）。
- 資料の `technologyIds` / `concepts` が実装案と一つも重ならない場合、検証で失敗する。重なりを作るためだけに語を追加しない。
- 各実装案に、条件なしで表示される `start` を最低1件置く。本がなければ公式資料でよい。
- 日本語の本が見つからない場合、無関係な日本語の本で埋めない。画面には英語資料である旨が自動で表示される。
- どの実装案からも使われなくなった本は、別の案へ付け替えずに削除する（Git履歴に残る）。

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

公式Docs、Specification、書籍、講座、資格などの学習・確認導線です。

書籍のバージョン項目：

- `publishedYear`（ISBNのある本は必須）
- `targetVersions`: `[{ technologyId, version }]`
- `targetExam`: `{ certificationId, version }`（資格の対策本）
- `usesLegacySkillIds`: jQueryなど、今は学ばなくてよい技術を使う箇所がある場合
- `outdatedNote`: 古くなった部分の説明
- `editionNote`: 新しい版の予定など

資格（`type: certification`）：`provider`、`examVersion`、`syllabusUrls`、`verifiedAt` が必須。改訂予定は `revisionNote` と `revisionSourceUrl`。

ISBNはチェックディジットを検証し、`pnpm books:verify` で書誌データと照合します。

- 公式：現在のAPI・Support・Migration
- 書籍：原理・設計・体系的理解

書籍Resourceは、曖昧な検索リンクではなく、書籍を特定できる直接の `url` を持たせます。表示と出典確認のため、次の項目も必須です。

- `authors`
- `language`
- `limitations`

表紙は任意です。載せる場合は `coverImageUrl` / `coverImageAlt` / `coverSourceName` / `coverSourceUrl` をすべて記録します。画像の利用条件を確認できない場合は載せません（画面では書名のみの表示になります）。

`edition`、`versionNote`、`isbn` は該当する場合に記録します。`limitations` には、対応言語や現在の実装手順にそのまま使えない範囲を明記します。
