---
id: authentication-method
slug: authentication-method
title: Webアプリのログイン方法を選びたい
summary: パスキー、組織の共通ログイン、アプリで管理するパスワードを、利用者の要望と運用体制に合わせて比較します。
type: selection
category: security
published: true
defaultConditionIds:
- maintainability-priority
- existing-organization-idp-available
conditionIds:
- passwordless-priority
- enterprise-sso-required
- account-recovery-required
- authentication-team-available
- existing-organization-idp-available
- short-deadline
- small-team
- maintainability-priority
- external-service-restricted
approachIds:
- authm-passkey-webauthn
- authm-external-oidc
- authm-password-session
lastReviewed: '2026-08-24'
---

ログイン方法は、入力画面だけでなく、本人確認をどこで行い、紛失時の復旧を誰が支えるかまで含めて選びます。

パスキーは、WebAuthn（ブラウザと端末の本人確認機能をつなぐ標準）を使い、サイト用パスワードを入力しないログインを実現します。IdP（本人確認と組織アカウントの管理を担う認証基盤）とのOpenID Connect連携は、その認証結果をアプリへ伝える標準を使って、会社や学校の共通ログインへ接続します。

IdPは外部のクラウドサービスだけでなく、組織内で運用する認証基盤も選べます。そのため「外部サービスへ情報を送れない」だけでOpenID Connectを除外せず、利用できるIdP、データの経路、運用責任を確認します。利用できる既存IdPがなく外部サービスも使えない場合は、新たな認証基盤の構築と運用が必要になるため、OpenID Connect案の優先度を下げます。組織ログインとパスワードを使わないことを両方求める場合は、選ぶIdP自身がパスキーなどに対応しているかも確認します。

パスワードとセッション（ログイン済み状態）をアプリで管理する方法は外部の認証基盤に依存しませんが、安全な保存、試行制限、復旧、セッション保護を自分たちで運用します。このページでは、アプリが最初に責任を置く場所を比較します。
