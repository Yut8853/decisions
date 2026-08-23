import type {
  Approach,
  ConditionDefinition,
  DecisionResult,
  DecisionWarning,
  ExcludedApproach,
  FiredRule,
  RankedApproach,
  Rule,
  Situation
} from "./types";

function matches(rule: Rule, active: Set<string>): boolean {
  const all = rule.when.all.every((id) => active.has(id));
  const any = rule.when.any.length === 0 || rule.when.any.some((id) => active.has(id));
  const none = rule.when.none.every((id) => !active.has(id));
  return all && any && none;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function labelFor(approach: Approach, rank: number): RankedApproach["label"] {
  if (rank === 0) return approach.defaultLabel === "fast" ? "最短" : "王道";
  if (approach.defaultLabel === "fast") return "最短";
  if (approach.defaultLabel === "specialized") return "条件付き推奨";
  return "別解";
}

export function decide(input: {
  situation: Situation;
  approaches: Approach[];
  rules: Rule[];
  conditions: ConditionDefinition[];
  activeConditionIds: string[];
}): DecisionResult {
  const { situation, approaches, rules, conditions } = input;
  const allowedConditions = new Set(situation.conditionIds);
  const active = new Set(input.activeConditionIds.filter((id) => allowedConditions.has(id)));
  const candidateIds = new Set(situation.approachIds);
  const candidates = approaches.filter((approach) => candidateIds.has(approach.id));
  const relevantRules = rules.filter((rule) => rule.situationId === situation.id && matches(rule, active));
  const firedRules = relevantRules.map((rule) => ({ ...rule, matched: true as const }));

  const warnings: DecisionWarning[] = [];
  const conditionMap = new Map(conditions.map((condition) => [condition.id, condition]));
  for (const conditionId of active) {
    const condition = conditionMap.get(conditionId);
    for (const conflictId of condition?.conflictsWith ?? []) {
      if (active.has(conflictId) && conditionId < conflictId) {
        warnings.push({
          id: `condition-conflict-${conditionId}-${conflictId}`,
          message: `${condition?.label ?? conditionId}と${conditionMap.get(conflictId)?.label ?? conflictId}は、両立のために優先順位の調整が必要です。`,
          evidenceIds: []
        });
      }
    }
  }

  for (const rule of relevantRules.filter((item) => item.effect.type === "warn")) {
    warnings.push({ id: rule.id, message: rule.reason, evidenceIds: rule.evidenceIds });
  }

  const requiredGroups = new Map<string, Set<string>>();
  for (const rule of relevantRules.filter((item) => item.effect.type === "require")) {
    const group = rule.effect.group ?? rule.id;
    if (!requiredGroups.has(group)) requiredGroups.set(group, new Set());
    if (rule.targetApproachId) requiredGroups.get(group)?.add(rule.targetApproachId);
  }

  const excludedIds = new Set<string>();
  for (const [_, required] of requiredGroups) {
    for (const candidate of candidates) {
      if (!required.has(candidate.id)) excludedIds.add(candidate.id);
    }
  }
  for (const rule of relevantRules.filter((item) => item.effect.type === "exclude")) {
    if (rule.targetApproachId) excludedIds.add(rule.targetApproachId);
  }

  const excluded: ExcludedApproach[] = candidates
    .filter((approach) => excludedIds.has(approach.id))
    .map((approach) => {
      const fired = relevantRules.filter((rule) =>
        rule.targetApproachId === approach.id && ["exclude", "require"].includes(rule.effect.type)
      );
      return {
        approach,
        reasons: unique(fired.map((rule) => rule.reason)),
        evidenceIds: unique(fired.flatMap((rule) => rule.evidenceIds)),
        firedRuleIds: fired.map((rule) => rule.id)
      };
    });

  const rankedBase = candidates
    .filter((approach) => !excludedIds.has(approach.id))
    .map((approach) => {
      const fired = relevantRules.filter((rule) => rule.targetApproachId === approach.id);
      const adjustment = fired.reduce((sum, rule) => {
        if (rule.effect.type === "boost") return sum + Math.abs(rule.effect.weight ?? 1);
        if (rule.effect.type === "penalize") return sum - Math.abs(rule.effect.weight ?? 1);
        return sum;
      }, 0);
      return {
        approach,
        score: approach.baseScore + adjustment,
        reasons: unique(fired.filter((rule) => ["boost", "penalize", "require"].includes(rule.effect.type)).map((rule) => rule.reason)),
        evidenceIds: unique(fired.flatMap((rule) => rule.evidenceIds)),
        firedRuleIds: fired.map((rule) => rule.id)
      };
    })
    .sort((a, b) => b.score - a.score || a.approach.title.localeCompare(b.approach.title, "ja"));

  const ranked: RankedApproach[] = rankedBase.map((item, index) => ({ ...item, label: labelFor(item.approach, index) }));

  if (ranked.length > 1 && Math.abs(ranked[0].score - ranked[1].score) <= 1) {
    warnings.push({
      id: "close-decision",
      message: "上位案の差は小さいため、単独の正解ではなく、優先したい条件で最終判断してください。",
      evidenceIds: unique([...ranked[0].evidenceIds, ...ranked[1].evidenceIds])
    });
  }

  return {
    situationId: situation.id,
    activeConditionIds: [...active],
    ranked,
    excluded,
    warnings,
    firedRules: firedRules as FiredRule[]
  };
}
