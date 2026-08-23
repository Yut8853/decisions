# AI operations

## 目的

AIに調査、構成、執筆、独立レビュー、Fact Check、PR作成を担当させながら、自己承認と無制限公開を防ぎます。

## 5段階Pipeline

### 1. Researcher

- Web searchを利用。
- 一次情報を優先。
- Facts、Contradictions、Unknowns、Candidate ApproachesをJSON化。
- Recommendationは確定しない。

### 2. Author

- Researcherが渡した文書内だけでCandidatePackageを生成。
- 既存IDを再利用しない。
- Approach、Rule、Evidence、Resource、Decision draftをSchemaに合わせる。
- Benchmarkが必要なら `benchmarkRequired=true`。数字を作らない。

### 3. Independent Reviewer

- Authorの自己評価を信用しない。
- 代替案、反例、Rule conflict、粒度、断定を再調査。
- Blocking issueが一つでもあればReject。

### 4. Independent Fact Checker

- 各Evidence URLを直接確認。
- ClaimがSourceのTopicではなく、本文によって支持されるか確認。
- Current Version、Deprecation、Support、日付を確認。
- 比較・性能Claimに実測がなければRejectまたは範囲を縮小。

### 5. Publisher Gate

ローカルCodeが次を判定します。

- ReviewerとFact CheckerがApprovedか。
- RuleにEvidenceがあるか。
- Evidenceがverifiedか。
- 参照IDが存在するか。
- 既存IDを無断上書きしていないか。
- Benchmark数値をAIが混ぜていないか。
- `AI_ALLOW_PUBLISH` が明示的に許可されているか。

## 実行方法

```bash
export OPENAI_API_KEY=...
export OPENAI_MODEL=<利用可能なモデルID>
pnpm ai:pipeline -- \
  --brief "WebGPUへ今移行すべきかを、既存GLSL資産・モバイル・納期から比較" \
  --slug webgl-or-webgpu \
  --mode draft
```

実行履歴は `.ai/runs/<run-id>/` に保存されます。`.gitignore`対象ですが、GitHub ActionsではArtifactとして30日保存されます。

## DraftとPublish

### Draft

`content/drafts/<slug>/candidate.json` を作り、PRへ載せます。通常はこちらを使用します。

### Publish

以下の両方が必要です。

```text
Workflow input: publish
Repository Variable: AI_ALLOW_PUBLISH=true
```

さらにGate、CI、Independent PR Reviewが必要です。既存ID更新は別の禁止設定により止まります。

## Auto-merge

初期は無効です。有効化条件：

1. Repository Variable `ENABLE_AI_AUTOMERGE=true`
2. PR labels `ai-generated` と `ai-approved`
3. PRがDraftではない
4. Branch protectionのRequired Checksがすべて成功

最初の運用では有効にしないでください。少なくとも3回のAI PRについて、人間がSource、Rule、UI結果を確認し、誤りパターンをPolicyへ追加した後に検討します。

## モデル変更

Model IDはCodeへ固定していません。`OPENAI_MODEL` Repository Variableで指定します。変更時は同じFixture BriefでRegressionを行い、JSON Schema遵守率、Fact Check Reject率、費用、処理時間を比較します。

## API障害時

AI Workflowが失敗しても本番サイトは変わりません。Artifactを確認し、再実行または手動Draft作成へ切り替えます。AI失敗を理由にGateを無効化しません。
