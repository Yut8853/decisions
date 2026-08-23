import fs from "node:fs";
import path from "node:path";
import { loadContent, loadManifest } from "./lib/load-content";
import { validateBundle } from "./lib/validate-bundle";

const bundle = loadContent();
const manifest = loadManifest();
validateBundle(bundle, manifest.minimums);

const generatedDir = path.join(process.cwd(), "src", "generated");
const publicDataDir = path.join(process.cwd(), "public", "data");
fs.mkdirSync(generatedDir, { recursive: true });
fs.mkdirSync(publicDataDir, { recursive: true });

const serialized = `${JSON.stringify(bundle, null, 2)}\n`;
fs.writeFileSync(path.join(generatedDir, "content.json"), serialized);
fs.writeFileSync(path.join(publicDataDir, "content.json"), serialized);

const llms = [
  "# Verified Technology Decisions / JUNKBRANDING",
  "",
  "Evidence-first technology decisions with explicit conditions, negative recommendations, and review dates.",
  "",
  ...bundle.situations.filter((item) => item.published).map((item) => `- [${item.title}](${manifest.defaultDomain}/decisions/${item.slug}): ${item.summary}`),
  "",
  `Policy version: ${manifest.policyVersion}`,
  `Generated: ${bundle.generatedAt}`
].join("\n");
fs.writeFileSync(path.join(process.cwd(), "public", "llms.txt"), `${llms}\n`);
console.log(`Generated ${bundle.situations.length} situations and ${bundle.rules.length} rules.`);
