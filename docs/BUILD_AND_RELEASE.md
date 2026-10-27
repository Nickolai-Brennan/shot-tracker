# Program boundaries, builds and releases

## Layout and ownership

| Program | Path | Own dependencies | Original offline snapshot tag |
|---|---|---|---|
| Shot Lab app | `apps/shot-lab` | Existing package.json and pnpm lockfile | `shot-lab/v6-baseline` |
| Extractor | `tools/extractor` | Pinned upstream Git dependency in requirements.txt | `extractor/v0.1.0-baseline` |
| Flight research | `prototypes/flight` | Separate Python environment | `flight/v0.1.0-baseline` |
| Green-break research | `prototypes/green-break` | Separate Python environment | `green-break/v0.2.0-baseline` |

Uploaded baseline branch: `baseline/2026-10-27` (`65058362462e3c88d1ffb667944885fb7b3246fa`). The original offline tags below are not remote GitHub tags. Prototype tags describe repository snapshots, not a claim of published package versions. Original app commit and file hashes are in `baselines/source-manifest.json`.

## Branches

- `main`: reviewed repository state. Hosted deployment remains a separate explicit action.
- `develop`: integration branch initially identical to main.
- `fix/shot-lab/BUG-001-video-resolution`: example future fix branch, not a completed fix.
- `feature/green-break/field-coverage`: example future prototype branch.
- `release/<program>/<version>`: optional stabilization branch before a module release.

Folders isolate dependencies and builds; branches isolate changes. Neither prevents every regression. Preserve the baseline snapshot ref; require module checks and review before integrating.

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
# Validate the preserved files at the preserved baseline ref.
python scripts/verify_baseline.py
# Inspect without resetting or overwriting active work.
git fetch origin
git worktree add --detach ../tourcast-baseline origin/baseline/2026-10-27
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

## GitHub repository

The uploaded source is in `Nickolai-Brennan/shot-tracker`. The import branch preserves the original files and adds unpacked program directories. See `GITHUB_IMPORT.md` for the exact baseline ref and original source commit.

Use normal Git branches and pull requests for subsequent changes. Original offline module tags have not been created remotely, and remote protection rules have not been configured. If release tags are added later, point them at reviewed commits and do not move existing references. No hosting deployment is triggered by these repository workflows.
