# TOURCAST Shot Lab bug register

Date: October 27, 2026. Baseline: hosted version 6 / source commit `1706677a7a9a22f8221c77521b948e10c31b11af`.

This register separates verified code/input behavior, user-reported symptoms, source discrepancies and missing features. Entries remain open. Priority P1 affects core results or retention; P2 affects interpretation or general reuse. None is claimed fixed by repository creation.

| ID | Priority | Problem | Evidence / classification | Fix and acceptance criteria |
|---|---|---|---|---|
| BUG-001 | P1 | Shot-video links unavailable: all share URLs are null | Confirmed in `fixtures/R2026011_57366_r1.json`: 37 videos, 37 null `shareUrl`, 37 populated `poster`, 37 populated `thumbnail`; video response has no playback URL field. `apps/shot-lab/app/shot-video-panel.tsx` reads only `v.shareUrl`. Upstream-null cause remains unknown. | Preserve raw metadata; distinguish matched metadata from playable video; investigate official content/playback resolution, coverage and availability using the actual response. Validate a resolvable clip, null response, unavailable clip, ambiguous match and rejected URL. Never construct a guessed player URL or treat an image as video. |
| BUG-002 | P1 | Missing imported event/player/round identity | Code-confirmed: bare `holes` imports use empty `meta` despite decoded identity fields; see `app/page.tsx`. | Promote validated source identity when wrapper identity is absent; reject conflicts. Bare fixture displays correct scope, filenames and video associations. |
| BUG-003 | P1 | Spin and flight-time fields can appear missing | `app/shot-metrics.ts` omits observed `launchSpin` and `actualFlightTime` aliases. | Explicit provider mapping, units and precedence. Hole 14 spin displays 2691.65 rpm where units are supported; reported 8 s remains distinct from fitted interval near 7.54 s. |
| BUG-004 | P1 | App cannot display the supplied radar polynomial flight | Reader accepts selected x/y/z arrays but does not evaluate `radarData.ballTrajectory`. Integration gap, verified in code. | Add adapter and parity fixtures. Hole 10/14 radar-fit outputs agree with the reference calculations within documented tolerance; missing/invalid segments produce useful empty states. |
| BUG-005 | P1 | Valid rounded putt path rejected by endpoint tolerance | `app/shot-video.ts` uses 1e-6 coordinate units. Example end `(11925.242,9210.303)` versus rounded `(11925.24,9210.3)` differs by about 0.00361 units. | Source-resolution-aware physical tolerance, exported residuals, scope checks, no silent snapping. Accept associated rounded sample; reject another shot's path. |
| BUG-006 | P1 | Active dataset cleared before replacement succeeds | `app/page.tsx` clears data on selections/fetch/import; README says failed API requests preserve it. Confirmed behavior/document mismatch. | Keep active and pending scope separate until replacement validates. Failed fetch/import retains old records and annotations without relabeling; stale responses ignored. |
| BUG-007 | P2 | Arc heading claims measurement provenance not established by parser | `app/shot-explorer.tsx` says measured trajectory; reader validates numeric shape only. | Heading and legend derive from measured/radar-fit/simulated/user/unknown classification. Simulated input never displays as measured. |
| BUG-008 | P2 | Native sampled putt path is not automatically available in the app | `ballPath.path` / `secondsSinceStart` not adapted into the existing timed-path input. Integration gap. | Import selected-shot samples with frame, units, timing and classification; preserve source points; no fabricated timing. |
| BUG-009 | P2 | Source putting distances disagree | Hole 14 label is 47 in; sampled XY length is about 50 in. Data discrepancy, not proven arithmetic bug. | Display reported distance, chord, planar sampled length and optional 3D length separately with source and units. Retain discrepancy through export/reimport. Do not rescale to force agreement. |
| BUG-010 | P2 | Flight scripts are tied to a scratch path and specific shots | `prototypes/flight/plot_drive.py`, `plot_hole14.py` use absolute input/output paths and sample labels; hole-14 script also retains an outdated hole-10 unit-check comment. | Separate reusable CLI from preserved baseline. Arguments select source/hole/shot/output; labels and limits derive from data; wrong/missing shots fail clearly. |
| BUG-011 | P2 | Green prototype can mislabel other shots | `prototypes/green-break/green_break_feature.py`: first eligible green-origin stroke, fixed Shot 4/cup label, downhill wording, fixed crop. Green-origin STROKE is not proof of putter use or hole-out. | Explicit shot/putt selection; distinguish finish/pin; signed uphill/downhill/level labels; reference crop settings; confirm units and source classification. |
| BUG-012 | P2 | Green-image fit can look more certain than evidence allows | Affine fit reuses endpoint correspondences; near-zero fit residual is not independent accuracy. Estimate/evidence limitation. | Distinguish training residual and held-out alignment error, record controls/frame/units, reject degenerate fits, mask unsupported regions. |
| BUG-013 | P2 | Work is lost on refresh; export is the only retained session mechanism | Confirmed current browser-memory lifecycle. Missing persistence feature with data-loss impact. | Save/resume records, annotations, map calibration and schema version; interrupted save reports failure; round trip retains source identity. |
| BUG-014 | P2 | Video URL helper accepts non-string inputs through coercion | `safeVideoUrl` calls `String(raw)` and resolves relative to PGA origin; null/empty values can become misleading PGA page links. Code-confirmed handling flaw; separate from upstream nulls. | Validate nonempty string before URL parsing; allow documented URL forms/domains only. Test null, undefined, empty, whitespace, malformed, relative and valid URL cases. |

## Video investigation steps

1. Preserve the failing fixture and its full video response. Source contains metadata without share URLs; this is not evidence of a playback network failure.
2. Separate video association state from URL-resolution and playback state.
3. Inspect the provider's actual supported content-resolution mechanism for these IDs and event scope; do not invent a URL schema.
4. Record returned status, availability, resolution errors and any expiry without storing credentials.
5. Test a real supported playable example, an unavailable example, all-null metadata, ambiguity, URL rejection and optional-video request failure.
6. Keep shot retrieval usable when video fails. Posters and thumbnails remain images, not playable clips.

## Feature backlog (not existing-code bugs)

Integrated green/flight views; event tee times; resumable full-field and all-round pulls; field spray patterns; top-decile outcome zones; coordinate-only field putt coverage; supported surface estimation; forecast/observation matching; per-club player 3D pages; measured or explicitly derived roll. See `FEATURE_SCOPE.md`.

## Closure policy

Each fix gets a module branch, a failing reproduction where practical, targeted acceptance checks, a PR and a module release note. Link the fix to the bug ID. Do not change unrelated program folders. A passing synthetic test does not establish live provider availability or measured green accuracy.
