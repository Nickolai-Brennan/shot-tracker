# TOURCAST Shot Lab — Complete App and Program User Guide

**Reviewed:** October 27, 2026  
**App version:** Saved version 6  
**Source snapshot:** `1706677a7a9a22f8221c77521b948e10c31b11af`  
**App:** https://tourcast-shot-lab-nick.shrewdfir128.chatgpt.site

## 1. Program overview

TOURCAST Shot Lab is your private golf-data workspace. It combines event and participant selection, player-round shot retrieval, JSON import, shot inspection, hole maps, radar metric display, official scorecard comparisons, video metadata, manually annotated putt calculations, and CSV/JSON exports.

This guide covers the whole hosted app and its supporting utilities. The recent Python drive and green-break renderers are companion prototypes; they have not been integrated into version 6. The app already has a functioning interface, server routes, selection controls, and calculation logic. Those should not be confused with the separate static illustrations created in this conversation.

The version and source above were verified against the saved app source. This review inspected code and existing test definitions; it did not conduct a new browser walkthrough, run the hosted live PGA requests, or rerun the app build/test suite.

## 2. Start here

### Open the app

1. Open the app URL with your authorized account.
2. The main workspace is **Shot explorer**. The sidebar’s **PGA TOUR data** label is informational, not a separate implemented page.
3. Choose either a live request or **Import JSON**.
4. After data loads, the app opens **Hole map & metrics**.
5. Use **Shot table**, **Hole map & metrics**, and **Raw response** to inspect the same dataset.
6. Download **Shot JSON** before refreshing or changing the active request scope if you want to retain your work.

The current hosted access configuration grants access to the owner only. Access is governed by the hosting platform; the “Owner access” badge is a label, not an in-app account-management screen.

### Two supported ways to load data

| Workflow | Best use | Requirements |
|---|---|---|
| **Fetch & verify** | Retrieve a player-round and request scoring verification | Selected event participant, server PGA credential, available upstream data |
| **Import JSON** | Inspect saved data without a successful live fetch | Direct decoded JSON with `holes`, or an app export with `decoded.holes`; maximum accepted size is 20 MiB |

An API key being configured does not prove the provider will accept a request. Import remains usable when live access fails.

## 3. Feature inventory and current status

| Feature area | Available in hosted version 6 | Important boundary |
|---|---|---|
| Season selector | Years 1960 through next calendar year | Coverage depends on the source; available years do not guarantee tracking |
| Event selector | PGA schedule; labeled bundled fallback on schedule failure | Fallback is not a verified live schedule |
| Participant selector | Event field merged with leaderboard records | Includes recorded participants, withdrawals, and alternates where supplied |
| Round selector | Rounds 1–4; “not recorded” hints where available | A selectable round may have no shot coverage |
| Radar request option | **Include radar data** | Requests data; does not guarantee returned measurements |
| Video request option | **Include shot videos** | Video lookup can fail while shots remain available |
| Request status | Key configuration, loading, success/failure, warnings | Configuration and connection success are separate states |
| JSON import | Direct decoded object or prior app export | Imported verification is a saved snapshot, not rerun live |
| Hole filtering | All holes or a selected hole | Affects filtered rows, map input, and CSV |
| Text search | Searches flattened row content | Can match hidden fields as well as visible descriptions |
| Shot table | Hole, sequence, record type, description, distance, remaining, from/to lies | First 1,000 matching rows displayed; CSV retains all matching rows |
| Source overhead map | Provider hole image with source-normalized endpoints | Dashed lines are endpoint connectors, not reconstructed ball flight |
| Coordinate-map fallback | Source start/end positions and stroke markers | Not a geographic terrain model |
| Custom image overlay | PNG/JPEG/WebP with manually entered bounds | Session-only calibration; not automatically georeferenced |
| Shot selection | Click/keyboard-select an end marker or choose a shot button | Selected shot drives detail and video/putt panels |
| Metric panel | Sixteen metric slots with source-field provenance | Missing/unsupported aliases remain unavailable |
| Sampled arc panel | Recognized finite x/y/z arrays | Horizontal axis is sample index; polynomial radar fits are not decoded here |
| Official viewer | Load/hide embedded TOURCAST and direct external link | Provider embedding and coverage can prevent display |
| Official scoring | Round total, to-par value, hole scorecard | Incomplete/inconsistent scorecards remain unverified |
| Tracking coverage | Stroke records and other record types | Tracking record count is not the round score |
| Verification bot | Deterministic API/page consistency checks | Not an LLM; not independent human review or tracking validation |
| Video association | Event/player-request scope/round/hole/stroke matching | Multiple matches are ambiguous; no silent first-choice selection |
| Video timing fields | Availability dates, availability interval, clip duration | Availability is not ball-motion duration |
| Manual putt confirmation | For generic green `STROKE` candidates | Green origin alone is not proof of a putter stroke |
| Putt distance/speed | Explicit physical units and contact/rest timing | Endpoint-only speed is a lower-bound average, not launch speed |
| Optional timed path | Ordered x/y/time samples; planar distance and segment speeds | Full-motion endpoints must match the selected shot |
| Reset calculation | Removes selected shot’s annotations | Does not remove source data |
| CSV export | All filtered enriched rows | Nested arrays become JSON cells |
| Shot JSON export | Entire active result, original decoded data, metadata, annotations, enrichments | Ignores hole/text filters; not just the selected shot |
| Raw response view | Full current result object | Includes enrichment/verification wrapper, not only upstream bytes |
| Browser-session state | Loaded records and annotations in memory | Refresh clears data; no saved-session database configured |
| Python drive renderer | Companion prototype only | Static 3D, side, overhead reconstruction; not yet in app |
| Green-break/elevation comparison | Companion prototype only | Static map/path/profile output; not yet in app |
| Green contours / independent break prediction | Not implemented | One simulated short putt cannot establish the full green surface |

## 4. Fetch and verify a player-round

1. Choose **Season**.
2. Choose **Event**. Read the schedule source/fallback note.
3. Choose **Participant** from this event’s roster.
4. Choose **Round**. The initial round value is 4; check it explicitly for a round-1 analysis.
5. Set **Include radar data** and **Include shot videos** as needed. Both begin enabled.
6. Select **Fetch & verify**.
7. Review warnings, official scoring, tracking coverage, and verification status before analysis.

Changing season, event, participant, or round clears the loaded dataset. Stale shot responses are aborted or ignored. Starting a fetch also clears the previous dataset before the new response succeeds. The current source therefore does not preserve an old dataset after a failed fetch, despite an older README sentence saying otherwise.

The **Open TOURCAST** link in the request panel uses the pending selection controls. The **Open hole map** link inside the map view uses the loaded dataset’s metadata and selected hole. Prefer the map-view link when comparing an imported dataset.

## 5. Import and retain work

1. Select **Import JSON**.
2. Choose a decoded response or previous **Shot JSON** export.
3. Confirm holes and shot details appeared.
4. Check the loaded dataset identity shown above the result tabs.
5. Export **Shot JSON** after annotations or calculations you want to retain.

A bare response may contain `tournamentId`, `playerId`, and `round` inside the decoded object, but the current importer does not automatically promote these fields to app `meta`. Such imports can show valid shots with unspecified result identity, missing video joins, and no loaded-context official link. Reimporting a full app export retains its metadata and annotations.

The import routine re-enriches source records and recomputes calculations from retained annotation inputs. Imported score/verification information is not a fresh live check. The app labels imported verification accordingly.

Imports, custom maps, and annotations are held in browser memory. There is no automatic cross-session save. Refresh, navigation, request changes, or a new import can replace work; export first.

## 6. Inspect shots and use filters

### Shot table

Use the **Hole** selector and **Search shots** field to narrow records. The search checks serialized flattened row content, so a match may come from radar, annotation, or other fields not shown in the eight visible columns.

The footer distinguishes matching records from loaded records. Empty filtered output is not proof of zero strokes or a completed round.

### Hole map & metrics

1. Open the tab.
2. Choose **Map hole**.
3. Select a numbered endpoint marker or a **Shot N** button.
4. Inspect its play-by-play description, from/to lie, metric cards, video data, and calculation panel.

When a source overhead image is available, normalized source x/y positions are placed directly on it without flipping the image axes. If the image fails or is absent, a coordinate-only view is used. Search filters also affect the map’s input rows; clear search when you want to see all shots on the hole.

### Custom map overlay

1. Expand **Overlay a hole-map image**.
2. Choose a PNG, JPEG, or WebP image.
3. Enter **Left x**, **Right x**, **Bottom y**, and **Top y**.
4. Use bounds in the same coordinate system as the map’s shot x/y fields.
5. Check known landmarks before interpreting positions.

Right must exceed left, and top must exceed bottom. This feature uses bounds, not a surveyed landmark fit. Do not enter native course-foot bounds for normalized 0–1 shot x/y. Changing map holes clears the custom image/calibration.

## 7. Understand the metric panel and shot arc

| Metric slots |
|---|
| Spin rate; smash factor; swing/club speed; ball speed |
| Air distance/carry; shot roll; putting distance; putting break |
| Launch angle; launch direction; apex height; flight time |
| Landing angle; spin axis; total distance; distance remaining |

Each reported metric identifies its source field. Units appear when supported by source fields or source strings; otherwise the app says the unit is unspecified. Total distance does not substitute for carry or roll. Endpoints do not establish spin or break.

Known source-compatibility gaps: the current metric aliases do not include `launchSpin` or `actualFlightTime`, which occur in the supplied data. Those values can remain blank even when the source contains them. The arc reader accepts selected arrays of explicit x/y/z samples, but does not evaluate `radarData.ballTrajectory` polynomial coefficients or automatically ingest `ballPath.path`.

The hosted **Shot arc · measured trajectory** heading is an existing label. Its reader checks numeric shape, not measurement provenance; do not interpret that heading as proof that arbitrary imported samples were physically measured.

The separate Python flight renderers do evaluate the radar polynomial fits. Their output is currently a companion result, not the hosted arc panel.

## 8. Scoring, coverage, and verification

### Official score versus tracking

The **Official round score** comes from the scorecard when all 18 valid hole scores reconcile. **Round to par** is derived from complete score/par values. Tracking summaries separate stroke records from other entries such as drops.

Expand **Round scorecard & tracking coverage** to inspect hole-level scores and coverage. A matching count is a consistency indication, not proof that all tracking geometry is correct.

### Verification bot

The service compares event total strokes, selected-round total, and scores on the lowest/highest available numbered holes using leaderboard, scorecard, and tracking records. When accessible structured page data exists, it also compares the player total from the official event page.

| Status | Meaning |
|---|---|
| **Passed** | Required comparisons agree, including the supported page confirmation |
| **Mismatch** | One or more compared values disagree |
| **Unable to fully verify** | Required values or readable page data are unavailable |
| **Not rerun for imported data** | Imported information is a saved snapshot |
| **Not applicable** | Request lacks the selected player-round score context |

The bot uses bounded server HTTP requests. It does not launch a browser or visually inspect the course. A score pass does not validate radar accuracy, real green slopes, or complete ShotLink coverage.

## 9. Video matching and timing

The **Shot video & event timing** section shows video match status and supported **Open clip** links. Matching uses canonical event identity, round, hole, stroke, and player scope. Ambiguous matches are retained rather than silently selected.

The timing panel distinguishes:

- **Video available from/until (UTC):** publication/availability dates.
- **Availability interval:** difference between availability dates.
- **Clip duration:** supplied video duration.
- **Ball-motion duration:** contact-to-rest/hole-out interval you annotate for a putt.

Never use a publication window or the entire clip duration as the putt’s travel time. The app does not include frame-by-frame annotation or automatic ball tracking; use the external clip to establish your timing inputs.

## 10. Calculate putt distance and average speed

1. Select the relevant green stroke.
2. If its generic source type is `STROKE`, enable **Confirm this green stroke is a putt** only when justified.
3. Choose **Coordinate unit**: meters, feet, or yards. Keep **Unknown** when the physical scale is unverified.
4. Enter **Ball contact (s)** and **Ball at rest / hole-out (s)** on a consistent timeline.
5. Select **Calculate putt metrics**.
6. Read the calculation status, straight-line distance, optional path length, motion duration, average speed, and basis text.
7. Use **Reset calculation** to remove that shot’s annotations.

For live-format source records, native `tourcastX`/`tourcastY` are preferred over normalized display x/y. Imported fallback x/y must already be calibrated physical positions.

### Optional timed path

Expand **Optional timed path coordinates** and enter an ordered JSON array of `{x, y, timeSeconds}`. Positions must use the selected physical unit, match the shot endpoints, and span the complete ball motion. Times must strictly increase; 2–10,000 points are accepted. A path takes precedence over separate contact/rest values.

The current endpoint tolerance is very strict (1e−6 coordinate units). Rounded manual points may be rejected. Also, the sample putt’s final path point and rounded source endpoint differ slightly, so direct paste-in can fail until endpoint handling is improved. Preserve the source discrepancy rather than silently editing it away.

A supplied clip duration bounds allowed motion offsets when available. Average speed is distance divided by motion duration, not initial launch speed. Endpoint-only distance/speed are lower bounds for a curved route. Timed path calculations are planar and can omit unsampled curvature and terrain.

Common statuses include `putt-confirmation-required`, `coordinate-unit-required`, `ball-motion-timing-required`, `coordinates-unavailable`, `invalid-timed-path`, `path-endpoints-do-not-match-shot`, `path-times-must-increase`, `motion-outside-video-duration`, and `calculated`.

## 11. Export and inspect raw data

| Action | Export scope | Retains |
|---|---|---|
| **CSV** | All currently filtered rows | Flattened source/enriched fields and annotations; arrays as JSON cells |
| **Shot JSON** | Entire active result, irrespective of filters | Original decoded payload, envelope where available, metadata, warnings, scoring, verification, videos, enrichment, annotations |
| **Raw response** tab | On-screen current result | Same broad wrapper for inspection; not a separate save action |

CSV escapes quotes and prefixes formula-like strings to reduce spreadsheet formula interpretation. Export filenames are based on dataset metadata; metadata-poor imports use generic names. Browser downloads may rename a repeated filename.

## 12. Supporting utilities and recent prototype features

### Extractor

The separate `tourcast-starter` Python package provides one-player/multiple-round extraction, raw JSON retention, and flattened CSV export. Its optional hole filter affects CSV only. It is a companion to the hosted TypeScript server, not the server process behind the app.

```bash
# Run inside the extracted tourcast-starter folder.
python -m venv .venv
# Activate the environment using your operating system's usual command.
python -m pip install -r requirements.txt
python pull_tourcast.py --event R2026011 --player 57366 --rounds 1 --hole 14 --out data
```

Use `--rounds 1 2 3 4` for four rounds; `--rounds 4` requests only round 4. `--url` can read event/player/round from a complete TOURCAST URL. Live retrieval depends on upstream access. The starter README records a historical HTTP 403, not a current audit result.

### Radar drive reconstruction

`plot_drive.py` and `plot_hole14.py` evaluate radar fits and render static 3D, side, and overhead views. They currently require source/path edits to run on another computer. They do not include course-registered flight, bounce, or roll.

For hole 14, shot 1, the fitted apex is about 127.09 ft versus the reported 127.1 ft. Ball speed 181.76 mph, spin 2,691.65 rpm, club speed 120.29 mph, and smash factor 1.51 match the supplied displayed specs after rounding. Fitted forward displacement is not automatically carry distance.

### Green-break comparison v2

Extract `green-break-feature-v2.zip` and run:

```bash
# Run inside the green feature folder; its requirements differ from the extractor.
python -m pip install -r requirements.txt
python green_break_feature.py --source shot-data.json --hole 14 --map hole14-green.png --reference tourcast-putt-closeup.png --output hole14-putt-closeup-comparison.png
```

This produces a green overlay, magnified chord deviation, elevation profile, screenshot reference, and metrics JSON. It selects the first eligible sampled putt, not an explicit stroke argument. Several captions remain specific to hole 14/shot 4 and downhill motion; do not treat it as a generalized production module yet.

Hole 14, shot 4 has 12 simulated samples, about 0.856 in. maximum chord deviation, 1.155 in. elevation drop, and −2.31% endpoint grade. Its displayed distance is 47 in., sampled planar length about 50.03 in., and source path-length metadata about 50.14 in. Those are distinct values, not an excuse to rescale the path.

The close-up supports qualitative shape agreement with TOURCAST. Both may use the same simulation, so it is not independent real-world validation. Full green contours and cross-slope are not inferred from this one putt.

## 13. Troubleshooting

| Problem | Action |
|---|---|
| Key configured but fetch fails | Read the actual request error; use JSON import while access is unavailable |
| No participants | The app could not establish event participation; do not substitute the full player lookup as the field |
| Imported shots have unspecified identity | Reimport a full app export with metadata; bare-object identity promotion is not implemented |
| Metric blank despite source data | Inspect raw fields; alias/shape support may be missing |
| Arc unavailable despite polynomial data | Polynomial reconstruction is a separate prototype, not the current app reader |
| Official viewer blank | Use **Open hole map**; embedding and coverage belong to the provider |
| Incorrect custom overlay | Recheck map orientation and normalized-versus-native bounds |
| Verification incomplete | Inspect individual API and page checks; do not relabel it as passed |
| Putt speed unavailable | Confirm putt type, physical unit, and valid full-motion timing |
| Timed path rejected | Check endpoints, precision, monotonic timestamps, and clip bounds |
| Work disappears after refresh | Reimport a retained Shot JSON export; there is no persistent session store |
| Selected hole appears empty | Clear search and inspect source coverage |

## 14. Developer commands and maintenance

The hosted app uses TypeScript/React, Vinext/Vite, and a Cloudflare Worker runtime. The package specifies Node ≥22.13 and pnpm 11.25.0. Use its checked-out source and configured server environment; keep the PGA credential outside tracked source.

```bash
# Development commands from the existing app README/package scripts.
pnpm install
pnpm dev

# Existing checks; these were inspected, not rerun for this documentation task.
node node_modules/typescript/bin/tsc --noEmit
node tests/data.test.mjs
node tests/metrics.test.mjs
node tests/video-putt.test.mjs
node tests/scoring-catalog.test.mjs
pnpm build
```

Publication follows the existing hosted app workflow. This documentation task does not modify or republish version 6.

## 15. Implementation Notes

### Assumptions

This guide describes saved app version 6 and the separately inspected prototypes as of October 27, 2026. Source inspection establishes implemented behavior, not fresh live/browser verification.

### Risks

Upstream access, incomplete tracking, inferred units, manual timing, strict endpoint matching, and alias gaps can limit results. Simulated paths must retain their classification.

### Next Steps

Use the app-wide changes report to prioritize import identity, source-field support, reliable session handling, and integration of the flight/green prototypes.

### Alternatives

Continue offline JSON workflows when live retrieval is unavailable. Retain the Python renderers as reference implementations while their features are integrated into the existing app.

### Performance Considerations

Search and enrichment run on browser-memory rows. The table displays 1,000 rows while CSV exports the entire filtered set. Large imports and repeated full-result rendering have not been benchmarked.

### Maintenance Considerations

Keep guide, source version, field mappings, status definitions, tests, and exported metadata synchronized. Preserve raw input separately from derived calculations.
