import type { Metadata } from "next";
export const metadata: Metadata = { title: "このサイトについて" };
export default function AboutPage() { return <article className="shell prose-page"><p className="eyebrow">このサイトについて</p><h1>JUNKBRANDINGが公開する技術判断の記録。</h1><p>このサイトは、案件に合う技術を選び、その理由をクライアント・上司・チームへ説明したいWeb制作者のための技術判断集です。</p><p>単に「おすすめ技術」を紹介するのではなく、適用条件、向いていない条件、根拠資料、独自検証、確認日を一つの判断記録として残します。</p></article>; }
