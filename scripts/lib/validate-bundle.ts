import fs from "node:fs";
import path from "node:path";
import { decide } from "../../src/lib/decision-engine";
import type { ContentBundle } from "../../src/lib/types";
import { benchmarkResultSchema } from "../../src/lib/schemas";

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

  for (const approach of bundle.approaches) {
    if (approach.notRecommendedWhen.length === 0) errors.push(`${approach.id} requires notRecommendedWhen.`);
    for (const id of approach.resourceIds) if (!resourceIds.has(id)) errors.push(`${approach.id} references missing resource ${id}.`);
  }

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
