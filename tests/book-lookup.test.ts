import { describe, expect, it } from "vitest";
import { checkBook, titlesMatch, toIsbn13, type FetchLike } from "../scripts/lib/book-lookup";

function fakeFetch(routes: Record<string, string | null>): FetchLike {
  return async (url: string) => {
    const key = Object.keys(routes).find((prefix) => url.startsWith(prefix));
    const body = key ? routes[key] : null;
    return { ok: body !== null, status: body === null ? 404 : 200, text: async () => body ?? "" };
  };
}

describe("book lookup", () => {
  it("converts ISBN-10 to ISBN-13", () => {
    expect(toIsbn13("4815618461")).toBe("9784815618469");
  });

  it("matches titles across punctuation and subtitle differences", () => {
    expect(titlesMatch("1冊ですべて身につくHTML & CSSとWebデザイン入門講座［第2版］", "1冊ですべて身につくHTML&CSSとWebデザイン入門講座")).toBe(true);
    expect(titlesMatch("入門 監視", "入門 監視 ―モダンなモニタリングのためのデザインパターン")).toBe(true);
    expect(titlesMatch("マスタリングTCP/IP 入門編", "体系的に学ぶ安全なWebアプリケーションの作り方")).toBe(false);
  });

  it("verifies through openBD", async () => {
    const fetcher = fakeFetch({ "https://api.openbd.jp": JSON.stringify([{ summary: { title: "入門 監視", publisher: "オライリー・ジャパン", pubdate: "201901" } }]) });
    const result = await checkBook({ resourceId: "x", isbn: "978-4-87311-864-2", title: "入門 監視 ―モダンなモニタリングのためのデザインパターン", publishedYear: 2019 }, fetcher);
    expect(result.status).toBe("verified");
    expect(result.record?.source).toBe("openbd");
  });

  it("falls back to Google Books for books not in openBD", async () => {
    const fetcher = fakeFetch({
      "https://api.openbd.jp": JSON.stringify([null]),
      "https://ndlsearch.ndl.go.jp": "<rss><channel></channel></rss>",
      "https://www.googleapis.com": JSON.stringify({ totalItems: 1, items: [{ volumeInfo: { title: "Learn Three.js", subtitle: "Fourth Edition", publishedDate: "2023-02-28" } }] })
    });
    const result = await checkBook({ resourceId: "x", isbn: "9781803233871", title: "Learn Three.js, Fourth Edition", publishedYear: 2023 }, fetcher);
    expect(result.status).toBe("verified");
    expect(result.record?.source).toBe("google-books");
  });

  it("reports a title mismatch (wrong ISBN written by AI)", async () => {
    const fetcher = fakeFetch({ "https://api.openbd.jp": JSON.stringify([{ summary: { title: "まったく別の本", pubdate: "2020" } }]), "https://ndlsearch.ndl.go.jp": null, "https://www.googleapis.com": null });
    const result = await checkBook({ resourceId: "x", isbn: "9784815618469", title: "1冊ですべて身につくHTML & CSSとWebデザイン入門講座", publishedYear: 2024 }, fetcher);
    expect(result.status).toBe("title-mismatch");
  });

  it("reports a year mismatch (old edition)", async () => {
    const fetcher = fakeFetch({ "https://api.openbd.jp": JSON.stringify([{ summary: { title: "1冊ですべて身につくHTML & CSSとWebデザイン入門講座", pubdate: "20190301" } }]) });
    const result = await checkBook({ resourceId: "x", isbn: "9784815618469", title: "1冊ですべて身につくHTML & CSSとWebデザイン入門講座", publishedYear: 2024 }, fetcher);
    expect(result.status).toBe("year-mismatch");
  });

  it("reports not found", async () => {
    const fetcher = fakeFetch({ "https://api.openbd.jp": JSON.stringify([null]), "https://ndlsearch.ndl.go.jp": null, "https://www.googleapis.com": JSON.stringify({ totalItems: 0 }) });
    const result = await checkBook({ resourceId: "x", isbn: "9784815618469", title: "架空の本" }, fetcher);
    expect(result.status).toBe("not-found");
  });
});

describe("book lookup resilience", () => {
  it("continues to the next source when one source fails", async () => {
    const fetcher: FetchLike = async (url) => {
      if (url.startsWith("https://api.openbd.jp")) throw new Error("network down");
      if (url.startsWith("https://ndlsearch.ndl.go.jp")) {
        return { ok: true, status: 200, text: async () => "<rss><channel><item><title>入門 監視</title><dcterms:issued>2019</dcterms:issued></item></channel></rss>" };
      }
      return { ok: false, status: 404, text: async () => "" };
    };
    const result = await checkBook({ resourceId: "x", isbn: "9784873118642", title: "入門 監視", publishedYear: 2019 }, fetcher);
    expect(result.status).toBe("verified");
    expect(result.record?.source).toBe("ndl");
  });
});
