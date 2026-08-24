import type { SituationCategoryId } from "./situation-category-ids";
import type { BookTopicId } from "./book-topic-ids";

export type SituationType = "build" | "selection" | "performance" | "architecture";
export type { SituationCategoryId } from "./situation-category-ids";
export type { BookTopicId } from "./book-topic-ids";
export type RuleEffectType = "require" | "exclude" | "boost" | "penalize" | "warn";
export type SourceType =
  | "specification"
  | "official-documentation"
  | "official-release"
  | "official-repository"
  | "benchmark"
  | "book"
  | "article";

export type ConditionDefinition = {
  id: string;
  label: string;
  description: string;
  category: "environment" | "requirement" | "priority" | "team" | "asset";
  conflictsWith: string[];
};

export type Situation = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: SituationType;
  category: SituationCategoryId;
  published: boolean;
  defaultConditionIds: string[];
  conditionIds: string[];
  approachIds: string[];
  lastReviewed: string;
  body: string;
};

export type Approach = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  defaultLabel: "canonical" | "fast" | "alternative" | "specialized";
  baseScore: number;
  technologyIds: string[];
  concepts: string[];
  recommendedWhen: string[];
  notRecommendedWhen: string[];
  advantages: string[];
  disadvantages: string[];
  resourceIds: string[];
  lastReviewed: string;
};

export type RuleWhen = {
  all: string[];
  any: string[];
  none: string[];
};

export type Rule = {
  id: string;
  situationId: string;
  targetApproachId?: string;
  when: RuleWhen;
  effect: {
    type: RuleEffectType;
    weight?: number;
    group?: string;
  };
  reason: string;
  evidenceIds: string[];
  lastReviewed: string;
};

export type Evidence = {
  id: string;
  title: string;
  claim: string;
  sourceType: SourceType;
  sourceName: string;
  url: string;
  primary: boolean;
  verificationStatus: "verified" | "needs-review";
  verifiedAt: string;
  conflictsWith: string[];
  notes?: string;
};

export type Resource = {
  id: string;
  type: "official" | "book" | "article" | "course";
  title: string;
  url?: string;
  amazonUrl?: string;
  authors?: string[];
  language?: string;
  edition?: string;
  versionNote?: string;
  isbn?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverSourceName?: string;
  coverSourceUrl?: string;
  bookTopicIds?: BookTopicId[];
  description: string;
  technologyIds: string[];
  concepts: string[];
  currentUse: string;
  limitations?: string;
};

export type BookResource = Resource & {
  type: "book";
  url: string;
  authors: string[];
  language: string;
  coverImageUrl: string;
  coverImageAlt: string;
  coverSourceName: string;
  coverSourceUrl: string;
  bookTopicIds: BookTopicId[];
  limitations: string;
};

export type DecisionPreset = {
  id: string;
  slug: string;
  situationId: string;
  title: string;
  conditionIds: string[];
  snapshotDate: string;
  summary: string;
  expectedTopApproachIds: string[];
  status: "published" | "draft";
};

export type BenchmarkPlan = {
  id: string;
  title: string;
  situationId: string;
  approachIds: string[];
  status: "planned" | "measured";
  metrics: string[];
  fixture: string;
  protocol: string[];
};

export type ContentBundle = {
  generatedAt: string;
  situations: Situation[];
  approaches: Approach[];
  rules: Rule[];
  evidence: Evidence[];
  resources: Resource[];
  conditions: ConditionDefinition[];
  decisions: DecisionPreset[];
  benchmarks: BenchmarkPlan[];
};

export type FiredRule = Rule & { matched: true };
export type RankedApproach = {
  approach: Approach;
  score: number;
  reasons: string[];
  evidenceIds: string[];
  firedRuleIds: string[];
  label: "王道" | "最短" | "条件付き推奨" | "別解";
};
export type ExcludedApproach = {
  approach: Approach;
  reasons: string[];
  evidenceIds: string[];
  firedRuleIds: string[];
};
export type DecisionWarning = {
  id: string;
  message: string;
  evidenceIds: string[];
};
export type DecisionResult = {
  situationId: string;
  activeConditionIds: string[];
  ranked: RankedApproach[];
  excluded: ExcludedApproach[];
  warnings: DecisionWarning[];
  firedRules: FiredRule[];
};
