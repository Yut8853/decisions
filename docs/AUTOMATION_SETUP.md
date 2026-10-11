# GitHub automation setup

## 1. RepositoryへPush

Project一式をGitHubへPushします。

## 2. SecretsとVariables

Settings → Secrets and variables → Actions。

### Secret

- `OPENAI_API_KEY`
- `AI_PR_TOKEN`（推奨）: AIが作るPull RequestでCIを起動するための、Fine-grained Personal Access TokenまたはGitHub Appのトークン（contents / pull-requests の書き込み権限）。`GITHUB_TOKEN` で作ったPRでは、GitHubの仕様でCIが起動しません。

### Variables

- `OPENAI_MODEL`: OpenAI API accountで利用可能なModel ID
- `OPENAI_WEB_SEARCH_TOOL`: 通常は `web_search`
- `AI_ALLOW_PUBLISH`: 最初は `false`
- `ENABLE_AI_AUTOMERGE`: 最初は `false`

## 3. Labels

Workflowが自動作成を試みますが、事前作成しても構いません。

```text
ai-generated
needs-editorial-review
needs-human-review
ai-approved
source-audit
benchmark
evidence-correction
situation-proposal
```

## 4. Branch protection

Settings → BranchesまたはRulesetsで `main` を保護します。

推奨：

- Require a pull request before merging
- Require status checks to pass
- Required checks: `validate-test-build`, `e2e`, `independent-review`（AI PRのみの運用に応じて）
- Require conversation resolution
- Block force pushes
- Block deletions
- Do not allow bypass for automation account

VercelのPreview CheckもRequiredに追加できます。

## 5. Workflow permissions

Settings → Actions → General：

- Workflow permissions: Read and write permissions
- Allow GitHub Actions to create and approve pull requests: Repositoryの運用方針に合わせる

Workflowごとにも最小権限を設定済みです。

## 6. 動作確認

### CI

READMEの空白修正などをPRにして、CIとVercel Previewを確認。

### AI Draft

Actions → AI — Create decision content：

```text
brief: WebGLとWebGPUを既存GLSL資産とモバイル条件で比較
slug: webgl-or-webgpu
publish_mode: draft
```

PR、AI Artifact、Independent Review Commentが作成されることを確認します。

### Audit

Actions → Monthly source auditを手動実行。`content/audits/YYYY-MM.json` のPRができることを確認します。

### Benchmark

Actions → Run reproducible benchmarkを手動実行。Result JSONに `generatedBy`、checksum、Environmentがあることを確認します。

## 7. Vercel連携

Vercel側で同じGitHub RepositoryをImportすると、PRごとにPreview、`main` MergeでProductionが作成されます。AI WorkflowからVercel Tokenを扱う必要はありません。

## 6. 本の照合

`Verify books (ISBN lookup)` が、資料・学ぶものを変更したPRと毎月1日に、ISBNを書誌データ（openBD → 国立国会図書館サーチ → Google Books）と照合します。書名・刊行年が合わない本や見つからない本があると失敗します。Required checkに追加することを推奨します。
