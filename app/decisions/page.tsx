import type { Metadata } from "next";
import { DecisionDirectory } from "@/components/decision-directory";
import { getPublishedSituations } from "@/lib/content";

export const metadata: Metadata = { title: "技術判断", description: "目的から選ぶ、根拠つき技術判断の一覧。" };

export default function DecisionsPage() {
  const situations = getPublishedSituations();
  return (
    <section className="shell page-shell">
      <p className="eyebrow">技術判断の一覧</p>
      <h1 className="page-title">何をしたいですか？</h1>
      <p className="page-intro">目的のカテゴリを選ぶか、困っていることを検索してください。技術名が分からなくても探せます。</p>
      <DecisionDirectory situations={situations} />
    </section>
  );
}
