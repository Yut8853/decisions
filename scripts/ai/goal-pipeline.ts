import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { loadContent } from "../lib/load-content";
import type { FetchLike } from "../lib/book-lookup";
import { callAgent, parseArgs, readPrompt, saveStage } from "./common";
import { goalCandidateSchema, goalResearchSchema, goalReviewSchema } from "./goal-contracts";
import { evaluateGoalGate, writeGoalCandidate } from "./goal-gate";

// 使い方: pnpm ai:goal -- --brief "中小企業のセキュリティ担当になりたい" --slug smb-security --mode draft|publish
// 流れ: 調査 → 執筆 → 独立レビュー → プログラムによる検証（順番・バージョン・関連性・重複・ISBN照合）→ 書き出し

async function main() {
  const args = parseArgs();
  const brief = args.get("brief");
  const slug = args.get("slug");
  const mode = (args.get("mode") ?? "draft") as "draft" | "publish";
  if (!brief || !slug) throw new Error("Usage: pnpm ai:goal -- --brief \"...\" --slug slug --mode draft|publish");

  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;
  const runDir = path.join(process.cwd(), ".ai", "runs", runId);
  const content = loadContent();
  const inventory = {
    domains: content.domains,
    goals: content.goals.map(({ id, title, aliases, domainId, skillIds }) => ({ id, title, aliases, domainId, skillIds })),
    skills: content.skills.map(({ id, title, domainIds, prerequisites, volatility, technologyIds, status, resources }) => ({ id, title, domainIds, prerequisites, volatility, technologyIds, status, resourceIds: resources.map((item) => item.resourceId) })),
    books: content.resources.filter((item) => item.type === "book").map(({ id, title, isbn, publishedYear, targetVersions, targetExam }) => ({ id, title, isbn, publishedYear, targetVersions, targetExam })),
    certifications: content.resources.filter((item) => item.type === "certification").map(({ id, title, examVersion, revisionNote }) => ({ id, title, examVersion, revisionNote })),
    technologies: content.technologies.map(({ id, name, volatility, currentVersion, currentVersionCheckedAt }) => ({ id, name, volatility, currentVersion, currentVersionCheckedAt })),
    policy: "Reuse existing skills and books whenever they fit. Do not overwrite existing ids. Every new book needs an ISBN, a target version and a reason written for the specific skill."
  };
  const currentDate = new Date().toISOString();

  const research = await callAgent({ stage: "goal-researcher", prompt: readPrompt("goal-researcher"), payload: { brief, slug, inventory, currentDate }, schema: goalResearchSchema, webSearch: true });
  saveStage(runDir, "01-research", research);
  const author = await callAgent({ stage: "goal-author", prompt: readPrompt("goal-author"), payload: { brief, slug, research: research.data, inventory, currentDate }, schema: goalCandidateSchema, webSearch: false });
  saveStage(runDir, "02-author", author);
  const review = await callAgent({ stage: "goal-reviewer", prompt: readPrompt("goal-reviewer"), payload: { brief, candidate: author.data, inventory, currentDate }, schema: goalReviewSchema, webSearch: true });
  saveStage(runDir, "03-review", review);

  const { candidate, result } = await evaluateGoalGate(author.data, review.data, fetch as unknown as FetchLike);
  saveStage(runDir, "04-gate", result);

  const labels = result.manualReviewRequired
    ? ["ai-generated", "needs-editorial-review", "needs-human-review"]
    : ["ai-generated", "ai-approved"];
  fs.mkdirSync(path.join(process.cwd(), ".ai", "runs"), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), ".ai", "runs", "latest-goal-labels.txt"), labels.join(","));
  fs.writeFileSync(path.join(process.cwd(), ".ai", "runs", "latest-goal-review.md"), [
    `- Goal: ${candidate.goal.title} (${candidate.goal.slug})`,
    `- Human review required: ${result.manualReviewRequired ? "yes" : "no"}`,
    ...result.manualReviewReasons.map((reason) => `  - ${reason}`),
    ...result.bookChecks.map((check) => `- Book ${check.resourceId}: ${check.status}${check.record ? ` (${check.record.source}: ${check.record.title})` : ""}`),
    ...result.warnings.map((warning) => `- Warning: ${warning}`)
  ].join("\n") + "\n");

  if (!result.approved) {
    fs.writeFileSync(path.join(runDir, "FAILED"), `${result.blockingIssues.join("\n")}\n`);
    throw new Error(`Goal gate rejected the candidate:\n- ${result.blockingIssues.join("\n- ")}`);
  }
  const written = writeGoalCandidate(candidate, runId, mode);
  saveStage(runDir, "05-written", { mode, written, labels, manualReviewReasons: result.manualReviewReasons });
  console.log(JSON.stringify({ runId, mode, written, labels, manualReviewReasons: result.manualReviewReasons }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
