---
id: reduced-motion-animation
slug: reduced-motion-animation
title: 動きが苦手な人には演出を控えたページを見せたい
summary: 端末の「動きを減らす」設定に合わせて、アニメーションを控える表示を作ります。動かなくても情報と操作が伝わるようにします。
kind: build
domainId: web-animation
aliases: []
published: true
skillIds:
  - css-animation
notNeededNow:
  - label: jQuery
    skillId: jquery
    reason: 今はCSSと標準のJavaScriptで同じ動きが作れます。jQueryを使う古い本や記事のコードを写しても、今のサイトには合わないことがあります。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

アニメーションを増やす課題とは逆に、演出が不要な場合の表示を用意する練習です。大きな移動や拡大を含む練習用ページで、通常時と動きを減らす設定の両方を確認します。

## まず取り組むこと

1. ページ内の動きを一覧にし、装飾なのか、処理中などの状態を伝えるものなのか分けます。
2. prefers-reduced-motionを使い、装飾の移動をなくすか、控えた表示へ切り替えます。
3. 動きを止めても説明文や操作ボタンが現れること、状態の変化が別の方法でも伝わることを確認します。

## この目的で本を読む理由

[CSSアニメーション](/skills/css-animation)の本で動きを付ける仕組みを理解します。[出版社の目次](https://book.impress.co.jp/books/1123101113)にあるCSS・JavaScriptの基礎とボタン・スクロールの例を、見直す対象として使います。動きを減らす設定の具体的な判定はMDNで補います。

## できたか確認すること

端末またはブラウザーの検証機能で設定を切り替え、両方の状態で内容を読んで操作できれば完成です。CSSだけで止まらないJavaScriptの動きは、別途切り替えを実装します。

## 学習内容の根拠

- [MDN：prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)：利用者の動きを減らす設定をCSSで参照する根拠です。
