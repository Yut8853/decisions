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

## Files AI may create

- `content/situations`, `content/approaches`, `content/rules`, `content/evidence`, `content/resources`, `content/decisions`
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
