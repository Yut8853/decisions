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

  it("keeps organization login available with an existing IdP when external cloud sending is restricted", () => {
    const result = run("authentication-method", [
      "enterprise-sso-required",
      "external-service-restricted",
      "existing-organization-idp-available"
    ]);
    expect(result.ranked.map((item) => item.approach.id)).toEqual(["authm-external-oidc"]);
    expect(result.warnings.some((warning) => warning.id === "r-authm-external-oidc")).toBe(true);
  });

  it("does not assume a self-hosted IdP is low-maintenance when no existing IdP is available", () => {
    const result = run("authentication-method", ["external-service-restricted", "maintainability-priority"]);
    expect(result.ranked[0].approach.id).toBe("authm-passkey-webauthn");
    expect(result.ranked.find((item) => item.approach.id === "authm-external-oidc")?.firedRuleIds)
      .toContain("r-authm-missing-existing-idp");
  });

  it("requires the real prerequisites before ranking GitHub dependency checks or an active scan", () => {
    const ciOnly = run("web-security-check-priority", ["ci-available"]);
    expect(ciOnly.ranked[0].approach.id).toBe("secc-static-code-analysis");
    expect(ciOnly.warnings.some((warning) => warning.id === "r-secc-codeql-availability-warning")).toBe(true);
    expect(ciOnly.excluded.map((item) => item.approach.id)).toEqual(expect.arrayContaining([
      "secc-dependency-monitoring",
      "secc-dynamic-app-scan"
    ]));

    const authorized = run("web-security-check-priority", [
      "public-attack-surface",
      "ci-available",
      "authorized-security-test-environment"
    ]);
    expect(authorized.ranked[0].approach.id).toBe("secc-dynamic-app-scan");
  });

  it("excludes GitHub dependency monitoring when repository data cannot use an external cloud service", () => {
    const result = run("web-security-check-priority", [
      "dependency-risk-priority",
      "github-dependency-graph-available",
      "external-service-restricted",
      "ci-available",
      "codeql-use-authorized"
    ]);
    expect(result.excluded.map((item) => item.approach.id)).toContain("secc-dependency-monitoring");
    expect(result.ranked[0].approach.id).toBe("secc-static-code-analysis");
  });

  it("keeps field diagnostics and pre-release checks together when both are required", () => {
    const result = run("web-vitals-monitoring", ["per-session-diagnostics-required", "ci-regression-gate-required"]);
    expect(result.ranked.map((item) => item.approach.id)).toEqual(["wvm-self-rum", "wvm-lighthouse-ci"]);
    expect(result.warnings.some((warning) => warning.id === "r-wvm-field-ci-combination-warning")).toBe(true);
  });

  it("requires the pre-release check when public field data and a CI gate are both selected", () => {
    const result = run("web-vitals-monitoring", ["public-field-data-available", "ci-regression-gate-required"]);
    expect(result.ranked.map((item) => item.approach.id)).toEqual(["wvm-lighthouse-ci"]);
    expect(result.excluded.map((item) => item.approach.id)).toEqual(expect.arrayContaining([
      "wvm-public-crux",
      "wvm-self-rum"
    ]));
  });

  it("keeps error records inside the selected boundary when external sending is restricted", () => {
    const result = run("frontend-error-monitoring", ["external-service-restricted"]);
    expect(result.ranked[0].approach.id).toBe("fem-self-error-endpoint");
    expect(result.excluded.map((item) => item.approach.id)).toContain("fem-managed-error-service");
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

  it("excludes full canvas for SEO-first rich sites", () => {
    const result = run("seo-rich-3d", ["seo-priority", "content-heavy"]);
    expect(result.excluded.map((item) => item.approach.id)).toContain("full-canvas-three");
    expect(result.ranked[0].approach.id).toBe("dom-first-three-islands");
  });

  it("warns when short deadline and advanced visuals conflict", () => {
    const result = run("scroll-linked-3d", ["short-deadline", "advanced-visuals"]);
    expect(result.warnings.some((warning) => warning.id.includes("condition-conflict") || warning.id === "r-sc-short-advanced-warning")).toBe(true);
  });

  it("ranks instancing first for repeated dynamic objects", () => {
    const result = run("threejs-many-objects", ["large-object-count", "repeated-geometry", "dynamic-objects"]);
    expect(result.ranked[0].approach.id).toBe("threejs-instancing");
  });

  it("ranks static edge hosting first when static output is possible", () => {
    const result = run("hosting-runtime-selection", ["static-output-possible"]);
    expect(result.ranked[0].approach.id).toBe("static-edge-hosting");
  });

  it("ranks a headless CMS first for structured multi-channel content", () => {
    const result = run("cms-architecture-selection", ["structured-content-required", "multi-channel-delivery-required"]);
    expect(result.ranked[0].approach.id).toBe("headless-api-cms");
  });

  it("ranks build-time search first for an infrequently updated small site", () => {
    const result = run("site-search", ["infrequent-content-updates", "short-deadline", "small-team"]);
    expect(result.ranked[0].approach.id).toBe("build-time-static-search");
  });

  it("ranks a managed form service first for a basic small-team inquiry", () => {
    const result = run("secure-contact-form", ["short-deadline", "small-team", "maintainability-priority"]);
    expect(result.ranked[0].approach.id).toBe("managed-form-service");
  });

  it("ranks hosted search first when updates and relevance controls are required", () => {
    const result = run("site-search", ["frequent-content-updates", "advanced-search-relevance"]);
    expect(result.ranked[0].approach.id).toBe("hosted-search-service");
  });

  it("excludes hosted search when external data services are restricted", () => {
    const result = run("site-search", ["external-service-restricted"]);
    expect(result.excluded.map((item) => item.approach.id)).toContain("hosted-search-service");
    expect(result.excluded.map((item) => item.approach.id)).toContain("database-full-text-search");
  });

  it("ranks self-hosted search first for frequent updates without an external search service", () => {
    const result = run("site-search", ["frequent-content-updates", "external-service-restricted"]);
    expect(result.ranked[0].approach.id).toBe("self-hosted-search-service");
  });

  it("keeps advanced self-hosted search first while warning about limited operations capacity", () => {
    const result = run("site-search", [
      "advanced-search-relevance",
      "external-service-restricted",
      "infrequent-content-updates",
      "short-deadline",
      "small-team",
      "maintainability-priority"
    ]);
    expect(result.ranked[0].approach.id).toBe("self-hosted-search-service");
    expect(result.warnings.some((warning) => warning.id === "r-search-selfhost-capacity-warning")).toBe(true);
  });

  it("ranks database search first only when the searched data is in PostgreSQL", () => {
    const result = run("site-search", ["existing-postgresql-database"]);
    expect(result.ranked[0].approach.id).toBe("database-full-text-search");
  });

  it("ranks the existing backend first for a complex form workflow", () => {
    const result = run("secure-contact-form", ["complex-form-workflow", "existing-application-backend"]);
    expect(result.ranked[0].approach.id).toBe("application-backend-form");
  });

  it("ranks an application backend first when a complex workflow requires one", () => {
    const result = run("secure-contact-form", ["complex-form-workflow"]);
    expect(result.ranked[0].approach.id).toBe("application-backend-form");
  });

  it("warns about governance when a form receives confidential data", () => {
    const result = run("secure-contact-form", ["confidential-form-data", "small-team"]);
    expect(result.warnings.some((warning) => warning.id === "r-form-sensitive-warning")).toBe(true);
    expect(result.warnings.some((warning) => warning.id === "r-form-managed-data-review-warning")).toBe(true);
  });

  it("excludes static hosting when request-time processing is required", () => {
    const result = run("hosting-runtime-selection", ["request-time-processing-required"]);
    expect(result.excluded.map((item) => item.approach.id)).toContain("static-edge-hosting");
    expect(result.ranked[0].approach.id).toBe("serverless-function-hosting");
  });

  it("splits static delivery from a persistent worker when both are required", () => {
    const result = run("hosting-runtime-selection", ["static-output-possible", "persistent-worker-required"]);
    expect(result.ranked[0].approach.id).toBe("split-static-runtime-hosting");
  });

  it("splits static delivery from a custom runtime when both are required", () => {
    const result = run("hosting-runtime-selection", ["static-output-possible", "custom-runtime-required"]);
    expect(result.ranked[0].approach.id).toBe("split-static-runtime-hosting");
  });

  it("ranks serverless functions first for bursty request-time processing", () => {
    const result = run("hosting-runtime-selection", ["bursty-traffic", "request-time-processing-required"]);
    expect(result.ranked[0].approach.id).toBe("serverless-function-hosting");
  });

  it("ranks an integrated CMS first for visual editing without a frontend build", () => {
    const result = run("cms-architecture-selection", ["cms-layout-editing-required", "cms-direct-publishing-required"]);
    expect(result.ranked[0].approach.id).toBe("integrated-cms");
  });

  it("warns when new mutually exclusive conditions are selected together", () => {
    const search = run("site-search", ["frequent-content-updates", "infrequent-content-updates"]);
    const hosting = run("hosting-runtime-selection", ["static-output-possible", "request-time-processing-required"]);
    expect(search.warnings.some((warning) => warning.id.includes("condition-conflict"))).toBe(true);
    expect(hosting.warnings.some((warning) => warning.id.includes("condition-conflict"))).toBe(true);
  });

  it("warns when mandatory code review is combined with direct CMS publishing", () => {
    const result = run("cms-architecture-selection", ["content-code-review-required", "cms-direct-publishing-required"]);
    expect(result.warnings.some((warning) => warning.id === "r-cms-review-direct-warning")).toBe(true);
  });
});
