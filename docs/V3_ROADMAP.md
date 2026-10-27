# Version 3 — custom models and expected outcomes

User-defined scope: October 27, 2026. Inputs come from the version 1 shot foundation and version 2 scores, statistics, rankings and percentile summaries. These models are planned, not implemented by this specification.

## Requested model families

| Family | Intended output | Candidate inputs / definition work |
|---|---|---|
| Player style and game-plan risk | Aggressive/conservative options, target/club scenarios, expected score and adverse-outcome distributions | Shot selection, dispersion, distance, lie, hazards, position/context and player history; define “aggression” operationally rather than assuming intent |
| Celebrity / fame scale | Explicitly labeled proxy index for public visibility | Documented, permitted sources, time windows, normalization and weights; not an objective measure of talent, character or actual performance pressure |
| Low floor / high ceiling | Lower-tail, central and upper-tail performance summaries or predictive intervals | Define outcome orientation: fewer strokes is better, while a performance score may be higher-better; use reproducible quantiles and uncertainty |
| Player/course connection | Estimated course fit beyond a raw course-history average | Player skill/shot-shape profile, course characteristics, layout/setup and sparse-history treatment; compare with simple course-history baselines |
| Player event projection | Finish/score distributions, cut probability, win/top-finish probabilities when validated | Field strength, course fit, recent/history windows, weather/tee-wave context and available injury/entry status only from verified appropriate sources |
| Shot/event expected outcome | Expected strokes, target value, risk and hole/round/event distributions | Source position, lie, club when known, player context and explicitly supported geometry/time conditions |
| Projected winning score | A distribution/range for the event's final winning total, with as-of time | Live/historical scoring, remaining holes, field and conditions; this is a projection, not a current leaderboard fact |

“Protected win score” is provisionally interpreted as projected winning score; confirm if a different lead-protection measure was intended. No arbitrary feature weights, target probabilities or model quality claims are fixed here.

## Model entities

| ID | Entity | Key information |
|---|---|---|
| V3-01 | FeatureSnapshot | As-of cutoff, source dataset/stat versions, feature definitions, missingness and training/evaluation scope |
| V3-02 | ModelDefinition | Target, intended use, algorithm/version, assumptions, feature set, training window and baseline |
| V3-03 | ModelRun | Model/feature versions, as-of time, scenario inputs and reproducible settings |
| V3-04 | Projection | Outcome definition, distribution/interval/probability, units, supported scope and uncertainty |
| V3-05 | Evaluation | Chronological/event-held-out split, metrics, calibration, baseline comparison and coverage |
| V3-06 | ProxyIndexDefinition | Fame/style proxy inputs, permitted provenance, weights, normalization, label and sensitivity checks |

## Validation and versioning requirements

Keep descriptive v2 splits separate from predictive v3 outputs. A player with a better historical average while leading is not thereby proven to possess a psychological lead-holding trait.

Use prediction-time cutoffs. Exclude the evaluated shot, later leaderboard positions, final earnings and future outcomes from its own inputs. Prefer time/event-held-out evaluation; repeated player shots within the same event are not independent evidence across train/test partitions.

Report calibration, uncertainty, sample/coverage limits and performance against simple baselines appropriate to the target. Handle course changes, changing fields and sparse histories. Separate fixed predictions made before play from updated in-play projections.

For Caddy Zones, preserve the input cohort, quality model, geometry and zone version. Distinguish location value, probability of reaching that location and resulting score expectation. Do not treat 90th quality percentile as 90% landing or winning probability.

Version 3 development does not modify the archived version 1 snapshot. Architecture/framework/provider decisions remain open until model requirements and data quality are established.
