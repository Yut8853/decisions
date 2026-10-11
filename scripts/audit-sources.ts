import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { loadContent } from "./lib/load-content";

const bundle = loadContent();
const timeoutMs = 20_000;

async function fetchWithTimeout(url: string, method: "HEAD" | "GET" = "HEAD") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "JUNKBRANDING-VTD-Audit/1.0",
        accept: "application/vnd.github+json, application/json, text/html;q=0.8"
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url: string) {
  try {
    let response = await fetchWithTimeout(url, "HEAD");
    if ([403, 405].includes(response.status)) response = await fetchWithTimeout(url, "GET");
    return { ok: response.ok, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { ok: false, status: 0, error: String(error), finalUrl: url };
  }
}

async function pool<T, R>(values: T[], limit: number, task: (value: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await task(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

const evidenceChecks = await pool(bundle.evidence, 5, async (evidence) => ({
  evidenceId: evidence.id,
  verifiedAt: evidence.verifiedAt,
  url: evidence.url,
  ...(await checkUrl(evidence.url))
}));

const registryPath = path.join(process.cwd(), "content", "technology-registry.yml");
const registry = YAML.parse(fs.readFileSync(registryPath, "utf8")) as {
  technologies: Array<{ id: string; officialUrl: string; releaseApi?: string | null; volatility: string; lastKnownVersion?: string | null }>;
};

const releaseObservations = await pool(registry.technologies, 4, async (technology) => {
  const official = await checkUrl(technology.officialUrl);
  if (!technology.releaseApi) return { technologyId: technology.id, volatility: technology.volatility, official, observedVersion: null, releaseApi: null, changedFromRegistry: false };
  try {
    const response = await fetchWithTimeout(technology.releaseApi, "GET");
    const body = response.ok ? await response.json() as { tag_name?: string; html_url?: string; published_at?: string } : {};
    const observedVersion = body.tag_name ?? null;
    return {
      technologyId: technology.id,
      volatility: technology.volatility,
      official,
      releaseApi: technology.releaseApi,
      releaseStatus: response.status,
      observedVersion,
      releaseUrl: body.html_url ?? null,
      publishedAt: body.published_at ?? null,
      registryVersion: technology.lastKnownVersion ?? null,
      changedFromRegistry: Boolean(observedVersion && observedVersion !== technology.lastKnownVersion)
    };
  } catch (error) {
    return { technologyId: technology.id, volatility: technology.volatility, official, releaseApi: technology.releaseApi, observedVersion: null, changedFromRegistry: false, error: String(error) };
  }
});

const now = new Date();
const report = {
  schemaVersion: 1,
  generatedAt: now.toISOString(),
  requiresReview: evidenceChecks.some((item) => !item.ok) || releaseObservations.some((item) => item.changedFromRegistry),
  evidenceChecks,
  releaseObservations,
  note: "Reachability and release observation do not prove that an Evidence claim remains semantically correct. verifiedAt is not changed automatically."
};
const filename = `${now.toISOString().slice(0, 7)}.json`;
const out = path.join(process.cwd(), "content", "audits", filename);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Audit completed. Evidence reachable: ${evidenceChecks.filter((item) => item.ok).length}/${evidenceChecks.length}. Release changes observed: ${releaseObservations.filter((item) => item.changedFromRegistry).length}.`);
