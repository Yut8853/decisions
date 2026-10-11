---
id: accessible-contact-form
slug: accessible-contact-form
title: 入力ミスがあっても直しやすいフォーム画面を作りたい
summary: 項目名、入力例、必須項目、エラーの場所が伝わるフォーム画面を作ります。HTMLの構造と入力を助ける表示を学びます。
kind: build
domainId: accessibility
aliases: []
published: true
skillIds:
  - javascript-basics
  - web-accessibility
notNeededNow:
  - label: 後付けの対応ツールだけに頼ること
    reason: サイトに部品を足すだけでは、根本的な対応にならないことが多いです。HTMLを正しく書くことが基本です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

名前とメールアドレスを入力する、送信しない練習用フォームを作ります。入力ミスを見つけるだけでなく、何をどう直せばよいか伝え、入力済みの内容を失わない画面が目標です。サーバーで受け付ける仕組みはこのコースの範囲外です。

## まず取り組むこと

1. 入力欄に対応する項目名を置き、必須か任意か、入力形式の例を文章で示します。
2. 空欄や形式違いを試し、該当する項目の近くに修正方法を表示します。色だけでエラーを示さないようにします。
3. キーボードだけで移動して修正できるか、読み上げでも項目名が分かるかを確かめます。

## この目的で本を読む理由

[HTML](/skills/html)と[JavaScriptの基礎](/skills/javascript-basics)で入力要素とイベントを理解してから、[Webアクセシビリティ](/skills/web-accessibility)の資料で説明と操作を見直します。[アクセシビリティ入門書の出版社紹介](https://book.impress.co.jp/books/1125101037)が扱う実装・評価の流れを、このフォームの確認に使います。フォーム専用の完成コードが載っているという意味ではありません。

## できたか確認すること

未入力、間違った形式、修正後の3通りを試し、エラーの理由と直す場所が分かることを確認します。実際の送信時はサーバー側の入力検証も別途必要です。

## 学習内容の根拠

- [W3C WAI：フォームの作り方](https://www.w3.org/WAI/tutorials/forms/)：ラベル、入力説明、入力の検証、通知を別々に確認する根拠です。
