import type { Metadata } from "next";
import Link from "next/link";
import { getDomainsWithGoals } from "@/lib/content";

export const metadata: Metadata = { title: "やりたいことから探す", description: "作りたいもの・やりたい仕事から、学ぶ順番と本を探す。" };

export default function GoalsPage() {
  const domains = getDomainsWithGoals();
  return (
    <section className="shell page-shell">
      <p className="eyebrow">やりたいことから探す</p>
      <h1 className="page-title">何をしたいですか？</h1>
      <p className="page-intro">やりたいことを選ぶと、何をどの順番で学べばよいかと、各段階で読む本を表示します。</p>
      {domains.map((domain) => (
        <section className="goal-domain" aria-labelledby={`domain-${domain.id}`} key={domain.id}>
          <h2 id={`domain-${domain.id}`}>{domain.title}</h2>
          <p>{domain.description}</p>
          <ul className="home-choice-grid">
            {domain.goals.map((goal) => (
              <li key={goal.id}>
                <Link className="home-choice-card" href={`/goals/${goal.slug}`}>
                  <span className="home-choice-category">{domain.title}</span>
                  <h3>{goal.title}</h3>
                  <p>{goal.summary}</p>
                  <span className="home-choice-link">学ぶ順番を見る →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
