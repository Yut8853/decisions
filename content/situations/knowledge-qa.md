---
id: knowledge-qa
slug: knowledge-qa
title: 自社資料に答える質問機能を作りたい
summary: 承認済みFAQの検索、ホスト型ファイル検索を使う生成AI、自前の検索と生成AIの組み合わせを、回答の確実さと資料の扱いから選びます。
type: architecture
category: data-ai
published: true
defaultConditionIds:
- source-citations-required
conditionIds:
- source-citations-required
- sensitive-knowledge-base
- frequent-knowledge-updates
- retrieval-customization-required
- deterministic-answers-required
- small-team
- external-service-restricted
approachIds:
- kqa-curated-faq-search
- kqa-hosted-file-search-ai
- kqa-custom-retrieval-ai
lastReviewed: '2026-08-24'
---

自社資料への質問機能は、回答を作る方法だけでなく、根拠を示せるか、資料をどこへ保存するか、同じ質問へどこまで同じ内容を返すかで選びます。

承認済みの回答をそのまま返したいならFAQ検索、少人数で資料検索付きの生成回答を始めたいならホスト型のファイル検索、権限や検索順を業務に合わせて制御したいなら自前検索との組み合わせが候補です。生成AIは誤り得るため、出典表示、回答できない場合の扱い、評価用の質問集を別途設計します。
