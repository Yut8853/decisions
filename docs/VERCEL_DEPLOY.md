# Vercel deployment and JUNKBRANDING subdomain

## 推奨URL

```text
https://decisions.junkbranding.com
```

別候補を使う場合は、GitHub/Vercelの `NEXT_PUBLIC_SITE_URL` と `content/manifest.yml` のdefaultDomainを同時に変更してください。

## 1. Project import

1. Vercel DashboardでAdd New → Project。
2. GitHubのRepositoryをImport。
3. Framework Preset: Next.js。
4. Install Command: `pnpm install --frozen-lockfile`。
5. Build Command: `pnpm build`。
6. Environment Variable：

```text
NEXT_PUBLIC_SITE_URL=https://decisions.junkbranding.com
```

OpenAI API KeyはVercelには不要です。AI自動化はGitHub Actionsで実行します。

## 2. Domain

1. Vercel Project → Settings → Domains。
2. `decisions.junkbranding.com` を追加。
3. Vercelが表示したDNS Recordを確認。
4. `junkbranding.com` のDNS管理サービスで、Host `decisions` にそのRecordを登録。
5. Cloudflare等を使う場合、初回認証中はProxy設定が影響することがあるためVercelの案内を優先。
6. VercelのDomain画面がValid Configurationになるまで確認。

DNSのTargetはProjectやVercelの運用変更で異なる可能性があるため、この文書の固定Targetではなく、Vercel UIに表示された値を使います。

## 3. Production / Preview

```text
main merge          → Production
Pull Request branch → Preview
その他branch push   → Preview
```

AIはPRまで作成し、Vercel Previewで表示を検証します。Productionへの直接Deploy Commandは用意していません。

## 4. Commercial use

Affiliate、B2B問い合わせ、有料Service導線を公開する場合、利用中のVercel PlanとTermsが商用利用要件を満たすか、公開時点のVercel公式情報で確認してください。

## 5. Rollback

問題があればVercel Dashboardの以前のDeploymentをPromoteするか、GitHubでRevert PRを作成します。Content原本とDecision履歴はGitに残ります。
