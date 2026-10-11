import Link from "next/link";
import { getDomainsWithGoals } from "@/lib/content";

export default function HomePage() {
  const domains = getDomainsWithGoals();
  const goalCount = domains.reduce((sum, domain) => sum + domain.goals.length, 0);

  return (
    <>
      <section aria-labelledby="home-hero-title" className="hero shell">
        <div className="hero-main">
          <p className="eyebrow">作りたいもの・やりたい仕事から、学ぶ順番と本を探す</p>
          <h1 id="home-hero-title">
            何をしたいですか？
            <span>学ぶ順番と、今読むべき本を案内します。</span>
          </h1>
          <p className="hero-copy">
            やりたいことを選ぶと、何をどの順番で学べばよいか、各段階で読む本、今は学ばなくていいものを、理由とバージョンの確認つきで表示します。
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="#goals">やりたいことを選ぶ</Link>
          </div>
        </div>

        <aside aria-labelledby="hero-guide-title" className="hero-guide">
          <div className="hero-guide-header">
            <div>
              <h2 id="hero-guide-title">使い方は3段階</h2>
              <p>目的、順番、本の順に見ていきます。</p>
            </div>
            <span>{domains.length}分野・{goalCount}件</span>
          </div>
          <ol role="list">
            <li>
              <span aria-hidden="true" className="hero-step-number">01</span>
              <div>
                <h3>やりたいことを選ぶ</h3>
                <p>作りたいもの、就きたい仕事、守りたいものから選びます。</p>
              </div>
            </li>
            <li>
              <span aria-hidden="true" className="hero-step-number">02</span>
              <div>
                <h3>学ぶ順番を見る</h3>
                <p>土台になるものから順に並んでいます。回り道になるものも分かります。</p>
              </div>
            </li>
            <li>
              <span aria-hidden="true" className="hero-step-number">03</span>
              <div>
                <h3>本を選ぶ</h3>
                <p>対象バージョンと刊行年を確認した本を、その段階で読む理由つきで紹介します。</p>
              </div>
            </li>
          </ol>
        </aside>
      </section>

      <section className="shell section-block" id="goals">
        <div className="section-heading">
          <div>
            <p className="eyebrow">やりたいことから探す</p>
            <h2>近いものを選んでください</h2>
          </div>
          <Link href="/goals">一覧で見る →</Link>
        </div>
        {domains.map((domain) => (
          <div className="goal-domain" key={domain.id}>
            <h3 id={`home-domain-${domain.id}`}>{domain.title}</h3>
            <nav aria-labelledby={`home-domain-${domain.id}`}>
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
            </nav>
          </div>
        ))}
      </section>

      <section className="shell principles section-block">
        <div>
          <p className="eyebrow">このサイトの決めごと</p>
          <h2>学ぶ順番と本の選び方を、理由つきで公開する。</h2>
        </div>
        <ol>
          <li><strong>順番は前提関係から決める</strong><span>「この技術の前に何が必要か」を記録し、そこから学ぶ順番を組み立てます。</span></li>
          <li><strong>今は学ばなくていいものも書く</strong><span>目的に対して回り道になる技術を、理由とあわせて示します。</span></li>
          <li><strong>本はバージョンを確認してから載せる</strong><span>対象バージョン、刊行年、試験の版を現行と比べ、古くなった部分があれば書きます。</span></li>
          <li><strong>資格は学ぶ範囲の地図として使う</strong><span>取ること自体より、出題範囲を「何を学べば一通りか」の一覧として使います。</span></li>
        </ol>
      </section>
    </>
  );
}
