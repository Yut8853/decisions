import { z } from "zod";
import { bookTopicIds } from "./book-topic-ids";
import { situationCategoryIds } from "./situation-category-ids";

const id = z.string().min(2).regex(/^[a-z0-9][a-z0-9-]*$/);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const conditionSchema = z.object({
  id,
  label: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["environment", "requirement", "priority", "team", "asset"]),
  conflictsWith: z.array(id).default([])
});

export const situationFrontmatterSchema = z.object({
  id,
  slug: id,
  title: z.string().min(1),
  summary: z.string().min(20),
  type: z.enum(["build", "selection", "performance", "architecture"]),
  category: z.enum(situationCategoryIds),
  published: z.boolean(),
  defaultConditionIds: z.array(id).default([]),
  conditionIds: z.array(id).min(1),
  approachIds: z.array(id).min(2),
  lastReviewed: isoDate
});

// ISBNのチェックディジットを検証する。AIがそれらしい番号を作った場合の最低限の検出。
export function isValidIsbn(raw: string): boolean {
  const digits = raw.replace(/[-\s]/g, "").toUpperCase();
  if (/^\d{13}$/.test(digits)) {
    const sum = digits.slice(0, 12).split("").reduce((acc, ch, index) => acc + Number(ch) * (index % 2 === 0 ? 1 : 3), 0);
    return (10 - (sum % 10)) % 10 === Number(digits[12]);
  }
  if (/^\d{9}[\dX]$/.test(digits)) {
    const sum = digits.split("").reduce((acc, ch, index) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - index), 0);
    return sum % 11 === 0;
  }
  return false;
}

export const volatilityIds = ["high", "medium", "low"] as const;

export const technologySchema = z.object({
  id,
  name: z.string().min(1).optional(),
  officialUrl: z.string().url(),
  releaseApi: z.string().url().nullable().optional(),
  volatility: z.enum(volatilityIds),
  lastKnownVersion: z.string().nullable().optional(),
  // 現行バージョン。人または月次監査のPRで更新する。未確認ならnull。
  currentVersion: z.string().nullable().optional(),
  currentVersionCheckedAt: isoDate.nullable().optional(),
  currentVersionSource: z.string().url().nullable().optional()
});

export const domainSchema = z.object({
  id,
  title: z.string().min(1),
  description: z.string().min(10),
  // 運営元のスクールへの案内を出してよい分野か。
  schoolEligible: z.boolean().default(false)
});

export const skillResourceLevelIds = ["intro", "practice", "reference"] as const;

export const skillResourceSchema = z.object({
  resourceId: id,
  level: z.enum(skillResourceLevelIds),
  reason: z.string().min(20)
});

export const skillSchema = z.object({
  id,
  slug: id,
  title: z.string().min(1),
  summary: z.string().min(20),
  canDo: z.string().min(10),
  domainIds: z.array(id).min(1),
  prerequisites: z.array(id).default([]),
  volatility: z.enum(volatilityIds),
  technologyIds: z.array(id).default([]),
  // planned: 学ぶ順番の骨組みだけ作り、本の確認がまだのもの。公開中の目標には使えない。
  status: z.enum(["active", "legacy", "planned"]).default("active"),
  legacyNote: z.string().min(20).optional(),
  resources: z.array(skillResourceSchema).default([]),
  lastReviewed: isoDate
}).superRefine((value, ctx) => {
  if (value.status === "legacy" && !value.legacyNote) {
    ctx.addIssue({ code: "custom", path: ["legacyNote"], message: "A legacy skill requires legacyNote." });
  }
  if (value.status === "active" && value.resources.length === 0) {
    ctx.addIssue({ code: "custom", path: ["resources"], message: "An active skill requires at least one resource." });
  }
});

export const goalFrontmatterSchema = z.object({
  id,
  slug: id,
  title: z.string().min(1),
  summary: z.string().min(20),
  kind: z.enum(["build", "career", "protect"]),
  domainId: id,
  aliases: z.array(z.string().min(1)).default([]),
  published: z.boolean(),
  skillIds: z.array(id).min(1),
  branches: z.array(z.object({
    id,
    question: z.string().min(5),
    options: z.array(z.object({
      label: z.string().min(1),
      note: z.string().optional(),
      skillIds: z.array(id).default([])
    })).min(2)
  })).default([]),
  notNeededNow: z.array(z.object({
    label: z.string().min(1),
    skillId: id.optional(),
    reason: z.string().min(20)
  })).min(1),
  relatedSituationIds: z.array(id).default([]),
  lastReviewed: isoDate
});

export const learningStageIds = ["start", "stuck", "deepen"] as const;

// 実装案ごとの「読む順番」。本・公式資料・講座を、なぜこの案に必要かの理由つきで並べる。
export const learningStepSchema = z.object({
  resourceId: id,
  stage: z.enum(learningStageIds),
  reason: z.string().min(20),
  showWhenAny: z.array(id).default([])
});

export const approachSchema = z.object({
  id,
  slug: id,
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  summary: z.string().min(20),
  defaultLabel: z.enum(["canonical", "fast", "alternative", "specialized"]),
  baseScore: z.number().int().min(-10).max(10).default(0),
  technologyIds: z.array(id).min(1),
  concepts: z.array(id).min(1),
  recommendedWhen: z.array(z.string().min(1)).min(1),
  notRecommendedWhen: z.array(z.string().min(1)).min(1),
  advantages: z.array(z.string().min(1)).min(1),
  disadvantages: z.array(z.string().min(1)).min(1),
  learningPath: z.array(learningStepSchema).min(1),
  lastReviewed: isoDate
});

export const ruleSchema = z.object({
  id,
  situationId: id,
  targetApproachId: id.optional(),
  when: z.object({
    all: z.array(id).default([]),
    any: z.array(id).default([]),
    none: z.array(id).default([])
  }),
  effect: z.object({
    type: z.enum(["require", "exclude", "boost", "penalize", "warn"]),
    weight: z.number().int().min(-10).max(10).optional(),
    group: id.optional()
  }),
  reason: z.string().min(15),
  evidenceIds: z.array(id).min(1),
  lastReviewed: isoDate
}).superRefine((value, ctx) => {
  if (value.effect.type !== "warn" && !value.targetApproachId) {
    ctx.addIssue({ code: "custom", message: "Non-warning rules require targetApproachId." });
  }
  if (["boost", "penalize"].includes(value.effect.type) && !value.effect.weight) {
    ctx.addIssue({ code: "custom", message: "Boost and penalize rules require a non-zero weight." });
  }
});

export const evidenceSchema = z.object({
  id,
  title: z.string().min(1),
  claim: z.string().min(20),
  sourceType: z.enum([
    "specification",
    "official-documentation",
    "official-release",
    "official-repository",
    "benchmark",
    "book",
    "article"
  ]),
  sourceName: z.string().min(1),
  url: z.string().url(),
  primary: z.boolean(),
  verificationStatus: z.enum(["verified", "needs-review"]),
  verifiedAt: isoDate,
  conflictsWith: z.array(id).default([]),
  notes: z.string().optional()
});

export const resourceSchema = z.object({
  id,
  type: z.enum(["official", "book", "article", "course", "certification"]),
  title: z.string().min(1),
  url: z.string().url().optional(),
  amazonUrl: z.string().url().optional(),
  authors: z.array(z.string().min(1)).optional(),
  language: z.string().min(1).optional(),
  edition: z.string().min(1).optional(),
  versionNote: z.string().min(1).optional(),
  isbn: z.string().min(10).optional(),
  coverImageUrl: z.string().url().optional(),
  coverImageAlt: z.string().min(1).optional(),
  coverSourceName: z.string().min(1).optional(),
  coverSourceUrl: z.string().url().optional(),
  bookTopicIds: z.array(z.enum(bookTopicIds)).optional(),
  description: z.string().min(10),
  technologyIds: z.array(id).default([]),
  concepts: z.array(id).default([]),
  currentUse: z.string().min(5),
  limitations: z.string().optional(),
  // 書籍のバージョン情報
  publishedYear: z.number().int().min(1990).max(2100).optional(),
  targetVersions: z.array(z.object({ technologyId: id, version: z.string().min(1) })).default([]),
  targetExam: z.object({ certificationId: id, version: z.string().min(1) }).optional(),
  usesLegacySkillIds: z.array(id).default([]),
  outdatedNote: z.string().min(10).optional(),
  editionNote: z.string().min(10).optional(),
  // 資格（出題範囲を学ぶ順番の地図として使う）
  provider: z.string().min(1).optional(),
  examVersion: z.string().min(1).optional(),
  syllabusUrls: z.array(z.string().url()).default([]),
  revisionNote: z.string().min(10).optional(),
  revisionSourceUrl: z.string().url().optional(),
  verifiedAt: isoDate.optional()
}).superRefine((value, ctx) => {
  if (!value.url && !value.amazonUrl) {
    ctx.addIssue({ code: "custom", message: "A resource requires url or amazonUrl." });
  }
  if (value.isbn && !isValidIsbn(value.isbn)) {
    ctx.addIssue({ code: "custom", path: ["isbn"], message: `ISBN check digit is invalid: ${value.isbn}` });
  }
  if (value.type === "certification") {
    for (const [field, fieldValue] of [
      ["provider", value.provider],
      ["examVersion", value.examVersion],
      ["syllabusUrls", value.syllabusUrls.length],
      ["verifiedAt", value.verifiedAt]
    ] as const) {
      if (!fieldValue) ctx.addIssue({ code: "custom", path: [field], message: `A certification requires ${field}.` });
    }
  }
  if (value.type !== "book") return;
  if (value.isbn && !value.publishedYear) {
    ctx.addIssue({ code: "custom", path: ["publishedYear"], message: "A book with ISBN requires publishedYear." });
  }

  const requiredBookFields = [
    ["url", value.url],
    ["authors", value.authors?.length],
    ["language", value.language],
    ["bookTopicIds", value.bookTopicIds?.length],
    ["limitations", value.limitations]
  ] as const;
  for (const [field, fieldValue] of requiredBookFields) {
    if (!fieldValue) {
      ctx.addIssue({ code: "custom", path: [field], message: `A book resource requires ${field}.` });
    }
  }
  // 表紙は任意。載せる場合だけ、代替テキストと出典を必須にする。
  if (value.coverImageUrl) {
    for (const [field, fieldValue] of [
      ["coverImageAlt", value.coverImageAlt],
      ["coverSourceName", value.coverSourceName],
      ["coverSourceUrl", value.coverSourceUrl]
    ] as const) {
      if (!fieldValue) ctx.addIssue({ code: "custom", path: [field], message: `A book cover requires ${field}.` });
    }
  }
});

export const decisionPresetSchema = z.object({
  id,
  slug: id,
  situationId: id,
  title: z.string().min(1),
  conditionIds: z.array(id),
  snapshotDate: isoDate,
  summary: z.string().min(20),
  expectedTopApproachIds: z.array(id).min(1),
  status: z.enum(["published", "draft"])
});

export const benchmarkPlanSchema = z.object({
  id,
  title: z.string().min(1),
  situationId: id,
  approachIds: z.array(id).min(2),
  status: z.enum(["planned", "measured"]),
  metrics: z.array(z.string()).min(1),
  fixture: z.string().min(1),
  protocol: z.array(z.string()).min(2)
});

export const benchmarkResultSchema = z.object({
  schemaVersion: z.literal(1),
  benchmarkId: id,
  runId: z.string().min(8),
  generatedBy: z.literal("benchmark-runner"),
  generatedAt: z.string().datetime(),
  runnerChecksum: z.string().regex(/^[a-f0-9]{64}$/),
  environment: z.object({
    browser: z.string(),
    browserVersion: z.string(),
    os: z.string(),
    viewport: z.object({ width: z.number(), height: z.number() })
  }),
  results: z.array(z.object({
    approachId: id,
    url: z.string(),
    samples: z.number().int().positive(),
    fpsMedian: z.number().nullable(),
    firstContentfulPaintMs: z.number().nullable(),
    transferredBytes: z.number().nullable(),
    jsHeapBytes: z.number().nullable(),
    drawCalls: z.number().nullable(),
    triangles: z.number().nullable()
  })).min(1)
});
