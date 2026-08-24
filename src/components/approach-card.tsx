"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
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
  const books = resources.filter((resource) => resource.type === "book");
  const otherResources = resources.filter((resource) => resource.type !== "book");
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
      {books.length ? (
        <section className="approach-books" aria-label="この実装案に関連する書籍">
          <header>
            <div>
              <h4>この実装案に関連する書籍</h4>
              <p>背景知識や設計の考え方を深く学べます。</p>
            </div>
            <Link href="/books">書籍一覧を見る →</Link>
          </header>
          <div className="approach-book-grid">
            {books.map((book) => (
              <a
                className="approach-book-card"
                href={book.url}
                target="_blank"
                rel="noreferrer"
                key={book.id}
                onClick={() => track("book_click", { situation: situationSlug, resource: book.id })}
              >
                <span className="approach-book-cover">
                  <img src={book.coverImageUrl} alt={book.coverImageAlt} loading="lazy" decoding="async" />
                </span>
                <span className="approach-book-copy">
                  <small>{[book.language, book.edition, book.versionNote].filter(Boolean).join("・")}</small>
                  <b>{book.title}</b>
                  <span>著者：{book.authors?.join("、")}</span>
                  <i>書籍ページを開く<span className="sr-only">（新しいタブで開きます）</span> ↗</i>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
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
        {otherResources.length ? (
          <div className="resource-links">
            <h4>さらに確認・理解する</h4>
            {otherResources.map((resource) => (
              <a key={resource.id} href={resource.url ?? resource.amazonUrl} target="_blank" rel="noreferrer" onClick={() => track("official_docs_click", { situation: situationSlug, resource: resource.id })}>
                <small>{resourceTypeLabels[resource.type]}</small><b>{resource.title}</b><span>{resource.currentUse}</span><i>↗</i>
              </a>
            ))}
          </div>
        ) : null}
      </details>
    </article>
  );
}
