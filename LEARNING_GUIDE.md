# Copilot GitHub Sandbox — Learning Guide

This guide walks through each feature area in the repo, written for someone
starting with very little GitHub/Copilot background. Each section has two
parts: **How to use it** (the setup/workflow) and **How to test it**
(how you confirm it actually worked, not just that you followed steps).

Work through these roughly in order — each one assumes the previous is done.
Sections 0–2 are foundational reference material, worth reading before you
start rather than only when you hit a wall.

---

## 0. Repo Settings vs. Account Settings

Easy to mix up, since both are literally called "Settings," and several
exercises in this guide only work once you're in the right one.

**Repo Settings** — anything specific to *this* repository: branch
rulesets, secrets, webhooks, Advanced Security (Dependabot/CodeQL),
CODEOWNERS enforcement, Pages deployment config.
- Go to the repo's main page → click the **Settings** tab along the top
  (next to Code, Issues, Pull requests, Actions).
- URL pattern: `github.com/<you>/<repo>/settings`

**Account Settings** — anything tied to *you* as a GitHub user, applies
across every repo: SSH/GPG signing keys, your profile, deploy keys are
the one exception (those are repo-level despite living visually near
personal key management — see the Findings section below for that trap).
- Click your **profile picture/avatar** in the very top-right corner of
  any GitHub page → **Settings** from that dropdown.
- URL pattern: `github.com/settings/...` (no repo name in the path)

Quick way to tell which one you're in at a glance: check the URL. If it
has your username and repo name in it, you're in repo settings. If it's
just `github.com/settings/...`, you're in account settings.

---

## 1. Git Command Cheat Sheet

The commands that came up repeatedly while working through this repo,
grouped by what they're for. PowerShell and bash/zsh syntax is identical
for all of these — only file-path commands elsewhere in this guide
differ by OS.

**Checking status:**
```
git status                    # what's staged/modified/clean
git log --oneline -5          # last 5 commits, one line each
git log --oneline -- <file>   # every commit that touched a specific file
```

**Undoing a local commit that got rejected by a push** (safe — it never
reached GitHub, so nothing shared is affected):
```
git reset --soft HEAD~1       # undo the commit, keep the changes staged
git restore --staged <file>   # unstage
git checkout <file>           # discard the changes entirely
```

**Doing a change properly via branch → PR** (the repeated pattern for
everything protected by the ruleset):
```
git checkout -b <branch-name>
git add <file>
git commit -m "type: description"
git push origin <branch-name>
```
Then open the PR on GitHub, let checks pass, review/merge.

**Cleaning up after a PR merges:**
```
git checkout main
git pull
git branch -d <branch-name>
```

**If a direct push to `main` gets rejected by the ruleset**, that's
expected — it means the ruleset is working. Don't fight it; redo the
same change through the branch → PR pattern above.

---

## 2. Writing Commit Messages

Not a GitHub feature exactly, but a real skill this repo is a good
place to practice — and one that has nothing to do with git mechanics,
so it's easy to neglect. Worth having down before you're deep into the
sections below generating a lot of commits.

### How to use it

A format that works for almost everything:
```
<type>: <what changed, imperative mood>
```
"Imperative mood" means write it as an instruction — "Add lint job,"
not "Added lint job" or "Adds lint job." Git's own auto-generated
commits (merges, reverts) use this style, so it reads consistently
alongside them.

Common `type` prefixes (the "Conventional Commits" pattern — not
mandatory, but a solid default, and Copilot Chat follows it well if
you ask it to write a commit message in this style):
- `feat:` — a new capability
- `fix:` — fixing something broken
- `docs:` — documentation only
- `chore:` — maintenance, config, no behavior change
- `ci:` — CI/workflow changes specifically

For a commit doing several related things, add a body after a blank
line, as bullet points — the short summary line is what shows in
`git log --oneline` and GitHub's commit list; the body is there for
anyone who wants the detail without opening the diff.

### How to test it

Not something to "test" in the pass/fail sense — the practical check
is: six months from now, does `git log --oneline` read like a
changelog someone could understand without you there to explain it?
If a commit message needs more than one sentence to describe and
you're struggling to write it, that's often a signal the commit itself
is doing too many unrelated things — worth splitting, not just
wordsmithing a better sentence for it.

---

## 3. GitHub Copilot in VS Code

### How to use it
1. Open the repo folder in VS Code.
2. Make sure the **GitHub Copilot** and **GitHub Copilot Chat** extensions
   are installed and you're signed in (bottom-right status bar shows a
   Copilot icon — click it to check sign-in status).
3. In `script.js`, write a comment describing a function you want, e.g.:
   ```
   // Returns true if the input string is a palindrome
   ```
4. Press Enter on a new line below the comment and pause — Copilot will
   suggest a function body as greyed-out "ghost text."
5. Press `Tab` to accept the suggestion, or keep typing to ignore it.

### How to test it
- Add a button and output line in `index.html` that calls your new
  function, then open the page in a browser and check the result matches
  what you expect for a few sample inputs (including edge cases, like an
  empty string).
- If Copilot's suggestion doesn't work, that's a normal and useful
  outcome — debugging a wrong suggestion teaches you more than accepting
  a correct one on the first try.

---

## 4. GitHub Actions & Runners

**What it is:** Actions run automated jobs (like linting or testing) on
GitHub's servers ("runners") whenever something happens in your repo,
like a push or a pull request.

### How to use it
1. `.github/workflows/ci.yml` already has three real jobs:
   - **lint** — runs HTMLHint against `index.html`
   - **syntax-check** — a **matrix build**: runs `node --check
     script.js` across three Node versions (18, 20, 22) in parallel.
     This is the part that demonstrates multiple *runners* working at
     once, not just multiple steps in one job.
   - **secrets-check** — see section 7.
2. `.github/workflows/deploy.yml` deploys the site to GitHub Pages on
   every push to `main`. **Order matters the first time:** push the
   workflow file first, *then* set Pages source to "GitHub Actions" in
   Settings, then re-trigger — see Findings §F1 below for why.
3. Commit and push (via a branch + PR once the ruleset is active — see
   section 6).

### How to test it
1. Go to your repo on GitHub → **Actions** tab.
2. Expand **syntax-check** and confirm you see three separate parallel
   jobs, one per Node version in the matrix (this is the "Runners"
   plural lesson: each matrix entry runs on its own runner instance).
3. A green checkmark means it passed; a red X means it failed — click
   into the failed step to read the log and see exactly what broke.
4. To confirm the checks are *actually* catching problems, not just
   always passing: deliberately break something (an unclosed HTML tag
   for the lint job, a stray bracket in `script.js` for the
   syntax-check job), push it, and confirm the relevant job fails.
   Then fix it and confirm it passes again.
5. Once `CODEOWNERS` and a ruleset requiring status checks are set up
   (see section 6), try opening a PR that fails one of these checks —
   confirm GitHub visibly blocks merging until it's fixed.

---

## 5. Issues & Pull Requests

**What it is:** Issues track things you want to do or fix. Pull requests
(PRs) propose a code change and let you review it before merging into
`main`.

### How to use it
1. On GitHub, go to the **Issues** tab → **New issue**. Describe a small
   feature, e.g. "Add a dark mode toggle."
2. Create a new branch locally: `git checkout -b add-dark-mode`.
3. Make the change (with Copilot's help), commit, and push the branch:
   `git push -u origin add-dark-mode`.
4. On GitHub, you'll see a prompt to **Compare & pull request** — click
   it, link the issue by writing `Closes #<issue-number>` in the PR
   description, and open the PR.

### How to test it
- Confirm the PR page shows your commits and a diff of the exact lines
  changed — read through it as if you were someone else reviewing your
  code.
- Merge the PR, then check that the linked issue automatically closed
  (GitHub does this when you use "Closes #").
- Pull `main` locally (`git checkout main && git pull`) and confirm your
  change is there.

---

## 6. Code Quality & Review

**What it is:** Automated review comments and required checks before code
can be merged, so mistakes get caught before they reach `main`.

### How to use it
1. Go to repo **Settings → Copilot → Code review**, and enable automatic
   review on pull requests (available on your Enterprise license).
2. Go to **Rules → Rulesets → New ruleset → New branch ruleset**, name
   it (e.g. `main-protection`), and target the default branch.
3. Under **Branch rules**, enable:
   - **Restrict deletions**
   - **Block force pushes**
   - **Require a pull request before merging** — once checked, a
     sub-option appears for **Require review from Code Owners**; check
     that too, and set **Required approvals to 1** (it defaults to
     `0` — see Findings §F5).
   - **Require status checks to pass** — add every individual check,
     including each matrix job separately (see Findings §F4).
4. Set **Enforcement status** to **Active**.
5. Add **Repository admin** to the **Bypass list**, and set its mode to
   **"For pull requests only"** — not the default "Always allow." See
   Findings §F6 and §F7 for why this exact setting matters.

**Current, correct state of this repo:** bypass mode is **"For pull
requests only."** Direct pushes to `main` are blocked for everyone
including the admin; the only exception is bypassing the Code Owners
review requirement when merging your own PR (since GitHub never allows
self-approval, regardless of role). This matches the setting used in
`least-privilege-demo`.

### How to test it — full walkthrough, tested end to end
1. **Confirm a direct push to `main` is rejected:**
   ```
   echo "test" >> README.md
   git add README.md
   git commit -m "test: direct push to main should be blocked"
   git push origin main
   ```
   Expect a `GH013` rejection citing "Changes must be made through a
   pull request" and the required status checks. That rejection is the
   correct, passing result.
2. **Undo the local commit** — see the Cheat Sheet in section 1.
3. **Do it properly via a branch and PR** — same cheat-sheet pattern.
4. **Confirm the PR correctly shows both requirements:** all required
   status checks passing, and a **"Review required"** / **"Merging is
   blocked"** state citing the approval requirement.
5. **Confirm self-approval is genuinely blocked:** try to approve your
   own PR (Files changed → Review changes → Approve → Submit) — GitHub
   rejects this outright. Expected platform behavior, not a bug.
6. **Use the bypass path deliberately:** the PR should offer **"Merge
   without waiting for requirements to be met (bypass rules)"** as a
   distinct button. GitHub logs this as a bypass-merge in the PR
   timeline — a permanent, visible audit trail every time it's used.
7. Clean up (see Cheat Sheet).

The complete, correct lesson here isn't just "require review" — it's
**least-privilege enforcement with a documented, traceable exception
path for the case where there's genuinely no second reviewer**.

---

## 7. Secrets

**What it is:** Encrypted values (API keys, tokens) that workflows can use
without exposing them in your code or logs.

### How to use it
1. **Settings → Secrets and variables → Actions → New repository
   secret**. Name it `DUMMY_KEY`, any placeholder value.
2. In `ci.yml`, reference it in its own job (see Findings §F2 for why a
   block-scalar `run: |` matters here):
   ```yaml
   secrets-check:
     runs-on: ubuntu-latest
     steps:
       - name: Checkout repo
         uses: actions/checkout@v4
       - name: Check secret exists
         run: |
           echo "Secret is set: ${{ secrets.DUMMY_KEY != '' }}"
   ```
   Never `echo` the secret's actual value — only ever check presence.

### How to test it
- Push and check the Actions log — should print `Secret is set: true`,
  never the actual value.
- Delete the secret temporarily, re-run, confirm it now prints `false`
  — proves the check is real, not hardcoded.
- Re-add the secret afterward so the repo's back to its intended state.

---

## 8. Security (Dependabot & Code Scanning)

**What it is:** Automated scans that flag vulnerable dependencies
(Dependabot) and risky code patterns (CodeQL).

**Where this actually lives (repo Settings, not account Settings —
see section 0):** the older separate "Code security" page has been
folded into **Advanced Security**, under the repo's Settings sidebar.
Dependabot alerts/updates and Code scanning (CodeQL) both live on that
one combined page now.

### How to use it
1. Repo → **Settings → Advanced Security**.
2. Enable **Dependabot alerts** and **Dependabot security updates**.
3. Under **Code scanning**, click **Set up → Default** for one-click
   CodeQL (this repo doesn't need the custom-query "advanced setup"
   used in `least-privilege-demo`).
4. This repo has few dependencies, so Dependabot may be quiet at
   first — it becomes genuinely active once a real `package.json`
   exists (see section 4's matrix job, or add a test runner).

### How to test it
- Check the **Security** tab for a "CodeQL" scan result after your
  next push — even a clean result confirms the scan ran.
- Browse the [GitHub Advisory Database](https://github.com/advisories)
  for a known older vulnerable package version, install it on purpose,
  and confirm Dependabot opens an alert.
- **If Dependabot comments that it "can't parse your ci.yml"** — that
  means the workflow file had a YAML error at the time Dependabot
  tried to scan it (see Findings §F1–F3). Fix the YAML, then comment
  `@dependabot rebase` on the affected PR to force a re-check rather
  than waiting for the next scheduled run.

---

## 9. Webhooks

**What it is:** A webhook sends a live HTTP notification to an external
URL whenever something happens in your repo (push, PR opened, etc.) —
this is how GitHub talks to outside tools.

### How to use it
1. Go to [webhook.site](https://webhook.site) — unique URL, no setup.
2. Repo → **Settings → Webhooks → Add webhook**, paste that URL as the
   Payload URL, content type `application/json`.
3. Save — this immediately sends a **ping** payload (recognizable by
   `"zen": "..."` — one of GitHub's rotating quotes, sent only on
   webhook creation, not real events).

### How to test it
- Make a small commit and push — a real `push` payload appears.
- **Push payloads aren't all the same shape** — a normal commit, a
  branch being created, and a branch being deleted (e.g. after merging
  a PR) all trigger `push` events but with meaningfully different
  fields (`"deleted": true`, `"created": true`, empty `commits: []`,
  etc.). Worth noticing these differ rather than assuming one payload
  tells the whole story.
- Switch the webhook to **"Let me select individual events"**, add
  **Pull requests**, and open/merge a PR. This payload has a
  fundamentally different shape — an `"action"` field (`opened`,
  `closed`, etc.) and a `"merged"` boolean that push events never
  carry. Comparing this against the push payloads is the actual point
  of the exercise.

---

## Findings & Gotchas — everything discovered while building this

A reference index, not something to work through top to bottom. Come
back here when something breaks in a way that looks like the guide
above should have covered it — there's a good chance it's already
been hit and solved once.

**YAML / workflow files:**
- **F1 — Deploy order matters:** push `deploy.yml` *before* setting
  Pages source to "GitHub Actions" in Settings — there's nothing for
  the setting to point to otherwise. The first run after pushing may
  fail/skip; re-trigger once the setting's in place.
- **F2 — Colon-space breaks plain YAML scalars:** a `run:` line like
  `echo "Secret is set: ${{ ... }}"` can fail to parse because `: `
  (colon-space) is a YAML-reserved sequence. Fix: use block scalar
  style (`run: |` then indent the actual command on the next line).
- **F3 — Copy/paste from a formatted code block can inject a stray
  first line** (e.g. a language label like `YML` ending up as literal
  file content) — always check line 1 of a pasted file matches what
  you expect before committing.
- Matrix builds report each variant as its **own separate status
  check** (`syntax-check (18)`, `(20)`, `(22)` are three checks, not
  one) — required-checks lists need each one added individually.

**Rulesets / branch protection:**
- **F4** — see above (matrix checks).
- **F5 — Required approvals defaults to 0** even with "Require review
  from Code Owners" checked, which silently makes that checkbox
  meaningless. Set it to at least `1` explicitly.
- **F6 — GitHub never allows a PR author to approve their own PR**,
  regardless of role or permissions. On a solo repo with Code Owners
  review required, this is a genuine deadlock with no workaround
  except a bypass list.
- **F7 — Bypass list default mode is "Always allow,"** which exempts
  the bypassed role from the *entire* ruleset — including direct
  pushes to `main`, not just the review requirement. The correct,
  narrower setting for this use case is **"For pull requests only,"**
  which restores full direct-push protection while still resolving
  the self-approval deadlock during a PR merge. This was only caught
  because a webhook payload showed a direct push succeeding when it
  should have been rejected — a good example of why logging/
  observability catches things configuration review alone can miss.
- **Bot-authored PRs (Dependabot, the Copilot coding agent) don't hit
  the self-approval block** — you're not the author, so you can
  Approve them normally, no bypass needed. The bypass path is only
  for merging your *own* PRs.
- Push protection scans the **whole set of commits in a push**, not
  just the final file state — deleting a secret in a follow-up commit
  and pushing both together still gets blocked. Use `git commit
  --amend` or a reset to actually remove it from history instead.

**GitHub UI navigation:**
- **Deploy keys** (under repo Settings → Deploy keys) are a
  completely different feature from personal **SSH/GPG signing keys**
  (under account Settings → SSH and GPG keys) — deploy keys grant a
  single repo automated push/pull access; signing keys prove commit
  authorship. Easy to land on the wrong page since both involve "SSH
  key" terminology.
- The older separate "Code security" settings page has been folded
  into **Advanced Security** — see section 8.
- Secret scanning's push protection toggle is labeled **Enable /
  Disable**, not "On/Off."

**Secret scanning:**
- The common AWS example key (`AKIAIOSFODNN7EXAMPLE`) is allowlisted
  by GitHub and won't trigger push protection — it'll make the feature
  look broken when it isn't. Use a different fake pattern (e.g. a
  Slack-token-shaped string) to actually test it.

**Commit signing:**
- GPG signing on Windows has real agent/keyring (`keyboxd`) reliability
  issues — a key that's genuinely present can still fail with
  "Couldn't load public key." **SSH-based signing is more reliable on
  Windows** and reuses infrastructure you likely already have.
- Git config paths on Windows must use **forward slashes even in
  PowerShell** — backslashes get corrupted by Git's config-file escape
  handling, silently pointing at a path that doesn't exist.
- A signing key registered on GitHub only covers the machine whose
  private key matches it — a key added for one laptop doesn't cover
  another.

**Miscellaneous:**
- Node.js 20 deprecation warnings in Action logs (GitHub's own
  infrastructure notice) are not errors and don't need fixing.
- Dependabot PRs that fail to parse a broken `ci.yml` self-resolve
  once the file's fixed — comment `@dependabot rebase` to force an
  immediate re-check instead of waiting for the weekly schedule.

---

## Suggested order of attack

1. Sections 0–2 (Settings distinction, git cheat sheet, commit
   messages) — read once up front, refer back as needed.
2. Copilot basics (section 3) — do this continuously throughout.
3. Actions & Runners (section 4).
4. Issues & PRs (section 5).
5. Code quality & review (section 6) — builds directly on section 5.
6. Secrets (section 7).
7. Security (section 8).
8. Webhooks (section 9) — no dependency on the others, do it whenever.
9. Findings & Gotchas — not a step, a reference to return to.
