---
id: database-transactions
slug: database-transactions
title: 途中で失敗してもデータのつじつまが合う更新を学びたい
summary: 複数の更新をひとまとめにして確定・取り消しするトランザクションを学びます。練習用データで、途中失敗の前後を比較します。
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

片方の更新だけが残ると困る処理を、SQLで確かめる課題です。架空の倉庫間で在庫を移す例を使い、移動元だけ減って移動先が増えない状態をどう避けるか考えます。実際の在庫システムへ直接適用する練習ではありません。

## まず取り組むこと

1. 二つの倉庫の在庫数を用意し、移動前の合計を記録します。
2. 複数の更新をトランザクション内で実行し、確定したときの結果を確認します。
3. 途中で取り消して、どの値が元へ戻るかを調べます。

## この目的で本を読む理由

[SQL](/skills/sql)の本を再利用します。[出版社の目次](https://book.impress.co.jp/books/1123101107)にはトランザクションの章があり、基本文法の次に学ぶ根拠があります。同時更新や分離レベルを全て解決する課題ではなく、まず確定と取り消しを理解します。

## できたか確認すること

成功時と取り消し時の結果を説明でき、複数の更新をまとめる理由が分かれば一区切りです。使うデータベースによる挙動の違いは、その製品の資料で確認します。

## 学習内容の根拠

- [PostgreSQL：トランザクション](https://www.postgresql.org/docs/current/tutorial-transactions.html)：複数操作をまとめ、COMMITとROLLBACKで結果を決める説明の根拠です。
