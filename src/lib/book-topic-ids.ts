export const bookTopicIds = [
  "accessibility",
  "design-ux",
  "frontend",
  "testing-quality",
  "security-auth",
  "performance-graphics",
  "architecture-operations",
  "data-ai-search"
] as const;

export type BookTopicId = (typeof bookTopicIds)[number];
