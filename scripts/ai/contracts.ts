import { z } from "zod";
import { approachSchema, decisionPresetSchema, evidenceSchema, resourceSchema, ruleSchema, situationFrontmatterSchema } from "../../src/lib/schemas";

export const researchResultSchema = z.object({
  brief: z.string(),
  scope: z.string(),
  researchedAt: z.string(),
  facts: z.array(z.object({
    claim: z.string().min(20),
    sourceUrl: z.string().url(),
    sourceName: z.string(),
    sourceType: z.string(),
    primary: z.boolean(),
    retrievedAt: z.string(),
    quoteOrParaphrase: z.string(),
    limitations: z.string().default("")
  })).min(3),
  candidateApproaches: z.array(z.object({ name: z.string(), rationale: z.string(), risks: z.array(z.string()) })).min(2),
  contradictions: z.array(z.object({ topic: z.string(), sources: z.array(z.string().url()), resolutionNeeded: z.string() })),
  unknowns: z.array(z.string())
});

export const candidatePackageSchema = z.object({
  schemaVersion: z.literal(1),
  operation: z.enum(["create", "update"]),
  situation: situationFrontmatterSchema.extend({ bodyMarkdown: z.string().min(80) }),
  approaches: z.array(approachSchema).min(2),
  evidence: z.array(evidenceSchema).min(3),
  rules: z.array(ruleSchema).min(2),
  resources: z.array(resourceSchema),
  decisions: z.array(decisionPresetSchema),
  authorNotes: z.object({
    assumptions: z.array(z.string()),
    unresolved: z.array(z.string()),
    benchmarkRequired: z.boolean(),
    manualReviewFocus: z.array(z.string())
  })
});

export const reviewerResultSchema = z.object({
  approved: z.boolean(),
  summary: z.string(),
  blockingIssues: z.array(z.string()),
  nonBlockingIssues: z.array(z.string()),
  missingAlternatives: z.array(z.string()),
  overclaims: z.array(z.string()),
  ruleConflicts: z.array(z.string()),
  requiredChanges: z.array(z.string()),
  independentlyCheckedUrls: z.array(z.string().url())
});

export const factCheckResultSchema = z.object({
  approved: z.boolean(),
  summary: z.string(),
  blockingIssues: z.array(z.string()),
  checks: z.array(z.object({
    evidenceId: z.string(),
    sourceReachable: z.boolean(),
    sourcePrimary: z.boolean(),
    claimSupported: z.boolean(),
    temporallyCurrent: z.boolean(),
    notes: z.string()
  })),
  uncheckedClaims: z.array(z.string()),
  requiredChanges: z.array(z.string())
});

export type CandidatePackage = z.infer<typeof candidatePackageSchema>;
export type ReviewerResult = z.infer<typeof reviewerResultSchema>;
export type FactCheckResult = z.infer<typeof factCheckResultSchema>;
