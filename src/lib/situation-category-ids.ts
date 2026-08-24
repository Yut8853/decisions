export const situationCategoryIds = [
  "sites",
  "products",
  "performance",
  "apps",
  "operations",
  "quality",
  "security",
  "data-ai",
  "measurement"
] as const;

export type SituationCategoryId = (typeof situationCategoryIds)[number];
