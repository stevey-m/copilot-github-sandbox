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
/.github/workflows/ci.yml  - starter Actions workflow
/LEARNING_GUIDE.md - how-to-use / how-to-test walkthrough per feature area
```

## Setup

1. Create the repo on GitHub (public, no template).
2. Clone it locally and drop these files in — `ci.yml` goes in
   `.github/workflows/ci.yml`.
3. Open the folder in VS Code with the GitHub Copilot extension enabled.
4. Start extending `script.js` — write a comment describing a function,
   let Copilot suggest it, then wire it into `index.html`.

## Learning roadmap

See `LEARNING_GUIDE.md` for a full "how to use / how to test" walkthrough
of each area below.

- [ ] Get a Copilot-suggested function working end-to-end in the browser
- [ ] Open a pull request and try Copilot code review
- [ ] Add a second CI job (lint or basic test runner)
- [ ] Add a repo secret and reference it in a workflow (e.g. a dummy API key)
- [ ] Enable branch protection + required status checks
- [ ] File an issue, then try assigning it to the Copilot coding agent
- [ ] Review Security tab findings (Dependabot, code scanning)