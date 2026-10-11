import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DecisionExplorer } from "@/components/decision-explorer";
import { getPublishedSituations, getSituationData } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedSituations().map((situation) => ({ slug: situation.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = getSituationData(slug);
  if (!data) return {};
  return {
    title: data.situation.title,
    description: data.situation.summary,
    alternates: { canonical: `/decisions/${data.situation.slug}` },
    openGraph: { title: data.situation.title, description: data.situation.summary, url: `/decisions/${data.situation.slug}` }
  };
}

export default async function DecisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getSituationData(slug);
  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: data.situation.title,
    description: data.situation.summary,
    dateModified: data.situation.lastReviewed,
    author: { "@type": "Organization", name: "JUNKBRANDING", url: "https://junkbranding.com" },
    mainEntityOfPage: `${siteConfig.url}/decisions/${data.situation.slug}`
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="shell decision-page">
        <header className="decision-hero">
          <div>
            <p className="eyebrow">検証済みの技術判断</p>
            <h1>{data.situation.title}</h1>
            <p>{data.situation.summary}</p>
          </div>
          <dl>
            <div><dt>最終確認日</dt><dd>{data.situation.lastReviewed}</dd></div>
          </dl>
        </header>

        <div className="markdown intro-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{data.situation.body}</ReactMarkdown></div>

        <DecisionExplorer {...data} />
      </article>
    </>
  );
}
