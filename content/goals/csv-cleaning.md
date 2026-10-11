---
id: csv-cleaning
slug: csv-cleaning
title: CSVの空欄や重複を整理して集計できるようにしたい
summary: CSVをPythonで読み込み、空欄、重複、表記の違いを整理します。元データを残し、何を変更したか説明できる前処理を学びます。
kind: build
domainId: data-ai
aliases: []
published: true
skillIds:
  - data-analysis
notNeededNow:
  - label: 機械学習から始めること
    reason: まず、データを集計してグラフにできることが先です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

グラフを作る前に、集計に使える表を準備する課題です。架空の売上CSVを使い、空欄をゼロにしてよいか、同じ行を削除してよいかを先に決めます。見た目が揃ったことだけで正しいデータとは判断しません。

## まず取り組むこと

1. CSVを読み込み、列の型、行数、空欄と重複の件数を調べます。
2. 削除・補完・表記統一のルールを決め、そのルールをコードにします。
3. 元のCSVを残したまま結果を別ファイルへ出し、変わった行と集計値を確認します。

## この目的で本を読む理由

[データ分析](/skills/data-analysis)の本を使います。[出版社の目次](https://www.oreilly.co.jp/books/9784814400195/)の6章が入出力、7章がクリーニングと前処理に対応します。Pythonの入門を終えてから該当箇所を読み、pandasの操作は現行の公式資料でも確認します。

## できたか確認すること

同じ元データから同じ結果を作れ、消した行と値を補った理由を説明できれば完成です。外れた値も、間違いと確かめずに削除しません。

## 学習内容の根拠

- [pandas：欠損データの扱い](https://pandas.pydata.org/docs/user_guide/missing_data.html)：欠損の検出、除去、補完を区別して選ぶための資料です。
