# Operations runbook

## Pull Requestごと

1. CI、Independent AI Review、Vercel Previewを確認。
2. Evidence URLだけでなくClaimとの一致を確認。
3. Conditionを最低3パターン操作し、順位と除外理由を確認。
4. Mobile Preview、Keyboard操作、Screen readerの見出し構造を確認。
5. Published Decision変更ならChangelogを追加。

## 月次

1. `Monthly source audit` Workflowを実行またはScheduled Resultを確認。
2. Unreachable Source、Redirect、Release変更をIssue化。
3. High volatility Technologyだけ優先して影響Conceptを調べる。
4. URLが生きているだけで `verifiedAt` を更新しない。

## 四半期

1. 全Published Situationを開く。
2. Official Release、Migration、Browser/Platform変更を確認。
3. Preset Decisionを再評価。
4. Benchmarkを同一Environmentまたは新Environmentで再計測。
5. 「変更なし」も内部Review logへ残す。
6. 6か月以上未確認Evidenceを更新またはLIMITED扱いにする。

## 緊急変更

Security issue、重大なDeprecation、Source消失、誤ったNegative Recommendationが見つかった場合：

1. IssueへSeverityと影響ページを記録。
2. 必要ならSituationを `published: false` にして緊急PR。
3. Decision変更と理由をChangelogへ記載。
4. Vercel Previewで確認してMerge。
5. CorrectionをページまたはChangelogで目立つ形で公開。

## AI障害

- AI生成が失敗：既存公開内容は変更されない。ArtifactからStageを特定。
- ReviewerとFact Checkerの不一致：Rejectを優先し、BriefかResearchを修正。
- JSON Schema不一致：PromptでなくSchemaを緩める前に、AI出力が不正な理由を確認。
- API費用増加：StageごとのRun数とModelを見直す。Fact Checkを省略しない。

## Source audit false positive

403/405やBot対策で到達失敗になる場合があります。Browserで直接確認し、URLが有効ならAudit Noteへ記録します。自動的にSourceを削除しません。
