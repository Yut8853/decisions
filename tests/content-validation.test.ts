import { describe, expect, it } from "vitest";
import { loadContent, loadManifest } from "../scripts/lib/load-content";
import { validateBundle } from "../scripts/lib/validate-bundle";
import { getVisibleSituationCategories } from "@/lib/situation-categories";

describe("content validation", () => {
  it("passes schemas, references, evidence gates and decision snapshots", () => {
    const report = validateBundle(loadContent(), loadManifest().minimums);
    expect(report.counts.rules).toBeGreaterThanOrEqual(58);
  });

  it("places every published situation in one visible category", () => {
    const published = loadContent().situations.filter((situation) => situation.published);
    const grouped = getVisibleSituationCategories(published).flatMap((category) => category.situations);
    expect(grouped.map((situation) => situation.id).sort()).toEqual(published.map((situation) => situation.id).sort());
    expect(new Set(grouped.map((situation) => situation.id)).size).toBe(published.length);
  });
});
