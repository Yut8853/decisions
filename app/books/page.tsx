import type { Metadata } from "next";
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
      <h1 className="page-title">判断の背景を、もう一段深く学ぶ。</h1>
      <p className="page-intro">
        このサイトの技術判断に関連する書籍だけを掲載しています。書名、著者、表紙、参照先を確認してから読めます。
      </p>

      <aside className="book-library-note">
        <strong>書籍と公式資料の使い分け</strong>
        <p>書籍は設計や考え方の理解に使います。現在のAPI、対応状況、導入手順は、各判断に掲載した公式資料でも確認してください。</p>
      </aside>

      <div className="book-library-heading">
        <h2>掲載中の書籍</h2>
        <p>{books.length}件</p>
      </div>
      <div className="book-library-grid">
        {books.map((book) => {
          const labels = [book.language, book.edition, book.versionNote].filter(Boolean);
          return (
            <article className="book-library-card" key={book.id}>
              <div className="book-library-cover">
                <img src={book.coverImageUrl} alt={book.coverImageAlt} loading="lazy" decoding="async" />
              </div>
              <div className="book-library-body">
                <ul className="book-library-labels" aria-label="書籍情報">
                  {labels.map((label) => <li key={label}>{label}</li>)}
                </ul>
                <h2>{book.title}</h2>
                <p className="book-authors">著者：{book.authors.join("、")}</p>
                <p>{book.description}</p>
                <dl className="book-library-details">
                  <div>
                    <dt>このサイトでの用途</dt>
                    <dd>{book.currentUse}</dd>
                  </div>
                  {book.limitations ? (
                    <div>
                      <dt>読む前に確認</dt>
                      <dd>{book.limitations}</dd>
                    </div>
                  ) : null}
                  {book.isbn ? (
                    <div>
                      <dt>ISBN</dt>
                      <dd>{book.isbn}</dd>
                    </div>
                  ) : null}
                </dl>
                <a className="book-library-link" href={book.url} target="_blank" rel="noreferrer">
                  書籍ページを開く
                  <span className="sr-only">（新しいタブで開きます）</span>
                  <span aria-hidden="true">↗</span>
                </a>
                <small className="book-cover-credit">
                  表紙画像：{book.coverSourceUrl === book.url
                    ? book.coverSourceName
                    : <a href={book.coverSourceUrl} target="_blank" rel="noreferrer">{book.coverSourceName}</a>}
                </small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
