---
id: wordpress-editor-workflow
slug: wordpress-editor-workflow
title: WordPressのお知らせを複数人で確認してから公開したい
summary: 書く人と公開を確認する人の役割を分け、お知らせを下書きから公開へ進めます。管理者権限を配る前に権限の違いを学びます。
kind: build
domainId: cms
aliases: []
published: true
skillIds:
  - wordpress
notNeededNow:
  - label: PHP
    reason: テーマを自作するまでは不要です。まず管理画面とブロックエディターで作れる範囲を覚えます。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

サイトを作る作業から一歩進み、複数の担当者で更新する手順を整えます。練習用サイトに担当を分けたアカウントを作り、下書き、確認、公開の順番を試します。特別な承認システムを開発するコースではありません。

## まず取り組むこと

1. 記事を書く人、内容を確認して公開する人、サイト設定を管理する人の作業を書き分けます。
2. それぞれの役割でログインし、記事の作成・公開・設定変更で何ができるか確認します。
3. 確認してほしい項目を一覧にし、画像、日付、リンク先を確認してから公開する練習をします。

## この目的で本を読む理由

[WordPress](/skills/wordpress)の入門書で管理画面の操作を押さえます。[出版社の目次](https://book.impress.co.jp/books/1124101161)にあるコンテンツ作成と安全な運用が基礎になります。本は6.x対応なので、権限の具体的な一覧は公式資料を確認します。

## できたか確認すること

書く担当者が不要な設定変更をできず、公開担当者が下書きを確認して公開できることを確かめます。複雑な承認段階や監査要件がある場合は、別の仕組みの検討が必要です。

## 学習内容の根拠

- [WordPress：権限グループと権限](https://wordpress.org/documentation/article/roles-and-capabilities/)：投稿の編集・公開や管理作業に必要な権限を確認する根拠です。
