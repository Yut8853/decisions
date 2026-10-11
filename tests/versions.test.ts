import { describe, expect, it } from "vitest";
import { isValidIsbn } from "@/lib/schemas";
import { compareVersion, evaluateBookForSkill, type VersionContext } from "@/lib/versions";
import type { Resource, Skill } from "@/lib/types";

const baseBook: Resource = {
  id: "book-test",
  type: "book",
  title: "テスト用の本",
  url: "https://example.com/book",
  authors: ["著者"],
  language: "日本語",
  description: "テスト用の架空の本です。",
  technologyIds: ["wordpress"],
  concepts: [],
  currentUse: "テストに使う。",
  limitations: "架空。",
  publishedYear: 2025,
  targetVersions: [],
  usesLegacySkillIds: [],
  syllabusUrls: []
};

const skill = (volatility: Skill["volatility"]): Skill => ({
  id: "test-skill",
  slug: "test-skill",
  title: "テスト",
  summary: "テスト用の学ぶものです。十分な長さの説明。",
  canDo: "テストができるようになる。",
  domainIds: ["web"],
  prerequisites: [],
  volatility,
  technologyIds: ["wordpress"],
  status: "active",
  resources: [],
  lastReviewed: "2026-10-10"
});

const context: VersionContext = {
  technologies: new Map([["wordpress", { id: "wordpress", name: "WordPress", officialUrl: "https://wordpress.org/", volatility: "high", currentVersion: "7.0" }]]),
  resources: new Map([["cert-x", { ...baseBook, id: "cert-x", type: "certification", title: "試験X", examVersion: "10.0", syllabusUrls: ["https://example.com/s"] }]]),
  skills: new Map([["jquery", { ...skill("medium"), id: "jquery", title: "jQuery", status: "legacy", legacyNote: "今は新しく学ぶ必要がありません。十分な長さ。" }]]),
  now: new Date("2026-10-10")
};
const intro = { resourceId: "book-test", level: "intro" as const, reason: "テスト用の理由を二十文字以上で書いておく。" };

describe("version checks", () => {
  it("compares major versions", () => {
    expect(compareVersion("7.0", "7.0")).toBe("current");
    expect(compareVersion("6.x", "7.0")).toBe("previous");
    expect(compareVersion("5.x", "7.0")).toBe("outdated");
    expect(compareVersion("6.x", null)).toBe("unknown");
  });

  it("warns for one major version behind and blocks two behind (fast-changing skill)", () => {
    const previous = evaluateBookForSkill({ ...baseBook, targetVersions: [{ technologyId: "wordpress", version: "6.x" }] }, skill("high"), intro, context);
    expect(previous.severity).toBe("warn");
    const outdated = evaluateBookForSkill({ ...baseBook, targetVersions: [{ technologyId: "wordpress", version: "5.x" }] }, skill("high"), intro, context);
    expect(outdated.severity).toBe("block");
  });

  it("requires a target version for fast-changing skills", () => {
    expect(evaluateBookForSkill(baseBook, skill("high"), intro, context).severity).toBe("block");
    expect(evaluateBookForSkill(baseBook, skill("low"), intro, context).severity).toBe("ok");
  });

  it("blocks an old medium-volatility book without a note, warns with a note", () => {
    const old = { ...baseBook, publishedYear: 2018 };
    expect(evaluateBookForSkill(old, skill("medium"), intro, context).severity).toBe("block");
    expect(evaluateBookForSkill({ ...old, outdatedNote: "古くなった部分の説明をここに書く。" }, skill("medium"), intro, context).severity).toBe("warn");
  });

  it("blocks intro books that teach legacy technology (jQuery)", () => {
    const book = { ...baseBook, usesLegacySkillIds: ["jquery"] };
    expect(evaluateBookForSkill(book, skill("low"), intro, context).severity).toBe("block");
    expect(evaluateBookForSkill(book, skill("low"), { ...intro, level: "reference" }, context).severity).toBe("warn");
  });

  it("blocks exam books written for a different exam version", () => {
    const ok = evaluateBookForSkill({ ...baseBook, targetExam: { certificationId: "cert-x", version: "10.0" } }, skill("medium"), intro, context);
    expect(ok.severity).toBe("ok");
    const ng = evaluateBookForSkill({ ...baseBook, targetExam: { certificationId: "cert-x", version: "4.0" } }, skill("medium"), intro, context);
    expect(ng.severity).toBe("block");
  });

  it("validates ISBN check digits", () => {
    expect(isValidIsbn("978-4-8156-1846-9")).toBe(true);
    expect(isValidIsbn("978-4-8156-1846-0")).toBe(false);
    expect(isValidIsbn("4815618461")).toBe(true);
  });
});
