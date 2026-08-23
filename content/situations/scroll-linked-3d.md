---
id: scroll-linked-3d
slug: scroll-linked-3d
title: スクロール連動のリッチサイトを作りたい
summary: DOM、Three.js、React Three Fiber、画像シーケンスによるスクロール演出を比較します。
type: build
category: sites
published: true
defaultConditionIds:
- mobile-priority
conditionIds:
- react-existing
- mobile-priority
- seo-priority
- short-deadline
- advanced-visuals
- maintainability-priority
- existing-glsl-assets
- accessibility-priority
- content-heavy
- low-end-devices
approachIds:
- dom-gsap-scroll
- threejs-scrolltrigger
- r3f-scrollcontrols
- canvas-image-sequence
lastReviewed: '2026-08-23'
---

スクロール連動演出には複数の実装経路があります。すべてをCanvasに載せる方法が最適とは限りません。

コンテンツ量、端末性能、React利用、演出の自由度を踏まえて、DOM・3D・画像シーケンスを比較します。
