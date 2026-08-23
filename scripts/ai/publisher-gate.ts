import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { candidatePackageSchema, type CandidatePackage, type FactCheckResult, type ReviewerResult } from "./contracts";
import { loadContent } from "../lib/load-content";

export type GateResult = { approved: boolean; blockingIssues: string[]; warnings: string[]; manualReviewRequired: boolean };

function officialHost(url: string): boolean {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return ["github.com", "developer.mozilla.org", "web.dev", "w3.org", "khronos.org", "registry.khronos.org"].some((domain) => host === domain || host.endsWith(`.${domain}`))
    || host.endsWith(".dev") || host.endsWith(".org") || host.endsWith(".com");
}

export function evaluatePublisherGate(rawCandidate: unknown, review: ReviewerResult, factCheck: FactCheckResult): { candidate: CandidatePackage; result: GateResult } {
  const candidate = candidatePackageSchema.parse(rawCandidate);
  const existing = loadContent();
  const issues: string[] = [];
  const warnings: string[] = [];
  let manualReviewRequired = candidate.operation === "update";

  if (!review.approved) issues.push(...review.blockingIssues.map((item) => `Reviewer: ${item}`));
  if (!factCheck.approved) issues.push(...factCheck.blockingIssues.map((item) => `Fact checker: ${item}`));
  if (review.requiredChanges.length) issues.push(...review.requiredChanges.map((item) => `Required review change: ${item}`));
  if (factCheck.requiredChanges.length) issues.push(...factCheck.requiredChanges.map((item) => `Required fact-check change: ${item}`));

  const candidateEvidenceIds = new Set(candidate.evidence.map((item) => item.id));
  for (const rule of candidate.rules) {
    if (!rule.evidenceIds.length) issues.push(`${rule.id}: rules without evidence cannot be published.`);
    for (const id of rule.evidenceIds) if (!candidateEvidenceIds.has(id) && !existing.evidence.some((item) => item.id === id)) issues.push(`${rule.id}: missing evidence ${id}.`);
  }
  for (const evidence of candidate.evidence) {
    if (evidence.verificationStatus !== "verified") issues.push(`${evidence.id}: AI cannot publish unverified evidence as live content.`);
    if (process.env.AI_REQUIRE_PRIMARY_SOURCES !== "false" && !evidence.primary) warnings.push(`${evidence.id}: secondary evidence requires explicit editorial justification.`);
    if (!officialHost(evidence.url)) warnings.push(`${evidence.id}: source host requires manual ownership/trust review.`);
  }

  const existingIds = new Set([
    ...existing.situations.map((item) => item.id), ...existing.approaches.map((item) => item.id), ...existing.rules.map((item) => item.id),
    ...existing.evidence.map((item) => item.id), ...existing.resources.map((item) => item.id), ...existing.decisions.map((item) => item.id)
  ]);
  const incomingIds = [candidate.situation.id, ...candidate.approaches.map((item) => item.id), ...candidate.rules.map((item) => item.id), ...candidate.evidence.map((item) => item.id), ...candidate.resources.map((item) => item.id), ...candidate.decisions.map((item) => item.id)];
  const collisions = incomingIds.filter((id) => existingIds.has(id));
  if (collisions.length) {
    manualReviewRequired = true;
    if (process.env.AI_ALLOW_EXISTING_DECISION_UPDATE !== "true") issues.push(`Existing ids cannot be overwritten automatically: ${collisions.join(", ")}`);
  }

  if (candidate.authorNotes.benchmarkRequired) warnings.push("Benchmark is required. AI may create a plan but cannot create measured values.");
  if (candidate.authorNotes.unresolved.length) warnings.push(`Unresolved questions: ${candidate.authorNotes.unresolved.join(" | ")}`);
  return { candidate, result: { approved: issues.length === 0, blockingIssues: issues, warnings, manualReviewRequired } };
}

function writeYaml(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, YAML.stringify(value, { lineWidth: 110 }));
}

export function publishCandidate(candidate: CandidatePackage, runId: string, mode: "draft" | "publish") {
  const root = process.cwd();
  if (mode === "draft") {
    const dir = path.join(root, "content", "drafts", candidate.situation.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "candidate.json"), `${JSON.stringify(candidate, null, 2)}\n`);
    return [path.relative(root, path.join(dir, "candidate.json"))];
  }
  if (process.env.AI_ALLOW_PUBLISH !== "true") throw new Error("AI_ALLOW_PUBLISH must be true to write live content. Default automation publishes drafts only.");
  const written: string[] = [];
  const situation = { ...candidate.situation } as Record<string, unknown>;
  const body = String(situation.bodyMarkdown); delete situation.bodyMarkdown;
  const situationFile = path.join(root, "content", "situations", `${candidate.situation.slug}.md`);
  fs.writeFileSync(situationFile, `---\n${YAML.stringify(situation, { lineWidth: 110 }).trim()}\n---\n\n${body.trim()}\n`); written.push(path.relative(root, situationFile));
  for (const [folder, values] of [["approaches", candidate.approaches], ["evidence", candidate.evidence], ["rules", candidate.rules], ["resources", candidate.resources], ["decisions", candidate.decisions]] as const) {
    for (const value of values) { const file=path.join(root,"content",folder,`${value.id}.yml`); writeYaml(file,value); written.push(path.relative(root,file)); }
  }
  const provenance = { runId, publishedAt: new Date().toISOString(), aiGenerated: true, files: written, requiresHumanAccountability: true };
  const provenanceFile = path.join(root, "content", "provenance", `${runId}.json`); fs.mkdirSync(path.dirname(provenanceFile), { recursive: true }); fs.writeFileSync(provenanceFile, `${JSON.stringify(provenance,null,2)}\n`); written.push(path.relative(root, provenanceFile));
  return written;
}
