---
id: sql-sales-report
slug: sql-sales-report
title: 売上データをSQLで月別・商品別に集計したい
summary: 明細データを集計し、月や商品ごとの売上を表にします。集計前の条件と集計後の条件を区別して学びます。
kind: build
domainId: database
aliases: []
published: true
skillIds:
  - sql
notNeededNow:
  - label: 特定のデータベース製品の細かい設定
    reason: SQLの基本は製品が変わってもほぼ共通です。製品ごとの設定は、使う製品が決まってから覚えます。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

SQLの文法を一通り眺めるより先に、集計表という成果物を作りたい人向けです。実在しない注文データを使い、対象期間と除外する注文を決めてから合計を計算します。

## まず取り組むこと

1. 注文日、商品、数量、単価、取消状態のある練習用明細を用意します。
2. 集計対象の行を絞り、商品や月でまとめて件数と金額を出します。
3. 少数の明細で手計算した値と照合し、取消や空の値をどう扱ったかを記録します。

## この目的で本を読む理由

[SQL](/skills/sql)の本の[集計とグループ化の章](https://book.impress.co.jp/books/1123101107)を中心に使います。同じ本を表の結合で使う場合とは違い、ここでは集計する単位と条件に注目します。日付のまとめ方は使用する製品の関数に合わせます。

## できたか確認すること

集計対象と計算方法を説明でき、明細の合計と集計表の合計を照合できれば完成です。練習結果の数値を実際の事業の売上として扱いません。

## 学習内容の根拠

- [PostgreSQL：集約関数](https://www.postgresql.org/docs/current/tutorial-agg.html)：集約関数、GROUP BY、WHEREとHAVINGの違いを学ぶ根拠です。
