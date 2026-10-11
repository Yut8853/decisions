import content from "@/generated/content.json";
import type { BookResource, ContentBundle, Resource, Skill, SkillResource } from "./types";
import { buildGoalRoute } from "./learning-route";
import { amazonUrlForBook } from "./affiliate";
import { affiliateConfig, isAffiliateEnabled } from "./site";
import { evaluateBookForSkill, evaluateNonBookResource, versionLabel, type Severity } from "./versions";

export const contentBundle = content as unknown as ContentBundle;

export function getPublishedSituations() {
  return contentBundle.situations.filter((item) => item.published);
}

export function getBookResources(): BookResource[] {
  return contentBundle.resources.filter((item): item is BookResource => item.type === "book");
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
  const resourceIds = new Set(approaches.flatMap((item) => item.learningPath.map((step) => step.resourceId)));
  const resources = contentBundle.resources.filter((item) => resourceIds.has(item.id));
  const presets = contentBundle.decisions.filter((item) => item.situationId === situation.id && item.status === "published");
  const benchmarks = contentBundle.benchmarks.filter((item) => item.situationId === situation.id);
  return { situation, approaches, conditions, rules, evidence, resources, presets, benchmarks };
}

// ---- 学ぶ順番（目標・学ぶもの） ----


export function getPublishedGoals() {
  return contentBundle.goals.filter((goal) => goal.published);
}

export function getDomainsWithGoals() {
  const goals = getPublishedGoals();
  return contentBundle.domains
    .map((domain) => ({ ...domain, goals: goals.filter((goal) => goal.domainId === domain.id) }))
    .filter((domain) => domain.goals.length > 0);
}

export function getVersionContext() {
  return {
    technologies: new Map(contentBundle.technologies.map((item) => [item.id, item])),
    resources: new Map(contentBundle.resources.map((item) => [item.id, item])),
    skills: new Map(contentBundle.skills.map((item) => [item.id, item]))
  };
}

export type ResourceView = {
  amazonUrl: string | null;
  resource: Resource;
  level: SkillResource["level"];
  reason: string;
  severity: Severity;
  versionLabel: string;
  messages: string[];
};

// 画面に出す形へ変換する。バージョンの判定は検証と同じ関数を使う。
export function getSkillResourceViews(skill: Skill): ResourceView[] {
  const context = getVersionContext();
  return skill.resources.flatMap((link) => {
    const resource = context.resources.get(link.resourceId);
    if (!resource) return [];
    if (resource.type === "book") {
      const evaluation = evaluateBookForSkill(resource, skill, link, context);
      const amazonUrl = isAffiliateEnabled() ? amazonUrlForBook(resource, affiliateConfig.associateTag) : null;
      return [{ resource, amazonUrl, level: link.level, reason: link.reason, severity: evaluation.severity, versionLabel: versionLabel(resource, evaluation), messages: evaluation.messages }];
    }
    const evaluation = evaluateNonBookResource(resource);
    const label = resource.type === "certification" && resource.examVersion ? `現行の試験：${resource.examVersion}` : "";
    return [{ resource, amazonUrl: null, level: link.level, reason: link.reason, severity: evaluation.severity, versionLabel: label, messages: evaluation.messages }];
  });
}

export function getGoalData(slug: string) {
  const goal = contentBundle.goals.find((item) => item.slug === slug && item.published);
  if (!goal) return null;
  const domain = contentBundle.domains.find((item) => item.id === goal.domainId);
  if (!domain) return null;
  const route = buildGoalRoute(goal, contentBundle.skills);
  const skillMap = new Map(contentBundle.skills.map((item) => [item.id, item]));
  const relatedSituations = contentBundle.situations.filter((item) => item.published && goal.relatedSituationIds.includes(item.id));
  return { goal, domain, route, skillMap, relatedSituations };
}

export function getSkillBySlug(slug: string) {
  return contentBundle.skills.find((item) => item.slug === slug);
}

export function getAllSkills() {
  return contentBundle.skills.filter((skill) => skill.status !== "planned");
}

export function getGoalStats() {
  return { published: contentBundle.goals.filter((goal) => goal.published).length, total: contentBundle.goals.length, domains: contentBundle.domains.length };
}

export function getGoalsUsingSkill(skillId: string) {
  return getPublishedGoals().filter((goal) => {
    const route = buildGoalRoute(goal, contentBundle.skills);
    const ids = [...route.steps, ...route.branches.flatMap((branch) => branch.options.flatMap((option) => option.steps))].map((skill) => skill.id);
    return ids.includes(skillId);
  });
}

export function getGoalsSkippingSkill(skillId: string) {
  return getPublishedGoals().filter((goal) => goal.notNeededNow.some((item) => item.skillId === skillId));
}

// 書籍一覧で表示する、本ごとのバージョン注記（紐づく学ぶもののうち、いちばん厳しい判定）。
export function getBookAmazonUrls(): Record<string, string> {
  if (!isAffiliateEnabled()) return {};
  const urls: Record<string, string> = {};
  for (const resource of contentBundle.resources) {
    const url = amazonUrlForBook(resource, affiliateConfig.associateTag);
    if (url) urls[resource.id] = url;
  }
  return urls;
}

export function getBookVersionNotes(): Record<string, { severity: Severity; label: string; messages: string[] }> {
  const notes: Record<string, { severity: Severity; label: string; messages: string[] }> = {};
  const order: Severity[] = ["ok", "warn", "block"];
  for (const skill of contentBundle.skills) {
    for (const view of getSkillResourceViews(skill)) {
      if (view.resource.type !== "book") continue;
      const current = notes[view.resource.id];
      if (!current || order.indexOf(view.severity) > order.indexOf(current.severity)) {
        notes[view.resource.id] = { severity: view.severity, label: view.versionLabel, messages: view.messages };
      }
    }
  }
  return notes;
}
