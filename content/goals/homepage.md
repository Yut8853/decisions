---
id: homepage
slug: homepage
title: お店や会社のホームページを作りたい
summary: HTMLとCSSで見た目を作り、JavaScriptで少し動きをつけるところまでを、順番に学びます。
kind: build
domainId: web
aliases:
- ホームページ制作
- ホームページを作りたい
- Webサイトを作りたい
published: true
skillIds:
- javascript-basics
branches:
- id: self-update
  question: 必要に応じて、WordPressを学ぶ
  options:
  - label: HTMLを編集せずに、お知らせを更新できるようにしたい
    note: WordPressを使うと、管理画面に文章を入力して、お知らせを公開できます。お店や会社の担当者が自分で更新できるサイトを作りたい場合は、次にWordPressの使い方を学びます。
    skillIds:
    - wordpress
  - label: HTMLを編集して更新する方法でよい
    note: お知らせを変えるときは、HTMLの文章を書き換えて、公開先のファイルを更新します。この方法で作るなら、WordPressの学習は後回しで構いません。
    skillIds: []
notNeededNow:
- label: jQuery
  skillId: jquery
  reason: 今のJavaScriptは標準の機能だけで同じことが書けます。古いサイトを直す仕事で出会ったら、その範囲だけ覚えれば十分です。
- label: Ruby・Python・Rust
  reason: サーバー側の仕組みやアプリを作るための言語で、ホームページの見た目を作るのには使いません。
- label: React・Vue
  reason: 大きなWebアプリの画面を作るための仕組みです。HTML・CSS・JavaScriptの基礎がないと使いこなせず、ホームページ制作では多くの場合いりません。
- label: Laravel
  reason: PHPでWebアプリを作るためのフレームワークです。会員登録や予約の仕組みなど、アプリを作る段階まではいりません。
relatedSituationIds:
- 3d-product-viewer
lastReviewed: "2026-10-10"
---

ホームページは、HTML（中身）、CSS（見た目）、JavaScript（動き）の3つでできています。この順番で学ぶと、前に学んだことを土台に次へ進めます。

お店や会社の担当者が、HTMLを編集せずにお知らせを更新できるようにしたい場合は、最後にWordPressの使い方を学びます。
