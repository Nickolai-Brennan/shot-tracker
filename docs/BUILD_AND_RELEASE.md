# Program boundaries, builds and releases

## Layout and ownership

| Program | Path | Own dependencies | Initial tag |
|---|---|---|---|
| Shot Lab app | `apps/shot-lab` | Existing package.json and pnpm lockfile | `shot-lab/v6-baseline` |
| Extractor | `tools/extractor` | Pinned upstream Git dependency in requirements.txt | `extractor/v0.1.0-baseline` |
| Flight research | `prototypes/flight` | Separate Python environment | `flight/v0.1.0-baseline` |
| Green-break research | `prototypes/green-break` | Separate Python environment | `green-break/v0.2.0-baseline` |

Baseline tag: `baseline/2026-10-27`. Prototype tags describe repository snapshots, not a claim of published package versions. Original app commit and file hashes are in `baselines/source-manifest.json`.

## Branches

- `main`: reviewed repository state. Hosted deployment remains a separate explicit action.
- `develop`: integration branch initially identical to main.
- `fix/shot-lab/BUG-001-video-resolution`: example future fix branch, not a completed fix.
- `feature/green-break/field-coverage`: example future prototype branch.
- `release/<program>/<version>`: optional stabilization branch before a module release.

Folders isolate dependencies and builds; branches isolate changes. Neither prevents every regression. Preserve the baseline tag; require module checks and review before integrating.

```bash
# Start one focused fix from the current reviewed state.
git switch main
git pull --ff-only
git switch -c fix/shot-lab/BUG-001-video-resolution
# Work only in the named program plus its focused tests/docs.
git diff --stat main...HEAD
```

Use a separate worktree when working on another module at the same time:

```bash
git worktree add ../tourcast-green -b feature/green-break/field-coverage main
```

## Baseline verification and rollback

```bash
# Validate the preserved files at the immutable-by-convention baseline tag.
python scripts/verify_baseline.py
# Inspect without resetting or overwriting active work.
git worktree add --detach ../tourcast-baseline baseline/2026-10-27
```

Do not use destructive reset commands to recover a program. Revert the specific reviewed commit through a new branch/PR, or inspect its module tag in a worktree. A Git rollback does not roll back a hosted deployment or external data.

## GitHub rules to enable after repository creation

Use a private repository by default. Configure rules for main: pull requests, required applicable checks, no force pushes and no deletion. Protect baseline/release tags where account capabilities permit. For a solo maintainer, checks are useful without requiring an unavailable second reviewer.

These are configuration instructions, not a claim that remote rules are already active. Local tags alone do not enforce protection. Workflows never deploy the hosted app, consume a PGA key, or make live PGA requests.

## Checks and module boundaries

GitHub workflows select the app or Python program paths independently. The app runs four existing suites, a build and typecheck. Python runs syntax checks and help checks; preservation is not a claim that live extraction is verified. The baseline workflow hashes tagged files separately from current features, so deliberate later changes do not fail solely for differing from the original.

## Release procedure

1. Open a PR from the module branch and identify the bug/feature, changed modules, validation and limitations.
2. Review the diff for changes outside scope; run the affected checks and shared-contract checks if any.
3. Merge after checks. Add a module-specific release note and a new tag; never move an old tag.
4. Deploy only the selected app release through its hosting workflow when requested. Prototype/extractor releases do not publish the app.
5. Keep exported data schema changes versioned and backward-compatible or provide an explicit migration.

## Initial GitHub publishing

The repository is prepared locally with commit history and tags. The connected GitHub toolset lacks repository creation, and no GitHub CLI is installed in the authoring environment. Do not claim a remote exists until creation and upload succeed.

On a computer with GitHub CLI installed and authenticated as the intended owner:

```bash
# Run inside this repository, only if this exact remote does not already exist.
gh auth status
gh repo create Nickolai-Brennan/tourcast-shot-data --private --source=. --remote=origin --push
git push origin develop
git push origin --tags
```

If a remote already exists, inspect its content before adding/pushing it. Do not force-push over existing work. GitHub CLI is needed only for this optional publishing route, not for running any program.
