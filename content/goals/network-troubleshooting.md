---
id: network-troubleshooting
slug: network-troubleshooting
title: サイトにつながらない原因を順番に調べたい
summary: 名前解決、接続、HTTPの応答を分けて調べます。やみくもに設定を変えず、どの段階で止まっているかを記録する練習です。
kind: build
domainId: infra-ops
aliases: []
published: true
skillIds:
  - network-basics
  - linux-basics
notNeededNow:
  - label: Kubernetes
    reason: 多数のコンテナをまとめて動かす仕組みです。1台のLinuxサーバーを扱えるようになってからで十分です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

「ブラウザーで開けない」という症状を、もう少し具体的に説明できるようにします。自分の端末と許可された確認先を使い、通信が始まる前の問題と、接続後にサーバーが返すエラーを分けて考えます。

## まず取り組むこと

1. いつ、どの端末で、どのURLが開けないかを記録し、他のページとの違いを整理します。
2. 名前が引けるか、接続できるか、HTTP応答があるかを段階ごとに確認します。
3. curlの詳細表示を読み、成功した段階と止まった段階を短い調査メモにします。

## この目的で本を読む理由

[ネットワークの基礎](/skills/network-basics)の本でIP、TCP、アプリケーションの役割を学びます。[出版社の紹介](https://www.ohmsha.co.jp/book/9784274224478.html)が扱うTCP/IPの基礎を、調査結果の読み分けに使います。[Linuxの基礎](/skills/linux-basics)は端末操作のために必要です。

## できたか確認すること

設定を変更する前に、確認できた事実とまだ不明な点を分けて報告できれば一区切りです。詳細ログには認証情報などが出る場合があるため、共有前に内容を確認します。

## 学習内容の根拠

- [curl：詳細表示の読み方](https://everything.curl.dev/usingcurl/verbose/)：名前解決、接続先、送受信ヘッダーを段階ごとに読む根拠です。
