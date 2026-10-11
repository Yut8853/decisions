---
id: javascript-api
slug: javascript-api
title: APIから取得した情報をページに表示したい
summary: JSON形式の情報を取得し、読み込み中・成功・失敗を表示する画面を作ります。通信と画面更新を分けて考える練習です。
kind: build
domainId: frontend
aliases: []
published: true
skillIds:
  - javascript-basics
notNeededNow:
  - label: jQuery
    skillId: jquery
    reason: 今のJavaScriptは標準の機能だけで同じことが書けます。古いサイトを直す仕事で出会ったら、その範囲だけ覚えれば十分です。
relatedSituationIds: []
lastReviewed: "2026-10-11"
---

HTMLに直接書いた内容ではなく、通信で受け取ったデータを表示する課題です。まず自分で用意したJSONファイルを取得するところから始め、通信に失敗しても画面が止まったままにならないようにします。

## まず取り組むこと

1. 商品名と説明を持つJSONを用意し、取得した値をページに表示します。
2. 読み込み中の表示を出し、取得後には消えるようにします。
3. 存在しないURL、空の配列、想定と違うデータを試し、状況に合った説明を表示します。

## この目的で本を読む理由

[JavaScriptの基礎](/skills/javascript-basics)の本でデータとエラーの扱いを学び、[出版社の目次](https://www.sbcr.jp/product/4815615758/)にある複数データ・エラー解決の部分を使います。Fetchの通信手順は下の公式資料で補います。この入門書だけで外部サービスの認証まで学べるとはしていません。

## できたか確認すること

成功と失敗を見分け、HTTPエラーも確認できれば一区切りです。公開できないAPIキーをブラウザーへ埋め込まないこと、外部APIの利用条件は別に確かめることも学習範囲に含めます。

## 学習内容の根拠

- [MDN：Fetch APIの利用](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)：JSONの取得とHTTPの成功状態の確認を学ぶ根拠です。
