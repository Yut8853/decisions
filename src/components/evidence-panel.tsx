"use client";

import { track } from "@vercel/analytics";
import type { Evidence } from "@/lib/types";

export function EvidencePanel({ evidence, situationSlug }: { evidence: Evidence[]; situationSlug: string }) {
  return (
    <section className="corpus-section" aria-labelledby="corpus-title">
      <div className="explorer-heading"><div><h2 id="corpus-title">判断に使った根拠</h2></div></div>
      <p>参照先だけでなく、各資料のどの情報を判断に使ったかも記録しています。</p>
      <div className="evidence-table">
        {evidence.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer" onClick={() => track("evidence_click", { situation: situationSlug, evidence: source.id })}>
            <span className="source-kind">{source.primary ? "一次資料" : "参考資料"}</span>
            <div><b>{source.title}</b><p>{source.claim}</p></div>
            <time>{source.verifiedAt}</time><i>↗</i>
          </a>
        ))}
      </div>
    </section>
  );
}
