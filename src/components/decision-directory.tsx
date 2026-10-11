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
  const purposeCategories = categories
    .filter((category) => activeCategory === "all" || category.id === activeCategory)
    .map((category) => ({
      ...category,
      situations: category.situations.filter((situation) => {
        if (!normalizedQuery) return true;
        return normalize(`${situation.title} ${situation.summary} ${category.title}`).includes(normalizedQuery);
      })
    }))
    .filter((category) => category.situations.length > 0);
  const activeCategoryDetails = categories.find((category) => category.id === activeCategory);
  const resultCount = purposeCategories.reduce((total, category) => total + category.situations.length, 0);

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
          <p>まず分野を絞り、次に具体的な目的を選べます。全{situations.length}件の目的を掲載しています。</p>
        </div>

        <section className="directory-filter-step" aria-labelledby="category-filter-title">
          <div className="directory-step-heading">
            <span>1</span>
            <div>
              <h3 id="category-filter-title">近い分野を選ぶ</h3>
              <p>{categories.length}つの分野から、探したい範囲を絞ります。</p>
            </div>
          </div>
          <fieldset className="category-filter" aria-labelledby="category-filter-title">
            <legend className="sr-only">近い分野を選ぶ</legend>
            <label>
              <input
                type="radio"
                name="situation-category"
                value="all"
                checked={activeCategory === "all"}
                onChange={() => selectCategory("all")}
              />
              <b>すべての分野</b>
              <small>{situations.length}件</small>
            </label>
            {categories.map((category) => (
              <label
                id={`category-${category.id}`}
                key={category.id}
              >
                <input
                  type="radio"
                  name="situation-category"
                  value={category.id}
                  checked={activeCategory === category.id}
                  onChange={() => selectCategory(category.id)}
                />
                <b>{category.title}</b>
                <small>{category.situations.length}件</small>
              </label>
            ))}
          </fieldset>
        </section>

        <section className="directory-filter-step" aria-labelledby="purpose-list-title">
          <div className="directory-step-heading">
            <span>2</span>
            <div>
              <h3 id="purpose-list-title">具体的な目的を選ぶ</h3>
              <p>{activeCategoryDetails ? `${activeCategoryDetails.title}の目的です。` : "掲載中の目的を分野ごとに確認できます。"}</p>
            </div>
          </div>
          <label className="decision-search">
            <span>キーワードで目的を探す</span>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例：ログイン、テスト、生成AI、表示が重い"
            />
          </label>
          <p className="directory-result" aria-live="polite" role="status">{resultCount}件の目的が見つかりました</p>
          {purposeCategories.length > 0 ? (
            <nav className="directory-purpose-groups" aria-labelledby="purpose-list-title">
              {purposeCategories.map((category) => (
                <section className="directory-purpose-group" aria-labelledby={`purpose-group-${category.id}`} key={category.id}>
                  <header>
                    <h4 id={`purpose-group-${category.id}`}>{category.title}</h4>
                    <span>{category.situations.length}件</span>
                  </header>
                  <ul>
                    {category.situations.map((situation) => (
                      <li key={situation.id}>
                        <Link href={`/decisions/${situation.slug}`}>
                          <span>{situation.title}</span>
                          <i aria-hidden="true">→</i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          ) : (
            <div className="directory-empty">
              <h2>該当する目的がありません</h2>
              <p>別のキーワードを試すか、分野を「すべて」に戻してください。</p>
              <button type="button" onClick={clearFilters}>検索と絞り込みを解除する</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
