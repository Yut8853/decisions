import type { Metadata } from "next";
import { BookLibrary } from "@/components/book-library";
import { isJapaneseReadableBook } from "@/lib/book-language";
import { getBookResources, getBookVersionNotes } from "@/lib/content";

export const metadata: Metadata = {
  title: "書籍・学習資料",
  description: "技術判断の背景を深く理解するための書籍と、公式の参照先。"
};

export default function BooksPage() {
  const books = getBookResources();
  const japaneseBookCount = books.filter(isJapaneseReadableBook).length;

  return (
    <section className="shell page-shell book-library">
      <p className="eyebrow">書籍・学習資料</p>
      <h1 className="page-title">何を学びたいですか？</h1>
      <p className="page-intro">
        各技術判断で紹介している本を、分野から探せます。どの実装案でなぜその本を勧めているかは、各判断ページの「この案を学ぶ資料」に書いています。
      </p>

      <aside className="book-library-note">
        <strong>日本語で学び、最新情報は公式資料で確認</strong>
        <p>
          日本語で読める書籍を優先して表示しています（現在{japaneseBookCount}冊）。書籍で基礎と設計を体系的に学び、変化するAPI、対応状況、導入手順は各判断に掲載した公式資料で確認してください。英語書籍は、日本語の選択肢が少ない専門分野の補足として掲載しています。
        </p>
      </aside>
      <BookLibrary books={books} versionNotes={getBookVersionNotes()} />
    </section>
  );
}
