---
id: web-security-check-priority
slug: web-security-check-priority
title: 最初に導入するセキュリティ検査を選びたい
summary: 依存パッケージの脆弱性監視、ソースコード解析、稼働中アプリの検査を、優先するリスクと運用体制に合わせて比較します。
type: selection
category: security
published: true
defaultConditionIds:
- ci-available
- codeql-use-authorized
conditionIds:
- dependency-risk-priority
- custom-code-risk-priority
- public-attack-surface
- ci-available
- codeql-use-authorized
- github-dependency-graph-available
- authorized-security-test-environment
- security-expert-available
- short-deadline
- small-team
- maintainability-priority
- external-service-restricted
approachIds:
- secc-dependency-monitoring
- secc-static-code-analysis
- secc-dynamic-app-scan
lastReviewed: '2026-08-24'
---

セキュリティ検査は、道具を一つ導入すれば終わるものではありません。Dependabot（利用中の外部パッケージと既知の脆弱性を照合するGitHub機能）は依存パッケージ、CodeQL（ソースコードへ検査ルールを実行する解析機能）は独自コード、ZAP（稼働中のWebアプリへ検査リクエストを送る道具）は実際の画面やAPIの応答を調べます。

三つは対象が異なるため相互補完です。まず優先するリスクに合う一つを継続運用できる形で始め、検出結果を直す流れを整えてから残りを加えます。CIは、変更ごとに自動検査する実行環境を指します。CodeQLは、対象言語だけでなく、公開・非公開の別や自動解析の用途によって利用条件が変わるため、契約または利用許可を先に確認します。動的検査は対象へ実際の攻撃に相当するリクエストを送るため、所有者から明示的に許可された検証環境だけで実行します。

リポジトリ情報を外部のクラウドサービスへ送れない場合、このページで扱うGitHubのDependabot方式は候補から外します。組織内の実行環境でCodeQLを使う場合も、外部へ送信しないことだけでなく、CodeQLの利用条件を満たしているかを確認してください。
