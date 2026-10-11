---
id: php-json-api
slug: php-json-api
title: PHPでJSONを返す小さなAPIを作りたい
summary: HTMLの代わりにJSONを返す処理をPHPで作ります。入力パラメーター、HTTPの結果、返すデータの形を決めます。
kind: build
domainId: backend
aliases: []
published: true
skillIds:
  - php-basics
notNeededNow:
  - label: Laravel
    skillId: laravel
    reason: PHPの基本が分かってからでないと、フレームワークが何をしているかを理解できません。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

固定の架空の商品データを返す、読み取り専用APIを作る練習です。会員機能やデータベースへの書き込みを含めず、リクエストを受け取って一定の形式で応答するところまでに絞ります。

## まず取り組むこと

1. 商品IDを受け取り、対応する商品名と説明を配列で用意します。
2. JSONへ変換して返し、Content-TypeとHTTPステータスを確認します。
3. 存在しないIDや不正な形式の入力で、成功時と区別できる応答を返します。

## この目的で本を読む理由

[PHPの基礎](/skills/php-basics)の本を使います。[出版社の目次](https://www.shoeisha.co.jp/book/detail/9784798168494)で配列とリクエスト情報を扱うことを確認しています。JSON変換の指定や失敗の扱いはPHP公式マニュアルで補います。認証付きの公開APIを作り切る本としては扱いません。

## できたか確認すること

正常なID、不明なID、不正な入力について、受け取り側が結果を区別できれば完成です。練習はローカルで行い、公開時の認証、アクセス制限、秘密情報の管理は別途学びます。

## 学習内容の根拠

- [PHP：json_encode](https://www.php.net/manual/en/function.json-encode.php)：PHPの値をJSONへ変換する関数と失敗時の扱いを確認する資料です。
