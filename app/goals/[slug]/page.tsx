import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResourceCard } from "@/components/learning/resource-card";
import { SchoolCta } from "@/components/learning/school-cta";
import { getGoalData, getPublishedGoals, getSkillResourceViews } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import type { Skill } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedGoals().map((goal) => ({ slug: goal.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = getGoalData(slug);
  if (!data) return {};
  return {
    title: `${data.goal.title}：学ぶ順番と本`,
    description: data.goal.summary,
    alternates: { canonical: `/goals/${data.goal.slug}` }
  };
}

function hasJapaneseIntroBook(skill: Skill) {
  return getSkillResourceViews(skill).some((view) => view.level === "intro" && view.resource.type === "book" && (view.resource.language ?? "").startsWith("日本語"));
}

function SkillStep({ skill, index, skillMap, goalSlug }: { skill: Skill; index: number; skillMap: Map<string, Skill>; goalSlug: string }) {
  const views = getSkillResourceViews(skill);
  const prerequisites = skill.prerequisites.map((id) => skillMap.get(id)?.title ?? id);
  return (
    <li className="route-step">
      <div className="route-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
      <div className="route-step-body">
        <h3><Link href={`/skills/${skill.slug}`}>{skill.title}</Link></h3>
        <p>{skill.summary}</p>
        <dl className="route-step-meta">
          <div><dt>できるようになること</dt><dd>{skill.canDo}</dd></div>
          {prerequisites.length ? <div><dt>先に必要</dt><dd>{prerequisites.join("、")}</dd></div> : null}
        </dl>
        <div className="resource-grid">
          {views.map((view) => (
            <ResourceCard key={view.resource.id} {...view} context={`goal:${goalSlug}:${skill.id}`} />
          ))}
        </div>
        {!hasJapaneseIntroBook(skill) ? (
          <p className="route-note">この段階に合う日本語の入門書は、今のところ載せていません。上の資料から始めてください。</p>
        ) : null}
      </div>
    </li>
  );
}

export default async function GoalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getGoalData(slug);
  if (!data) notFound();
  const { goal, domain, route, skillMap, relatedSituations } = data;
  const school = domain.schoolEligible;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: goal.title,
    description: goal.summary,
    provider: { "@type": "Organization", name: "JUNKBRANDING", url: "https://junkbranding.com" },
    url: `${siteConfig.url}/goals/${goal.slug}`
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="shell goal-page">
        <header className="decision-hero">
          <div>
            <p className="eyebrow">{domain.title}</p>
            <h1>{goal.title}</h1>
            <p>{goal.summary}</p>
          </div>
          <dl>
            <div><dt>学ぶもの</dt><dd>{route.steps.length}段階</dd></div>
            <div><dt>最終確認日</dt><dd>{goal.lastReviewed}</dd></div>
          </dl>
        </header>

        <div className="markdown intro-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{goal.body}</ReactMarkdown></div>

        <section className="route-section" aria-labelledby="route-title">
          <div className="explorer-heading"><div><h2 id="route-title">学ぶ順番</h2></div></div>
          <p>前の段階が次の段階の土台になる順に並べています。各段階の本は、対象バージョンと刊行年を確認したうえで載せています。</p>
          <ol className="route-steps">
            {route.steps.map((skill, index) => (
              <SkillStep key={skill.id} skill={skill} index={index} skillMap={skillMap} goalSlug={goal.slug} />
            ))}
          </ol>
        </section>

        {route.branches.map(({ branch, options }) => (
          <section className="branch-section" aria-labelledby={`branch-${branch.id}`} key={branch.id}>
            <div className="explorer-heading"><div><h2 id={`branch-${branch.id}`}>{branch.question}</h2></div></div>
            <div className="branch-options">
              {options.map((option) => (
                <div className="branch-option" key={option.label}>
                  <h3>{option.label}</h3>
                  {option.note ? <p>{option.note}</p> : null}
                  {option.steps.length ? (
                    <ol className="route-steps compact">
                      {option.steps.map((skill, index) => (
                        <SkillStep key={skill.id} skill={skill} index={route.steps.length + index} skillMap={skillMap} goalSlug={goal.slug} />
                      ))}
                    </ol>
                  ) : null}
                </div>
              ))}
            </div>
            {school ? (
              <SchoolCta
                goalSlug={goal.slug}
                placement={`branch-${branch.id}`}
                title="どちらにするか決められないときは"
                body="作りたいホームページに合う進め方を、運営元のスクールで面談して相談できます。"
              />
            ) : null}
          </section>
        ))}

        <section className="skip-section" aria-labelledby="skip-title">
          <div className="explorer-heading"><div><h2 id="skip-title">今は学ばなくていいもの</h2></div></div>
          <p>この目的では、次のものは後回しで構いません。先に学ぶと遠回りになります。</p>
          <ul className="skip-list">
            {goal.notNeededNow.map((item) => {
              const skill = item.skillId ? skillMap.get(item.skillId) : undefined;
              return (
                <li key={item.label}>
                  <b>{skill ? <Link href={`/skills/${skill.slug}`}>{item.label}</Link> : item.label}</b>
                  <span>{item.reason}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {relatedSituations.length ? (
          <section className="related-section" aria-labelledby="related-title">
            <div className="explorer-heading"><div><h2 id="related-title">この先の選択（中級以降）</h2></div></div>
            <ul className="home-choice-grid">
              {relatedSituations.map((situation) => (
                <li key={situation.id}>
                  <Link className="home-choice-card" href={`/decisions/${situation.slug}`}>
                    <span className="home-choice-category">技術の選び方</span>
                    <h3>{situation.title}</h3>
                    <p>{situation.summary}</p>
                    <span className="home-choice-link">条件を選んで比較する →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {school ? (
          <SchoolCta
            goalSlug={goal.slug}
            placement="route-end"
            title="学び方に迷ったら"
            body="この順番で進めて詰まったときや、独学を続けるか迷ったときは、運営元のスクールで面談して相談できます。"
          />
        ) : null}
      </article>
    </>
  );
}
