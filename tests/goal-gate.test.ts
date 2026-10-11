import { afterEach, describe, expect, it, vi } from "vitest";
import * as contentLoader from "../scripts/lib/load-content";
import { evaluateGoalGate } from "../scripts/ai/goal-gate";
import type { GoalReview } from "../scripts/ai/goal-contracts";
import type { FetchLike } from "../scripts/lib/book-lookup";

const approvedReview: GoalReview = {
  approved: true, summary: "ok", blockingIssues: [], orderProblems: [], detourProblems: [], bookProblems: [], versionProblems: [], requiredChanges: [], checkedUrls: []
};

const noNetwork: FetchLike = async () => ({ ok: false, status: 404, text: async () => "" });

const baseGoal = {
  id: "test-candidate-goal",
  slug: "test-candidate-goal",
  title: "商品の紹介ページを1枚作りたい",
  summary: "HTMLとCSSで、商品を紹介する縦長のページを1枚作るところまでを学びます。",
  kind: "build" as const,
  domainId: "web",
  aliases: ["ランディングページを作りたい"],
  published: true,
  skillIds: ["css"],
  branches: [],
  notNeededNow: [{ label: "JavaScript", reason: "まずは静的なページを1枚作れれば十分で、動きは後から足せます。" }],
  relatedSituationIds: [],
  lastReviewed: "2026-10-10",
  bodyMarkdown: "商品の紹介ページは、HTMLとCSSだけで作れます。まずは1枚を最後まで作り切ることを目標にします。"
};

describe("goal gate", () => {
  afterEach(() => vi.restoreAllMocks());

  it("approves a goal that reuses verified skills, but asks for human review while the domain has few goals", async () => {
    const existing = contentLoader.loadContent();
    const firstTwo = existing.goals.filter((goal) => goal.domainId === "web").slice(0, 2);
    vi.spyOn(contentLoader, "loadContent").mockReturnValueOnce({
      ...existing,
      goals: [...existing.goals.filter((goal) => goal.domainId !== "web"), ...firstTwo]
    });
    const { result } = await evaluateGoalGate({ schemaVersion: 1, goal: baseGoal, authorNotes: {} }, approvedReview, noNetwork);
    expect(result.blockingIssues).toEqual([]);
    expect(result.approved).toBe(true);
    expect(result.manualReviewRequired).toBe(true);
    expect(result.manualReviewReasons.join(" ")).toMatch(/最初の3本/);
  });

  it("rejects a goal that duplicates an existing one", async () => {
    const goal = { ...baseGoal, id: "homepage-2", slug: "homepage-2", title: "ホームページを作りたい", aliases: [] };
    const { result } = await evaluateGoalGate({ schemaVersion: 1, goal, authorNotes: {} }, approvedReview, noNetwork);
    expect(result.approved).toBe(false);
    expect(result.blockingIssues.join(" ")).toMatch(/duplicates goal homepage/);
  });

  it("rejects a new book that cannot be found in any bibliographic source", async () => {
    const book = {
      id: "book-ai-made-up",
      type: "book",
      title: "AIが考えた架空のCSS入門",
      url: "https://example.com/book",
      authors: ["架空の著者"],
      language: "日本語",
      publishedYear: 2026,
      isbn: "978-4-8156-1846-9",
      bookTopicIds: ["frontend"],
      description: "存在しない本を想定したテスト用データです。",
      technologyIds: ["css"],
      concepts: [],
      currentUse: "テスト用。",
      limitations: "架空。"
    };
    const candidate = {
      schemaVersion: 1,
      goal: baseGoal,
      newResources: [book],
      skillResourceAdditions: [{ skillId: "css", link: { resourceId: book.id, level: "practice", reason: "テスト用に、実在しない本を追加しようとしたケース。" } }],
      authorNotes: {}
    };
    const { result } = await evaluateGoalGate(candidate, approvedReview, noNetwork);
    expect(result.approved).toBe(false);
    expect(result.blockingIssues.join(" ")).toMatch(/book-ai-made-up: book verification not-found/);
  });

  it("rejects when the independent reviewer finds an ordering problem", async () => {
    const { result } = await evaluateGoalGate({ schemaVersion: 1, goal: baseGoal, authorNotes: {} }, { ...approvedReview, orderProblems: ["CSSの前にHTMLが必要"] }, noNetwork);
    expect(result.approved).toBe(false);
  });
});
