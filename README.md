# copilot-github-sandbox

A static, no-backend playground for learning GitHub Copilot and core
GitHub features — Actions, issues, pull requests, secrets, and security
tooling — by building things inside it.

No personal data, no database — just a plain HTML/JS/CSS front end that
Copilot can extend.

> This repo is intentionally basic and low-stakes: a place to practice
> the mechanics without worrying about breaking anything "real." A
> separate, security-focused portfolio project builds on what's learned
> here.

## Structure

```
/index.html   - single page with a demo input/output
/script.js    - functions Copilot will help you write and extend
/style.css    - minimal styling
/LICENSE      - MIT license
/.gitignore
/.github/workflows/ci.yml      - lint (HTMLHint) + syntax-check (matrix build across Node versions)
/.github/workflows/deploy.yml  - deploys to GitHub Pages on push to main
/.github/CODEOWNERS             - routes all changes through a required reviewer
/.github/PULL_REQUEST_TEMPLATE.md
/.github/ISSUE_TEMPLATE/feature.md
/.github/dependabot.yml         - weekly checks for outdated Action versions
/LEARNING_GUIDE.md - how-to-use / how-to-test walkthrough per feature area
/SUMMARY.md - what's in this repo and what else could be added
```

## Setup

1. Create the repo on GitHub (public, no template).
2. Clone it locally and drop these files in, preserving the folder
   structure above (the `.github/` files must stay nested exactly as
   shown for GitHub to recognize them).
3. Open the folder in VS Code with the GitHub Copilot extension enabled.
4. Start extending `script.js` — write a comment describing a function,
   let Copilot suggest it, then wire it into `index.html`.
5. In **Settings → Pages**, set Source to **GitHub Actions** so
   `deploy.yml` can publish the site (see Learning Guide §2 for the
   full push → configure → re-trigger order this needs).

## Learning roadmap

See `LEARNING_GUIDE.md` for a full "how to use / how to test" walkthrough
of each area below.

- [x] Add a second CI job (lint + matrix syntax-check)
- [x] Add CODEOWNERS and a PR template
- [x] Deploy to GitHub Pages
- [x] Enable branch protection via a ruleset — require PRs, require all
      4 status checks, require Code Owners review, with an admin
      bypass path for the solo-maintainer case (see Learning Guide §4)
- [ ] Get a Copilot-suggested function working end-to-end in the browser
- [ ] Open a pull request and try Copilot code review
- [ ] Add a repo secret and reference it in a workflow (e.g. a dummy API key)
- [ ] File an issue, then try assigning it to the Copilot coding agent
- [ ] Review Security tab findings (Dependabot, code scanning)
- [ ] Deliberately open a PR that fails CI (e.g. break `index.html`
      syntax), watch it fail, then fix it — proves the checks can
      actually catch something, not just pass
