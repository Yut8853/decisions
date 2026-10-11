import { describe, expect, it } from "vitest";
import { loadContent, loadManifest } from "../scripts/lib/load-content";
import { decide } from "@/lib/decision-engine";

const bundle = loadContent();
const minimums = loadManifest().minimums;
function run(slug: string, conditionIds: string[]) {
  const situation = bundle.situations.find((item) => item.slug === slug);
  if (!situation) throw new Error(`Missing situation ${slug}`);
  return decide({ situation, approaches: bundle.approaches, rules: bundle.rules, conditions: bundle.conditions, activeConditionIds: conditionIds });
}

describe("initial corpus", () => {
  it("contains the promised minimum scope", () => {
    expect(bundle.situations.length).toBeGreaterThanOrEqual(minimums.situations ?? 0);
    expect(bundle.approaches.length).toBeGreaterThanOrEqual(minimums.approaches ?? 0);
    expect(bundle.rules.length).toBeGreaterThanOrEqual(minimums.rules ?? 0);
    expect(bundle.evidence.length).toBeGreaterThanOrEqual(minimums.evidence ?? 0);
  });

  it("calculates a usable default result for every published situation", () => {
    for (const situation of bundle.situations.filter((item) => item.published)) {
      const result = run(situation.slug, situation.defaultConditionIds);
      expect(result.ranked[0]?.approach.id, situation.id).toBeTruthy();
    }
  });

  it("keeps every published preset aligned with the rule engine", () => {
    for (const preset of bundle.decisions.filter((item) => item.status === "published")) {
      const situation = bundle.situations.find((item) => item.id === preset.situationId);
      if (!situation) throw new Error(`Missing situation ${preset.situationId}`);
      const result = run(situation.slug, preset.conditionIds);
      expect(preset.expectedTopApproachIds, preset.id).toContain(result.ranked[0]?.approach.id);
    }
  });

  it("keeps a candidate for every non-conflicting pair of selectable conditions", () => {
    const conditionMap = new Map(bundle.conditions.map((condition) => [condition.id, condition]));
    for (const situation of bundle.situations.filter((item) => item.published)) {
      for (const [index, first] of situation.conditionIds.entries()) {
        for (const second of situation.conditionIds.slice(index + 1)) {
          const isConflict = conditionMap.get(first)?.conflictsWith.includes(second)
            || conditionMap.get(second)?.conflictsWith.includes(first);
          if (isConflict) continue;
          const result = run(situation.slug, [first, second]);
          expect(result.ranked.length, `${situation.id}: ${first} + ${second}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("ranks model-viewer first for AR + short deadline + simple display", () => {
    const result = run("3d-product-viewer", ["ar-required", "short-deadline", "simple-display", "mobile-priority"]);
    expect(result.ranked[0].approach.id).toBe("model-viewer-product");
  });

  it("excludes model-viewer when advanced custom visuals are required", () => {
    const result = run("3d-product-viewer", ["advanced-visuals", "existing-glsl-assets"]);
    expect(result.excluded.map((item) => item.approach.id)).toContain("model-viewer-product");
    expect(result.ranked[0].approach.id).toBe("threejs-gltf-product");
  });

});
