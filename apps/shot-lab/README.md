# TOURCAST Shot Lab

Private PGA TOUR shot explorer. Select an event, player, and round, request shot data, filter holes, search strokes, inspect normalized end positions, and export CSV or raw JSON.

## Runtime

This hosted interface uses TypeScript, React, and a server route rather than a hosted Python process. The GraphQL operation matches the uploaded pgatourPY source. No secret is embedded in the repository or browser bundle. Set PGA_API_KEY in the server environment. Live access depends on PGA TOUR accepting the request; configuration alone does not establish valid access.

## Local development

```bash
pnpm install
# Supply PGA_API_KEY through your local environment, never in tracked source.
pnpm dev
```

## Validation

```bash
node node_modules/typescript/bin/tsc --noEmit
node tests/data.test.mjs
pnpm build
```

## Data behavior

- Uploaded lookups contain 149 valid event IDs and 218 valid player IDs; repeated CSV header rows were excluded.
- One request retrieves a player-round; hole and text filtering happen locally.
- CSV contains filtered shots and all flattened stroke fields, including radar when supplied. Arrays remain JSON cells.
- Raw JSON exports the complete decoded response, source envelope, and request metadata, regardless of active filters.
- JSON import accepts decoded data with a holes array or a prior app export with decoded.holes.
- Imports stay in browser memory. Refreshing clears data. Download exports to retain them.
- Empty coverage is not an authentication failure. API failures preserve the previous dataset.
- Coordinate view uses source x/y end positions normalized within the selected hole; it is not a geographic map.

## Known verification limit

The authoring environment returned HTTP 403 for the supplied production key. Live shot coverage remains unverified. Automated tests use clearly separated synthetic fixtures to verify decoding, preservation, validation, and error handling.

## Hole maps and radar metrics

The **Hole map & metrics** tab opens after a successful import or fetch. Choose a hole and select an end marker or stroke button. Dashed segments connect source start/end coordinates; they are not measured flight arcs. The optional TOURCAST viewer and direct link use the loaded dataset metadata, not pending request controls. PGA may block embedding or have no coverage.

For a local basemap overlay, expand **Overlay a hole-map image**, select a PNG/JPEG/WebP, and supply left/right X and bottom/top Y bounds in the shot coordinate system. The image is not automatically georeferenced or saved. Changing holes resets it to avoid showing the wrong map. Check calibration against known landmarks.

The metric panel preserves field provenance and source units. Spin, smash, club/ball speed, carry, roll, putt distance/break, launch, apex, flight time, landing angle and spin axis display only supported source values. Missing fields show unavailable. Putting distance may use the source stroke distance when strokeType identifies a putt. Total distance never substitutes for carry or roll. Trajectory rendering requires a recognized array of finite x/y/z samples; its horizontal axis is sample index.

Validation: `node tests/data.test.mjs`, `node tests/metrics.test.mjs`, and `node node_modules/typescript/bin/tsc --noEmit`.

## TOURCAST video timing and putting calculations

`POST /api/tourcast-shot-video` accepts `event`, `player`, `round`, optional `hole` (1–18), and optional `shot` (1–100). It runs the bundled `TourcastVideos` query with the server-side PGA key and returns raw video metadata and envelope.

`POST /api/shots` accepts `includeVideos: true` to request video metadata alongside shot data. Video lookup failure becomes a warning; shot results remain available. `decoded` and `envelope` retain their source contents. `enrichedDecoded.holes[].strokes[]` adds:

- `tourcastShotVideo`: matched metadata, association, and matched/ambiguous/not-available status.
- `video-availability-start-utc`, `video-availability-end-utc`: UTC ISO dates from the matched video's `startsAt`/`endsAt` epoch milliseconds.
- `video-availability-seconds`: the availability interval, never used to calculate putt speed.
- `start-time-event`, `end-time-event`, `time-total-event`: validated annotated ball-motion start/end offsets and duration in seconds; null until a valid calculation is available. These are timeline offsets, not UTC timestamps.
- `event-time-basis`: explicitly identifies annotated motion offsets or unavailable shot-event timing.
- `puttAnalysis` and `motionAnnotation`: calculated values and their explicit inputs.

Video joins require matching event, round, hole, and stroke inside the player request scope, and matching player IDs when the response includes them. Multiple matches never silently select one.

`POST /api/putt-analysis` accepts a source `shot`, optional `video`, and `options` containing `coordinateUnit` (`m`, `ft`, `yd`, or `unknown`) plus `motionStartSeconds` and `motionEndSeconds`, plus `confirmPutt: true` for confirmed putts with generic STROKE classification. Coordinates must be projected physical coordinates, not uncalibrated pixels or latitude/longitude. The start/end offsets must describe ball contact through rest/hole-out, rather than the whole clip. Live green shots labeled STROKE require explicit putt confirmation; a green lie alone does not prove the club used was a putter. Units and motion markers are manually asserted annotations; calculations do not validate them against video frames.

Optionally supply `options.path` as an ordered array of `{x, y, timeSeconds}` covering the full motion and matching the source shot endpoints. This yields sampled planar path length and per-segment average speeds. The path takes precedence over explicit start/end offsets. Times must increase; positions are never reordered. Annotated times beyond the source duration (clip length) are rejected; availability start/end dates are never used to constrain motion offsets.

Math: straight distance = Euclidean endpoint displacement × coordinate-unit scale. Sampled path distance = sum of consecutive coordinate displacements × scale. Average speed = distance / contact-to-rest duration. Endpoint-only distance and speed are lower bounds for a curved putt, not the traveled distance or initial launch speed. Timed samples approximate the path and omit unsampled curvature/vertical terrain.

In **Hole map & metrics**, select a putt, choose the physical coordinate unit, enter contact/rest seconds or a timed path, then select **Calculate putt metrics**. Shot JSON exports retain annotations and enriched results; CSV contains enriched flattened fields. Reimporting an app export recomputes the calculations from retained inputs.

Run `node tests/video-putt.test.mjs` for joins, timestamp semantics, unit conversions, duration validation, curved paths, route integration, and partial video failure.

Live schema verification: full event identity uses `contentTournamentId`; `tournamentId` may be a short course/event code. The inspected videos had `startsAt` equal to publication time and `endsAt` in 2038, so these are treated as availability dates. `duration` is separately exposed as `video-duration-seconds`. They cannot establish actual shot-event or ball-motion timestamps.

## Event participation, scoring and verification

Selection is now **Season → Event → Participant → Round**. `/api/catalog?season=YYYY` loads the PGA schedule (1960 through next calendar year, subject to source coverage). A clearly labeled bundled lookup is used only when the live schedule request fails. `/api/participants?event=RYYYYNNN` merges that event’s Field and Leaderboard responses; it retains withdrawals, recorded historical participants, and alternates without presenting the fixed player catalog as event membership.

Selections clear prior datasets and abort/ignore stale shot responses. Every response retains the event/player/round scope. A source shot payload with a conflicting identity is rejected.

ScorecardCompressedV3 supplies official hole and round scoring. A completed round total must agree with its 18 hole scores; inconsistent/incomplete scorecards remain unverified. Tracking record counts are separate from strokes; DROP and other non-STROKE entries are not counted as physical strokes or used to infer penalty scoring.

The verification bot runs on each successful `/api/shots` and standalone `/api/tourcast-shot-video` request. It runs on `/api/putt-analysis` when valid event/player/round `meta` is supplied. Schedule/roster requests have no selected player score and report verification as not applicable. The bot opens the official event page with a bounded server request and compares event total strokes, selected-round total, and the first/last available hole scores using leaderboard, scorecard, and shot records. Page access failure, absent values, or unreadable client-rendered score data cannot produce a full pass. Results expose separate API-check and page-check states, source URLs, selected holes, compared values and verification timestamps. This is a deterministic verification service, not an LLM guessing scores.

A page opened by the service is an HTTP page fetch; it does not control a separate browser or launch user tabs. Dynamic page values can be checked only when usable structured data is embedded in its HTML. A pass is a scoped consistency check and does not establish complete ShotLink coverage or independent human confirmation.

Live TOURCAST normalized x/y are rendered against the returned overhead hole image without flipping or rescaling the source image axes. Putting calculations use native tourcastX/tourcastY when present and still require an explicit physical-unit selection.

Validation: `node tests/scoring-catalog.test.mjs` plus the existing data, video/putt, metrics, TypeScript and production build checks.
