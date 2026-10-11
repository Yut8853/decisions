import { describe, expect, it } from "vitest";
import { loadContent } from "../scripts/lib/load-content";
import { buildGoalRoute, findDuplicateGoals, findPrerequisiteCycle, normalizeGoalText } from "@/lib/learning-route";

describe("learning route", () => {
  const content = loadContent();
  const goal = (id: string) => content.goals.find((item) => item.id === id)!;

  it("fills prerequisites automatically and puts them first", () => {
    // 目標には javascript-basics しか書いていないが、前提が自動で前に並ぶ。
    const route = buildGoalRoute(goal("homepage"), content.skills);
    expect(route.steps.map((skill) => skill.id)).toEqual(["web-basics", "html", "css", "javascript-basics"]);
  });

  it("does not repeat skills already learned in the main route inside a branch", () => {
    const route = buildGoalRoute(goal("homepage"), content.skills);
    const yes = route.branches[0].options[0];
    expect(yes.steps.map((skill) => skill.id)).toEqual(["wordpress"]);
  });

  it("orders a route that mixes domains", () => {
    const route = buildGoalRoute(goal("company-security"), content.skills);
    const ids = route.steps.map((skill) => skill.id);
    expect(ids.indexOf("network-basics")).toBeLessThan(ids.indexOf("security-basics"));
    expect(ids.indexOf("web-basics")).toBeLessThan(ids.indexOf("web-app-security"));
    expect(ids.indexOf("security-basics")).toBeLessThan(ids.indexOf("web-app-security"));
  });

  it("detects prerequisite cycles", () => {
    expect(findPrerequisiteCycle(content.skills)).toBeNull();
    const broken = content.skills.map((skill) => skill.id === "html" ? { ...skill, prerequisites: ["css"] } : skill);
    expect(findPrerequisiteCycle(broken)).not.toBeNull();
  });

  it("normalizes wording differences when checking duplicate goals", () => {
    expect(normalizeGoalText("ホームページを作りたい")).toBe(normalizeGoalText("ホームページ を 作りたい！"));
    expect(findDuplicateGoals(content.goals)).toEqual([]);
  });
});
