import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { loadContent } from "../lib/load-content";
import { validateBundle } from "../lib/validate-bundle";
import { checkBook, type BookCheck, type FetchLike } from "../lib/book-lookup";
import type { ContentBundle, Skill } from "../../src/lib/types";
import { goalCandidateSchema, type GoalCandidate, type GoalReview } from "./goal-contracts";

export type GoalGateResult = {
  approved: boolean;
  blockingIssues: string[];
  warnings: string[];
  manualReviewRequired: boolean;
  manualReviewReasons: string[];
  bookChecks: BookCheck[];
};

// 各分野の最初の何本までを、人が全体を確認する対象にするか。
export const FIRST_GOALS_PER_DOMAIN_FOR_HUMAN_REVIEW = 3;

export function mergeCandidate(bundle: ContentBundle, candidate: GoalCandidate): ContentBundle {
  const { bodyMarkdown, ...goal } = candidate.goal;
  const additions = new Map<string, GoalCandidate["skillResourceAdditions"]>();
  for (const item of candidate.skillResourceAdditions) additions.set(item.skillId, [...(additions.get(item.skillId) ?? []), item]);
  const skills: Skill[] = [...bundle.skills, ...candidate.newSkills].map((skill) => {
    const extra = additions.get(skill.id);
    return extra ? { ...skill, resources: [...skill.resources, ...extra.map((item) => item.link)] } : skill;
  });
  const technologies = bundle.technologies.map((technology) => {
    const update = candidate.technologyUpdates.find((item) => item.id === technology.id);
    return update ? { ...technology, ...update } : technology;
  });
  return {
    ...bundle,
    goals: [...bundle.goals, { ...goal, body: bodyMarkdown }],
    skills,
    resources: [...bundle.resources, ...candidate.newResources],
    technologies
  };
}

export async function evaluateGoalGate(rawCandidate: unknown, review: GoalReview, fetcher: FetchLike): Promise<{ candidate: GoalCandidate; result: GoalGateResult }> {
  const candidate = goalCandidateSchema.parse(rawCandidate);
  const existing = loadContent();
  const issues: string[] = [];
  const warnings: string[] = [];
  const manualReviewReasons: string[] = [];

  if (!review.approved) issues.push(...review.blockingIssues.map((item) => `Reviewer: ${item}`));
  for (const item of [...review.requiredChanges, ...review.orderProblems, ...review.bookProblems, ...review.versionProblems]) issues.push(`Reviewer: ${item}`);
  warnings.push(...review.detourProblems.map((item) => `Reviewer (detour): ${item}`));

  // 既存のIDは上書きしない
  const existingIds = new Set([...existing.goals, ...existing.skills, ...existing.resources].map((item) => item.id));
  const incoming = [candidate.goal.id, ...candidate.newSkills.map((item) => item.id), ...candidate.newResources.map((item) => item.id)];
  const collisions = incoming.filter((itemId) => existingIds.has(itemId));
  if (collisions.length) issues.push(`Existing ids cannot be overwritten: ${collisions.join(", ")}`);

  // 新しい本はISBN必須（オンラインの無料資料は type: official / course で登録する）
  for (const resource of candidate.newResources) {
    if (resource.type === "book" && !resource.isbn) issues.push(`${resource.id}: a new book requires an ISBN so that it can be verified.`);
  }

  // 公開前と同じ検証（順番・バージョン・関連性・重複）を、追加後の全体に対して行う
  try {
    validateBundle(mergeCandidate(existing, candidate));
  } catch (error) {
    issues.push(String(error).replace(/^Error: /, ""));
  }

  // 本の実在確認（書誌データと照合）
  const bookChecks: BookCheck[] = [];
  for (const resource of candidate.newResources.filter((item) => item.type === "book" && item.isbn)) {
    const check = await checkBook({ resourceId: resource.id, isbn: resource.isbn!, title: resource.title, publishedYear: resource.publishedYear }, fetcher);
    bookChecks.push(check);
    if (check.status !== "verified") issues.push(`${resource.id}: book verification ${check.status}. ${check.note ?? ""}`.trim());
  }

  // 人が確認する範囲：新しい学ぶもの・本・資格・現行バージョンの更新、各分野の最初の数本
  if (candidate.newSkills.length) manualReviewReasons.push(`新しい学ぶもの: ${candidate.newSkills.map((item) => item.id).join(", ")}`);
  if (candidate.newResources.length) manualReviewReasons.push(`新しい資料: ${candidate.newResources.map((item) => item.id).join(", ")}`);
  if (candidate.skillResourceAdditions.length) manualReviewReasons.push("既存の学ぶものへの資料の追加");
  if (candidate.technologyUpdates.length) manualReviewReasons.push(`現行バージョンの更新: ${candidate.technologyUpdates.map((item) => item.id).join(", ")}`);
  const domainGoalCount = existing.goals.filter((goal) => goal.domainId === candidate.goal.domainId && goal.published).length;
  if (domainGoalCount < FIRST_GOALS_PER_DOMAIN_FOR_HUMAN_REVIEW) manualReviewReasons.push(`この分野の${domainGoalCount + 1}本目の目標（最初の${FIRST_GOALS_PER_DOMAIN_FOR_HUMAN_REVIEW}本は全体を確認）`);

  if (candidate.authorNotes.unresolved.length) warnings.push(`Unresolved: ${candidate.authorNotes.unresolved.join(" | ")}`);
  return {
    candidate,
    result: {
      approved: issues.length === 0,
      blockingIssues: issues,
      warnings,
      manualReviewRequired: manualReviewReasons.length > 0,
      manualReviewReasons,
      bookChecks
    }
  };
}

function writeYaml(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, YAML.stringify(value, { lineWidth: 110 }));
}

export function writeGoalCandidate(candidate: GoalCandidate, runId: string, mode: "draft" | "publish") {
  const root = process.cwd();
  if (mode === "draft") {
    const file = path.join(root, "content", "drafts", "goals", `${candidate.goal.slug}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(candidate, null, 2)}\n`);
    return [path.relative(root, file)];
  }
  if (process.env.AI_ALLOW_PUBLISH !== "true") throw new Error("AI_ALLOW_PUBLISH must be true to write live content.");
  const written: string[] = [];
  const { bodyMarkdown, ...goal } = candidate.goal;
  const goalFile = path.join(root, "content", "goals", `${goal.slug}.md`);
  fs.mkdirSync(path.dirname(goalFile), { recursive: true });
  fs.writeFileSync(goalFile, `---\n${YAML.stringify(goal, { lineWidth: 110 }).trim()}\n---\n\n${bodyMarkdown.trim()}\n`);
  written.push(path.relative(root, goalFile));
  for (const skill of candidate.newSkills) { const file = path.join(root, "content", "skills", `${skill.id}.yml`); writeYaml(file, skill); written.push(path.relative(root, file)); }
  for (const resource of candidate.newResources) { const file = path.join(root, "content", "resources", `${resource.id}.yml`); writeYaml(file, resource); written.push(path.relative(root, file)); }
  for (const addition of candidate.skillResourceAdditions) {
    const file = path.join(root, "content", "skills", `${addition.skillId}.yml`);
    const skill = YAML.parse(fs.readFileSync(file, "utf8"));
    skill.resources = [...(skill.resources ?? []), addition.link];
    writeYaml(file, skill);
    written.push(path.relative(root, file));
  }
  if (candidate.technologyUpdates.length) {
    const file = path.join(root, "content", "technology-registry.yml");
    const registry = YAML.parse(fs.readFileSync(file, "utf8"));
    registry.technologies = registry.technologies.map((technology: { id: string }) => {
      const update = candidate.technologyUpdates.find((item) => item.id === technology.id);
      return update ? { ...technology, ...update } : technology;
    });
    writeYaml(file, registry);
    written.push(path.relative(root, file));
  }
  const provenance = { runId, publishedAt: new Date().toISOString(), aiGenerated: true, kind: "goal", files: written, requiresHumanAccountability: true };
  const provenanceFile = path.join(root, "content", "provenance", `${runId}.json`);
  fs.mkdirSync(path.dirname(provenanceFile), { recursive: true });
  fs.writeFileSync(provenanceFile, `${JSON.stringify(provenance, null, 2)}\n`);
  written.push(path.relative(root, provenanceFile));
  return written;
}
