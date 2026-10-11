import { describe, expect, it } from "vitest";
import { loadContent, loadManifest } from "../scripts/lib/load-content";
import { validateBundle } from "../scripts/lib/validate-bundle";
import { getFeaturedSituationChoices, getVisibleSituationCategories } from "@/lib/situation-categories";

describe("content validation", () => {
  it("passes schemas, references, evidence gates and decision snapshots", () => {
    const report = validateBundle(loadContent(), loadManifest().minimums);
    expect(report.counts.situations).toBe(1);
    expect(report.counts.goals).toBeGreaterThanOrEqual(3);
    expect(report.counts.rules).toBeGreaterThanOrEqual(loadManifest().minimums.rules);
  });

  it("places every published situation in one visible category", () => {
    const published = loadContent().situations.filter((situation) => situation.published);
    const grouped = getVisibleSituationCategories(published).flatMap((category) => category.situations);
    expect(grouped.map((situation) => situation.id).sort()).toEqual(published.map((situation) => situation.id).sort());
    expect(new Set(grouped.map((situation) => situation.id)).size).toBe(published.length);
  });

  it("keeps the home selection bounded while representing every visible category", () => {
    const published = loadContent().situations.filter((situation) => situation.published);
    const categories = getVisibleSituationCategories(published);
    const featured = getFeaturedSituationChoices(categories);
    expect(featured.length).toBeLessThanOrEqual(12);
    expect(new Set(featured.map(({ situation }) => situation.id)).size).toBe(featured.length);
    expect(new Set(featured.map(({ categoryTitle }) => categoryTitle))).toEqual(new Set(categories.map(({ title }) => title)));
  });

  it("requires complete display and direct-source data for every book", () => {
    const books = loadContent().resources.filter((resource) => resource.type === "book");
    expect(books.length).toBeGreaterThan(0);
    expect(new Set(books.map((book) => book.url)).size).toBe(books.length);
    for (const book of books) {
      expect(book.url).toMatch(/^https:\/\//);
      expect(book.url).not.toMatch(/amazon\.[^/]+\/s\?/);
      if (book.amazonUrl) expect(book.amazonUrl).not.toMatch(/amazon\.[^/]+\/s\?/);
      expect(book.authors?.length).toBeGreaterThan(0);
      expect(book.language).toBeTruthy();
      expect(book.bookTopicIds?.length).toBeGreaterThan(0);
      // 表紙は任意。載せる場合だけ出典まで揃える。
      if (book.coverImageUrl) {
        expect(book.coverImageUrl).toMatch(/^https:\/\//);
        expect(book.coverImageAlt).toBeTruthy();
        expect(book.coverSourceName).toBeTruthy();
        expect(book.coverSourceUrl).toMatch(/^https:\/\//);
      }
    }
  });

  it("links every book from at least one approach (orphans are deleted, not reattached)", () => {
    const content = loadContent();
    const referencedIds = new Set([
      ...content.approaches.flatMap((approach) => approach.learningPath.map((step) => step.resourceId)),
      ...content.skills.flatMap((skill) => skill.resources.map((link) => link.resourceId))
    ]);
    const books = content.resources.filter((resource) => resource.type === "book");
    for (const book of books) {
      expect(
        referencedIds.has(book.id),
        `${book.id} はどの実装案からも使われていません。無関係な案へ付け替えず、ファイルを削除してください。`
      ).toBe(true);
    }
  });

  it("gives every learning step a reason written for that approach", () => {
    for (const approach of loadContent().approaches) {
      for (const step of approach.learningPath) {
        expect(step.reason.length, `${approach.id} → ${step.resourceId}`).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("offers an always-visible starting resource for every approach", () => {
    for (const approach of loadContent().approaches) {
      expect(
        approach.learningPath.some((step) => step.stage === "start" && step.showWhenAny.length === 0),
        `${approach.id} needs a start resource`
      ).toBe(true);
    }
  });

  it("rejects a book whose topics do not overlap with the approach", () => {
    // 2026-10時点で実際に起きた事故の再発防止：HTMLの本をmodel-viewerの案へ付け替えるとCIで止まること。
    const content = loadContent();
    const unrelatedBook = {
      id: "book-unrelated-html",
      type: "book" as const,
      title: "HTMLの本",
      url: "https://example.com/book-unrelated-html",
      authors: ["著者"],
      language: "日本語",
      bookTopicIds: ["accessibility" as const],
      description: "HTMLの構文と意味、WAI-ARIAを扱う本。",
      technologyIds: ["html"],
      concepts: ["semantic-html", "wai-aria"],
      currentUse: "HTMLの基礎を確認する。",
      limitations: "テスト用の架空の本。",
      targetVersions: [],
      usesLegacySkillIds: [],
      syllabusUrls: []
    };
    const approaches = content.approaches.map((approach) => approach.id === "model-viewer-product"
      ? { ...approach, learningPath: [...approach.learningPath, { resourceId: unrelatedBook.id, stage: "stuck" as const, reason: "理由を書いても、関連のない本は通らないことを確認する。", showWhenAny: [] }] }
      : approach);
    expect(() => validateBundle({ ...content, approaches, resources: [...content.resources, unrelatedBook] }))
      .toThrow(/model-viewer-product → book-unrelated-html/);
  });

  it("only uses conditions that the situation allows to show a resource", () => {
    const content = loadContent();
    const approaches = content.approaches.map((approach) => approach.id === "threejs-gltf-product"
      ? { ...approach, learningPath: approach.learningPath.map((step) => step.resourceId === "book-real-time-rendering" ? { ...step, showWhenAny: ["not-a-condition"] } : step) }
      : approach);
    expect(() => validateBundle({ ...content, approaches })).toThrow(/uses missing condition not-a-condition/);
  });

  it("rejects a goal that puts a legacy skill (jQuery) in its route", () => {
    const content = loadContent();
    const goals = content.goals.map((goal) => goal.id === "homepage"
      ? { ...goal, skillIds: [...goal.skillIds, "jquery"], notNeededNow: goal.notNeededNow.filter((item) => item.skillId !== "jquery") }
      : goal);
    expect(() => validateBundle({ ...content, goals })).toThrow(/cannot include legacy skill jquery/);
  });

  it("rejects a duplicate goal written with different wording", () => {
    const content = loadContent();
    const original = content.goals.find((goal) => goal.id === "homepage")!;
    const duplicate = { ...original, id: "homepage-copy", slug: "homepage-copy", title: "ホームページを 作りたい！", aliases: [] };
    expect(() => validateBundle({ ...content, goals: [...content.goals, duplicate] })).toThrow(/duplicates goal homepage/);
  });

  it("rejects a prerequisite cycle", () => {
    const content = loadContent();
    const skills = content.skills.map((skill) => skill.id === "web-basics" ? { ...skill, prerequisites: ["javascript-basics"] } : skill);
    expect(() => validateBundle({ ...content, skills })).toThrow(/Prerequisite cycle/);
  });

  it("rejects an intro book that is two major versions behind for a fast-changing skill", () => {
    const content = loadContent();
    const resources = content.resources.map((resource) => resource.id === "book-ichiban-wordpress-7e"
      ? { ...resource, targetVersions: [{ technologyId: "wordpress", version: "5.x" }] }
      : resource);
    expect(() => validateBundle({ ...content, resources })).toThrow(/2世代以上前/);
  });

  it("rejects an exam book written for an old exam version", () => {
    const content = loadContent();
    const resources = content.resources.map((resource) => resource.id === "book-saitan-linuc1-v10"
      ? { ...resource, targetExam: { certificationId: "cert-linuc-level1", version: "4.0" } }
      : resource);
    expect(() => validateBundle({ ...content, resources })).toThrow(/現行の試験は10\.0/);
  });

  it("shows the school guidance only for school-eligible domains", () => {
    const content = loadContent();
    const eligible = new Set(content.domains.filter((domain) => domain.schoolEligible).map((domain) => domain.id));
    expect(eligible.has("web")).toBe(true);
    expect(eligible.has("security")).toBe(false);
    expect(eligible.has("infra-ops")).toBe(false);
  });

  it("keeps every domain populated as the article collection grows", () => {
    const content = loadContent();
    expect(content.domains).toHaveLength(20);
    for (const domain of content.domains) {
      expect(content.goals.filter((goal) => goal.domainId === domain.id).length, domain.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("does not publish a goal whose route still contains a planned skill", () => {
    const content = loadContent();
    const goals = content.goals.map((goal) => goal.id === "ios-app" ? { ...goal, published: true } : goal);
    expect(() => validateBundle({ ...content, goals })).toThrow(/uses planned skill swift-ios/);
  });

  it("uses the same reason for the same detour across goals", () => {
    const reasons = new Map<string, Set<string>>();
    for (const goal of loadContent().goals) {
      for (const item of goal.notNeededNow) {
        reasons.set(item.label, new Set([...(reasons.get(item.label) ?? []), item.reason]));
      }
    }
    for (const label of ["攻撃ツールの使い方から入ること", "後付けの対応ツールだけに頼ること", "Kubernetes", "iPhoneとAndroidを同時に学ぶこと", "複数のデザインツールを並行して覚えること"]) {
      expect(reasons.get(label)?.size, label).toBe(1);
    }
  });
});
