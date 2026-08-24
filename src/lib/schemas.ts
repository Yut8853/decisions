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
  resourceIds: z.array(id).default([]),
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
  type: z.enum(["official", "book", "article", "course"]),
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
  limitations: z.string().optional()
}).superRefine((value, ctx) => {
  if (!value.url && !value.amazonUrl) {
    ctx.addIssue({ code: "custom", message: "A resource requires url or amazonUrl." });
  }
  if (value.type !== "book") return;

  const requiredBookFields = [
    ["url", value.url],
    ["authors", value.authors?.length],
    ["language", value.language],
    ["coverImageUrl", value.coverImageUrl],
    ["coverImageAlt", value.coverImageAlt],
    ["coverSourceName", value.coverSourceName],
    ["coverSourceUrl", value.coverSourceUrl],
    ["bookTopicIds", value.bookTopicIds?.length],
    ["limitations", value.limitations]
  ] as const;
  for (const [field, fieldValue] of requiredBookFields) {
    if (!fieldValue) {
      ctx.addIssue({ code: "custom", path: [field], message: `A book resource requires ${field}.` });
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
