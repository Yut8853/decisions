import fs from "node:fs";
import path from "node:path";
import { decide } from "../../src/lib/decision-engine";
import type { ContentBundle } from "../../src/lib/types";
import { benchmarkResultSchema } from "../../src/lib/schemas";
import { buildGoalRoute, findDuplicateGoals, findPrerequisiteCycle } from "../../src/lib/learning-route";
import { evaluateBookForSkill } from "../../src/lib/versions";

export type ValidationReport = {
  counts: Record<string, number>;
  warnings: string[];
};

function uniqueIds(items: { id: string }[], label: string, errors: string[]) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) errors.push(`Duplicate ${label} id: ${item.id}`);
    seen.add(item.id);
  }
}

export function validateBundle(bundle: ContentBundle, minimums: Record<string, number> = {}): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts = {
    goals: bundle.goals.length,
    skills: bundle.skills.length,
    domains: bundle.domains.length,
    situations: bundle.situations.length,
    approaches: bundle.approaches.length,
    rules: bundle.rules.length,
    evidence: bundle.evidence.length,
    resources: bundle.resources.length,
    conditions: bundle.conditions.length,
    decisions: bundle.decisions.length,
    benchmarks: bundle.benchmarks.length
  };

  for (const [key, minimum] of Object.entries(minimums)) {
    const current = counts[key as keyof typeof counts];
    if (typeof current === "number" && current < minimum) {
      errors.push(`${key} count ${current} is below manifest minimum ${minimum}.`);
    }
  }

  uniqueIds(bundle.domains, "domain", errors);
  uniqueIds(bundle.goals, "goal", errors);
  uniqueIds(bundle.skills, "skill", errors);
  uniqueIds(bundle.technologies, "technology", errors);
  uniqueIds(bundle.situations, "situation", errors);
  uniqueIds(bundle.approaches, "approach", errors);
  uniqueIds(bundle.rules, "rule", errors);
  uniqueIds(bundle.evidence, "evidence", errors);
  uniqueIds(bundle.resources, "resource", errors);
  uniqueIds(bundle.conditions, "condition", errors);
  uniqueIds(bundle.decisions, "decision", errors);
  uniqueIds(bundle.benchmarks, "benchmark", errors);

  const situationIds = new Set(bundle.situations.map((item) => item.id));
  const approachIds = new Set(bundle.approaches.map((item) => item.id));
  const evidenceMap = new Map(bundle.evidence.map((item) => [item.id, item]));
  const resourceIds = new Set(bundle.resources.map((item) => item.id));
  const conditionIds = new Set(bundle.conditions.map((item) => item.id));

  for (const situation of bundle.situations) {
    for (const id of situation.approachIds) if (!approachIds.has(id)) errors.push(`${situation.id} references missing approach ${id}.`);
    for (const id of situation.conditionIds) if (!conditionIds.has(id)) errors.push(`${situation.id} references missing condition ${id}.`);
    for (const id of situation.defaultConditionIds) if (!situation.conditionIds.includes(id)) errors.push(`${situation.id} default condition ${id} is not allowed by the situation.`);
  }

  const resourceMap = new Map(bundle.resources.map((item) => [item.id, item]));
  for (const approach of bundle.approaches) {
    if (approach.notRecommendedWhen.length === 0) errors.push(`${approach.id} requires notRecommendedWhen.`);

    // この実装案を含むSituationで使える条件だけを、本の表示条件に使える。
    const owningSituations = bundle.situations.filter((item) => item.approachIds.includes(approach.id));
    const approachTerms = new Set([...approach.technologyIds, ...approach.concepts]);
    const seen = new Set<string>();

    for (const step of approach.learningPath) {
      if (seen.has(step.resourceId)) errors.push(`${approach.id} lists ${step.resourceId} more than once.`);
      seen.add(step.resourceId);

      const resource = resourceMap.get(step.resourceId);
      if (!resourceIds.has(step.resourceId) || !resource) {
        errors.push(`${approach.id} references missing resource ${step.resourceId}.`);
        continue;
      }

      // 関連性チェック：資料の技術・概念が、実装案の技術・概念と一つも重ならないなら紐づけを拒否する。
      // 孤立した本をテストを通すために無関係な案へ付け替える、という事故を防ぐための最低限の関門。
      const overlaps = [...resource.technologyIds, ...resource.concepts].some((term) => approachTerms.has(term));
      if (!overlaps) {
        errors.push(
          `${approach.id} → ${step.resourceId}: 資料の technologyIds / concepts が実装案と一つも重なりません。` +
          "この案を作る人に必要な資料か見直してください（孤立した本は付け替えずに削除します）。"
        );
      }

      for (const conditionId of step.showWhenAny) {
        if (!conditionIds.has(conditionId)) errors.push(`${approach.id} → ${step.resourceId} uses missing condition ${conditionId}.`);
        for (const situation of owningSituations) {
          if (!situation.conditionIds.includes(conditionId)) {
            errors.push(`${approach.id} → ${step.resourceId} uses condition ${conditionId} not allowed by ${situation.id}.`);
          }
        }
      }
    }

    // どの条件でも必ず見える「最初に読む」資料を最低1件持たせる。
    if (!approach.learningPath.some((step) => step.stage === "start" && step.showWhenAny.length === 0)) {
      errors.push(`${approach.id} needs at least one always-visible "start" resource.`);
    }
  }

  validateLearning(bundle, errors, warnings);

  for (const rule of bundle.rules) {
    const situation = bundle.situations.find((item) => item.id === rule.situationId);
    if (!situation) errors.push(`${rule.id} references missing situation ${rule.situationId}.`);
    if (rule.targetApproachId && !approachIds.has(rule.targetApproachId)) errors.push(`${rule.id} references missing approach ${rule.targetApproachId}.`);
    if (rule.targetApproachId && situation && !situation.approachIds.includes(rule.targetApproachId)) errors.push(`${rule.id} target is outside situation approaches.`);
    for (const id of [...rule.when.all, ...rule.when.any, ...rule.when.none]) {
      if (!conditionIds.has(id)) errors.push(`${rule.id} references missing condition ${id}.`);
      if (situation && !situation.conditionIds.includes(id)) errors.push(`${rule.id} uses condition ${id} not allowed by ${situation.id}.`);
    }
    for (const id of rule.evidenceIds) {
      const evidence = evidenceMap.get(id);
      if (!evidence) errors.push(`${rule.id} references missing evidence ${id}.`);
      else if (evidence.verificationStatus !== "verified") errors.push(`${rule.id} uses evidence ${id} that is not verified.`);
    }
  }

  for (const condition of bundle.conditions) {
    for (const id of condition.conflictsWith) if (!conditionIds.has(id)) errors.push(`${condition.id} conflicts with missing condition ${id}.`);
  }

  for (const preset of bundle.decisions) {
    const situation = bundle.situations.find((item) => item.id === preset.situationId);
    if (!situation) {
      errors.push(`${preset.id} references missing situation ${preset.situationId}.`);
      continue;
    }
    const result = decide({
      situation,
      approaches: bundle.approaches,
      rules: bundle.rules,
      conditions: bundle.conditions,
      activeConditionIds: preset.conditionIds
    });
    const top = result.ranked[0]?.approach.id;
    if (!top || !preset.expectedTopApproachIds.includes(top)) {
      errors.push(`${preset.id} expected one of [${preset.expectedTopApproachIds.join(", ")}], calculated ${top ?? "none"}.`);
    }
  }

  for (const benchmark of bundle.benchmarks) {
    if (!situationIds.has(benchmark.situationId)) errors.push(`${benchmark.id} references missing situation.`);
    for (const id of benchmark.approachIds) if (!approachIds.has(id)) errors.push(`${benchmark.id} references missing approach ${id}.`);
  }

  const resultsDir = path.join(process.cwd(), "content", "benchmarks", "results");
  if (fs.existsSync(resultsDir)) {
    for (const file of fs.readdirSync(resultsDir).filter((name) => name.endsWith(".json"))) {
      try {
        benchmarkResultSchema.parse(JSON.parse(fs.readFileSync(path.join(resultsDir, file), "utf8")));
      } catch (error) {
        errors.push(`Invalid benchmark result ${file}: ${String(error)}`);
      }
    }
  }

  const staleCutoff = new Date();
  staleCutoff.setUTCMonth(staleCutoff.getUTCMonth() - 6);
  for (const evidence of bundle.evidence) {
    if (new Date(evidence.verifiedAt) < staleCutoff) warnings.push(`Evidence ${evidence.id} has not been verified within six months.`);
  }

  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join("\n- ")}`);
  return { counts, warnings };
}

// 目標・学ぶもの・資料の検証。AIが記事を増やしても、ここを通らなければ公開されない。
function validateLearning(bundle: ContentBundle, errors: string[], warnings: string[]) {
  const domainIds = new Set(bundle.domains.map((item) => item.id));
  const skillMap = new Map(bundle.skills.map((item) => [item.id, item]));
  const resourceMap = new Map(bundle.resources.map((item) => [item.id, item]));
  const technologyMap = new Map(bundle.technologies.map((item) => [item.id, item]));
  const situationIds = new Set(bundle.situations.map((item) => item.id));
  const context = { technologies: technologyMap, resources: resourceMap, skills: skillMap };

  for (const skill of bundle.skills) {
    for (const id of skill.domainIds) if (!domainIds.has(id)) errors.push(`skill ${skill.id} references missing domain ${id}.`);
    for (const id of skill.prerequisites) {
      if (id === skill.id) errors.push(`skill ${skill.id} lists itself as a prerequisite.`);
      if (!skillMap.has(id)) errors.push(`skill ${skill.id} references missing prerequisite ${id}.`);
      else if (skillMap.get(id)?.status === "legacy") errors.push(`skill ${skill.id} cannot require legacy skill ${id}.`);
      else if (skill.status === "active" && skillMap.get(id)?.status === "planned") errors.push(`active skill ${skill.id} cannot require planned skill ${id}.`);
    }

    if (skill.status === "active" && !skill.resources.some((item) => item.level === "intro")) {
      errors.push(`skill ${skill.id} needs at least one "intro" resource for beginners.`);
    }

    const skillTerms = new Set([skill.id, ...skill.technologyIds]);
    const seen = new Set<string>();
    for (const link of skill.resources) {
      if (seen.has(link.resourceId)) errors.push(`skill ${skill.id} lists ${link.resourceId} more than once.`);
      seen.add(link.resourceId);
      const resource = resourceMap.get(link.resourceId);
      if (!resource) {
        errors.push(`skill ${skill.id} references missing resource ${link.resourceId}.`);
        continue;
      }
      // 関連性チェック：資料の技術・概念が、学ぶものと一つも重ならなければ紐づけを拒否する。
      if (![...resource.technologyIds, ...resource.concepts].some((term) => skillTerms.has(term))) {
        errors.push(`skill ${skill.id} → ${resource.id}: 資料の technologyIds / concepts が学ぶものと重なりません。`);
      }
      if (resource.type === "book") {
        const evaluation = evaluateBookForSkill(resource, skill, link, context);
        const message = `skill ${skill.id} → ${resource.id}: ${evaluation.messages.join(" ")}`;
        if (evaluation.severity === "block") errors.push(message);
        else if (evaluation.severity === "warn") warnings.push(message);
        for (const note of evaluation.editorNotes) warnings.push(`skill ${skill.id} → ${resource.id}: ${note}`);
      }
      if (resource.type === "certification" && resource.revisionNote) {
        warnings.push(`skill ${skill.id} → ${resource.id}: ${resource.revisionNote}`);
      }
    }
  }

  const cycle = findPrerequisiteCycle(bundle.skills);
  if (cycle) errors.push(`Prerequisite cycle: ${cycle.join(" → ")}`);

  for (const resource of bundle.resources) {
    for (const id of resource.usesLegacySkillIds) {
      if (skillMap.get(id)?.status !== "legacy") errors.push(`${resource.id}: usesLegacySkillIds must point to a legacy skill (${id}).`);
    }
    for (const target of resource.targetVersions) {
      if (!technologyMap.has(target.technologyId)) errors.push(`${resource.id}: target technology ${target.technologyId} is not in technology-registry.yml.`);
    }
  }

  for (const goal of bundle.goals) {
    if (!domainIds.has(goal.domainId)) errors.push(`goal ${goal.id} references missing domain ${goal.domainId}.`);
    const referenced = [...goal.skillIds, ...goal.branches.flatMap((branch) => branch.options.flatMap((option) => option.skillIds))];
    for (const id of referenced) {
      const skill = skillMap.get(id);
      if (!skill) errors.push(`goal ${goal.id} references missing skill ${id}.`);
      else if (skill.status === "legacy") errors.push(`goal ${goal.id} cannot include legacy skill ${id} in its route. Put it in notNeededNow.`);
    }
    for (const id of goal.relatedSituationIds) if (!situationIds.has(id)) errors.push(`goal ${goal.id} references missing situation ${id}.`);

    if (!cycle) {
      const route = buildGoalRoute(goal, bundle.skills);
      const routeSkills = [...route.steps, ...route.branches.flatMap((branch) => branch.options.flatMap((option) => option.steps))];
      const routeIds = new Set(routeSkills.map((skill) => skill.id));
      if (goal.published) {
        for (const skill of routeSkills) {
          if (skill.status === "planned") errors.push(`goal ${goal.id} is published but uses planned skill ${skill.id} (本の確認が終わっていません).`);
        }
      }
      for (const item of goal.notNeededNow) {
        if (item.skillId && !skillMap.has(item.skillId)) errors.push(`goal ${goal.id} notNeededNow references missing skill ${item.skillId}.`);
        if (item.skillId && routeIds.has(item.skillId)) errors.push(`goal ${goal.id}: ${item.skillId} is both in the route and in notNeededNow.`);
      }
    }
  }

  for (const duplicate of findDuplicateGoals(bundle.goals)) {
    errors.push(`goal ${duplicate.b} duplicates goal ${duplicate.a} (「${duplicate.term}」). 別ページにせず、既存の目標の aliases に追加してください。`);
  }
}
