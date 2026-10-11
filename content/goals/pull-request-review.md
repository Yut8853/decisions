---
id: pull-request-review
slug: pull-request-review
title: GitHubで変更内容を説明してレビューを受けたい
summary: 小さな変更をブランチで作り、理由と確認結果を添えてPull Requestにします。指摘への対応と差分の読み方を学びます。
kind: build
domainId: team-dev
aliases: []
published: true
skillIds:
  - git
notNeededNow:
  - label: Gitの内部の仕組みを深く学ぶこと
    reason: 最初は、記録・取り消し・共有・衝突の解決ができれば十分です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

チーム開発全体を学ぶ前に、他の人へひとつの変更を見てもらう流れを練習します。対象は説明文の修正など、結果を確認しやすい小さな変更にします。レビューが通ること自体より、判断に必要な情報を伝えることが目標です。

## まず取り組むこと

1. 変更前の問題を一文で書き、関係するファイルだけをブランチで修正します。
2. Pull Requestに変更理由、見てほしい箇所、確認したことを書きます。
3. 差分を自分でも読み、指摘を受けたら修正内容と再確認の結果を伝えます。

## この目的で本を読む理由

[Git](/skills/git)の本の[ブランチとGitHubを扱う章](https://book.impress.co.jp/books/1124101049)を使います。Gitの記録操作と、他の人に変更を伝える操作をつなげるための再利用です。組織ごとの承認ルールは別途確認します。

## できたか確認すること

第三者が差分と説明から変更の目的を追え、指摘への対応を確認できれば一区切りです。レビュー済みという記録を自分で作ったり、テスト未実行を成功と書いたりしません。

## 学習内容の根拠

- [GitHub：Pull Requestのレビュー](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)：コメント、承認、変更要求を使って変更を確認する流れの根拠です。
