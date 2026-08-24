---
id: frontend-test-priority
slug: frontend-test-priority
title: 最初に整備するテストを選びたい
summary: ロジックの単体テスト、ブラウザ内のコンポーネントテスト、主要な利用導線のE2Eテストから、最初に厚くする層を選びます。
type: selection
category: quality
published: true
defaultConditionIds:
- critical-user-journeys
conditionIds:
- logic-heavy
- browser-behavior-priority
- critical-user-journeys
- accessibility-priority
approachIds:
- ftp-logic-unit-tests
- ftp-browser-component-tests
- ftp-critical-flow-e2e
lastReviewed: '2026-08-24'
---

テストは数を増やす前に、どの失敗を最初に見つけたいかを決めます。計算や変換の誤り、入力やフォーカスの崩れ、ログインや申し込みの途中失敗では、適したテストの範囲が異なります。

ここでは三つのテストを排他的に選ぶのではなく、最初に重点を置く層を決めます。重要な箇所から始め、残るリスクを別の層で補います。
