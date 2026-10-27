# shot-tracker

Versioned workspace for TOURCAST Shot Lab, the Python extractor, and the flight and green-break research prototypes.

## Version status

**Version 1 source is frozen as-is** on `release/v1.0.0`; [lock details](docs/releases/V1_LOCK.md) and [158-file source inventory](releases/v1.0.0.json) record the checkpoint. Known bugs and unfinished features remain explicit. **Weather moves to version 2**, tracked in [IVI-288](https://linear.app/nthezone/issue/IVI-288/version-2-event-weather-widget-and-api-with-hole-110-group-tracking) and the [v2 roadmap](docs/V2_ROADMAP.md). New work is separated on `version/2.0`. Branch protection is not configured.

## Start here

- [Version 1.0 entities and confirmed decisions](docs/V1_PROGRAM_ENTITIES.md)
- [Caddy Zone: top-decile destination regions](docs/CADDY_ZONE.md)

- [Environment, extensions, installation and running](docs/ENVIRONMENT_SETUP.md)
- [Bug register and acceptance criteria](docs/BUG_REGISTER.md)
- [Program boundaries and release workflow](docs/BUILD_AND_RELEASE.md)
- [Feature scope](docs/FEATURE_SCOPE.md)
- [Existing full app user guide](docs/TOURCAST_Program_User_Guide.md)
- [Existing architecture and changes report](docs/TOURCAST_Program_Breakdown_and_Changes_Report.md)
- [Validation performed for this snapshot](docs/VALIDATION.md)

## Programs

| Directory | Program | Baseline |
|---|---|---|
| `apps/shot-lab` | Existing TypeScript/React app, server routes, exports, maps, metrics and tests | Hosted saved version 6; original commit `1706677a7a9a22f8221c77521b948e10c31b11af` |
| `tools/extractor` | Python player/multiple-round JSON/CSV extraction | Preserved starter |
| `prototypes/flight` | Python radar polynomial plotting experiments | Hole 10/14 scripts; fixed paths remain documented bugs |
| `prototypes/green-break` | Python green overlay, putt curvature and elevation experiment | Existing prototype; not integrated into the app |
| `fixtures` | Supplied round export and provider green image | Source evidence; simulation labels retained |

The original preserved baseline contains 143 tracked app files copied byte-for-byte. Later reviewed source changes include nullable headshot metadata and the Caddy Zone visual component; their state is captured in the version 1 source inventory. The app retains its original package version `0.1.0`; hosted version 6 is a separate version identifier. New repository tags do not claim a new hosted release.

`baselines/source-manifest.json` records SHA-256 for 155 preserved program/input files. The remote `baseline/2026-10-27` branch identifies the uploaded preservation snapshot (`65058362462e3c88d1ffb667944885fb7b3246fa`). Original module tags remain in the supplied offline Git bundle; they have not been created remotely. Snapshot branches are references, not enforced protection rules. See [GitHub import details](docs/GITHUB_IMPORT.md).

## Quick start: app

```bash
cd apps/shot-lab
# Install the exact package-manager version declared in package.json first.
pnpm install --frozen-lockfile
# Set PGA_API_KEY in the shell for live requests; imports work without a live key.
pnpm dev
```

Portable development defaults to http://localhost:5173. Follow the terminal if a different address is printed. Keep the development server local; hosted owner access is not a substitute for authentication on a different host.

## Validation

```bash
# From the repository root: inspect the preserved baseline ref, not evolving working files.
python scripts/verify_baseline.py
# Optional: compare the current working copy against the original snapshot.
python scripts/verify_baseline.py --working-tree
```

Module commands, API limitations, independent environments, and known installation limits are documented in the setup guide. No GitHub deployment automation is configured.

## Existing archive and placeholder

The original `shot-tracker.zip`, `RESTORE.md` and root `index.html` remain in this repository. The placeholder page is not the Shot Lab app. Run the program in `apps/shot-lab` using the setup guide; the files are now unpacked and directly editable.
