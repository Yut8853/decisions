"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const id = window.location.hash.replace(/^#category-/, "") as SituationCategoryId;
    if (categories.some((category) => category.id === id)) setActiveCategory(id);
  }, [categories]);

  const normalizedQuery = normalize(query);
  const visibleGroups = categories
    .filter((category) => activeCategory === "all" || category.id === activeCategory)
    .map((category) => ({
      ...category,
      situations: category.situations.filter((situation) => {
        if (!normalizedQuery) return true;
        return normalize(`${situation.title} ${situation.summary} ${category.title}`).includes(normalizedQuery);
      })
    }))
    .filter((category) => category.situations.length > 0);

  const resultCount = visibleGroups.reduce((total, category) => total + category.situations.length, 0);

  function selectCategory(category: CategoryFilter) {
    setActiveCategory(category);
    const hash = category === "all" ? "" : `#category-${category}`;
    window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
  }

  return (
    <div className="decision-directory">
      <div className="directory-tools">
        <div className="category-filter" aria-label="目的のカテゴリ">
          <button type="button" aria-pressed={activeCategory === "all"} onClick={() => selectCategory("all")}>
            <b>すべて</b>
            <span>{situations.length}件の技術判断</span>
          </button>
          {categories.map((category) => (
            <button
              type="button"
              aria-pressed={activeCategory === category.id}
              onClick={() => selectCategory(category.id)}
              key={category.id}
            >
              <b>{category.title}</b>
              <span>{category.situations.length}件</span>
            </button>
          ))}
        </div>

        <label className="decision-search">
          <span>キーワードで探す</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例：SEO、商品、スクロール、表示が重い"
          />
        </label>
      </div>

      <p className="directory-result" aria-live="polite">{resultCount}件の技術判断が見つかりました</p>

      {visibleGroups.length > 0 ? (
        <div className="category-sections">
          {visibleGroups.map((category) => (
            <section className="category-section" id={`category-${category.id}`} key={category.id}>
              <header>
                <div>
                  <p>{category.prompt}</p>
                  <h2>{category.title}</h2>
                </div>
                <p>{category.description}</p>
              </header>
              <div className="category-decision-grid">
                {category.situations.map((situation) => (
                  <Link href={`/decisions/${situation.slug}`} className="directory-decision-card" key={situation.id}>
                    <h3>{situation.title}</h3>
                    <p>{situation.summary}</p>
                    <span>条件を選んで比較する →</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="directory-empty">
          <h2>該当する技術判断がありません</h2>
          <p>別のキーワードを試すか、カテゴリを「すべて」に戻してください。</p>
          <button type="button" onClick={() => { setQuery(""); selectCategory("all"); }}>絞り込みを解除する</button>
        </div>
      )}
    </div>
  );
}
