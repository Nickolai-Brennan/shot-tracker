# Program feature scope

Approved planning direction from the current project conversation; future items are not implemented by this snapshot. See [Version 1.0 entities and confirmed decisions](V1_PROGRAM_ENTITIES.md) for implementation status, answers and pending choices.

| Module | Existing foundation | Planned extension |
|---|---|---|
| Event collection | Event/participant/round selection, player-round pull and raw import | Tee times, player/all-round and field/round pulls, full-event jobs, retry/resume and coverage |
| Shot details | Standard distance/lie/sequence fields and source metric slots | Complete radar field adapters, units, ball speed/spin/club speed/smash displays |
| Maps and flight | Hole-image endpoints and separate radar-fit scripts | Integrated overhead/side/3D paths, source classification, landing/bounce/roll when supplied |
| Green analysis | Separate image/putt/profile prototype | Native image retrieval, coordinate-only x/y/z green, field trails, selected-putt break detail |
| Comparison | Qualitative source-image comparison | Calibrated rendering comparison; independent prediction only with a validated model |
| Field analysis | Participant roster | Comparable-shot spray charts, density and top-decile outcome zones with sample sizes |
| Player analysis | Selected player-round; nullable source headshot URL/provenance retention | Player details and separate 3D trajectory groups for driver and each reliably identified club |
| Weather | No integrated tracker | Forecast issue/valid times, observations, true shot-time association, matching uncertainty |
| Durability | Manual JSON/CSV exports | Saved sessions, versioned schemas and provenance |
| PGA TOUR news | No RSS ingestion yet | Future-release verified RSS/Atom fetch and normalized items: [IVI-287](https://linear.app/nthezone/issue/IVI-287/future-release-fetch-and-normalize-pga-tour-rss-news) |

Top 10% must name the ranking metric: useful distance/playable lie, next-shot outcome, or sufficiently supported expected strokes remaining. Dense/longest regions are not automatically best. Control for comparable starts, hole/course, pin/round and available conditions; retain sample-size limits.

Multiple putt routes can support coverage and local elevation exploration. Simulation paths are not independent evidence of surveyed terrain. Near-cup downward points can describe ball entry and must not automatically deform the green. Keep unsupported surface areas unknown.

Tee times are scheduled group starts, not per-shot timestamps. Historical observations and archived forecasts must remain separate. Video publication/availability timestamps cannot establish shot time.

Carry, reported total, derived distance differences and measured ground paths remain separate. Do not infer a roll trajectory from endpoints or classify clubs solely by shot distance.

Implementation order: correctness and video investigation; integrated flight/green views; persistent bulk collection; field analysis; player/conditions views; independently validated surface research.
