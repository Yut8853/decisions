import type { Metadata } from "next";
import { BookLibrary } from "@/components/book-library";
import { getBookResources } from "@/lib/content";

export const metadata: Metadata = {
  title: "書籍・学習資料",
  description: "技術判断の背景を深く理解するための書籍と、公式の参照先。"
};

export default function BooksPage() {
  const books = getBookResources();

  return (
    <section className="shell page-shell book-library">
      <p className="eyebrow">書籍・学習資料</p>
      <h1 className="page-title">何を学びたいですか？</h1>
      <p className="page-intro">
        アクセシビリティ、UI・UX、テスト、セキュリティ、性能、設計、データ・生成AIなど、技術判断の背景を分野から探せます。
      </p>

      <aside className="book-library-note">
        <strong>書籍と公式資料の使い分け</strong>
        <p>書籍は設計や考え方を体系的に学ぶための資料です。変化するAPI、対応状況、導入手順は、各判断に掲載した公式資料でも確認してください。</p>
      </aside>
      <BookLibrary books={books} />
    </section>
  );
}
