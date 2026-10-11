"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { isJapaneseReadableBook } from "@/lib/book-language";
import type { Evidence, LearningStage, LearningStep, RankedApproach, Resource } from "@/lib/types";

const evidenceTypeLabels: Record<Evidence["sourceType"], string> = {
  specification: "仕様書",
  "official-documentation": "公式資料",
  "official-release": "公式発表",
  "official-repository": "公式コード",
  benchmark: "性能測定",
  book: "書籍",
  article: "記事"
};

const resourceTypeLabels: Record<Resource["type"], string> = {
  official: "公式資料",
  book: "書籍",
  article: "記事",
  course: "講座",
  certification: "資格"
};

const stageLabels: Record<LearningStage, { title: string; note: string }> = {
  start: { title: "最初に読む", note: "この案で作り始めるのに必要なもの" },
  stuck: { title: "困った時に引く", note: "実装中に詰まった箇所を調べるもの" },
  deepen: { title: "さらに深める", note: "必要になってから読めばよいもの" }
};
const stageOrder: LearningStage[] = ["start", "stuck", "deepen"];

type VisibleStep = LearningStep & { resource: Resource; triggeredBy: string[] };

export function ApproachCard({
  rank,
  item,
  evidenceMap,
  resourceMap,
  activeConditionIds,
  conditionLabels,
  situationSlug
}: {
  rank: number;
  item: RankedApproach;
  evidenceMap: Map<string, Evidence>;
  resourceMap: Map<string, Resource>;
  activeConditionIds: string[];
  conditionLabels: Map<string, string>;
  situationSlug: string;
}) {
  const evidence = item.evidenceIds.map((id) => evidenceMap.get(id)).filter(Boolean) as Evidence[];
  const active = new Set(activeConditionIds);

  // 条件つきの資料は、選んだ条件のどれかに当てはまる時だけ表示する。
  const steps = item.approach.learningPath
    .map((step) => ({ ...step, resource: resourceMap.get(step.resourceId) }))
    .filter((step): step is LearningStep & { resource: Resource } => Boolean(step.resource));
  const visibleSteps: VisibleStep[] = steps
    .filter((step) => step.showWhenAny.length === 0 || step.showWhenAny.some((id) => active.has(id)))
    .map((step) => ({ ...step, triggeredBy: step.showWhenAny.filter((id) => active.has(id)) }));
  const hiddenCount = steps.length - visibleSteps.length;

  const visibleReading = visibleSteps.filter((step) => step.resource.type === "book" || step.resource.type === "course");
  const hasJapaneseReading = visibleReading.some((step) => isJapaneseReadableBook(step.resource));
  const readingNote = visibleReading.length === 0
    ? "この案に合う本は載せていません。公式資料から始めてください。"
    : hasJapaneseReading
      ? null
      : "この案に合う日本語の本は見つかっていないため、英語の本・講座を載せています。";

  return (
    <article className={rank === 1 ? "approach-card top" : "approach-card"}>
      <header>
        <div className="rank"><span>{String(rank).padStart(2, "0")}</span><small>{item.label}</small></div>
        <div className="approach-title"><h3>{item.approach.title}</h3><span>{item.approach.summary}</span></div>
      </header>
      <div className="reason-panel">
        <strong>なぜこの位置か</strong>
        {item.reasons.length ? item.reasons.map((reason) => <p key={reason}>{reason}</p>) : <p>追加条件による補正はありません。標準条件での基準順位です。</p>}
      </div>
      <div className="fit-grid">
        <div><strong>向いている</strong><ul>{item.approach.recommendedWhen.map((text) => <li key={text}>{text}</li>)}</ul></div>
        <div><strong>向いていない</strong><ul>{item.approach.notRecommendedWhen.map((text) => <li key={text}>{text}</li>)}</ul></div>
      </div>
      <section className="learning-path" aria-label={`${item.approach.shortTitle}を学ぶための資料`}>
        <header>
          <div>
            <h4>この案を学ぶ資料</h4>
            <p>本・公式資料・講座を、使う場面ごとに分けています。それぞれに、この案で読む理由を書いています。</p>
          </div>
          <Link href="/books">書籍一覧を見る →</Link>
        </header>
        {stageOrder.map((stage) => {
          const stageSteps = visibleSteps.filter((step) => step.stage === stage);
          if (!stageSteps.length) return null;
          return (
            <div className="learning-stage" key={stage}>
              <h5>{stageLabels[stage].title}<small>{stageLabels[stage].note}</small></h5>
              <ul>
                {stageSteps.map(({ resource, reason, triggeredBy }) => {
                  const meta = [resourceTypeLabels[resource.type], resource.language, resource.edition, resource.versionNote].filter(Boolean);
                  return (
                    <li key={resource.id}>
                      <a
                        className="learning-item"
                        data-resource-type={resource.type}
                        href={resource.url ?? resource.amazonUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => track(resource.type === "book" ? "book_click" : "official_docs_click", { situation: situationSlug, resource: resource.id })}
                      >
                        {resource.type === "book" ? (
                          <span className="learning-cover">
                            {resource.coverImageUrl
                              ? <img src={resource.coverImageUrl} alt={resource.coverImageAlt ?? ""} loading="lazy" decoding="async" />
                              : <span aria-hidden="true">BOOK</span>}
                          </span>
                        ) : null}
                        <span className="learning-copy">
                          <small>{meta.join("・")}</small>
                          <b>{resource.title}</b>
                          <span className="learning-reason">{reason}</span>
                          {triggeredBy.length ? (
                            <em>「{triggeredBy.map((id) => conditionLabels.get(id) ?? id).join("」「")}」を選んだため表示</em>
                          ) : null}
                          <i>開く<span className="sr-only">（新しいタブで開きます）</span> ↗</i>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {readingNote ? <p className="learning-note">{readingNote}</p> : null}
        {hiddenCount > 0 ? <p className="learning-note">条件を選ぶと表示される資料が、あと{hiddenCount}件あります。</p> : null}
      </section>
      <details className="approach-details" onToggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) track("approach_expand", { situation: situationSlug, approach: item.approach.slug });
      }}>
        <summary>詳しい理由・根拠 <span>＋</span></summary>
        <div className="detail-columns">
          <div><h4>メリット</h4><ul>{item.approach.advantages.map((text) => <li key={text}>{text}</li>)}</ul></div>
          <div><h4>デメリット</h4><ul>{item.approach.disadvantages.map((text) => <li key={text}>{text}</li>)}</ul></div>
        </div>
        <div className="evidence-links">
          <h4>この判断を支える根拠</h4>
          {evidence.length ? evidence.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" onClick={() => track("evidence_click", { situation: situationSlug, evidence: source.id })}>
              <small>{evidenceTypeLabels[source.sourceType]}</small><b>{source.title}</b><span>{source.claim}</span><i>{source.verifiedAt} ↗</i>
            </a>
          )) : <p>標準の並び順です。追加条件による根拠はありません。</p>}
        </div>
      </details>
    </article>
  );
}
