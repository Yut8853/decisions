# AGENTS.md — AI execution contract

This repository is designed for AI-assisted creation, verification and publication. All agents must follow these rules.

## Required sequence

1. Read `README.md`, `docs/AI_OPERATIONS.md`, `.ai/policies/*`, and the affected content.
2. Run `pnpm content:validate` before editing.
3. Research current facts from primary sources. Do not rely on memory for versions or support status.
4. Create a branch. Never write to `main` directly.
5. Keep Situation → Condition → Rule → Approach → Evidence relations valid.
6. Add negative recommendations to every new Approach.
7. Never hand-write benchmark result numbers. Use `pnpm benchmark:run`.
8. Run `pnpm check` and, for UI changes, `pnpm test:e2e`.
9. Open a Pull Request with source URLs, unresolved issues, and a statement of what was not verified.
10. Publication occurs only after required checks and repository protection rules pass.

## Learning routes (goals)

Codexに記事追加を頼むときの詳しい手順は `.ai/codex/ADD_ARTICLES.md` にあります。記事を追加・変更する作業では、必ず先に読んでください。

- Write user-facing Japanese in plain, practical wording. Avoid poetic or abstract phrases.
- A goal lists only the final skills; prerequisites are ordered by the program. Never put a legacy skill in a route; list it in `notNeededNow`.
- Attach books to skills, not goals. Every link needs a reason written for that skill.
- Every new book needs an ISBN copied from a publisher or bookstore page, `publishedYear`, and `targetVersions` for fast-changing technologies. Run `pnpm books:verify`.
- Certifications are learning maps (syllabus), not a recommendation to take the exam.
- Never attach an unrelated book to satisfy a count or a language rule. Delete orphaned books instead.
- Use the print-edition ISBN. Never write `amazonUrl`; Amazon links are generated from the ISBN. Never choose books based on affiliate commission.
- Reuse the exact label and reason for a detour that already exists in another goal.
- Keep a goal `published: false` while any skill in its route is `status: planned`.

## Files AI may create

- `content/goals`, `content/skills`, `content/situations`, `content/approaches`, `content/rules`, `content/evidence`, `content/resources`, `content/decisions`
- `content/drafts`, `.ai/runs`, documentation and tests

## Files AI may not forge

- `content/benchmarks/results/*.json`
- audit history, Decision timestamps, reviewer approvals, CI status or provenance metadata

## Definition of done

- All references resolve.
- All Rule Evidence is verified and supports the Rule reason.
- The default and Preset Decisions are covered by tests.
- No user-visible fake numeric score.
- `pnpm check` succeeds.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
