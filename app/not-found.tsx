import Link from "next/link";
export default function NotFound() { return <section className="shell not-found"><p>404</p><h1>お探しの技術判断が見つかりません。</h1><Link className="button primary" href="/decisions">一覧へ戻る</Link></section>; }
