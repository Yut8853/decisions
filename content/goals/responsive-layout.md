---
id: responsive-layout
slug: responsive-layout
title: スマホで横にはみ出すホームページを直したい
summary: 画面が狭いと文字や画像がはみ出すページを、CSSで読みやすく直します。幅・段組み・画像の指定を順に確認します。
kind: build
domainId: web
aliases: []
published: true
skillIds:
  - css
notNeededNow:
  - label: jQuery
    skillId: jquery
    reason: 今のJavaScriptは標準の機能だけで同じことが書けます。古いサイトを直す仕事で出会ったら、その範囲だけ覚えれば十分です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

パソコンでは読めるのにスマホでは横にスクロールしてしまうページを直す練習です。サイトを一から作るコースとは違い、すでにある見出し・画像・カードの幅を調べ、崩れの原因を説明できることを目指します。

## まず取り組むこと

1. 見出し、画像、カード一覧のある練習用ページを用意し、どの要素が画面の外へ出ているか調べます。
2. 固定した幅を見直し、画像を親要素に収め、カードを狭い画面では縦に並べます。
3. 画面幅を連続して変え、文字を拡大しても読めるか確認します。特定の機種の幅だけに合わせて終えません。

## この目的で本を読む理由

[CSSの学習項目](/skills/css)の入門書を使います。[出版社の紹介と目次](https://www.sbcr.jp/product/4815618469/)で、レスポンシブ、Flexbox、複数の段組みの制作を扱うことを確認しています。同じ本をHTML入門で使っていても、ここでは幅と配置の章を読み直す理由があります。

## できたか確認すること

狭い画面でも本文が横にはみ出さず、画像とカードが読める順に並び、修正したCSSの役割を説明できれば一区切りです。

## 学習内容の根拠

- [MDN：レスポンシブデザイン](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)：柔軟な配置、画像の幅、メディアクエリーを学ぶ根拠です。
