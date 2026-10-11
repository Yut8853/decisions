---
id: test-boundaries
slug: test-boundaries
title: 入力欄で試すべき値を整理したい
summary: 文字数や数値の上限・下限から、確認する入力値を選びます。思いついた値だけで試すのをやめ、期待する結果を先に書きます。
kind: build
domainId: testing
aliases: []
published: true
skillIds:
  - web-testing
notNeededNow:
  - label: 自動テストから始めること
    reason: まず、何を確認すべきかを手で確かめられることが先です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

画面全体の表示確認とは別に、ひとつの入力欄のルールからテストを作る練習です。架空の申込フォームで、空欄、受け付ける値、受け付けない値を整理します。ここで使う数値は練習用の入力条件です。

## まず取り組むこと

1. たとえば数量を1から5まで受け付ける、という練習用の仕様を決めます。
2. 0、1、2、4、5、6と空欄を試す表を作り、入力前に期待結果を書きます。
3. 実際の結果と比べ、仕様が曖昧だった箇所と実装の不具合を分けて記録します。

## この目的で本を読む理由

[Webサイトのテスト](/skills/web-testing)の本を使います。[出版社の内容紹介](https://www.ric.co.jp/book/development/detail/2395)が扱うテスト技法と設計の考え方を、入力値の選択に当てはめます。境界値という技法の定義はISTQBのシラバスでも確認します。試験を受けるためのコースではありません。

## できたか確認すること

どの値を選んだかをルールと対応付けて説明できれば完成です。境界だけで全ての不具合を見つけられるわけではなく、形式違いや項目間の組み合わせは別に確認します。

## 学習内容の根拠

- [ISTQB：Foundation Levelシラバス 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)：境界値分析を、順序のある入力範囲の境目で考える根拠です。
