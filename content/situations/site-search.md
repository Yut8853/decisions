---
id: site-search
slug: site-search
title: サイト内検索を実装したい
summary: 公開時の検索索引、外部または自前の検索サーバー、既存データベースの全文検索を、更新頻度と運用条件から選ぶ判断ページです。
type: selection
category: apps
published: true
defaultConditionIds:
- infrequent-content-updates
conditionIds:
- short-deadline
- maintainability-priority
- small-team
- frequent-content-updates
- infrequent-content-updates
- existing-postgresql-database
- advanced-search-relevance
- external-service-restricted
approachIds:
- build-time-static-search
- hosted-search-service
- self-hosted-search-service
- database-full-text-search
lastReviewed: '2026-08-24'
---

サイト内検索は、検索欄の見た目よりも「いつ索引を更新するか」と「誰が検索品質を調整するか」で構成が変わります。

更新が公開作業と同時でよければ静的な検索索引が小さく始めやすく、頻繁な更新や細かな検索調整が必要なら検索専用サービスが候補です。検索データを外部サービスへ送れない場合は自分たちで動かす検索サーバー、検索対象が既存のPostgreSQLにある場合はデータベース内の全文検索も比較します。日本語の分かち書きや固有名詞は製品ごとに扱いが異なるため、採用前に実データで検索結果を確認します。
