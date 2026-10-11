import { z } from "zod";
import { goalFrontmatterSchema, resourceSchema, skillResourceSchema, skillSchema } from "../../src/lib/schemas";

const id = z.string().min(2).regex(/^[a-z0-9][a-z0-9-]*$/);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// 1. 調査：必要な学ぶもの、回り道、本の候補、現行バージョンを集める
export const goalResearchSchema = z.object({
  brief: z.string(),
  researchedAt: z.string(),
  candidateSkills: z.array(z.object({
    id,
    existing: z.boolean(),
    title: z.string(),
    why: z.string().min(10),
    prerequisites: z.array(id).default([])
  })).min(1),
  detours: z.array(z.object({ label: z.string(), reason: z.string().min(20) })).min(1),
  books: z.array(z.object({
    title: z.string(),
    isbn: z.string(),
    publisher: z.string(),
    publishedYear: z.number().int(),
    url: z.string().url(),
    forSkillId: id,
    level: z.enum(["intro", "practice", "reference"]),
    targetVersions: z.array(z.object({ technologyId: id, version: z.string() })).default([]),
    targetExam: z.object({ certificationId: id, version: z.string() }).optional(),
    whyThisBook: z.string().min(20),
    evidenceUrls: z.array(z.string().url()).min(1)
  })),
  versionFacts: z.array(z.object({ technologyId: id, currentVersion: z.string(), sourceUrl: z.string().url(), checkedAt: isoDate })).default([]),
  unknowns: z.array(z.string()).default([])
});

// 2. 執筆：公開用のデータ一式
export const goalCandidateSchema = z.object({
  schemaVersion: z.literal(1),
  goal: goalFrontmatterSchema.extend({ bodyMarkdown: z.string().min(40) }),
  newSkills: z.array(skillSchema).default([]),
  newResources: z.array(resourceSchema).default([]),
  skillResourceAdditions: z.array(z.object({ skillId: id, link: skillResourceSchema })).default([]),
  technologyUpdates: z.array(z.object({
    id,
    currentVersion: z.string(),
    currentVersionSource: z.string().url(),
    currentVersionCheckedAt: isoDate
  })).default([]),
  authorNotes: z.object({
    assumptions: z.array(z.string()).default([]),
    unresolved: z.array(z.string()).default([]),
    manualReviewFocus: z.array(z.string()).default([])
  })
});

// 3. 独立レビュー
export const goalReviewSchema = z.object({
  approved: z.boolean(),
  summary: z.string(),
  blockingIssues: z.array(z.string()),
  orderProblems: z.array(z.string()),
  detourProblems: z.array(z.string()),
  bookProblems: z.array(z.string()),
  versionProblems: z.array(z.string()),
  requiredChanges: z.array(z.string()),
  checkedUrls: z.array(z.string().url())
});

export type GoalCandidate = z.infer<typeof goalCandidateSchema>;
export type GoalReview = z.infer<typeof goalReviewSchema>;
