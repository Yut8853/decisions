import type { Resource } from "./types";

// ISBN-13（978で始まるもの）をISBN-10に変換する。Amazon.co.jpの紙の本のASINはISBN-10と同じ。
export function isbn13To10(raw: string): string | null {
  const digits = raw.replace(/[-\s]/g, "");
  if (/^\d{9}[\dX]$/i.test(digits)) return digits.toUpperCase();
  if (!/^978\d{10}$/.test(digits)) return null;
  const core = digits.slice(3, 12);
  const sum = core.split("").reduce((acc, ch, index) => acc + Number(ch) * (10 - index), 0);
  const check = (11 - (sum % 11)) % 11;
  return `${core}${check === 10 ? "X" : String(check)}`;
}

// 本のAmazonリンク。手書きのURLではなくISBNから作るので、AIが別の商品のURLを書く事故が起きない。
// 検索結果ページへのリンクは作らない。
export function amazonUrlForBook(resource: Resource, associateTag: string): string | null {
  if (resource.type !== "book" || !associateTag) return null;
  let base: string | null = null;
  if (resource.amazonUrl && /^https:\/\/www\.amazon\.co\.jp\/(dp|gp\/product)\/[A-Z0-9]{10}/.test(resource.amazonUrl)) {
    base = resource.amazonUrl.split("?")[0];
  } else if (resource.isbn) {
    const asin = isbn13To10(resource.isbn);
    if (asin) base = `https://www.amazon.co.jp/dp/${asin}`;
  }
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set("tag", associateTag);
  return url.toString();
}
