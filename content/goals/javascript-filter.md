---
id: javascript-filter
slug: javascript-filter
title: 商品一覧を条件で絞り込めるようにしたい
summary: カテゴリを選ぶと一覧が切り替わる画面を、JavaScriptで作ります。元データ、条件、表示を分け、該当する商品がない場合も扱います。
kind: build
domainId: frontend
aliases: []
published: true
skillIds:
  - javascript-basics
notNeededNow:
  - label: jQuery
    skillId: jquery
    reason: 今のJavaScriptは標準の機能だけで同じことが書けます。古いサイトを直す仕事で出会ったら、その範囲だけ覚えれば十分です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

手元にある小さな商品データを使い、画面内で一覧を絞り込む練習です。サーバー側の全文検索や大量データへの対応とは分けて、配列と入力イベントを使えることを目標にします。

## まず取り組むこと

1. 名前とカテゴリを持つ架空の商品を配列に入れ、まず全件を表示します。
2. 選択したカテゴリに合う商品だけを取り出し、一覧と件数を更新します。
3. 該当なしと条件解除の表示を用意し、元データが書き換わっていないか確認します。

## この目的で本を読む理由

[JavaScriptの基礎](/skills/javascript-basics)の入門書を使います。[出版社の目次](https://www.sbcr.jp/product/4815615758/)のイベントと複数データの章が、この課題の中心です。単なるアニメーションの練習と違い、条件とデータの関係を説明するために読みます。

## できたか確認すること

全件、1種類、該当なし、条件解除で正しく切り替われば完成です。ブラウザーに全件を渡せない量や公開できない情報を扱う場合は、サーバー側の設計も必要です。

## 学習内容の根拠

- [MDN：Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)：条件に合う要素を別の配列として取り出す根拠です。
