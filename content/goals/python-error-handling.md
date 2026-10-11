---
id: python-error-handling
slug: python-error-handling
title: Pythonのエラーを読んで原因を切り分けたい
summary: エラーの種類と発生した行を読み、少ないコードで再現して直します。例外を無視せず、入力ミスとプログラムの不具合を分けて扱います。
kind: build
domainId: programming-basics
aliases: []
published: true
skillIds:
  - python-basics
notNeededNow:
  - label: 複数の言語を同時に学ぶこと
    reason: 1つの言語で変数・条件分岐・繰り返しが書けるようになれば、ほかの言語にも応用できます。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

エラーが出るたびに全文を書き直す状態から抜け出すための練習です。文法の学習とは別に、失敗を再現する入力と、原因を絞る手順を残せることを目指します。

## まず取り組むこと

1. 数値への変換失敗や存在しないファイルの読み込みなど、原因が分かる小さな例を作ります。
2. エラーの種類と該当する行を読み、入力と途中の値を確認します。
3. 想定する失敗だけを扱い、修正前に失敗した入力と正常な入力の両方を試します。

## この目的で本を読む理由

[Pythonの基礎](/skills/python-basics)の本の[付録「エラー解決・虎の巻」](https://book.impress.co.jp/books/1122101165)を使います。文法を読み直す場所と、エラーの意味を調べる場所を分けられるためです。例外の構造はPython公式チュートリアルで補います。

## できたか確認すること

何が原因で、どの入力で再現し、何を変えて直ったかを短く説明できれば一区切りです。全ての例外を握りつぶして動いたように見せる方法は取りません。

## 学習内容の根拠

- [Python：エラーと例外](https://docs.python.org/3/tutorial/errors.html)：構文エラーと例外、例外処理の役割を区別する根拠です。
