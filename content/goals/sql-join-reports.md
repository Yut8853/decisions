---
id: sql-join-reports
slug: sql-join-reports
title: 顧客表と注文表をつないで一覧を作りたい
summary: 別々の表にある顧客名と注文情報をSQLで組み合わせます。結合の条件、注文のない顧客、重複する行の扱いを学びます。
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

同じ名前を両方の表へ毎回書かず、IDで関連付けた表から一覧を作る練習です。SQL集計の記事とは異なり、表を結合したときに行が増えたり消えたりする理由を確かめます。

## まず取り組むこと

1. 顧客表と注文表を作り、1人が複数回注文した場合と、注文のない顧客を含めます。
2. INNER JOINとLEFT JOINで一覧を作り、残る顧客と行数の違いを比較します。
3. 同名の顧客を追加し、名前ではなくIDで結び付ける理由を確認します。

## この目的で本を読む理由

[SQL](/skills/sql)の本の[複数テーブルの結合の章](https://book.impress.co.jp/books/1123101107)を読みます。集計の前に、何を1行として取り出しているかを把握するための学習です。表そのものの設計に進む場合は、別のデータベース設計コースを使います。

## できたか確認すること

注文のない顧客を含めるかどうかを選べ、想定外の重複があれば結合条件を調べられることを確認します。

## 学習内容の根拠

- [PostgreSQL：表の結合](https://www.postgresql.org/docs/current/tutorial-join.html)：内部結合と外部結合の結果の違いを理解する根拠です。
