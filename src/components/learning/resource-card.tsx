"use client";

import { track } from "@vercel/analytics";
import type { Resource, SkillResourceLevel } from "@/lib/types";
import type { Severity } from "@/lib/versions";

const typeLabels: Record<Resource["type"], string> = {
  official: "公式資料",
  book: "書籍",
  article: "記事",
  course: "講座",
  certification: "資格（学ぶ範囲の地図）"
};

export const levelLabels: Record<SkillResourceLevel, string> = {
  intro: "入門",
  practice: "実践",
  reference: "辞書として引く"
};

export function ResourceCard({ resource, amazonUrl, level, reason, severity, versionLabel, messages, context }: {
  resource: Resource;
  amazonUrl?: string | null;
  level: SkillResourceLevel;
  reason: string;
  severity: Severity;
  versionLabel: string;
  messages: string[];
  context: string;
}) {
  const meta = [typeLabels[resource.type], resource.language, resource.edition].filter(Boolean).join("・");
  return (
    <article className={`resource-card severity-${severity}`} data-resource-type={resource.type}>
      <header>
        <small>{levelLabels[level]}・{meta}</small>
        <h4>{resource.title}</h4>
        {resource.authors?.length ? <p className="resource-authors">著者：{resource.authors.join("、")}</p> : null}
      </header>
      <p className="resource-reason">{reason}</p>
      {versionLabel ? <p className="resource-version">{versionLabel}</p> : null}
      {messages.length ? (
        <div className="resource-caution" role="note">
          <strong>買う前・読む前に確認</strong>
          {messages.map((message) => <p key={message}>{message}</p>)}
          {resource.revisionSourceUrl ? <a href={resource.revisionSourceUrl} target="_blank" rel="noreferrer">発表元を確認する ↗</a> : null}
        </div>
      ) : null}
      <div className="resource-actions">
        <a
          href={resource.url ?? resource.amazonUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(resource.type === "book" ? "book_click" : "learning_resource_click", { context, resource: resource.id })}
        >
          {resource.type === "book" ? "書籍の詳細を開く" : resource.type === "certification" ? "公式サイトを開く" : "開く"}
          <span className="sr-only">（新しいタブで開きます）</span> ↗
        </a>
        {amazonUrl ? (
          <a
            className="amazon-link"
            href={amazonUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => track("amazon_click", { context, resource: resource.id })}
          >
            Amazonで見る（広告）<span className="sr-only">（新しいタブで開きます）</span> ↗
          </a>
        ) : null}
        {resource.syllabusUrls.map((url, index) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            出題範囲{resource.syllabusUrls.length > 1 ? ` ${index + 1}` : ""}を見る<span className="sr-only">（新しいタブで開きます）</span> ↗
          </a>
        ))}
      </div>
    </article>
  );
}
