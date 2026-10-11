---
id: react-app
slug: react-app
title: "Reactで画面を作れるようになりたい"
summary: "HTML・CSS・JavaScriptの基礎を押さえたうえで、画面を部品に分けて組み立てるReactを学びます。"
kind: build
domainId: frontend
aliases:
- "Reactを学びたい"
- "Webアプリの画面を作りたい"
published: true
skillIds:
- "react"
branches:
- id: typescript
  question: "チームでの開発や、長く保守するアプリを作る予定ですか？"
  options:
  - label: "はい"
    note: "TypeScriptを加えると、書き間違いを早く見つけられます。"
    skillIds:
    - "typescript"
  - label: "いいえ"
    note: "まずはJavaScriptのままで構いません。"
    skillIds: []
notNeededNow:
- label: "jQuery"
  skillId: jquery
  reason: "Reactでは画面の更新をReactに任せます。jQueryで直接画面を書き換える方法とは考え方が合いません。"
- label: "Next.jsなどのフレームワーク"
  reason: "Reactの基本が分かってから選びます。最初から使うと、どこまでがReactの機能か分からなくなります。"
relatedSituationIds: []
lastReviewed: "2026-10-10"
---

Reactは、画面をボタンや一覧などの部品に分けて組み立てるためのライブラリです。部品の中身はJavaScriptで書くため、JavaScriptの基礎がないと先に進めません。

ホームページを作るだけなら、Reactは多くの場合いりません。会員機能のある画面など、データによって表示が変わるWebアプリを作るときに使います。
