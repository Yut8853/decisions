---
id: seo-rich-3d
slug: seo-rich-3d
title: SEOを維持しながらリッチな3Dサイトを作りたい
summary: HTML本文を保ちながら3Dを組み込む構成と、Canvas中心構成の違いを判断します。
type: architecture
category: sites
published: true
defaultConditionIds:
- seo-priority
- content-heavy
conditionIds:
- react-existing
- mobile-priority
- seo-priority
- short-deadline
- advanced-visuals
- maintainability-priority
- accessibility-priority
- content-heavy
- low-end-devices
- performance-priority
approachIds:
- dom-first-three-islands
- full-canvas-three
- static-fallback-progressive
lastReviewed: '2026-08-23'
---

検索流入やアクセシビリティが重要なサイトでは、3D表現をページ構造の中心に置くか、HTMLの補助表現として扱うかが設計上の大きな分岐になります。

ここでは、DOM優先、フルCanvas、静的フォールバックの3案を比較します。
