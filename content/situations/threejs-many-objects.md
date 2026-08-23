---
id: threejs-many-objects
slug: threejs-many-objects
title: Three.jsで大量オブジェクトを表示すると重い
summary: Instancing、Geometry統合、LODとカリングを、シーンの性質から選び分けます。
type: performance
category: performance
published: true
defaultConditionIds:
- large-object-count
- performance-priority
conditionIds:
- mobile-priority
- short-deadline
- advanced-visuals
- maintainability-priority
- performance-priority
- large-object-count
- low-end-devices
- dynamic-objects
- static-scene
- repeated-geometry
- varying-detail
approachIds:
- threejs-instancing
- geometry-merge-batching
- lod-frustum-culling
lastReviewed: '2026-08-23'
---

大量表示の改善策は、単純な「軽量化テクニック一覧」では決まりません。同じ形状の反復か、個別形状か、動的か、距離による詳細度変更が可能かで有効な方法が変わります。

まずDraw Callを減らすのか、Geometryを統合するのか、描画対象そのものを減らすのかを切り分けます。
