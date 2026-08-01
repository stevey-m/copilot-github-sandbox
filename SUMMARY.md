# copilot-github-sandbox — Summary & Suggested Additions

## What's in this package

| File | Purpose |
|---|---|
| `README.md` | Repo description, structure, setup, learning roadmap checklist |
| `LEARNING_GUIDE.md` | How-to-use / how-to-test walkthrough for each feature area |
| `index.html` / `script.js` / `style.css` | The static demo page |
| `.github/workflows/ci.yml` | **Updated:** real lint job (HTMLHint) + a matrix build (`syntax-check` runs across Node 18/20/22 in parallel) |
| `.github/workflows/deploy.yml` | **New:** deploys to GitHub Pages via OIDC on push to `main` |
| `.github/CODEOWNERS` | **New:** routes all changes through a required reviewer once a ruleset requires it |
| `.github/PULL_REQUEST_TEMPLATE.md` | **New:** lightweight PR checklist |
| `.github/dependabot.yml` | Weekly checks for outdated Action versions |
| `.github/ISSUE_TEMPLATE/feature.md` | Lightweight issue template tying tasks to Learning Guide sections |
| `LICENSE` | MIT license |
| `.gitignore` | Basic ignores |

**Not included:** the original planning conversation transcript
(`GitHub_Copilot_Playground_Transcript.md`) was previously kept in a
`docs/` folder — removed on review. It's a raw, unedited chat log
rather than something written for an audience, and adds no value to
someone evaluating the repo. Worth keeping for your own reference, just
not in the public repo.

## What changed since the last package

All six previously-recommended additions are now built:
1. ✅ Real lint job — HTMLHint replaces the placeholder `echo`
2. ✅ CODEOWNERS file
3. ✅ PR template
4. ✅ Matrix build — `syntax-check` runs in parallel across three Node
   versions, which is what actually demonstrates multiple *runners*
   (plural), not just multiple steps in one job
5. ✅ Pages deployment — `deploy.yml`, same OIDC-based pattern used in
   `least-privilege-demo`, adapted for this repo
6. **Not a file** — the "deliberately-broken PR" exercise is listed as
   a roadmap checklist item in `README.md` rather than something to
   build; it's a testing exercise you run once the checks above exist.
7. ✅ **New:** `LEARNING_GUIDE.md` §8 now documents commit message
   conventions (type prefixes, imperative mood, when to split a
   commit) — a real gap hit while pushing this exact set of changes.

## What this repo demonstrates now

A working environment covering:
- Copilot-assisted development in VS Code
- A two-job CI pipeline (lint + matrix syntax-check)
- Automated Pages deployment
- The scaffolding (CODEOWNERS, PR template) needed to practice
  review-gated merges once you enable a ruleset requiring them

## Suggested next additions (not yet built)

**Small, quick:**
- **A repo secret + reference it in a workflow** — Learning Guide §5
  covers this; no new file needed, just a settings step and one line
  added to a workflow.
- **Enable branch protection / a ruleset requiring the CI checks and
  CODEOWNERS review** — settings only, no files. This is what makes
  `CODEOWNERS` and the PR template actually *enforce* something rather
  than sit unused.

**Slightly bigger, worth deciding on:**
- **A real test runner** instead of just a syntax check — e.g. a
  couple of Vitest assertions on `script.js`'s functions. The current
  `node --check` step only confirms the file parses, not that it
  behaves correctly; a real test would close that gap. Bigger lift
  since it needs `package.json` and a test file, not just workflow YAML.
- **Copilot coding agent exercise** — file an issue, assign it to the
  agent, review its PR. No files to pre-build; this is entirely a
  hands-on exercise using what's already here.

**Explicitly not recommended for this repo:**
- Anything from the `least-privilege-demo` roadmap (RBAC, signed
  commits, CodeQL custom queries) — deliberately kept out to preserve
  the split between the low-stakes sandbox and the security-focused
  portfolio repo.
