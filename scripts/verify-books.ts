import fs from "node:fs";
import path from "node:path";
import { loadContent } from "./lib/load-content";
import { checkBook, type FetchLike } from "./lib/book-lookup";

// 使い方:
//   pnpm books:verify                 … ISBNのある本をすべて照合
//   pnpm books:verify -- --ids a,b    … 指定した本だけ照合（AIパイプラインの新規本など）
// 書名・刊行年が書誌データと合わない本、どこにも見つからない本があれば失敗する。

const args = process.argv.slice(2);
const idsIndex = args.indexOf("--ids");
const onlyIds = idsIndex >= 0 ? new Set((args[idsIndex + 1] ?? "").split(",").filter(Boolean)) : null;

const books = loadContent().resources.filter((resource) => resource.type === "book" && resource.isbn && (!onlyIds || onlyIds.has(resource.id)));
const fetcher = fetch as unknown as FetchLike;

async function main() {
const results = [];
for (const book of books) {
  const result = await checkBook({ resourceId: book.id, isbn: book.isbn!, title: book.title, publishedYear: book.publishedYear }, fetcher);
  results.push(result);
  const mark = result.status === "verified" ? "OK " : "NG ";
  console.log(`${mark}${book.id} (${result.isbn}) ${result.status}${result.record ? ` via ${result.record.source}` : ""}${result.note ? ` — ${result.note}` : ""}`);
}

const failed = results.filter((item) => item.status !== "verified");
const report = { checkedAt: new Date().toISOString(), total: results.length, failed: failed.length, results };
const dir = path.join(process.cwd(), ".ai", "runs");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "book-verification.json"), `${JSON.stringify(report, null, 2)}\n`);

if (failed.length) {
  console.error(`\n${failed.length}冊の本が確認できませんでした。書名・ISBN・刊行年を見直してください。`);
  process.exit(1);
}
console.log(`\n${results.length}冊すべて確認できました。`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
