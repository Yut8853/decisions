# Benchmark policy

## 目的

Benchmarkは「Library Aが常に速い」と断定するためではなく、**このFixture・Environment・Version・条件で何が起きたか**を再現可能に残すために使います。

## AIと人間が禁止される操作

- Result JSONへの数値手入力
- Environmentを省いた比較
- 一回のRunだけで順位を決める
- Implementation経験差を隠した所要時間比較
- 合成Labの結果を、そのまま実商品案件の結論に使う

## Runner

```bash
pnpm build
pnpm start
pnpm benchmark:run -- --id bench-product-viewer-baseline --base-url http://127.0.0.1:3000
pnpm benchmark:validate
```

Resultは次を含みます。

- `generatedBy: benchmark-runner`
- `runId`
- `runnerChecksum`
- Browser / Version / OS / Viewport
- ApproachごとのRaw metrics

## 公開Evidenceへ昇格する条件

1. Fixture、Source Code、Versionを公開。
2. Desktop自動Runを3回以上。
3. 少なくともiPhone 1台と中位Android 1台を実機測定。
4. Thermal throttling、電源状態、Browserを記録。
5. 見た目・機能の同等性をScreenshotまたは動画で確認。
6. 比較対象に習熟した第三者から改善PRを受け付ける。
7. Medianとばらつきを掲載し、単一最高値を使わない。

## Implementation time

所要時間は参考Logに留めます。実装者の経験、既存Template、Debug環境の影響が大きいため、Rule Weightの直接Evidenceにはしません。
