import { describe, expect, it } from "vitest";
import { loadContent, loadManifest } from "../scripts/lib/load-content";
import { validateBundle } from "../scripts/lib/validate-bundle";
import { getFeaturedSituationChoices, getVisibleSituationCategories } from "@/lib/situation-categories";

describe("content validation", () => {
  it("passes schemas, references, evidence gates and decision snapshots", () => {
    const report = validateBundle(loadContent(), loadManifest().minimums);
    expect(report.counts.rules).toBeGreaterThanOrEqual(58);
  });

  it("places every published situation in one visible category", () => {
    const published = loadContent().situations.filter((situation) => situation.published);
    const grouped = getVisibleSituationCategories(published).flatMap((category) => category.situations);
    expect(grouped.map((situation) => situation.id).sort()).toEqual(published.map((situation) => situation.id).sort());
    expect(new Set(grouped.map((situation) => situation.id)).size).toBe(published.length);
  });

  it("backs every expanded category with multiple published decisions", () => {
    const published = loadContent().situations.filter((situation) => situation.published);
    const categories = getVisibleSituationCategories(published);
    for (const id of ["quality", "security", "data-ai", "measurement"] as const) {
      expect(categories.find((category) => category.id === id)?.situations.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps the home selection bounded while representing every visible category", () => {
    const published = loadContent().situations.filter((situation) => situation.published);
    const categories = getVisibleSituationCategories(published);
    const featured = getFeaturedSituationChoices(categories);
    expect(featured.length).toBeLessThanOrEqual(12);
    expect(new Set(featured.map(({ situation }) => situation.id)).size).toBe(featured.length);
    expect(new Set(featured.map(({ categoryTitle }) => categoryTitle))).toEqual(new Set(categories.map(({ title }) => title)));
  });

  it("requires complete display and direct-source data for every book", () => {
    const books = loadContent().resources.filter((resource) => resource.type === "book");
    expect(books.length).toBeGreaterThanOrEqual(4);
    for (const book of books) {
      expect(book.url).toMatch(/^https:\/\//);
      expect(book.url).not.toMatch(/amazon\.[^/]+\/s\?/);
      if (book.amazonUrl) expect(book.amazonUrl).not.toMatch(/amazon\.[^/]+\/s\?/);
      expect(book.authors?.length).toBeGreaterThan(0);
      expect(book.language).toBeTruthy();
      expect(book.coverImageUrl).toMatch(/^https:\/\//);
      expect(book.coverImageAlt).toBeTruthy();
      expect(book.coverSourceName).toBeTruthy();
      expect(book.coverSourceUrl).toMatch(/^https:\/\//);
    }
  });
});
