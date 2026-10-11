# Verified Technology Decisions

JUNKBRANDINGが運営する、**初学者が「やりたいこと」から学ぶ順番と読むべき本を探せるサイト**です。方向が決まった人向けに、SituationとConditionから実装Approachを比較する技術判断ページもあります。

既定公開先は `https://decisions.junkbranding.com` です。別のサブドメインへ変更する場合は `NEXT_PUBLIC_SITE_URL` を変更してください。

## 入っているもの

- 目標（やりたいこと）→ 学ぶもの（前提関係で順番を自動計算）→ 本・資格・公式資料の3層構造
- 初期データ：20分野・73記事（うち66記事は本の確認まで終えて公開、7記事は本の確認待ちの下書き）、学ぶもの49件（うち準備中7件）、本・資格・公式資料57件
- Amazonアソシエイトのリンク（ISBNから商品ページのURLを自動で作成）と広告表記。環境変数 `AMAZON_ASSOCIATE_TAG` を設定すると表示される
- 本のバージョン判定（対象バージョン・刊行年・試験の版を現行と比較し、古すぎる本は公開できない）
- 「今は学ばなくていいもの」と、jQueryなどlegacy技術の扱い
- ISBNのチェックディジット検証と、書誌データ（openBD・国立国会図書館サーチ・Google Books）との照合
- 目標の重複チェック（表記ゆれを含む）
- Web制作分野だけに出る、運営元のスクールへの案内
- 目標を追加するAIパイプライン（調査 → 執筆 → 独立レビュー → プログラムによる検証 → PR、人が確認する範囲をラベルで分ける）
- Next.js App Router / TypeScript / Vercel向け構成
- Git内のMarkdown・YAMLを原本にするContent system
- サンプル記事1件（3D商品ビューア）・4件の実装案・12件の判定基準・6件の根拠資料
- Conditionで順位・除外・警告を再計算する決定論的Rule Engine
- Zod Schema、参照整合性、公開Presetの自動検証
- VitestとPlaywright
- Three.js / R3F / Babylon.js / model-viewerの合成Lab
- Runner以外のBenchmark数値を拒否するprovenance検証
- Researcher → Author → Reviewer → Fact Checker → Publisher GateのAIパイプライン
- AI変更をPull RequestにするGitHub Actions
- 独立AI PR Review、月次Source Audit、Benchmark PR、任意Auto-merge
- Vercel Preview → `main` Merge → Production公開の運用手順

## まず動かす

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm check
pnpm dev
```

開発URLは `http://localhost:3000` です。

## 最短のGit / Vercel公開

```bash
git init
git add .
git commit -m "feat: initial verified technology decisions"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

その後VercelでGitHub RepositoryをImportし、次を設定します。

```text
Framework Preset: Next.js
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Environment Variable:
  NEXT_PUBLIC_SITE_URL=https://decisions.junkbranding.com
```

Vercel ProjectのDomainsへ `decisions.junkbranding.com` を追加し、Vercel画面に表示されたDNSレコードを、`junkbranding.com` のDNS管理画面へ設定します。固定値を推測せず、VercelがそのProject用に提示した値を使用してください。

詳細は [`docs/VERCEL_DEPLOY.md`](docs/VERCEL_DEPLOY.md) を参照してください。

## AI自動化の初期設定

GitHub Repositoryに以下を登録します。

### Secrets

```text
OPENAI_API_KEY
AI_PR_TOKEN   # 推奨。AIが作るPRでCIを起動するため（docs/AUTOMATION_SETUP.md）
```

### Repository Variables

```text
OPENAI_MODEL=<OpenAI APIアカウントで利用可能なモデルID>
OPENAI_WEB_SEARCH_TOOL=web_search
AI_ALLOW_PUBLISH=false
ENABLE_AI_AUTOMERGE=false
```

安全な初期値では、AIは `content/drafts/**` を作成するPull Requestまで行います。本番Contentへ直接書くには、Publisher Gateに加え、Repository VariableとWorkflow入力の両方で明示的に許可する必要があります。

GitHubの **Actions → AI — Create decision content → Run workflow** から、BriefとSlugを入力すると次が実行されます。

```text
Researcher
  ↓
Structured Author
  ↓
Independent Reviewer
  ↓
Independent Fact Checker
  ↓
Deterministic Publisher Gate
  ↓
Branch / Pull Request
  ↓
CI / Independent PR Review / Vercel Preview
```

詳細は [`docs/AI_OPERATIONS.md`](docs/AI_OPERATIONS.md) と [`docs/AUTOMATION_SETUP.md`](docs/AUTOMATION_SETUP.md) を参照してください。

## よく使うコマンド

```bash
pnpm content:validate     # Schema、参照、Evidence、Presetを検査
pnpm content:build        # Next.js用JSONとllms.txtを生成
pnpm test                 # Rule EngineとContent GateのUnit Test
pnpm test:e2e             # UIとLabをPlaywrightで確認
pnpm build                # Vercelと同じProduction Build
pnpm check                # validate + test + build
pnpm content:audit        # Evidence URLとRelease観測Reportを作成
pnpm books:verify         # 本のISBNを書誌データと照合（ネットワークが必要）
pnpm ai:goal -- --brief "中小企業のセキュリティ担当になりたい" --slug smb-security --mode draft
pnpm ai:pipeline -- --brief "..." --slug example --mode draft
pnpm benchmark:run -- --id bench-product-viewer-baseline --base-url http://127.0.0.1:3000
```

## 原本と役割

```text
content/**
  公開判断・Evidence・Ruleの原本

src/lib/decision-engine.ts
  ConditionからApproachを計算する純粋関数

.ai/**
  AI Prompt、Policy、実行履歴

.github/workflows/**
  CI、AI PR、Audit、Benchmark、任意Auto-merge

app/** / src/components/**
  人間向けWeb UIとRead-only API
```

## 安全上の重要事項

- AIは `main` へ直接Pushしません。
- AI出力は、文章が自然でもSchema・Fact Check・Publisher Gateを通らなければ公開されません。
- Benchmark ResultはRunner生成の署名情報がないとBuildが失敗します。
- 自動Source AuditはURL到達性とRelease観測を補助します。**Claimが現在も意味的に正しいことを完全自動で保証するものではありません。**
- Auto-mergeは初期状態で無効です。最初の運用では無効のまま、3回以上のAI PRを人間が確認してから判断してください。
- サイト上の技術判断は助言であり、案件の要件・契約・セキュリティ審査を代替しません。

## ドキュメント

- [Codexに記事追加を頼むときのプロンプト](.ai/codex/ADD_ARTICLES.md)
- [目標（学ぶ順番）の追加手順](docs/ADDING_A_GOAL.md)
- [データモデル](docs/DATA_MODEL.md)
- [Content作成ルール](docs/CONTENT_RULES.md)
- [AI運用](docs/AI_OPERATIONS.md)
- [自動化セットアップ](docs/AUTOMATION_SETUP.md)
- [Vercel・サブドメイン公開](docs/VERCEL_DEPLOY.md)
- [運用Runbook](docs/OPERATIONS_RUNBOOK.md)
- [Benchmark規約](docs/BENCHMARKING.md)
- [Security](docs/SECURITY.md)
- [新規Situation追加手順](docs/ADDING_A_SITUATION.md)

## ローカル容量を抑える

`.next`、`node_modules`、`test-results` は再生成可能なため、使用しないときは削除できます。開発を再開する場合は Node.js 22〜24 で `pnpm install --frozen-lockfile` を実行し、`pnpm dev` で起動してください。依存パッケージのバックアップを `.ai/runs` に保管しないでください。
