---
id: hosting-runtime-selection
slug: hosting-runtime-selection
title: Webサイト・アプリの公開先を選びたい
summary: 静的・エッジ配信、サーバーレス関数、マネージドコンテナ、それらを分ける構成を、実行時処理と運用要件から比較します。
type: selection
category: operations
published: true
defaultConditionIds:
- static-output-possible
conditionIds:
- static-output-possible
- request-time-processing-required
- bursty-traffic
- persistent-worker-required
- custom-runtime-required
approachIds:
- static-edge-hosting
- serverless-function-hosting
- managed-container-runtime
- split-static-runtime-hosting
lastReviewed: '2026-08-24'
---

閲覧時にサーバー処理が不要なら、静的ファイルをエッジから配信する構成が第一候補です。認証や利用者ごとの応答が必要ならサーバーレス関数、常駐処理や独自の実行環境が必要ならマネージドコンテナを検討します。

公開サービスの名前から選ぶのではなく、リクエスト時に何を実行するか、処理を常駐させるか、実行環境をどこまで指定するかで比較します。データベース、監視、バックアップなど、公開先以外の運用設計は別途必要です。

公開画面を静的配信できても、別に常駐処理や独自実行環境が必要なら、静的配信と動的な実行環境を分ける構成も候補です。このページは管理された配信・実行基盤を対象とし、仮想マシン、Kubernetes、特権実行、永続的なローカル状態、特殊なネットワーク要件は別の判断範囲とします。
