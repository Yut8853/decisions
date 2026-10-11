import { describe, expect, it } from "vitest";
import { amazonUrlForBook, isbn13To10 } from "@/lib/affiliate";
import type { Resource } from "@/lib/types";

const book = (overrides: Partial<Resource> = {}): Resource => ({
  id: "book-x", type: "book", title: "本", url: "https://example.com", authors: ["著者"], language: "日本語",
  description: "テスト用の本です。", technologyIds: [], concepts: [], currentUse: "テスト",
  targetVersions: [], usesLegacySkillIds: [], syllabusUrls: [], isbn: "978-4-8156-1846-9", ...overrides
});

describe("Amazon affiliate links", () => {
  it("converts ISBN-13 to the ISBN-10 used as the Amazon ASIN", () => {
    expect(isbn13To10("978-4-8156-1846-9")).toBe("4815618461");
    expect(isbn13To10("978-4-8399-5555-7")).toBe("4839955557");
    expect(isbn13To10("979-10-90636-07-1")).toBeNull();
  });

  it("builds a product page link with the associate tag, never a search page", () => {
    const url = amazonUrlForBook(book(), "junkbranding-22");
    expect(url).toBe("https://www.amazon.co.jp/dp/4815618461?tag=junkbranding-22");
    expect(url).not.toMatch(/\/s\?/);
  });

  it("does not create links without a tag or for non-books", () => {
    expect(amazonUrlForBook(book(), "")).toBeNull();
    expect(amazonUrlForBook(book({ type: "official" }), "junkbranding-22")).toBeNull();
  });

  it("keeps an explicit Amazon product URL but replaces its query with the tag", () => {
    const url = amazonUrlForBook(book({ amazonUrl: "https://www.amazon.co.jp/dp/4798070874?ref=abc" }), "junkbranding-22");
    expect(url).toBe("https://www.amazon.co.jp/dp/4798070874?tag=junkbranding-22");
  });
});
