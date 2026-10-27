# Program version roadmap

Scope clarified by the user: October 27, 2026. This is the current planning authority for version boundaries. Implementation status remains separate from requested scope.

| Version | Primary purpose | Unit of work | Main output |
|---|---|---|---|
| **1 — Shot data** | Collect, preserve, inspect and visualize individual shot records | Event → round → hole → player → shot | Source-backed shots, measurements, paths, maps and exports |
| **2 — Statistics and rankings** | Aggregate those records and official scoring/results into comparable player, group, event and course statistics | Player/group/hole/round/event/course/season | Defined metrics, historical/current leaderboards, rankings and percentile summaries |
| **3 — Models and projections** | Use versioned scores, statistics, rankings and percentiles to build custom explanatory/predictive models | Feature snapshot → model version → run → evaluation | Expected outcomes, player profiles, game-plan scenarios and projections with uncertainty |

Version 1 source remains frozen at `release/v1.0.0` / commit `ecf2f4e6aaa098c187dd0a127cc24cf987a3b6ef`. This roadmap changes planning documents on main; it does not move or modify that snapshot. Its code includes documented bugs and unfinished integrations. A declared focus is not a claim that every requested feature is delivered.

## Version 1: single-shot foundation

Focus on individual shots, navigable hole by hole, by round and by event. Event/round/hole are scope and navigation containers, not a reason to add player ranking models to version 1.

Core scope: event/player/round/hole/shot identity; raw payload preservation; standard distances, lies and results; advanced source measurements; source images, calibrated positions and supported flight/putt paths; selected-shot video metadata; explicit provenance/units; filtering and exports. Existing scoring verification remains a consistency check for the shot data, not the version 2 analytics engine.

The snapshot retains the current extractor and separate research prototypes, plus Caddy Zone schema/style. Full-field collection or bulk import can support later versions without changing the meaning of the shot-level foundation.

## Version 2: descriptive statistics and ranking layer

[Detailed version 2 scope and metric definitions](V2_ROADMAP.md).

Includes player OTT, approach, tee-to-green/around-the-green as separately defined categories, putting, scrambling, scoring metrics and rankings; player event/round/hole standings; par-3/4/5 performance; chronological/leader-position splits; cut history and group statistics; prize earnings and FedEx points; event history/current results; course/hole/green difficulty; field means, medians and par-type comparisons.

Weather remains version 2 under IVI-288 as context for groups at holes 1 and 10. RSS remains separately tracked as future work under IVI-287; no specific release is assigned here.

Metrics require declared formulas, denominators, comparison population, time window, coverage, source and units. Existing official/provider metrics can be ingested; bespoke expected-outcome model development belongs in version 3. Rank/percentile summaries are descriptive unless explicitly labeled model outputs.

## Version 3: custom models and expected outcomes

[Detailed version 3 scope](V3_ROADMAP.md).

Requested model families: playing-style/aggressive-risk game plans, celebrity/fame-scale proxies, low-floor/high-ceiling profiles, player/course connection, player event projection and expected outcomes from shot/event context.

Current leaderboard facts remain version 2. **Projected winning score** is provisionally the interpretation of the user's phrase “protected win score” and belongs in version 3. If “protected” instead means a lead-protection statistic, keep that descriptive metric in version 2 and revise the interpretation; do not silently change the label.

## Caddy Zone boundaries across versions

| Layer | Responsibility |
|---|---|
| Version 1 | Preserve the existing zone entity/schema and transparent-green rendering component; inspect supported shot positions. The frozen source does not compute actual zones. |
| Version 2 | Build comparable field cohorts, scatter/dispersion, historical location/outcome summaries, rankings and percentiles. Derive an evidence-supported descriptive zone only with an explicit quality metric, spatial support and registration. |
| Version 3 | Develop/validate custom position-value, player reachability, target optimization, shot grading and outcome projection models using versioned zones. |

A retrospective top-decile area is not automatically an optimal player-specific target. Keep descriptive and modeled zone versions distinct.

## Shared rules

- Source-reported, calculated descriptive, user-annotated and model-projected values remain distinct.
- Preserve event/player/round/hole/shot and group identity, chronological availability, course/layout/configuration and provenance.
- Do not invent missing tracking, official payouts, points, clubs, timestamps or green measurements.
- Separate observed values and matched forecasts from model expectations. Show coverage, sample size and unavailable states.
- Every downstream statistic/model references its source snapshot and definition version. A later refresh does not silently rewrite a frozen report or grade.
- Do not infer causality, psychology or personal traits from a performance split or fame proxy.

## Development order

1. Maintain the frozen v1 source and bug register; authorize any maintenance through a separate patch snapshot.
2. Define v2 metric contracts and source coverage before building aggregation and leaderboard screens.
3. Add versioned v2 aggregates and context (including weather), validate against source totals and handle missing rounds/withdrawals correctly.
4. Build v3 features only from data available at prediction time; validate against held-out events/time periods and simple baselines.
5. Publish each program/version deliberately; this roadmap update performs no application deployment.
