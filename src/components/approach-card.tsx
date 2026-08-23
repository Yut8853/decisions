"use client";

import { track } from "@vercel/analytics";
import type { Evidence, RankedApproach, Resource } from "@/lib/types";

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
  course: "講座"
};

export function ApproachCard({
  rank,
  item,
  evidenceMap,
  resourceMap,
  situationSlug
}: {
  rank: number;
  item: RankedApproach;
  evidenceMap: Map<string, Evidence>;
  resourceMap: Map<string, Resource>;
  situationSlug: string;
}) {
  const evidence = item.evidenceIds.map((id) => evidenceMap.get(id)).filter(Boolean) as Evidence[];
  const resources = item.approach.resourceIds.map((id) => resourceMap.get(id)).filter(Boolean) as Resource[];
  return (
    <article className={rank === 1 ? "approach-card top" : "approach-card"}>
      <header>
        <div className="rank"><span>{String(rank).padStart(2, "0")}</span><small>{item.label}</small></div>
        <div className="approach-title"><p>{item.approach.technologyIds.join(" / ")}</p><h3>{item.approach.title}</h3><span>{item.approach.summary}</span></div>
      </header>
      <div className="reason-panel">
        <strong>なぜこの位置か</strong>
        {item.reasons.length ? item.reasons.map((reason) => <p key={reason}>{reason}</p>) : <p>追加条件による補正はありません。標準条件での基準順位です。</p>}
      </div>
      <div className="fit-grid">
        <div><strong>向いている</strong><ul>{item.approach.recommendedWhen.map((text) => <li key={text}>{text}</li>)}</ul></div>
        <div><strong>向いていない</strong><ul>{item.approach.notRecommendedWhen.map((text) => <li key={text}>{text}</li>)}</ul></div>
      </div>
      <details className="approach-details" onToggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) track("approach_expand", { situation: situationSlug, approach: item.approach.slug });
      }}>
        <summary>詳しい理由・根拠・参考資料 <span>＋</span></summary>
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
        <div className="resource-links">
          <h4>さらに確認・理解する</h4>
          {resources.map((resource) => (
            <a key={resource.id} href={resource.url ?? resource.amazonUrl} target="_blank" rel="noreferrer" onClick={() => track(resource.type === "book" ? "book_click" : "official_docs_click", { situation: situationSlug, resource: resource.id })}>
              <small>{resourceTypeLabels[resource.type]}</small><b>{resource.title}</b><span>{resource.currentUse}</span><i>↗</i>
            </a>
          ))}
        </div>
      </details>
    </article>
  );
}
