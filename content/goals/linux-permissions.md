---
id: linux-permissions
slug: linux-permissions
title: Linuxでファイルを読めない・書けない原因を調べたい
summary: 所有者、グループ、読み書きの権限を確認し、必要な範囲だけ直します。全員へ権限を広げずに原因を切り分ける練習です。
kind: build
domainId: infra-ops
aliases: []
published: true
skillIds:
  - linux-basics
notNeededNow:
  - label: Kubernetes
    reason: 多数のコンテナをまとめて動かす仕組みです。1台のLinuxサーバーを扱えるようになってからで十分です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

ファイル操作でPermission deniedと出たときに、設定をむやみに変えず状況を調べる課題です。自分の練習用Linux環境を使い、誰として操作しているかと、誰に何が許されているかを区別します。

## まず取り組むこと

1. 操作しているユーザーと、ファイル・親ディレクトリの所有者と権限を確認します。
2. 練習用ファイルで、読む場合と書く場合に必要な権限の違いを調べます。
3. 必要な対象だけを変更し、目的の操作ができることと、不要な書き込みができないことを確かめます。

## この目的で本を読む理由

[Linuxの基礎](/skills/linux-basics)の入門書をコマンド操作の土台にします。[出版社の紹介と目次](https://www.shoeisha.co.jp/book/detail/9784798181974)の第5章でユーザー、グループ、パーミッションを扱うことを確認しています。所有者と権限の具体的な判断はRed Hatの公式資料で補います。本の学習用OSと手元の環境の違いにも注意します。

## できたか確認すること

誰にどの権限が足りなかったかを説明できれば一区切りです。原因がACLやSELinuxなど別の制御にある場合は、この基本確認だけで解決したと決めず、対象の仕組みを追加で調べます。

## 学習内容の根拠

- [Red Hat：ファイルシステムの権限管理](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-file-system-permissions_configuring-basic-system-settings)：所有者・グループ・その他の権限を区別する根拠です。
