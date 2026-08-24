---
id: web-vitals-monitoring
slug: web-vitals-monitoring
title: 実際の表示品質を継続して測りたい
summary: 公開された実利用データ、自前の利用者計測、公開前の自動検査を、調べたい範囲と運用条件に合わせて比較します。
type: performance
category: measurement
published: true
defaultConditionIds:
- public-field-data-available
conditionIds:
- public-field-data-available
- per-session-diagnostics-required
- ci-regression-gate-required
- data-control-priority
- short-deadline
- small-team
- maintainability-priority
- external-service-restricted
approachIds:
- wvm-public-crux
- wvm-self-rum
- wvm-lighthouse-ci
lastReviewed: '2026-08-24'
---

表示品質には、実際の利用者が体験した結果と、決めた端末条件で繰り返す検査があります。CrUX（Chrome UX Reportの略）は、Googleが公開する集計済みの実利用データです。導入負担が小さい一方、対象URLに十分な利用実績が必要で、個別の利用状況は追えません。

自前RUM（実際の利用者のブラウザで行う計測）は画面ごとの状況を詳しく調べられますが、送信項目、保存先、閲覧権限を設計します。Lighthouse CI（公開前に同じ条件で繰り返す自動検査）は変更前の比較に向きますが、実利用データの代わりではありません。個別状況の調査と公開前の回帰検査を両方求める場合は、自前RUMとLighthouse CIを組み合わせます。

専用の管理型RUMや既存のアクセス解析サービスでも、実利用者の表示品質を収集できます。このページでは、公開済みの集計データを見る方法、自分たちで収集先を用意する方法、公開前に自動検査する方法の違いへ比較範囲を絞り、管理型RUMは個別候補に含めません。
