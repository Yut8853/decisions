import Link from "next/link";
import { getPublishedSituations } from "@/lib/content";
import { getFeaturedSituationChoices, getVisibleSituationCategories } from "@/lib/situation-categories";

export default function HomePage() {
  const situations = getPublishedSituations();
  const categories = getVisibleSituationCategories(situations);
  const situationChoices = getFeaturedSituationChoices(categories);

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
          <Link className="button primary" href="#categories">やりたいことから探す</Link>
          <Link className="button ghost" href="/decisions">すべての判断を見る</Link>
        </div>
      </section>

      <section className="shell section-block" id="categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">やりたいことから探す</p>
            <h2>まず、近いカテゴリーを選ぶ</h2>
          </div>
          <Link href="/decisions">全{situations.length}件を一覧で見る →</Link>
        </div>

        <nav aria-label="カテゴリーで絞る" className="home-category-grid">
          {categories.map((category) => (
            <Link className="home-category-card" href={`/decisions#category-${category.id}`} key={category.id}>
              <div>
                <small>{category.situations.length}件</small>
                <h3>{category.title}</h3>
                <p>{category.prompt}</p>
              </div>
              <span>まとめて見る →</span>
            </Link>
          ))}
        </nav>

        <div className="home-category-heading">
          <div>
            <h3 id="home-purpose-heading">具体的な目的から選ぶ</h3>
            <p>各カテゴリーから代表的な目的を掲載しています。</p>
          </div>
          <Link href="/decisions">全{situations.length}件を見る →</Link>
        </div>
        <nav aria-labelledby="home-purpose-heading">
          <ul className="home-choice-grid">
            {situationChoices.map(({ situation, categoryTitle }) => (
              <li key={situation.id}>
                <Link className="home-choice-card" href={`/decisions/${situation.slug}`}>
                  <span className="home-choice-category">{categoryTitle}</span>
                  <h3>{situation.title}</h3>
                  <p>{situation.summary}</p>
                  <span className="home-choice-link">条件を選んで比較する →</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section className="shell principles section-block">
        <div>
          <p className="eyebrow">このサイトが残すもの</p>
          <h2>AIの回答だけでは見えにくい判断材料を、公開記録にする。</h2>
        </div>
        <ol>
          <li><strong>条件</strong><span>同じ目的でも、検索で見つけてもらうこと、納期、使用中の開発環境、端末などの条件に合わせて答えを変える。</span></li>
          <li><strong>向いていない条件</strong><span>何を使うかだけでなく、どんな場合に使わないかも必ず示す。</span></li>
          <li><strong>根拠と確認日</strong><span>何を根拠に、いつ確認した判断なのかをたどれるようにする。</span></li>
          <li><strong>再現できる判定基準</strong><span>曖昧な点数ではなく、該当した判定基準から理由を組み立てる。</span></li>
        </ol>
      </section>
    </>
  );
}
