# Validation Report

最終確認日: 2026-08-24

| 確認項目 | 結果 |
|---|---|
| Node.js | 24.14.1（`engines.node` の `>=22 <25` を満たす） |
| コンテンツのSchema・参照・確認日 | PASS（警告0件） |
| 単体・内容検証テスト | PASS（27件） |
| Next.js本番ビルド | PASS |
| PC・モバイルの画面操作テスト | PASS（8件） |
| Benchmark結果の形式検証 | PASS（生成済み結果0件） |
| `pnpm check` | PASS |

## 現在のコンテンツ

- 9件の目的
- 32件の実装案
- 98件の判定基準
- 51件の根拠資料
- 51件の参考資料
- 38件の条件
- 10件の確認済み条件例

## 実行したコマンド

```text
pnpm content:validate
pnpm test
pnpm check
pnpm test:e2e
```

## この確認に含まれないもの

- 実サービスへの公開と本番環境での動作
- GitHub Actions、Branch protection、外部サービスの接続状態
- SaaSの案件別料金、契約、保存期間、データ処理契約
- 実データでの日本語検索品質と負荷試験
- Cloud環境への実配備、障害復旧、通知到達の試験
- 独自Benchmark結果（結果ファイルは作成していません）

公開はPull Requestの確認、必須CI、Repository protectionを通過した後に行います。
