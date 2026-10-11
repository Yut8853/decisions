import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResourceCard } from "@/components/learning/resource-card";
import { getAllSkills, getGoalsSkippingSkill, getGoalsUsingSkill, getSkillBySlug, getSkillResourceViews } from "@/lib/content";

export const dynamicParams = false;

const volatilityLabels = {
  high: "変化が速い：本の対象バージョンを必ず確認してください。",
  medium: "中くらい：刊行年と、古くなった部分の注記を確認してください。",
  low: "変化が遅い：古い本でも基本的な内容は使えます。"
} as const;

export function generateStaticParams() {
  return getAllSkills().map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return {};
  return { title: `${skill.title}を学ぶ本と資料`, description: skill.summary, alternates: { canonical: `/skills/${skill.slug}` } };
}

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();
  const skills = new Map(getAllSkills().map((item) => [item.id, item]));
  const views = getSkillResourceViews(skill);
  const usedBy = getGoalsUsingSkill(skill.id);
  const skippedBy = getGoalsSkippingSkill(skill.id);

  return (
    <article className="shell goal-page">
      <header className="decision-hero">
        <div>
          <p className="eyebrow">学ぶもの</p>
          <h1>{skill.title}</h1>
          <p>{skill.summary}</p>
        </div>
        <dl>
          <div><dt>変化の速さ</dt><dd>{{ high: "速い", medium: "中くらい", low: "遅い" }[skill.volatility]}</dd></div>
          <div><dt>最終確認日</dt><dd>{skill.lastReviewed}</dd></div>
        </dl>
      </header>

      {skill.status === "legacy" ? (
        <aside className="legacy-box" role="note">
          <strong>これから学ぶ順番には入れていません</strong>
          <p>{skill.legacyNote}</p>
        </aside>
      ) : null}

      <section className="route-section">
        <dl className="route-step-meta wide">
          <div><dt>できるようになること</dt><dd>{skill.canDo}</dd></div>
          <div><dt>先に必要</dt><dd>{skill.prerequisites.length ? skill.prerequisites.map((id) => {
            const item = skills.get(id);
            return item ? <Link key={id} href={`/skills/${item.slug}`}>{item.title}</Link> : id;
          }).reduce<React.ReactNode[]>((acc, node, index) => index ? [...acc, "、", node] : [node], []) : "なし"}</dd></div>
          <div><dt>本の選び方</dt><dd>{volatilityLabels[skill.volatility]}</dd></div>
        </dl>
        {views.length ? (
          <div className="resource-grid">
            {views.map((view) => <ResourceCard key={view.resource.id} {...view} context={`skill:${skill.id}`} />)}
          </div>
        ) : null}
      </section>

      {usedBy.length ? (
        <section className="related-section" aria-labelledby="used-title">
          <div className="explorer-heading"><div><h2 id="used-title">この学ぶものが出てくる目的</h2></div></div>
          <ul className="goal-link-list">
            {usedBy.map((goal) => <li key={goal.id}><Link href={`/goals/${goal.slug}`}>{goal.title} →</Link></li>)}
          </ul>
        </section>
      ) : null}

      {skippedBy.length ? (
        <section className="related-section" aria-labelledby="skipped-title">
          <div className="explorer-heading"><div><h2 id="skipped-title">「今は学ばなくていい」としている目的</h2></div></div>
          <ul className="goal-link-list">
            {skippedBy.map((goal) => <li key={goal.id}><Link href={`/goals/${goal.slug}`}>{goal.title} →</Link></li>)}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
