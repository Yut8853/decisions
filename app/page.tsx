import Link from "next/link";
import { getPublishedSituations } from "@/lib/content";
import { getVisibleSituationCategories } from "@/lib/situation-categories";

export default function HomePage() {
  const situations = getPublishedSituations();
  const categories = getVisibleSituationCategories(situations);
  return (
    <>
      <section className="hero shell">
        <p className="eyebrow">JUNKBRANDINGの技術判断集</p>
        <h1>
          技術を薦めるのではなく、<br />
          <em>判断できる根拠</em>を残す。
        </h1>
        <p className="hero-copy">
          作りたいものと条件を選ぶと、おすすめの実装案と避けるべき案が分かります。判断の根拠、確認日、向いていない条件も掲載しています。
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="#categories">カテゴリから探す</Link>
          <Link className="button ghost" href="/decisions">すべての判断を見る</Link>
        </div>
      </section>

      <section className="shell section-block" id="categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">カテゴリから探す</p>
            <h2>まず、やりたいことを選ぶ</h2>
          </div>
          <Link href="/decisions">すべて見る →</Link>
        </div>
        <div className="home-category-grid">
          {categories.map((category) => (
            <Link className="home-category-card" href={`/decisions#category-${category.id}`} key={category.id}>
              <div>
                <small>{category.situations.length}件</small>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
              <ul>
                {category.situations.slice(0, 3).map((situation) => <li key={situation.id}>{situation.title}</li>)}
              </ul>
              <span>このカテゴリを見る →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell principles section-block">
        <div>
          <p className="eyebrow">このサイトが残すもの</p>
          <h2>AIの回答だけでは見えにくい判断材料を、公開記録にする。</h2>
        </div>
        <ol>
          <li><strong>条件</strong><span>同じ目的でも、SEO・納期・React・端末の条件に合わせて答えを変える。</span></li>
          <li><strong>向いていない条件</strong><span>何を使うかだけでなく、どんな場合に使わないかも必ず示す。</span></li>
          <li><strong>根拠と確認日</strong><span>何を根拠に、いつ確認した判断なのかをたどれるようにする。</span></li>
          <li><strong>再現できる判定基準</strong><span>曖昧な点数ではなく、該当した判定基準から理由を組み立てる。</span></li>
        </ol>
      </section>
    </>
  );
}
