# Validation Report

最終確認日: 2026-10-10（第4回）

| 確認項目 | 結果 |
|---|---|
| Node.js | 22.22.2（`engines.node` の `>=22 <25` を満たす） |
| コンテンツのSchema・参照・前提関係・バージョン・重複 | PASS（エラー0件、警告7件：下記） |
| 単体・内容検証テスト | PASS（7ファイル・52件） |
| Amazonアソシエイトのリンク表示（`AMAZON_ASSOCIATE_TAG=example-22` でビルド） | PASS（商品ページURL・rel="sponsored"・広告表記を確認） |
| 型チェック（`tsc --noEmit`） | PASS |
| Next.js本番ビルド | PASS |
| PC・モバイルの画面操作テスト（Playwright） | 未実行（作業環境にブラウザがないため。CIで実行する） |
| 本のISBN照合（`pnpm books:verify`） | 未実行（作業環境から書誌データに接続できないため。GitHub Actionsで実行する） |
| AIパイプラインの実行（OpenAI API） | 未実行（AIの応答を模したテストのみ） |

## 現在のコンテンツ

- 20分野・40記事（目標）。公開33記事、本の確認待ちの下書き7記事（iPhoneアプリ、Androidアプリ、ブラウザゲーム、Webサーバー構築、チーム開発、Web制作の仕事、フリーランス）
- 学ぶもの49件（公開中の記事で使う42件、準備中7件）
- 資料57件（本45冊、資格2件、公式資料・講座10件）
- 技術判断1件（3D商品ビューア）、実装案4件、判定基準12件、根拠6件

## 警告（公開は可能、画面に注意書きを表示）

- イラストでそこそこわかるLinux 第2版：対象はAlmaLinux 9、現行は10
- いちばんやさしいWordPressの教本 第7版：対象はWordPress 6.x、現行は7.0
- 体系的に学ぶ 安全なWebアプリケーションの作り方 第2版：2018年刊（OWASP Top 10 2017対応）、第3版の改訂が進行中と報道
- 情報セキュリティマネジメント試験：2027年度から新試験制度へ移行予定
- React本格入門・Unityの教科書：React・Unityの現行バージョンが technology-registry.yml に未記入（編集者向け。画面には出さない）
- 作って学ぶ WordPress ブロックテーマ：対象はWordPress 6.x、現行は7.0

## 実行したコマンド

```text
pnpm content:validate
pnpm test
pnpm check
npx tsc --noEmit
```

## この確認に含まれないもの

- 実サービスへの公開と本番環境での動作
- GitHub Actions、Branch protection、外部サービスの接続状態
- 書誌データとの実際の照合結果
- AIパイプラインの実際の出力品質
- 独自Benchmark結果（結果ファイルは作成していません）

公開はPull Requestの確認、必須CI、Repository protectionを通過した後に行います。
