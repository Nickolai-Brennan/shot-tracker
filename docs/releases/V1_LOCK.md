# Version 1.0 source lock

Locked by user decision: October 27, 2026.

## Snapshot

- Release snapshot branch: `release/v1.0.0`.
- Frozen program source commit: `0ef7c8a00bf9610d5ba135f84c42ca2b185e38d3`.
- Exact program/input inventory: `releases/v1.0.0.json` (158 paths, Git blob IDs and file modes).
- Original preserved baseline remains `baseline/2026-10-27`.
- Subsequent version 2 work starts on `version/2.0` or focused branches from it.

This is an **as-is source checkpoint**, not a statement that every planned version 1 entity is implemented, every bug is fixed, or a new app has been published. The existing package remains 0.1.0 and the original hosted app baseline remains saved version 6. No package bump, runtime change or deployment is made by the lock.

The release branch includes this documentation update; its 158 program/input blobs match the frozen program source commit above. An exact commit identifies immutable content; a branch name alone is movable. GitHub protection/rulesets are not configured by this operation, and no remote tag is claimed. Treat the release branch as archival and do not force-update it. The source commit and inventory allow exact verification if a ref is moved accidentally.

## Included in the frozen source

| Area | Included state |
|---|---|
| Shot Lab | Existing event/player/round flow, import/export, source map markers, metric slots, scoring checks, video metadata and putt controls |
| Player metadata | Nullable source headshot URL/provenance retention |
| Extractor | Preserved Python player/multiple-round JSON/CSV program |
| Flight/green research | Existing separate Python prototypes; not silently presented as integrated app features |
| Caddy Zone | Entity/schema/feature contract, bright translucent green styling, reusable SVG layer and explicitly illustrative preview |
| Documentation | User guide, bugs, setup, build/release workflow, entities/decisions and future feature scope |

Caddy Zone calculation and live map mounting remain planned. Video playback/null URL investigation, import identity, radar compatibility, precision and other known bugs remain documented. Snapshotting preserves those limitations; it does not resolve them.

## Explicitly excluded: weather application

The weather forecast widget, weather API setup and group checkpoint tracking move to **version 2**. Only preliminary research occurred; no weather UI, API route, dependency or environment setting was added to version 1.

Task: [IVI-288 — Version 2 weather widget and hole 1/10 group tracking](https://linear.app/nthezone/issue/IVI-288/version-2-event-weather-widget-and-api-with-hole-110-group-tracking).

See [Version 2 roadmap](../V2_ROADMAP.md). RSS remains separately tracked as future work in IVI-287; this decision does not silently assign every future feature to version 2.

## Working safely after the lock

```bash
# Inspect exact frozen source without changing the active working tree.
git fetch origin
# Full commit remains a precise reference even if a branch is moved.
git worktree add --detach ../shot-tracker-v1 0ef7c8a00bf9610d5ba135f84c42ca2b185e38d3

# Start new version 2 work from its separate branch.
git switch --track origin/version/2.0
# If already created locally: git switch version/2.0
```

Do not merge version 2 features into `release/v1.0.0`. If a version 1 maintenance correction is later authorized, use a new maintenance branch and a new snapshot/version; preserve this checkpoint.
