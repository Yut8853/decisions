---
id: aws-cost-check
slug: aws-cost-check
title: AWSで何に料金がかかっているか確認したい
summary: 利用料金をサービス別に確認し、予算の通知を設定する考え方を学びます。通知が来れば課金が止まる、という誤解も避けます。
kind: build
domainId: cloud
aliases: []
published: true
skillIds:
  - aws-basics
notNeededNow:
  - label: 多くのサービスを一度に覚えること
    reason: AWSのサービスは非常に多くあります。最初はサーバー・ネットワーク・保存場所の基本だけで足ります。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

AWSでサーバーを作る課題とは別に、使ったものと費用の関係を説明する練習です。料金の閲覧権限がある学習用アカウントを使い、誰の何の用途で使っているリソースかを整理します。

## まず取り組むこと

1. 請求やコスト管理の画面で、対象期間とサービスごとの利用を確認します。
2. 残しているリソースの用途と担当を一覧にし、不明なものは削除せずに確認対象にします。
3. AWS Budgetsで通知する条件と宛先を決め、通知後に何を調べるかを書きます。

## この目的で本を読む理由

[AWSの基礎](/skills/aws-basics)の本を使います。[出版社の目次](https://gihyo.jp/book/2025/978-4-297-14820-1)のAWSのコスト、料金計算、Billing and Cost Managementが、この目的に対応します。変わる料金表を暗記する本としては使いません。

## できたか確認すること

費用が発生する主なサービスを説明し、予算通知後の確認先を決められれば一区切りです。料金の反映や通知には遅れがあり、通知の設定だけで支払い上限が保証されるわけではありません。

## 学習内容の根拠

- [AWS：Budgetsによるコスト管理](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)：予算通知の用途と、課金の反映・通知に遅れがあることの根拠です。
