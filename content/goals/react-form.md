---
id: react-form
slug: react-form
title: Reactで入力内容を確認しながら進める画面を作りたい
summary: 入力した内容を確認画面へ引き継ぎ、戻って修正できる画面をReactで作ります。stateとイベント、部品間のデータの渡し方を学びます。
kind: build
domainId: frontend
aliases: []
published: true
skillIds:
  - react
notNeededNow:
  - label: jQuery
    skillId: jquery
    reason: Reactでは画面の更新をReactに任せます。jQueryで直接画面を書き換える方法とは考え方が合いません。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

Reactの画面作りを、入力・確認・修正というひとつの流れで練習します。送信先は作らず、氏名などの架空データを使います。入力欄と表示内容が食い違わないよう、どの部品が値を持つかを決めます。

## まず取り組むこと

1. 入力値をstateで管理し、入力欄を変えると確認表示も変わるようにします。
2. 入力と確認を別の部品へ分け、必要な値と操作を受け渡します。
3. 確認から入力へ戻って修正し、入力した文字が意図せず消えないか確かめます。

## この目的で本を読む理由

[React](/skills/react)の本を使います。[出版社の目次](https://gihyo.jp/book/2026/978-4-297-15523-0)のstate、状態のリフトアップ、フォームと入力値の管理が、この課題に対応します。外部の状態管理ライブラリを先に覚えず、Reactの基本だけでデータの置き場所を理解します。

## できたか確認すること

確認画面に最新の値が出て、戻って修正でき、必須項目の不足も伝えられれば完成です。本人確認やデータ保存の安全性は別途設計します。

## 学習内容の根拠

- [React：inputコンポーネント](https://react.dev/reference/react-dom/components/input)：入力値と変更イベントを組み合わせる制御された入力の根拠です。
