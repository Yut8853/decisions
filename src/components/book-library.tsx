"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { bookTopics, getBookTopicsWithCounts } from "@/lib/book-topics";
import type { BookResource, BookTopicId } from "@/lib/types";

type TopicFilter = "all" | BookTopicId;

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

export function BookLibrary({ books }: { books: BookResource[] }) {
  const topics = useMemo(() => getBookTopicsWithCounts(books), [books]);
  const [activeTopic, setActiveTopic] = useState<TopicFilter>("all");
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function syncTopicFromUrl() {
      const id = window.location.hash.replace(/^#book-topic-/, "") as BookTopicId;
      setActiveTopic(bookTopics.some((topic) => topic.id === id) ? id : "all");
    }

    syncTopicFromUrl();
    window.addEventListener("hashchange", syncTopicFromUrl);
    window.addEventListener("popstate", syncTopicFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncTopicFromUrl);
      window.removeEventListener("popstate", syncTopicFromUrl);
    };
  }, []);

  const normalizedQuery = normalize(query);
  const filteredBooks = books.filter((book) => {
    if (activeTopic !== "all" && !book.bookTopicIds.includes(activeTopic)) return false;
    if (!normalizedQuery) return true;
    const topicTitles = topics
      .filter((topic) => book.bookTopicIds.includes(topic.id))
      .map((topic) => topic.title)
      .join(" ");
    return normalize([
      book.title,
      book.authors.join(" "),
      book.description,
      book.currentUse,
      book.limitations,
      topicTitles
    ].join(" ")).includes(normalizedQuery);
  });

  const sections = (activeTopic === "all"
    ? topics.map((topic) => ({
        ...topic,
        books: filteredBooks.filter((book) => book.bookTopicIds[0] === topic.id)
      }))
    : topics
        .filter((topic) => topic.id === activeTopic)
        .map((topic) => ({ ...topic, books: filteredBooks })))
    .map((section) => ({
      ...section,
      books: [...section.books].sort((left, right) => left.title.localeCompare(right.title, "ja"))
    }))
    .filter((section) => section.books.length > 0);

  function selectTopic(topic: TopicFilter) {
    setActiveTopic(topic);
    const hash = topic === "all" ? "" : `#book-topic-${topic}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
  }

  function clearFilters() {
    setQuery("");
    selectTopic("all");
    searchInputRef.current?.focus();
  }

  return (
    <div className="book-directory">
      <div className="directory-filter-heading book-filter-heading">
        <h2 id="book-filter-title">分野から本を探す</h2>
        <p>{topics.length}つの分野とキーワードから絞れます。複数分野に関係する本は、どちらの分野からも見つかります。</p>
      </div>

      <fieldset className="category-filter book-topic-filter">
        <legend className="sr-only">書籍の分野を選ぶ</legend>
        <label>
          <input
            type="radio"
            name="book-topic"
            value="all"
            checked={activeTopic === "all"}
            onChange={() => selectTopic("all")}
          />
          <b>すべての分野</b>
          <small>{books.length}冊</small>
        </label>
        {topics.map((topic) => (
          <label id={`book-topic-${topic.id}`} key={topic.id}>
            <input
              type="radio"
              name="book-topic"
              value={topic.id}
              checked={activeTopic === topic.id}
              onChange={() => selectTopic(topic.id)}
            />
            <b>{topic.title}</b>
            <small>{topic.count}冊</small>
          </label>
        ))}
      </fieldset>

      <label className="decision-search book-search">
        <span>書名・著者・学びたい内容で探す</span>
        <input
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例：アクセシビリティ、テスト、認証、生成AI"
        />
      </label>

      <p className="directory-result" aria-live="polite" role="status">
        {filteredBooks.length}冊の書籍が見つかりました
      </p>

      {sections.length > 0 ? (
        <div className="book-topic-sections">
          {sections.map((section) => (
            <section className="book-topic-section" aria-labelledby={`book-section-${section.id}`} key={section.id}>
              <header className="book-library-heading">
                <div>
                  <h2 id={`book-section-${section.id}`}>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
                <span>{section.books.length}冊</span>
              </header>
              <div className="book-library-grid">
                {section.books.map((book) => {
                  const labels = [book.language, book.edition, book.versionNote].filter(Boolean);
                  const bookTopicLabels = topics.filter((topic) => book.bookTopicIds.includes(topic.id));
                  return (
                    <article className="book-library-card" data-book-id={book.id} key={book.id}>
                      <div className="book-library-cover">
                        <img src={book.coverImageUrl} alt={book.coverImageAlt} loading="lazy" decoding="async" />
                      </div>
                      <div className="book-library-body">
                        <ul className="book-library-labels" aria-label="書籍情報">
                          {labels.map((label) => <li key={label}>{label}</li>)}
                        </ul>
                        <h3>{book.title}</h3>
                        <p className="book-authors">著者：{book.authors.join("、")}</p>
                        <ul className="book-topic-labels" aria-label="関連分野">
                          {bookTopicLabels.map((topic) => <li key={topic.id}>{topic.title}</li>)}
                        </ul>
                        <p>{book.description}</p>
                        <dl className="book-library-details">
                          <div>
                            <dt>この本で学べること</dt>
                            <dd>{book.currentUse}</dd>
                          </div>
                          <div>
                            <dt>読む前に確認</dt>
                            <dd>{book.limitations}</dd>
                          </div>
                          {book.isbn ? (
                            <div>
                              <dt>ISBN</dt>
                              <dd>{book.isbn}</dd>
                            </div>
                          ) : null}
                        </dl>
                        <div className="book-library-actions">
                          <a className="book-library-link" href={book.url} target="_blank" rel="noreferrer">
                            出版社・公式ページを開く
                            <span className="sr-only">（新しいタブで開きます）</span>
                            <span aria-hidden="true">↗</span>
                          </a>
                          {book.amazonUrl ? (
                            <a className="book-library-link secondary" href={book.amazonUrl} target="_blank" rel="sponsored noreferrer">
                              Amazonで確認する
                              <span className="sr-only">（新しいタブで開きます）</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          ) : null}
                        </div>
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
          ))}
        </div>
      ) : (
        <div className="directory-empty book-empty">
          <h2>該当する書籍がありません</h2>
          <p>別のキーワードを試すか、分野を「すべて」に戻してください。</p>
          <button type="button" onClick={clearFilters}>検索と絞り込みを解除する</button>
        </div>
      )}
    </div>
  );
}
