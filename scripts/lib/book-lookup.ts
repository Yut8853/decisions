// 本の実在確認。ISBNを外部の書誌データ（openBD → 国立国会図書館サーチ → Google Books）で引き、
// 書名と刊行年が登録内容と一致するかを確かめる。AIが実在しない本や違う版を書いた場合に止めるため。

export type FetchLike = (url: string, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export type BookRecord = { source: "openbd" | "ndl" | "google-books"; title: string; publisher?: string; year?: number };

export type BookCheck = {
  resourceId: string;
  isbn: string;
  expectedTitle: string;
  expectedYear?: number;
  status: "verified" | "title-mismatch" | "year-mismatch" | "not-found" | "error";
  record?: BookRecord;
  note?: string;
};

export function toIsbn13(raw: string): string {
  const digits = raw.replace(/[-\s]/g, "").toUpperCase();
  if (digits.length === 13) return digits;
  const core = `978${digits.slice(0, 9)}`;
  const sum = core.split("").reduce((acc, ch, index) => acc + Number(ch) * (index % 2 === 0 ? 1 : 3), 0);
  return `${core}${(10 - (sum % 10)) % 10}`;
}

export function normalizeTitle(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\s\u3000・:：,，.。、!！?？'"“”‘’()（）［］\[\]【】「」『』〈〉<>―—–\-~〜／/]/g, "");
}

// 書誌データ側はサブタイトルや版表記の付け方が違うことがあるため、
// 正規化したうえで「どちらかがもう一方を含む」または「先頭10文字が一致」で同一とみなす。
export function titlesMatch(expected: string, found: string): boolean {
  const a = normalizeTitle(expected);
  const b = normalizeTitle(found);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const head = Math.min(10, a.length, b.length);
  return a.slice(0, head) === b.slice(0, head);
}

function yearOf(value?: string | null): number | undefined {
  const match = value?.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : undefined;
}

async function fetchText(fetcher: FetchLike, url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetcher(url, { headers: { "user-agent": "verified-technology-decisions-book-check" }, signal: controller.signal });
    if (!response.ok) return null;
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function lookupOpenBd(isbn13: string, fetcher: FetchLike): Promise<BookRecord | null> {
  const text = await fetchText(fetcher, `https://api.openbd.jp/v1/get?isbn=${isbn13}`);
  if (!text) return null;
  const data = JSON.parse(text) as Array<{ summary?: { title?: string; publisher?: string; pubdate?: string } } | null>;
  const summary = data?.[0]?.summary;
  if (!summary?.title) return null;
  return { source: "openbd", title: summary.title, publisher: summary.publisher, year: yearOf(summary.pubdate) };
}

export async function lookupNdl(isbn13: string, fetcher: FetchLike): Promise<BookRecord | null> {
  const text = await fetchText(fetcher, `https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${isbn13}`);
  if (!text) return null;
  const item = text.match(/<item>([\s\S]*?)<\/item>/)?.[1];
  if (!item) return null;
  const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
  if (!title) return null;
  const publisher = item.match(/<dc:publisher>([\s\S]*?)<\/dc:publisher>/)?.[1]?.trim();
  const issued = item.match(/<dcterms:issued[^>]*>([\s\S]*?)<\/dcterms:issued>/)?.[1] ?? item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/)?.[1];
  return { source: "ndl", title, publisher, year: yearOf(issued) };
}

export async function lookupGoogleBooks(isbn13: string, fetcher: FetchLike): Promise<BookRecord | null> {
  const text = await fetchText(fetcher, `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`);
  if (!text) return null;
  const data = JSON.parse(text) as { totalItems?: number; items?: Array<{ volumeInfo?: { title?: string; subtitle?: string; publisher?: string; publishedDate?: string } }> };
  const info = data.items?.[0]?.volumeInfo;
  if (!info?.title) return null;
  return { source: "google-books", title: [info.title, info.subtitle].filter(Boolean).join(" "), publisher: info.publisher, year: yearOf(info.publishedDate) };
}

export async function checkBook(input: { resourceId: string; isbn: string; title: string; publishedYear?: number }, fetcher: FetchLike): Promise<BookCheck> {
  const isbn = toIsbn13(input.isbn);
  const base = { resourceId: input.resourceId, isbn, expectedTitle: input.title, expectedYear: input.publishedYear };
  let lastRecord: BookRecord | undefined;
  const errors: string[] = [];
  for (const lookup of [lookupOpenBd, lookupNdl, lookupGoogleBooks]) {
    let record: BookRecord | null = null;
    try {
      record = await lookup(isbn, fetcher);
    } catch (error) {
      // 1つの書誌データが落ちていても、次の書誌データで確認を続ける。
      errors.push(`${lookup.name}: ${String(error)}`);
      continue;
    }
    if (!record) continue;
    lastRecord = record;
    if (!titlesMatch(input.title, record.title)) continue;
    // 電子版と紙版で発売年がずれることがあるため、1年の差は許容する。
    if (input.publishedYear && record.year && Math.abs(record.year - input.publishedYear) > 1) {
      return { ...base, status: "year-mismatch", record, note: `書誌データの刊行年は${record.year}年です。` };
    }
    return { ...base, status: "verified", record };
  }
  if (!lastRecord && errors.length === 3) return { ...base, status: "error", note: errors.join(" / ") };
  if (lastRecord) return { ...base, status: "title-mismatch", record: lastRecord, note: `書誌データの書名は「${lastRecord.title}」です。` };
  return { ...base, status: "not-found", note: "どの書誌データにも見つかりませんでした。ISBNを確認してください。" };
}
