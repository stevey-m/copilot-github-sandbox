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
2. Go to **Rules → Rulesets → New ruleset → New branch ruleset**, name
   it (e.g. `main-protection`), and target the default branch.
3. Under **Branch rules**, enable:
   - **Restrict deletions**
   - **Block force pushes**
   - **Require a pull request before merging** — once checked, a
     sub-option appears for **Require review from Code Owners**; check
     that too, and set **Required approvals to 1** (it defaults to
     `0`, which silently makes the Code Owners checkbox meaningless —
     easy to miss).
   - **Require status checks to pass** — add every individual check,
     including each matrix job separately (e.g. `syntax-check (18)`,
     `syntax-check (20)`, `syntax-check (22)` are three distinct
     checks, not one — a matrix build reports each version as its own
     status check).
4. Set **Enforcement status** to **Active**.
5. **A real gotcha found while testing this:** GitHub never allows a
   PR author to approve their own PR, no matter their permissions —
   this creates a genuine deadlock on a solo repo with Code Owners
   review required, since there's no second person to approve. Fix it
   with a **bypass list**: in the same ruleset, add **Repository
   admin** to the bypass list. This keeps the rule fully enforced for
   anyone without admin rights, while letting you merge via an
   explicit, logged **"Merge without waiting for requirements to be
   met (bypass rules)"** action — a deliberate, auditable exception
   rather than either "impossible to merge solo" or "silently
   unenforced."
6. **Important distinction found while testing this on a real
   Dependabot PR:** the self-approval block only applies when *you*
   personally are the PR's author. On a **bot-authored** PR (a
   Dependabot version-bump PR, or later a Copilot coding agent PR),
   you are not the author — so you can **Approve it normally**,
   satisfying Code Owners review without needing the bypass path at
   all. The bypass list is really only needed for the narrower case of
   merging your own PRs on a solo repo, not for reviewing bot-opened
   ones.
7. **A real gap found via the webhooks exercise (§7):** when adding
   Repository admin to the bypass list in step 5, GitHub defaults the
   bypass mode to **"Always allow"** — which exempts admins from the
   *entire* ruleset, including direct pushes straight to `main`, not
   just the Code Owners review requirement. This was only caught
   because a webhook payload showed a direct push to `main` succeeding
   when it should have been rejected. **Fix:** in the bypass list
   entry for Repository admin, change the mode from "Always allow" to
   **"For pull requests only."** This keeps the narrow exception (admin
   can bypass the review deadlock when merging a PR) while restoring
   full protection against direct pushes, even for the admin. Worth
   checking this setting specifically any time a bypass list is added
   for any reason — the default is broader than it first appears.

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
2. **Undo the local commit** (it never reached GitHub):
   ```
   git reset --soft HEAD~1
   git restore --staged README.md
   git checkout README.md
   ```
3. **Do it properly via a branch and PR:**
   ```
   git checkout -b test-ruleset-flow
   echo "test" >> README.md
   git add README.md
   git commit -m "test: confirm PR flow satisfies ruleset requirements"
   git push origin test-ruleset-flow
   ```
   Open the PR from GitHub's prompt.
4. **Confirm the PR correctly shows both requirements:**
   - All required status checks listed and passing
   - A **"Review required"** / **"Merging is blocked"** state citing
     the approval requirement — confirms the rule is genuinely
     enforced, not just configured
5. **Confirm self-approval is genuinely blocked:** try to approve your
   own PR (Files changed → Review changes → Approve → Submit) — GitHub
   rejects this outright ("Pull request owners cannot approve their
   own pull request"). This is expected and is GitHub platform
   behavior, not something to fix.
6. **Use the bypass path deliberately:** the PR should now offer
   **"Merge without waiting for requirements to be met (bypass
   rules)"** as a distinct button, separate from a normal merge.
   Clicking it completes the merge — GitHub logs this as a
   bypass-merge in the PR timeline, giving a permanent, visible audit
   trail every time the exception path is used.
7. Clean up:
   ```
   git checkout main
   git pull
   git branch -d test-ruleset-flow
   ```

The complete, correct lesson here isn't just "require review" — it's
**least-privilege enforcement with a documented, traceable exception
path for the case where there's genuinely no second reviewer**, which
is closer to how this actually works on a real team than a naive
"require 1 approval" setup would be.

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

**Note on where this actually lives:** this is the repo's own
Settings, not your GitHub account/global Settings — easy to confuse
since both are called "Settings." From the repo page, click the
**Settings** tab (top of the repo, not your profile menu). In the
current UI, the older "Code security" page has been folded into
**Advanced Security** (sidebar, under a "Security and quality" or
similar heading) — the same page used for Secret Protection if you've
set that up on another repo. Dependabot alerts/updates and Code
scanning (CodeQL) both live on that one combined page now.

### How to use it
1. From the repo, **Settings → Advanced Security**.
2. Enable **Dependabot alerts** and **Dependabot security updates**.
3. Under **Code scanning**, click **Set up → Default** for the
   one-click CodeQL setup (this repo doesn't need the custom-query
   "advanced setup" used in `least-privilege-demo` — default is fine
   here).
4. This repo has no dependencies yet, so Dependabot will be quiet at
   first. Add one small npm package (e.g. install a test runner like
   `vitest` — see section 2) to give it something real to scan.

### How to test it
- Check the **Security** tab (top of the repo, separate from
  Settings) for a "CodeQL" scan result after your next push — even a
  clean result confirms the scan ran.
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

## 8. Writing commit messages

Not a GitHub feature exactly, but a real skill this repo is a good
place to practice — and one that has nothing to do with git mechanics,
so it's easy to neglect.

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

## Suggested order of attack

1. Copilot basics (section 1) — do this continuously throughout.
2. Actions & Runners (section 2).
3. Issues & PRs (section 3).
4. Code quality & review (section 4) — builds directly on section 3.
5. Secrets (section 5).
6. Security (section 6).
7. Webhooks (section 7) — no dependency on the others, do it whenever.
8. Commit message habits (section 8) — practice continuously, not a
   discrete step.
