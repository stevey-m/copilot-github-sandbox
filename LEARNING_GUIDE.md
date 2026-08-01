# Copilot GitHub Sandbox — Learning Guide

This guide walks through each feature area in the repo, written for someone
starting with very little GitHub/Copilot background. Each section has two
parts: **How to use it** (the setup/workflow) and **How to test it**
(how you confirm it actually worked, not just that you followed steps).

Work through these roughly in order — each one assumes the previous is done.

---

## 1. GitHub Copilot in VS Code

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

## 2. GitHub Actions & Runners

**What it is:** Actions run automated jobs (like linting or testing) on
GitHub's servers ("runners") whenever something happens in your repo,
like a push or a pull request.

### How to use it
1. `.github/workflows/ci.yml` already has two real jobs:
   - **lint** — runs HTMLHint against `index.html`
   - **syntax-check** — a **matrix build**: runs `node --check
     script.js` across three Node versions (18, 20, 22) in parallel.
     This is the part that demonstrates multiple *runners* working at
     once, not just multiple steps in one job.
2. `.github/workflows/deploy.yml` deploys the site to GitHub Pages on
   every push to `main` — see the Setup section in `README.md` for the
   push → configure Pages source → re-trigger order this needs the
   first time.
3. Commit and push.

### How to test it
1. Go to your repo on GitHub → **Actions** tab.
2. You should see both workflows run — expand **syntax-check** and
   confirm you see three separate parallel jobs, one per Node version
   in the matrix (this is the "Runners" plural lesson: each matrix
   entry runs on its own runner instance).
3. A green checkmark means it passed; a red X means it failed — click
   into the failed step to read the log and see exactly what broke.
4. To confirm the checks are *actually* catching problems, not just
   always passing: deliberately break something (an unclosed HTML tag
   for the lint job, a stray bracket in `script.js` for the
   syntax-check job), push it, and confirm the relevant job fails.
   Then fix it and confirm it passes again.
5. Once `CODEOWNERS` and a ruleset requiring status checks are set up
   (see §3), try opening a PR that fails one of these checks — confirm
   GitHub visibly blocks merging until it's fixed.

---

## 3. Issues & Pull Requests

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

## 4. Code Quality & Review

**What it is:** Automated review comments and required checks before code
can be merged, so mistakes get caught before they reach `main`.

### How to use it
1. Go to repo **Settings → Copilot → Code review**, and enable automatic
   review on pull requests (available on your Enterprise license).
2. Go to **Settings → Branches**, add a branch protection rule for
   `main` requiring the CI check to pass and at least one review before
   merging.
3. Open a new PR as in section 3 — Copilot will automatically leave
   review comments on it within a minute or two.

### How to test it
- Confirm the PR page shows a "Review required" or "Checks pending"
  state before you've satisfied the rules, and that the **Merge** button
  is disabled or shows a warning.
- Intentionally write a small, obviously improvable bit of code (an
  unused variable, a magic number) and confirm Copilot's review flags it.
- Satisfy the requirements and confirm the merge button becomes enabled.

---

## 5. Secrets

**What it is:** Encrypted values (API keys, tokens) that workflows can use
without exposing them in your code or logs.

### How to use it
1. Go to **Settings → Secrets and variables → Actions → New repository
   secret**. Name it `DUMMY_KEY` and set any placeholder value.
2. In `ci.yml`, add a step that references it:
   ```yaml
   - name: Check secret exists
     run: echo "Secret is set: ${{ secrets.DUMMY_KEY != '' }}"
   ```
   Never `echo` the secret's actual value — only ever check that it's
   present, like above.

### How to test it
- Push the change and check the Actions log — you should see
  `Secret is set: true`, and the actual value should never appear
  anywhere in the log (GitHub also auto-redacts it as `***` if you
  accidentally do print it).
- Remove the secret temporarily from repo settings, re-run the job, and
  confirm it now prints `false` — this proves the check is real, not
  just always saying `true`.

---

## 6. Security (Dependabot & Code Scanning)

**What it is:** Automated scans that flag vulnerable dependencies
(Dependabot) and risky code patterns (CodeQL).

### How to use it
1. Go to **Settings → Code security**, enable **Dependabot alerts**,
   **Dependabot security updates**, and **Code scanning** (set up the
   default CodeQL workflow).
2. This repo has no dependencies yet, so Dependabot will be quiet at
   first. Add one small npm package (e.g. install a test runner like
   `vitest` — see section 2) to give it something real to scan.

### How to test it
- Check the **Security** tab for a "CodeQL" scan result after your next
  push — even a clean result confirms the scan ran.
- For Dependabot, you can browse the [GitHub Advisory
  Database](https://github.com/advisories) to see if any package you've
  added has a known older vulnerable version, install that older
  version on purpose, and confirm Dependabot opens an alert (and
  eventually a PR) suggesting the upgrade.

---

## 7. Webhooks

**What it is:** A webhook sends a live HTTP notification to an external
URL whenever something happens in your repo (push, PR opened, etc.) —
this is how GitHub talks to outside tools.

### How to use it
1. Go to [webhook.site](https://webhook.site) — it gives you a unique
   URL and shows any request sent to it, no setup required.
2. In your repo, go to **Settings → Webhooks → Add webhook**, paste that
   URL as the Payload URL, set content type to `application/json`, and
   choose which events to send (start with just "Pushes").
3. Save it.

### How to test it
- Make any small commit and push it.
- Go back to your webhook.site tab — a new request should appear within
  a couple of seconds, containing a JSON payload describing your push
  (who pushed, which commits, etc.).
- Try adding a second event type (e.g. "Pull requests"), open a PR, and
  confirm a second, differently-shaped payload shows up — this is what
  proves you understand *which* event triggered *which* payload, not
  just that "something happened."

---

## Suggested order of attack

1. Copilot basics (section 1) — do this continuously throughout.
2. Actions & Runners (section 2).
3. Issues & PRs (section 3).
4. Code quality & review (section 4) — builds directly on section 3.
5. Secrets (section 5).
6. Security (section 6).
7. Webhooks (section 7) — no dependency on the others, do it whenever.
