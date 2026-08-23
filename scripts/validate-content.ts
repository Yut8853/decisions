import { loadContent, loadManifest } from "./lib/load-content";
import { validateBundle } from "./lib/validate-bundle";

const bundle = loadContent();
const manifest = loadManifest();
const report = validateBundle(bundle, manifest.minimums);
console.log(JSON.stringify({ ok: true, ...report }, null, 2));
