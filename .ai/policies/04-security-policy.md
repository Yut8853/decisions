# Automation security

- Secrets are available only to workflows in this repository; never log prompts containing secrets.
- Pull requests from forks do not receive AI or deployment secrets.
- `pull_request_target` is not used to execute untrusted code.
- Dependencies and GitHub Actions are pinned to major versions and reviewed by Dependabot.
- AI-generated shell commands are never executed. Only JSON content is accepted by the pipeline.
- External URLs are treated as untrusted content and never converted into executable code.
