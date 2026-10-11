# Project File Inventory

このリポジトリは、固定の全ファイル一覧ではなく、役割ごとのDirectoryを正として管理します。

| Directory | 役割 |
|---|---|
| `app/` | Next.jsのPage、API、共通Layout |
| `src/components/` | 判断画面、Category一覧、検証画面のUI |
| `src/lib/` | Schema、Content読込、判定Engine |
| `content/goals/` | 初学者のやりたいこと（学ぶ順番の入口） |
| `content/skills/` | 学ぶもの（前提関係・変化の速さ・資料と読む理由） |
| `content/domains.yml` | 目標の分野とスクール案内の可否 |
| `content/situations/` | 技術の選び方（方向が決まった人向け） |
| `content/approaches/` | 比較する実装案と非推奨条件 |
| `content/rules/` | 条件から順位・除外・警告を決めるRule |
| `content/evidence/` | 確認日つきの根拠Claim |
| `content/resources/` | 公式資料と書籍への案内 |
| `content/decisions/` | 確認済みの代表条件例 |
| `content/benchmarks/` | 測定計画とRunner生成結果 |
| `scripts/` | Content検証、生成、AI Pipeline、Benchmark |
| `tests/` | Unit TestとPC・Mobileの画面操作Test |
| `.ai/` | AIのPolicy、Prompt、実行記録の置き場 |
| `.github/` | CI、Review、監査、Issue Template |
| `docs/` | 編集・運用・公開・Securityの手順 |

現在の件数は [Validation Report](./VALIDATION_REPORT.md) を参照してください。正確なファイル一覧は次で確認できます。

```bash
rg --files -g '!node_modules' -g '!.next'
```
