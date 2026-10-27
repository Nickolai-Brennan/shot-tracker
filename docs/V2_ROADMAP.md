# Version 2 — player, event and course statistics

User-defined scope: October 27, 2026. Version 2 aggregates version 1 shot records with official scoring, results, standings, prize/points records and event/course metadata. All items below are planned requirements, not newly implemented calculations.

See [the three-version roadmap](VERSION_ROADMAP.md). The frozen version 1 snapshot remains unchanged. Custom predictive models and projected outcomes belong in [version 3](V3_ROADMAP.md).

## Player statistics and rankings

| Category | Required output | Definition / validation requirement |
|---|---|---|
| Off the tee (OTT) | Source-supported OTT measurements, descriptive performance and rankings by round/event/window | Define eligible tee shots, holes and any source-reported strokes-gained baseline; preserve raw distance/accuracy separately |
| Approach | Approach distance bands, proximity, green results and supported performance rankings | Define eligible shot/lie/distance categories; do not infer club solely from distance |
| Tee-to-green and around-the-green | Separate combined tee-to-green and short-game categories | “Shot to green” is interpreted as tee-to-green plus separately inspectable around-the-green/short-game measures; confirm naming. Define components to prevent double counting; keep putting separate |
| Putting | Putts, putts/round, distance bands, makes/misses where supported, and source-supported putting metrics | Confirm putt classification; distinguish green strokes, source putts, tracked path distance and official score |
| Scrambling | Attempts, successful outcomes, rates and rankings | Version a precise green-in-regulation/missed-green and save criterion; retain eligible opportunities and exclusions; no denominator from incomplete tracking |
| Scoring | Strokes, to-par, birdie/eagle/par/bogey rates, distributions and rankings | Official completed hole/round scores are authoritative; penalty scoring is not inferred from count of tracking records |
| Ranking / percentile | Rank, tied rank, percentile, sample count and comparison population | State event/round/season/window, membership, direction, tie method and minimum coverage; missing data is unavailable, not zero |

Version 2 can ingest reported advanced stats and reproduce calculations against a named, versioned reference definition. An official/reference strokes-gained metric is not the same work as designing a custom expected-strokes model; bespoke model development belongs in version 3. Never sum, average or combine incompatible reference populations without an explicit method.

## Player event, round and hole leaderboards

Provide historical event results and live/current standings, player round totals/to-par, round-by-round changes, and per-hole scoring/comparison leaderboards. Include ties, completed holes, thru/current-hole status, in-progress versus complete scores, cut/withdrawn/disqualified states and source freshness.

Compare equivalent holes/configurations and scope multi-course events explicitly. A hole-performance rank is not the player's event leaderboard position. Empty/partial tracking is not a zero score or completed round.

The current leading score and historical winning scores are version 2 facts. Projected winning score is version 3. The user's phrase “protected win score” is provisionally interpreted as projected winning score; a descriptive lead-protection statistic, if intended instead, remains version 2.

## Par-type scoring and field benchmarks

For par 3, par 4 and par 5 separately, provide player and field scoring mean, median, average relative to par, scoring distribution and birdie/bogey-or-worse rates where scoring coverage supports them.

| Benchmark | Contract |
|---|---|
| Mean hole score | Sum official strokes / number of eligible completed player-hole observations |
| Median hole score | Median of the same eligible observations; a different statistic from mean |
| Mean relative to par | Sum(strokes - hole par) / eligible observations |
| Player versus field | Player value minus a matched benchmark, with direction explicitly explained and cohort labeled |
| Hole versus PGA comparison | Name whether comparison means this event's field, selected PGA events or a season/window; match par/layout/configuration where required |
| Cross-event summaries | Declare observation-weighted versus event-weighted aggregation; do not silently average averages or percentiles |

Retain holes/rounds/events included, denominators, completion status, sample size and coverage. Do not mix average strokes on par 3 with average strokes on par 5 as if they share the same baseline.

## Time and positional-status splits

Support early/late tee times and waves, rounds, chronological hole segments, current rank, tied/outright lead, lead margin, trailing position, cut position and explicitly defined contention states.

- **Lead holding:** store the checkpoint definition (for example end of a specified round), qualifying lead states/ties, subsequent scoring and eventual finish. Report conversions and denominators, not a psychological label.
- **Out of contention:** choose a reproducible, as-of gap/rank rule and thresholds. Do not use the final result to retrospectively decide what was known at an earlier shot. A model win-probability rule belongs in version 3.
- **Performance after a status change:** compare subsequent scoring with an explicit player/field/context baseline; show sample size and selection/confounding limits. “Good” and “bad” are analytical comparisons, not claims about motivation.
- **Time provenance:** actual shot/checkpoint time, scheduled tee time and estimated time stay separate. State which drives each split.

## Cut history and group statistics

Track player event entries, starts, completed events, made/missed cut outcomes and rates under a documented eligibility rule. Preserve no-cut formats and withdrawals/disqualifications separately; do not force every non-finish into missed-cut status.

Group statistics link player IDs to event/round/group/starting hole/tee wave and report individual/group aggregates, scoring differences and field comparisons. Preserve group membership revisions and source timing. Association with a group is not evidence of a causal group effect.

## Prize earnings and FedEx Cup points

Store official event payouts, currency, player/event identity, payout basis/status and source, plus separately identified season totals/standings. Store event points awarded and season point standings with the applicable competition/season rule version and source date. No current payout table or points formula is assumed in this roadmap.

**Do not invent official round earnings or round FedEx points.** If a source reports a genuine round-specific award, retain it with its own type. Otherwise any per-round financial/points attribution is a derived analytical allocation with an explicit rule and must not be labeled an official payout/award. Default to unavailable when neither source nor approved allocation exists. Forecast earnings/points belong in version 3.

## Course difficulty and scoring

| Scope | Required analysis | Evidence limits |
|---|---|---|
| Full course | Round score/to-par distributions, completion/coverage and comparisons by event/round/configuration | Match total par, course/setup and field/context; multi-course rounds must identify the actual course |
| Hole | Mean/median score, relative-to-par difficulty, scoring distribution, penalties/hazard outcomes where supported | Use official scores and matching hole/configuration; raw tracking counts are not scores |
| Green | Putting outcomes, distance bands, GIR/approach finish context, supported putt/short-game difficulty summaries | Missing putt/green tracking limits conclusions; simulated routes are not surveyed slope or independent measured break |
| Par type | Par-3/4/5 scoring and player-versus-field comparisons | Declare comparison population/window and weighting |

Course difficulty can be raw descriptive scoring or an explicitly adjusted statistic. Any custom predictive difficulty/course-fit model belongs in version 3; do not present raw field differences as fully adjusted causal difficulty.

## Field spatial summaries and Caddy Zones

Aggregate comparable shots into field scatter/dispersion and location/outcome summaries. Top-decile descriptive regions require a named quality metric, sufficient spatial support, hazard evidence and calibrated frames. The version 1 entity/green visual style is retained; the frozen source does not calculate the region. Player-specific optimal targets, reachability, expected outcomes and predictive grades belong in version 3.

## Statistics entities

| ID | Entity | Required metadata |
|---|---|---|
| V2-01 | MetricDefinition | Formula, units, denominator, eligibility, better-direction, aggregation/ties and definition version |
| V2-02 | StatAggregate | Player/group/course/hole scope, event/round/window, value, sample count, coverage and source snapshot |
| V2-03 | LeaderboardSnapshot | Event/round/hole scope, as-of time, scores, ties, progress and status |
| V2-04 | ContextSplit | Chronological/status definition, thresholds, eligible observations and comparisons |
| V2-05 | EventParticipationResult | Entry/start/cut/finish/withdrawal states and source |
| V2-06 | PrizeAward / PointAward | Official versus derived basis, event/season, currency/rule version, source and award type |
| V2-07 | CourseDifficultySummary | Course/layout/configuration, hole/green/par-type cohort, benchmark and adjustment basis |
| V2-08 | RankPercentileSnapshot | Metric/cohort/version, value, tie method, sample/coverage and as-of time |

Existing WeatherRecord (E23), ShotWeatherAssociation (E24) and GroupWeatherCheckpoint (F03) support the weather scope below; retain IDs for continuity rather than renumbering them.

## Supporting context: weather application

[IVI-288 — Version 2: event weather widget and API with hole 1/10 group tracking](https://linear.app/nthezone/issue/IVI-288/version-2-event-weather-widget-and-api-with-hole-110-group-tracking)

| Area | Required version 2 behavior |
|---|---|
| Event identity | Event ID and name; round and local playing date |
| Location | Country, city, state/region, verified venue coordinates and IANA timezone |
| First tee | First tee time with weather valid/match time, temperature, wind speed/direction/gusts |
| Sky and precipitation | Condition/weather code, cloud cover, precipitation probability/amount and sunshine duration where supported |
| Player groups | Group ID, player IDs/names, starting hole, scheduled tee time and source |
| Hole 1 checkpoint | Forecast/conditions association for each group when an actual, scheduled or explicitly estimated checkpoint time is available |
| Hole 10 checkpoint | Separate association under the same rules; do not assume a fixed turn time |
| Provenance | Provider, units, retrieval time, sample valid time, issue/model time only when supplied, matching offsets and uncertainty |
| Refresh/history | Document refresh scope, persistence and retention; preserve forecast snapshots for comparison |

These are planned requirements, not implemented routes or a selected provider. Open-Meteo was researched as a candidate, but provider choice, commercial access/key setup, source coverage, storage and refresh cadence remain implementation decisions.

Keep forecasts and observations separate. A model forecast at the course is not a sensor observation at hole 1 or hole 10. Missing checkpoint/shot times stay missing; video publication and scheduled tee times do not become actual shot times.

## Branch, validation and release policy

Use `version/2.0` and focused feature/fix branches. Preserve `release/v1.0.0` and its source inventory. No statistics engine, model, weather API or deployment is implemented by this planning update.

Before implementation, define the metric/source contracts and validate reconstruction of source totals. Check complete/incomplete rounds, ties, zero opportunities, no-cut events, withdrawals, multiple courses, group changes and missing tracking. Validate player/round/event rollups against official scoring and awards; record coverage rather than filling gaps.

Version 3 consumes versioned v2 outputs, not mutable undocumented calculations. RSS remains future work in IVI-287 without a release assignment. Weather remains in version 2 under IVI-288.
