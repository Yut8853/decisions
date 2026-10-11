import type { Resource, Skill, SkillResource, Technology } from "./types";

// 本のバージョンを、技術の現行版・資格の現行の試験版・刊行年と比べて判定する。
// 画面表示（バッジ）と公開前の検証（validate-bundle）の両方で同じ関数を使う。

export type VersionState = "current" | "previous" | "outdated" | "unknown";
export type Severity = "ok" | "warn" | "block";

export type TargetCheck = {
  technologyId: string;
  label: string;
  target: string;
  current: string | null;
  state: VersionState;
};

export type ExamCheck = {
  certificationId: string;
  certificationTitle: string;
  target: string;
  current: string | null;
  state: "current" | "outdated" | "unknown";
  revisionNote?: string;
};

export type BookEvaluation = {
  severity: Severity;
  messages: string[];
  // 編集者向けの注意（画面には出さず、検証の警告にだけ出す）
  editorNotes: string[];
  targets: TargetCheck[];
  exam?: ExamCheck;
  ageYears?: number;
};

export type VersionContext = {
  technologies: Map<string, Technology>;
  resources: Map<string, Resource>;
  skills: Map<string, Skill>;
  now?: Date;
};

// 中くらいに変化する技術で、注記なしに出せる刊行からの年数。
export const MEDIUM_VOLATILITY_MAX_AGE = 5;

export function majorOf(version: string): number | null {
  const match = version.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function compareVersion(target: string, current: string | null | undefined): VersionState {
  if (!current) return "unknown";
  const t = majorOf(target);
  const c = majorOf(current);
  if (t === null || c === null) return target.trim() === current.trim() ? "current" : "unknown";
  if (t >= c) return "current";
  if (c - t === 1) return "previous";
  return "outdated";
}

function raise(current: Severity, next: Severity): Severity {
  const order: Severity[] = ["ok", "warn", "block"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

export function evaluateBookForSkill(book: Resource, skill: Skill, link: SkillResource, context: VersionContext): BookEvaluation {
  const now = context.now ?? new Date();
  const messages: string[] = [];
  const editorNotes: string[] = [];
  let severity: Severity = "ok";

  // 1. 今は新しく学ばなくてよい技術（jQueryなど）を使っている本
  if (book.usesLegacySkillIds.length) {
    const names = book.usesLegacySkillIds.map((id) => context.skills.get(id)?.title ?? id).join("、");
    if (link.level === "intro") {
      severity = raise(severity, "block");
      messages.push(`入門の資料に、今は新しく学ばなくてよい技術（${names}）を使う本は置けません。`);
    } else {
      severity = raise(severity, "warn");
      messages.push(`一部に、今は新しく学ばなくてよい技術（${names}）を使う箇所があります。`);
    }
  }

  // 2. 対象バージョンと現行版の比較
  const targets: TargetCheck[] = book.targetVersions.map(({ technologyId, version }) => {
    const technology = context.technologies.get(technologyId);
    const current = technology?.currentVersion ?? null;
    return { technologyId, label: technology?.name ?? technologyId, target: version, current, state: compareVersion(version, current) };
  });
  for (const target of targets) {
    if (target.state === "outdated") {
      if (skill.volatility === "low") {
        severity = raise(severity, "warn");
        messages.push(`対象は${target.label} ${target.target}で、現行は${target.current}です。基本的な内容は共通ですが、画面や手順は違います。`);
      } else {
        severity = raise(severity, "block");
        messages.push(`対象が${target.label} ${target.target}で、現行の${target.current}より2世代以上前です。差し替えが必要です。`);
      }
    } else if (target.state === "previous") {
      severity = raise(severity, "warn");
      messages.push(`対象は${target.label} ${target.target}、現行は${target.current}です。${book.outdatedNote ?? "違う箇所は公式資料で確認してください。"}`);
    } else if (target.state === "unknown" && skill.volatility === "high") {
      editorNotes.push(`${target.label}の現行バージョンが technology-registry.yml に未記入です。確認して currentVersion を記入してください。`);
    }
  }

  // 3. 変化の速い技術は、対象バージョンの記録が必須
  if (skill.volatility === "high" && targets.length === 0 && !book.targetExam) {
    severity = raise(severity, "block");
    messages.push("変化の速い技術の本には、対象バージョン（targetVersions）の記録が必要です。");
  }

  // 4. 刊行年
  const ageYears = book.publishedYear ? now.getFullYear() - book.publishedYear : undefined;
  if (skill.volatility === "medium" && ageYears !== undefined && ageYears > MEDIUM_VOLATILITY_MAX_AGE) {
    if (book.outdatedNote) {
      severity = raise(severity, "warn");
      messages.push(book.outdatedNote);
    } else {
      severity = raise(severity, "block");
      messages.push(`刊行から${ageYears}年経っています。古くなった部分（outdatedNote）を書くか、新しい本に差し替えてください。`);
    }
  }

  // 5. 資格の対策本は、現行の試験の版に対応しているか
  let exam: ExamCheck | undefined;
  if (book.targetExam) {
    const certification = context.resources.get(book.targetExam.certificationId);
    if (!certification || certification.type !== "certification") {
      severity = raise(severity, "block");
      messages.push(`対象の資格 ${book.targetExam.certificationId} が登録されていません。`);
    } else {
      const current = certification.examVersion ?? null;
      const state = !current ? "unknown" : current.trim() === book.targetExam.version.trim() ? "current" : "outdated";
      exam = {
        certificationId: certification.id,
        certificationTitle: certification.title,
        target: book.targetExam.version,
        current,
        state,
        revisionNote: certification.revisionNote
      };
      if (state === "outdated") {
        severity = raise(severity, "block");
        messages.push(`${certification.title}の${book.targetExam.version}向けの本です。現行の試験は${current}のため使えません。`);
      }
      if (certification.revisionNote) {
        severity = raise(severity, "warn");
        messages.push(certification.revisionNote);
      }
    }
  }

  // 6. 新しい版の予定など
  if (book.editionNote) {
    severity = raise(severity, "warn");
    messages.push(book.editionNote);
  }

  return { severity, messages, editorNotes, targets, exam, ageYears };
}

// 本以外（公式資料・資格・講座）の注意書き。資格の改訂予定などを表示する。
export function evaluateNonBookResource(resource: Resource): { severity: Severity; messages: string[] } {
  if (resource.type === "certification" && resource.revisionNote) {
    return { severity: "warn", messages: [resource.revisionNote] };
  }
  return { severity: "ok", messages: [] };
}

export function versionLabel(book: Resource, evaluation: BookEvaluation): string {
  const parts: string[] = [];
  for (const target of evaluation.targets) {
    parts.push(`対象：${target.label} ${target.target}${target.current ? `／現行：${target.current}` : ""}`);
  }
  if (evaluation.exam) {
    parts.push(`対象：${evaluation.exam.certificationTitle} ${evaluation.exam.target}${evaluation.exam.current ? `／現行：${evaluation.exam.current}` : ""}`);
  }
  if (book.publishedYear) parts.push(`${book.publishedYear}年刊`);
  return parts.join("・");
}
