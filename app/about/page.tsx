import type { Metadata } from "next";
export const metadata: Metadata = { title: "このサイトについて" };
export default function AboutPage() {
  return (
    <article className="shell prose-page">
      <p className="eyebrow">このサイトについて</p>
      <h1>JUNKBRANDINGが公開する、学ぶ順番と本の案内。</h1>
      <p>プログラミングやWeb制作には、学校の教科書のような決まった順番がありません。そのため、やりたいことに対して何から学べばよいか分からず、遠回りになる人が多くいます。</p>
      <p>このサイトでは、やりたいことを選ぶと、学ぶ順番、各段階で読む本、今は学ばなくていいものを、理由とあわせて表示します。本は対象バージョンと刊行年を確認し、古くなった部分があれば書いています。</p>
      <p>作るものと方向が決まった人向けには、条件から実装方法を比べる「技術の選び方」も公開しています。</p>
      <p>運営元のJUNKBRANDINGはWeb制作スクールも運営しています。スクールの案内は、Web・ホームページ制作の分野のページにだけ「運営元のスクール」と明記して表示し、本の推薦とは分けています。</p>
    </article>
  );
}
