import type { Metadata } from "next";
export const metadata: Metadata = { title: "変更履歴" };
export default function ChangelogPage() { return <article className="shell prose-page"><p className="eyebrow">変更履歴</p><h1>判断と仕組みの変更履歴</h1><div className="change-item"><time>2026-08-24</time><div><h2>カテゴリと判断テーマを拡張</h2><p>アプリ・機能と開発・運用のカテゴリに、サイト内検索、問い合わせフォーム、公開先、CMS構成の4件を追加。合計9件の目的、32件の実装案、98件の判定基準、51件の根拠資料になりました。</p></div></div><div className="change-item"><time>2026-08-23</time><div><h2>初期版</h2><p>5件の目的・悩み、18件の実装案、58件の判定基準、21件の根拠資料で初期版を構成。AIによる公開判定と、性能測定結果の出所を確認する仕組みを追加。</p></div></div></article>; }
