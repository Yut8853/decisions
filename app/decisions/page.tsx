import type { Metadata } from "next";
import { DecisionDirectory } from "@/components/decision-directory";
import { getPublishedSituations } from "@/lib/content";

export const metadata: Metadata = { title: "技術判断", description: "目的から選ぶ、根拠つき技術判断の一覧。" };

export default function DecisionsPage() {
  const situations = getPublishedSituations();
  return (
    <section className="shell page-shell">
      <p className="eyebrow">技術判断の一覧</p>
      <h1 className="page-title">技術の選び方</h1>
      <p className="page-intro">作るものと方向が決まった人向けに、条件から実装方法を比べます。何を学べばよいか分からない場合は、<a href="/goals">やりたいことから探す</a>から始めてください。</p>
      <DecisionDirectory situations={situations} />
    </section>
  );
}
