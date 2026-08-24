---
id: frontend-error-monitoring
slug: frontend-error-monitoring
title: 公開後の画面エラーを見つけたい
summary: 管理型のエラー監視、既存の追跡基盤との連携、自前収集を、発見までの速さとデータ管理方針に合わせて比較します。
type: selection
category: measurement
published: true
defaultConditionIds:
- production-errors-priority
conditionIds:
- distributed-tracing-required
- production-errors-priority
- data-control-priority
- short-deadline
- small-team
- maintainability-priority
- external-service-restricted
approachIds:
- fem-managed-error-service
- fem-opentelemetry-pipeline
- fem-self-error-endpoint
lastReviewed: '2026-08-24'
---

公開後の画面エラーは、利用者から連絡が来るまで待たず、ブラウザから必要な情報だけを収集して担当者が確認できる流れを作ります。

管理型サービスは、SDK（ブラウザへ組み込む収集用ライブラリ）、確認画面、通知をまとめて用意できます。OpenTelemetry（異なるシステムの記録を共通形式でつなぐ仕組み）は、ブラウザのエラーをSpan（ひと続きの処理区間の記録）へ加え、Collector（記録を受信・中継するプログラム）から既存の追跡基盤へ送る場合の候補です。

自前収集は保存先を細かく管理できますが、受信、分類、検索、通知、保守を自分たちで担います。どの方法でも個人情報や認証情報を送らない設計が必要です。圧縮後のエラー位置を元のコードへ対応させるソースマップを使う場合は、ビルドとの対応と公開範囲も確認します。
