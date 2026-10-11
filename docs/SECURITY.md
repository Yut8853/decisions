# Automation security model

## Trust boundaries

- PromptとWeb Sourceはuntrusted input。
- AI outputはuntrusted structured proposal。
- Only deterministic parser, Zod Schema, Publisher Gate and CI may write publishable files.
- GitHub branch protection is the final repository boundary.
- Vercel deploys only Git commits; AI does not receive a Vercel production token.

## Secret rules

- `OPENAI_API_KEY` is a GitHub Actions Secret only.
- Do not put API Keys in `.env.example`, Prompt, Artifact, PR body, generated Content or Vercel public environment variables.
- Fork Pull Requests do not run workflows that receive Secrets.
- Avoid `pull_request_target` for code execution.

## Prompt injection

Researcher may read adversarial Web pages. The system Prompt requires JSON only, but that is not sufficient. Publisher Gate ignores shell commands, HTML, binaries and arbitrary paths. CandidatePackage can only populate approved Content entities.

## Dependency security

Dependabot checks npm and GitHub Actions. Review major updates through Preview and tests. Do not auto-merge dependency major updates.

## Incident

If a Secret is exposed, revoke it immediately, remove it from Git history, rotate related credentials, and inspect Workflow logs and AI Artifacts. Disabling the Workflow alone is insufficient.
