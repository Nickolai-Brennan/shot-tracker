# Program feature scope

Approved planning direction from the current project conversation; future items are not implemented by this snapshot. See [Version 1.0 entities and confirmed decisions](V1_PROGRAM_ENTITIES.md) for implementation status, answers and pending choices.

## Version boundaries

The latest user-defined version allocation is authoritative: [Version 1 → 2 → 3 roadmap](VERSION_ROADMAP.md).

| Layer | Ownership |
|---|---|
| Version 1 | Individual shot acquisition, preservation, inspection and visualization, scoped by event/round/hole; current source remains frozen |
| Version 2 | Player/group/event/course aggregates, scoring, OTT/approach/short game/putting/scrambling, rankings, leaderboards, contextual splits, earnings/points, field benchmarks and weather context |
| Version 3 | Custom player/style/fame-proxy/course-fit/risk models, expected outcomes and projections |

Existing rows below describe implementation status; use the version roadmaps for ownership. In particular, descriptive field percentile/Caddy Zone summaries are version 2, while custom optimal-target/grading/projection models are version 3.

| Module | Existing foundation | Planned extension |
|---|---|---|
| Event collection | Event/participant/round selection, player-round pull and raw import | Tee times, player/all-round and field/round pulls, full-event jobs, retry/resume and coverage |
| Shot details | Standard distance/lie/sequence fields and source metric slots | Complete radar field adapters, units, ball speed/spin/club speed/smash displays |
| Maps and flight | Hole-image endpoints and separate radar-fit scripts | Integrated overhead/side/3D paths, source classification, landing/bounce/roll when supplied |
| Green analysis | Separate image/putt/profile prototype | Native image retrieval, coordinate-only x/y/z green, field trails, selected-putt break detail |
| Comparison | Qualitative source-image comparison | Calibrated rendering comparison; independent prediction only with a validated model |
| Field analysis / Caddy Zone | Participant roster; E26 entity/schema defined | Field scatter and supported >=90th-quality-percentile destination region(s), preferred target, hole-map overlay; later versioned shot grading and projections. See [Caddy Zone](CADDY_ZONE.md) |
| Player analysis | Selected player-round; nullable source headshot URL/provenance retention | Player details and separate 3D trajectory groups for driver and each reliably identified club |
| Weather — version 2 | Deferred; excluded from locked version 1 | Event/location widget, first-tee weather and hole 1/10 player-group checkpoint associations; [IVI-288](https://linear.app/nthezone/issue/IVI-288/version-2-event-weather-widget-and-api-with-hole-110-group-tracking) |
| Durability | Manual JSON/CSV exports | Saved sessions, versioned schemas and provenance |
| PGA TOUR news | No RSS ingestion yet | Future-release verified RSS/Atom fetch and normalized items: [IVI-287](https://linear.app/nthezone/issue/IVI-287/future-release-fetch-and-normalize-pga-tour-rss-news) |

The **Caddy Zone** is the confirmed name for this >=90th-quality-percentile destination area. Its cutoff describes quality, not 90% landing probability or a 90% coverage/confidence contour. No actual field zone is computed by this entity-definition change.

Top 10% must name the ranking metric: useful distance/playable lie, next-shot outcome, or sufficiently supported expected strokes remaining. Dense/longest regions are not automatically best. Control for comparable starts, hole/course, pin/round and available conditions; retain sample-size limits.

Multiple putt routes can support coverage and local elevation exploration. Simulation paths are not independent evidence of surveyed terrain. Near-cup downward points can describe ball entry and must not automatically deform the green. Keep unsupported surface areas unknown.

Tee times are scheduled group starts, not per-shot timestamps. Historical observations and archived forecasts must remain separate. Video publication/availability timestamps cannot establish shot time.

Carry, reported total, derived distance differences and measured ground paths remain separate. Do not infer a roll trajectory from endpoints or classify clubs solely by shot distance.

Implementation order: correctness and video investigation; integrated flight/green views; persistent bulk collection; field analysis; player/conditions views; independently validated surface research.

## Version lock

Version 1 is an as-is source snapshot, not a completion claim for all planned features. See [version 1 lock](releases/V1_LOCK.md). Weather is explicitly version 2; see [version 2 roadmap](V2_ROADMAP.md). No weather code was introduced before this deferral.
