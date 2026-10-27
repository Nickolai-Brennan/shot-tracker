# Caddy Zone — entity and feature contract

Version: 1.0 working specification. Added: October 27, 2026.

## Confirmed user requirement

A **Caddy Zone** is a supported area on a hole that represents the most advantageous ball destination, derived from comparable full-field shot scatter/spray data. Its defining quality cutoff is **90th percentile or better**. It appears as an area on the program's TOURCAST hole-map view, with a preferred target point. Later shot grading and outcome projections reference the zone and its calculation version.

This confirms the name, purpose, percentile threshold, scatter-data input, map destination and later uses. It does not confirm a particular scoring model, smoothing method, sample threshold or physical boundary. Those implementation choices are documented proposals below until validated.

**Implementation status:** entity definition and machine-readable contract added; field collection, zone computation, map overlay, grading and projection are not implemented by this documentation change. The current app retrieves player-rounds, not a complete comparable field cohort. No actual field zone or example boundary is fabricated here.

## Meaning of 90th percentile+

The cutoff describes **shot/location quality within a defined comparison group**. Higher percentile means better under the named metric. It does not mean an area containing 90% of all shots, a 90% chance of landing there, or 90% statistical confidence.

A spray plot supplies spatial positions. It does not, by itself, establish which finish is best for the next shot. Quality must be joined to supported outcomes or a documented position-value model. Longest shot, nearest to the pin and highest landing density are separate metrics and cannot silently replace next-shot advantage.

The preferred metric proposal is fewer expected strokes remaining from the destination, conditioned on distance, lie and relevant hole configuration. Its model, coverage and validation must be available before it is treated as predictive. Observed subsequent strokes can support a separately labeled retrospective analysis, but include player skill and later execution/luck; they are not an independent causal location value.

## Relationships

CaddyZone (E26) references Course (E03), Hole/configuration (E04), FieldShotGroup (E20), AnalysisResult (E19), DatasetSnapshot (E18), and MapAsset/Calibration (E14). It may reference WeatherRecord/cohort filters where those inputs are available. Later grading and projection outputs reference a **specific Caddy Zone version**, not a moving current overlay.

## Required stored information

| Group | Fields / meaning |
|---|---|
| Identity | `zoneId`, `zoneVersion`, `schemaVersion`, `createdAt` |
| Scope | Event IDs/rounds, course/layout, hole, tee/pin configuration where relevant, shot phase, comparison-group ID |
| Position basis | `firstLanding` or `finalRest`; never silently mix them |
| Coordinates | Explicit frame ID, axis meanings, units, optional verified map-transform reference |
| Quality | Metric ID/version, direction, evaluation basis and comparison cohort |
| Percentile | Minimum percentile 90; exact rank/tie method and computed score cutoff |
| Evidence | Snapshot IDs, eligible/qualifying/excluded counts, distinct players, qualifying shot IDs, data coverage and availability |
| Generation | Algorithm/version, spatial parameters, minimum sample/support requirements and their validation |
| Geometry | Polygon or multiple polygons, including excluded holes when supported; null when insufficient evidence |
| Preferred target | Supported x/y position, target-selection method and region identity; null when unavailable |
| Constraints | Hazard/boundary source and status; no assumption that missing hazard data means safe ground |
| Validation | Draft/insufficient-data/uncalibrated/provisional/validated status, reasons, held-out validation references, uncertainty assessment |
| Later uses | Enable grading/projection only after their own validation; versioned downstream references |

`schemas/caddy-zone.schema.json` captures the initial contract. It is not a database migration or a zone generator. Changes to the contract must be versioned.

## Proposed calculation workflow

1. **Collect the field cohort.** Request/import all relevant player-rounds; retain success, missing and excluded coverage. Select one course/hole/configuration and comparable shot phase/start conditions. Multiple events/rounds require explicit compatibility rules. Do not count a drop as a ball strike or silently discard adverse outcomes from the quality comparison.
2. **Resolve the position basis.** True first landing requires supplied landing data. When only endpoints are available, use a clearly labeled final-rest Caddy Zone or mark landing unavailable. A destination position and its outcome must refer to the same state; later bounce/roll cannot be attributed to a carry location without an explicit model.
3. **Resolve the quality model.** Require a named metric, units/direction, input provenance and validation basis. Group unequal starts/approach distances/lies into comparable cohorts or adjust them explicitly. Unknown outcome/club/weather values must follow declared eligibility rules.
4. **Rank eligible shots.** Convert the metric so higher quality is better. Proposed empirical method: sort scores ascending, assign equal scores their average 1-based rank r, and calculate `100 * (r - 1) / (n - 1)` for n > 1. Retain percentile >= 90. Boundary ties can change the selected count; report them. With one record, no ranking is established. If every score is equal, there is no quality separation and no best-zone claim.
5. **Check evidence.** Require configured minimum eligible shots, distinct players, qualifying points, spatial coverage and model support. These thresholds must be chosen/validated; they are not invented defaults here. Failure yields `insufficientData`, not an apparently precise region.
6. **Estimate supported areas.** Use the high-quality locations and the surrounding eligible cohort to assess regional quality and support. A hull or buffer around top endpoints alone does not prove the area between them is top-decile quality. Choose/version an estimator, spatial scale and region-selection rule; leave unsampled areas unknown. Preserve disconnected regions rather than bridging them over hazards or unsupported terrain.
7. **Apply known constraints.** Clip regions only with registered authoritative playable-area/hazard geometry. Retain gaps/excluded holes. Unknown hazard geometry remains an explicit limitation; do not present the region as universally safe or reachable.
8. **Select the preferred spot.** Proposed initial representative: an observed supported point/medoid in the strongest qualifying region, rather than an arithmetic average that could fall outside it. A model-optimized target requires separate support/reachability validation. Record its selection method.
9. **Register and display.** Transform the zone through the same verified map contract as shot markers; retain native geometry. Missing/mismatched course, configuration, axis or transform prevents an aligned overlay. Never use a single player's normalized image coordinates as a field-wide physical frame without verification.
10. **Save the version.** Preserve inputs, filters, metric/rank method, spatial parameters, validation and output. Refresh creates a new version and does not rewrite earlier shot grades.

If high-quality point clusters exist without sufficient evidence for an area, display the points as **top-decile observations**, not an activated Caddy Zone polygon.

## Hole-map display requirements

- Add a **Caddy Zone** layer toggle to the program's own hole-map SVG/canvas. This does not imply modifying the externally embedded TOURCAST viewer.
- Show the cohort's scatter points, distinguish qualifying points, add a translucent zone boundary and mark the preferred target.
- Label `Caddy Zone · >=90th quality percentile`, the metric, landing/final-rest basis, comparison scope, sample counts, version and validation state.
- Support multiple regions and excluded holes. Show the selected shot over the zone without hiding its landing/rest distinction.
- Keep scatter, zone and shot markers synchronized under pan/zoom/resizing and either map orientation.
- On missing field coverage, inadequate support or missing registration, provide the reason and omit the unsupported polygon.
- Use a legend and distinct boundary/marker shapes as well as color. Source samples remain inspectable.

## Later shot grading

A later grade should combine location quality percentile, inside/outside or distance-to-zone, lie/hazard result, and player/context suitability where supported. Merely landing inside a polygon is not proof of a 90+ grade or a guaranteed good next shot.

Freeze the training snapshot and zone version before grading a held-out shot. Do not include the evaluated shot or its future outcomes in its own training/ranking cohort. Report out-of-support cases as ungraded/uncertain rather than extrapolating a confident result.

## Later outcome projections

Projection outputs must distinguish target-location value, probability that a particular player reaches the zone, and expected next-shot/hole outcome. These are different quantities. Use independently evaluated models and uncertainty; the zone percentile is not an outcome probability. Retain the zone/model/data versions used by every projection.

## Acceptance criteria for implementation

1. A complete-enough comparable field cohort and declared outcome metric can be loaded; missing/failed requests remain visible.
2. Ranking handles higher/lower-better metrics, ties, equal scores, one record and missing outcomes correctly; 90th+ selects high quality rather than 90% coverage.
3. Endpoint-only inputs cannot silently generate a first-landing zone.
4. Sparse/disconnected/hazard-crossing/unknown-support cases never become a misleading broad target area.
5. Polygon, representative point and scatter agree in the verified map frame; mismatched scope/calibration blocks rendering.
6. Outputs retain input IDs, ranks, parameters, geometry, coverage, uncertainty and versions for export/reproduction.
7. Baseline app behavior remains available with the zone layer disabled or unavailable.
8. Grading and projections remain disabled until their separate validation and training/evaluation isolation are implemented.

## Remaining choices

Confirm/validate the default quality model, cohort adjustment, minimum sample/support thresholds, spatial estimator/scale, hazard source, map transform, player-specific reachability policy and independent validation plan. The confirmed 90th percentile+ requirement is retained while these details remain open.

## Implementation Notes

- Assumptions: Caddy Zone is a derived spatial entity from comparable field shots, not an existing provider field.
- Risks: selection bias, missing field data, mislabeled first landing, unsafe spatial interpolation and outcome leakage can invalidate a zone.
- Next Steps: implement field-cohort/outcome adapters and verify map registration before computing/displaying a real zone.
- Alternatives: show top-decile points or a clearly labeled final-rest zone when area/landing support is insufficient.
- Performance Considerations: compute/cache per scope and input version; render simplified geometry while retaining full source data.
- Maintenance Considerations: version scores, cohorts, geometry and downstream grades independently; preserve the original baseline.
