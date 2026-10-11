---
id: python-file-automation
slug: python-file-automation
title: たくさんのファイル名をルールに沿って整理したい
summary: Pythonでフォルダ内のファイルを調べ、変更前と変更後の名前を一覧にします。実行前の確認と、同名ファイルの衝突を避ける処理を学びます。
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

ファイル整理を題材に、繰り返しと条件分岐を使う練習です。コピーした練習用フォルダだけを対象にし、いきなり一括変更せず、最初に変更予定の一覧を出します。

## まず取り組むこと

1. 練習用フォルダのファイルを列挙し、対象にする拡張子と名前のルールを決めます。
2. 変更予定を表示するだけの処理を作り、対象外のファイルと名前の衝突を検出します。
3. 予定を確認してから練習用ファイルに適用し、変更履歴を残します。

## この目的で本を読む理由

[Pythonの基礎](/skills/python-basics)の本を使います。[出版社の目次](https://book.impress.co.jp/books/1122101165)の条件分岐、繰り返し、モジュールが土台です。pathlibの個別操作は公式資料で補います。入門書がファイル整理の完成ツールを提供するという選び方ではありません。

## できたか確認すること

対象と対象外が分かれ、衝突する名前があれば変更を止められることを確認します。原本を保管し、やり直せる練習にします。

## 学習内容の根拠

- [Python：pathlib](https://docs.python.org/3/library/pathlib.html)：パスの操作、ファイルの列挙、名前の変更を確認する公式資料です。
