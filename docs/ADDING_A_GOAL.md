# 目標（学ぶ順番）の追加手順

初学者向けの「やりたいこと → 学ぶ順番 → 本」のページは、次の3つのデータでできています。

| データ | 置き場所 | 中身 |
|---|---|---|
| 目標 | `content/goals/*.md` | 初学者の言葉で書いた目的、最終的に必要な学ぶもの、分かれ道、今は学ばなくていいもの |
| 学ぶもの | `content/skills/*.yml` | 技術・知識の単位。先に必要なもの（prerequisites）、変化の速さ、資料と読む理由 |
| 資料 | `content/resources/*.yml` | 本・公式資料・講座・資格。本は対象バージョンと刊行年、資格は試験の版 |

本は目標ではなく「学ぶもの」に付けます。目標が増えても、同じ学ぶものの本はそのまま使い回せます。

## AIで追加する（通常の運用）

GitHubの **Actions → AI — Create learning route (goal) → Run workflow** に、やりたいことを一文で入れます。

```text
調査 → 執筆 → 独立レビュー → プログラムによる検証 → Pull Request
```

プログラムによる検証では、次を確認します。

- 学ぶ順番が前提関係と矛盾しないか（循環していないか）
- 本の対象バージョン・刊行年・試験の版が現行と比べて古すぎないか
- 本と学ぶものの技術・概念が重なっているか（関係のない本を付けていないか）
- 既存の目標と重複していないか（表記ゆれを含む）
- 新しい本が書誌データ（openBD・国立国会図書館サーチ・Google Books）に実在し、書名と刊行年が一致するか

## 人が確認する範囲

Pull Requestに `needs-human-review` が付いたものは、人が確認してからMergeします。付くのは次の場合です。

- 新しい学ぶもの、新しい本・資格、既存の学ぶものへの資料の追加
- 技術の現行バージョンの更新
- その分野の最初の3本の目標

既存の検証済みの学ぶもの・本だけで組んだ目標には `ai-approved` が付きます。`ENABLE_AI_AUTOMERGE=true` にすると、CIが通った時点で自動でMergeされます。

## 手で追加する

1. `content/goals/` に目標を作る。`skillIds` には最後に必要な学ぶものだけを書く（前提は自動で前に並ぶ）。
2. 足りない学ぶものを `content/skills/` に作る。`prerequisites` と `volatility` を正しく書く。
3. 本を `content/resources/` に作り、学ぶものの `resources` に `level` と `reason` をつけて紐づける。
4. `pnpm check` と `pnpm books:verify` を実行する。

## 変化の速さ（volatility）と本の基準

| 値 | 例 | 本の基準 |
|---|---|---|
| `high` | WordPress、React、Laravel | `targetVersions` が必須。現行と一つ前のメジャーまで。2世代以上前は公開できない |
| `medium` | JavaScript、CSS、PHP | 刊行から5年を超えたら `outdatedNote`（古くなった部分）が必須 |
| `low` | HTMLの意味づけ、TCP/IP、監視の考え方 | 古い本でも可。新しい版があれば `editionNote` |

技術の現行バージョンは `content/technology-registry.yml` の `currentVersion` に、確認日と出典つきで書きます。新しいバージョンが出たら更新すると、古いバージョン対象の本はCIで止まり、差し替えが必要な本がわかります。

## 準備中の学ぶもの（status: planned）

学ぶ順番の骨組みだけ作り、本の確認がまだの学ぶものは `status: planned` にします。資料は空で構いません。planned の学ぶものを含む目標は公開できない（`published: false` のまま）ので、本を確認して `status: active` に変えてから公開します。

## 今は学ばなくていいもの

目標ごとに `notNeededNow` を最低1件書きます。jQueryのように「これから学ぶ必要はない」技術は、学ぶものに `status: legacy` と `legacyNote` を付けます。legacyの学ぶものは、どの目標の学ぶ順番にも入れられません。

## 資格

資格は「出題範囲が学ぶ順番の地図になる」という扱いで載せます（`type: certification`）。`examVersion`（現行の試験の版）と `syllabusUrls`、改訂予定があれば `revisionNote` を書きます。対策本は `targetExam` で対応する試験の版を書き、現行と違えば公開できません。

## スクールへの案内

`content/domains.yml` で `schoolEligible: true` の分野の目標だけに、運営元のスクールへの案内が出ます。リンク先は `src/lib/site.ts` の `schoolConfig` で変更します。
