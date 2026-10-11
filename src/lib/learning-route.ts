import type { Goal, GoalBranch, Skill } from "./types";

// 学ぶ順番は、AIではなくプログラムが「先に必要なもの（prerequisites）」から組み立てる。
// 目標には「最終的に必要な学ぶもの」だけを書けば、前提は自動で前に並ぶ。

export function findPrerequisiteCycle(skills: Skill[]): string[] | null {
  const map = new Map(skills.map((skill) => [skill.id, skill]));
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  function visit(id: string): string[] | null {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "visiting") return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, "visiting");
    stack.push(id);
    for (const next of map.get(id)?.prerequisites ?? []) {
      const cycle = visit(next);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, "done");
    return null;
  }

  for (const skill of skills) {
    const cycle = visit(skill.id);
    if (cycle) return cycle;
  }
  return null;
}

// 指定した学ぶものと、その前提をすべて含めて、前提が先に来る順に並べる。
// alreadyLearned に含まれるものは結果から除く（分かれ道で、本ルートで学習済みのものを省くため）。
export function orderWithPrerequisites(targetIds: string[], skillMap: Map<string, Skill>, alreadyLearned: Set<string> = new Set()): Skill[] {
  const ordered: Skill[] = [];
  const seen = new Set<string>(alreadyLearned);

  function visit(id: string) {
    if (seen.has(id)) return;
    seen.add(id);
    const skill = skillMap.get(id);
    if (!skill) return;
    for (const prerequisite of skill.prerequisites) visit(prerequisite);
    ordered.push(skill);
  }

  for (const id of targetIds) visit(id);
  return ordered;
}

export type GoalRoute = {
  steps: Skill[];
  branches: {
    branch: GoalBranch;
    options: { label: string; note?: string; steps: Skill[] }[];
  }[];
};

export function buildGoalRoute(goal: Goal, skills: Skill[]): GoalRoute {
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const steps = orderWithPrerequisites(goal.skillIds, skillMap);
  const learned = new Set(steps.map((skill) => skill.id));
  return {
    steps,
    branches: goal.branches.map((branch) => ({
      branch,
      options: branch.options.map((option) => ({
        label: option.label,
        note: option.note,
        steps: orderWithPrerequisites(option.skillIds, skillMap, learned)
      }))
    }))
  };
}

// 目標の重複チェック用。表記ゆれ（全角半角、空白、記号、語尾）をそろえて比べる。
export function normalizeGoalText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\s・、。，．,.「」『』()（）!！?？/／-]/g, "")
    .replace(/(を作りたい|をつくりたい|を作る|になりたい|がしたい|をしたい|したい|を守りたい|たい)$/u, "");
}

export function findDuplicateGoals(goals: Goal[]): { a: string; b: string; term: string }[] {
  const owners = new Map<string, string>();
  const duplicates: { a: string; b: string; term: string }[] = [];
  for (const goal of goals) {
    const terms = new Set([goal.title, ...goal.aliases].map(normalizeGoalText).filter(Boolean));
    for (const term of terms) {
      const owner = owners.get(term);
      if (owner && owner !== goal.id) duplicates.push({ a: owner, b: goal.id, term });
      else owners.set(term, goal.id);
    }
  }
  return duplicates;
}
