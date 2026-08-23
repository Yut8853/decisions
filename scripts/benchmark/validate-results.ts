import fs from "node:fs";
import path from "node:path";
import { benchmarkResultSchema } from "../../src/lib/schemas";

const dir = path.join(process.cwd(), "content", "benchmarks", "results");
if (!fs.existsSync(dir)) {
  console.log("No benchmark results yet; planned benchmarks remain unpublished.");
  process.exit(0);
}
const files = fs.readdirSync(dir).filter((name) => name.endsWith(".json"));
for (const file of files) {
  benchmarkResultSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")));
}
console.log(`Validated ${files.length} runner-generated benchmark result files.`);
