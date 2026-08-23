import content from "@/generated/content.json";
import type { ContentBundle } from "./types";

export const contentBundle = content as ContentBundle;

export function getPublishedSituations() {
  return contentBundle.situations.filter((item) => item.published);
}

export function getSituationBySlug(slug: string) {
  return contentBundle.situations.find((item) => item.slug === slug && item.published);
}

export function getSituationData(slug: string) {
  const situation = getSituationBySlug(slug);
  if (!situation) return null;
  const approachIds = new Set(situation.approachIds);
  const conditionIds = new Set(situation.conditionIds);
  const approaches = contentBundle.approaches.filter((item) => approachIds.has(item.id));
  const conditions = contentBundle.conditions.filter((item) => conditionIds.has(item.id));
  const rules = contentBundle.rules.filter((item) => item.situationId === situation.id);
  const evidenceIds = new Set(rules.flatMap((item) => item.evidenceIds));
  const evidence = contentBundle.evidence.filter((item) => evidenceIds.has(item.id));
  const resourceIds = new Set(approaches.flatMap((item) => item.resourceIds));
  const resources = contentBundle.resources.filter((item) => resourceIds.has(item.id));
  const presets = contentBundle.decisions.filter((item) => item.situationId === situation.id && item.status === "published");
  const benchmarks = contentBundle.benchmarks.filter((item) => item.situationId === situation.id);
  return { situation, approaches, conditions, rules, evidence, resources, presets, benchmarks };
}
