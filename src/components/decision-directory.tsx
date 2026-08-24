"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getVisibleSituationCategories } from "@/lib/situation-categories";
import type { Situation, SituationCategoryId } from "@/lib/types";

type CategoryFilter = "all" | SituationCategoryId;

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("ja");
}

export function DecisionDirectory({ situations }: { situations: Situation[] }) {
  const categories = useMemo(() => getVisibleSituationCategories(situations), [situations]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function syncCategoryFromUrl() {
      const id = window.location.hash.replace(/^#category-/, "") as SituationCategoryId;
      setActiveCategory(categories.some((category) => category.id === id) ? id : "all");
    }

    syncCategoryFromUrl();
    window.addEventListener("hashchange", syncCategoryFromUrl);
    window.addEventListener("popstate", syncCategoryFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncCategoryFromUrl);
      window.removeEventListener("popstate", syncCategoryFromUrl);
    };
  }, [categories]);

  const normalizedQuery = normalize(query);
  const visibleEntries = categories
    .filter((category) => activeCategory === "all" || category.id === activeCategory)
    .flatMap((category) =>
      category.situations
        .filter((situation) => {
          if (!normalizedQuery) return true;
          return normalize(`${situation.title} ${situation.summary} ${category.title}`).includes(normalizedQuery);
        })
        .map((situation) => ({ situation, category }))
    );
  const activeCategoryDetails = categories.find((category) => category.id === activeCategory);
  const resultCount = visibleEntries.length;

  function selectCategory(category: CategoryFilter) {
    setActiveCategory(category);
    const hash = category === "all" ? "" : `#category-${category}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
  }

  function clearFilters() {
    setQuery("");
    selectCategory("all");
    searchInputRef.current?.focus();
  }

  return (
    <div className="decision-directory">
      <div className="directory-tools">
        <div className="directory-filter-heading">
          <h2 id="purpose-filter-title">やりたいことから絞る</h2>
          <p>近い目的を選ぶと、該当する判断だけを表示します。</p>
        </div>
        <div className="category-filter" role="group" aria-labelledby="purpose-filter-title">
          <button type="button" aria-pressed={activeCategory === "all"} onClick={() => selectCategory("all")}>
            <b>すべて</b>
          </button>
          {categories.map((category) => (
            <button
              id={`category-${category.id}`}
              type="button"
              aria-pressed={activeCategory === category.id}
              onClick={() => selectCategory(category.id)}
              key={category.id}
            >
              <b>{category.title}</b>
            </button>
          ))}
        </div>

        <label className="decision-search">
          <span>キーワードで探す</span>
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例：ログイン、テスト、生成AI、表示が重い"
          />
        </label>
      </div>

      <section className="directory-results">
        <header>
          <div>
            <p>{activeCategoryDetails?.prompt ?? "すべての目的から探す"}</p>
            <h2>{activeCategoryDetails?.title ?? "技術判断の一覧"}</h2>
          </div>
          <p>{activeCategoryDetails?.description ?? "作りたいものや解決したいことを選び、条件に合う実装方法を比較できます。"}</p>
        </header>
        <p className="directory-result" aria-live="polite" role="status">{resultCount}件の技術判断が見つかりました</p>
        {visibleEntries.length > 0 ? (
          <div className="directory-card-grid">
            {visibleEntries.map(({ situation, category }) => (
              <Link href={`/decisions/${situation.slug}`} className="directory-decision-card" key={situation.id}>
                <small>{category.title}</small>
                <h3>{situation.title}</h3>
                <p>{situation.summary}</p>
                <span>条件を選んで比較する →</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="directory-empty">
            <h2>該当する技術判断がありません</h2>
            <p>別のキーワードを試すか、カテゴリーを「すべて」に戻してください。</p>
            <button type="button" onClick={clearFilters}>絞り込みを解除する</button>
          </div>
        )}
      </section>
    </div>
  );
}
