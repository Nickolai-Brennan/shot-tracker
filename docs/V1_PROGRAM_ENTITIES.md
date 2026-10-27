# Version 1.0 program entities and decision record

Updated: October 27, 2026. Program: TOURCAST Shot Lab / shot-tracker.

## Purpose and version meaning

This is the working version 1.0 entity specification and the place to record confirmed answers during the program-document review. It consolidates the current Program User Guide, Program Breakdown and Changes Report, Feature Scope, Bug Register, and the user's current requirements. No separate document was attached to this request, so those repository documents are the review baseline.

**Version 1.0 here names the target specification, not a shipped release.** The preserved hosted app is saved version 6; its package version is still 0.1.0. A feature may belong in the entity model while its implementation is still planned. No package bump, release tag, database migration or hosted deployment is implied.

## Status vocabulary

- **Implemented:** present in the repository, with the limitations documented below.
- **Prototype:** demonstrated in a companion Python program; not integrated into the app.
- **Required / planned:** requested program capability whose implementation is outstanding.
- **Future release:** explicitly outside the version 1.0 core, with release number/date not chosen.
- **Pending confirmation:** a decision or source contract still needs evidence or a user answer.

These labels describe implementation and scope separately. A requested feature is not marked delivered merely because this document defines its entities.

## Entity inventory

Keys below are logical identity contracts, not a mandate to add database tables now. Retain provider IDs as strings; scope source-local IDs to the provider/event as needed.

| ID | Entity | Identity and relationships | Required information / behavior | Implementation and scope |
|---|---|---|---|---|
| E01 | Season | Provider + season; contains Events | Season year and schedule coverage/source | Implemented selection |
| E02 | Event | Provider + eventId; belongs to Season; references Courses | Name, dates/timezone where supplied, field and retrieval status | Implemented event selection; richer event workspace planned |
| E03 | Course | Provider courseId when supplied; referenced by event/round/shot | Name, course version, coordinate frames and source assets | Existing source data; normalized course identity pending source verification |
| E04 | Hole | Course + layout/version + holeNumber; round-specific tee/pin configuration | Par, available hole/green images, tee/pin coordinates and frame | Hole navigation/maps implemented; configuration normalization planned |
| E05 | Player | Provider + playerId; participates through EventParticipant | Name, optional `headshotUrl`, `headshotSource`; further biography only when supplied | Player identity implemented; headshot retention added by this change |
| E06 | EventParticipant | Event + playerId | Field/alternate/withdrawn/recorded membership, status and available rounds | Implemented roster merge; preserve source role distinctions in later refinements |
| E07 | PlayerRound | Event + playerId + roundNumber; references course/configuration when known | Official scorecard, tracking coverage, available shots | Implemented selected player-round; all-round view planned |
| E08 | TeeTimeGroup | Provider group ID scoped to event + round, otherwise an explicit source key | Players, starting hole, scheduled time, timezone and revision time | Required / planned; scheduled time is not actual shot time |
| E09 | Shot / TrackingRecord | Event + player + round + hole + provider record identity/sequence | Record type, sequence, description, start/end lie and coordinates, reported distances, timing basis | Implemented; distinguish STROKE, DROP and other records; sequence alone may require disambiguation |
| E10 | ShotMeasurement | Shot + metric name + source field | Value, unit, precision, source, reported/derived status; ball speed, spin, club speed, smash, launch, apex, carry/roll when supplied | Metric slots implemented; observed field adapters remain incomplete |
| E11 | TrajectorySegment | Shot + source segment identity/order | Radar fit or samples, time interval, axes, units, frame, segment kind and reconstruction class | App supports selected sample arrays; radar polynomial flight is a prototype awaiting integration |
| E12 | GroundMovement | Shot + segment identity/order | First landing, bounce/roll samples and times where supplied; final rest distinct from landing | Required / planned; total-minus-carry is not a measured roll path |
| E13 | PuttingPath | Shot + path/source version | x/y/z samples, elapsed motion time when supplied, initial direction, finish, pin and simulation classification | Timed manual path calculations implemented; native provider-path integration is planned |
| E14 | MapAsset / Calibration | Provider asset identity/URL + course/hole/configuration | Image URL, asset type, dimensions, world-to-image transform, controls, units and alignment error basis | Hole maps/manual bounds implemented; green-image retrieval/fit is a prototype |
| E15 | ShotVideo | Provider video ID; links to shot only through validated scope | Metadata, share/playback URL if supplied, poster/thumbnail, availability, duration and match status | Metadata matching implemented; fixture has 37 null share URLs; playable resolution remains BUG-001 |
| E16 | VerificationResult | Dataset/shot scope + check/version + performedAt | Values compared, source, result, warnings and limitations | Deterministic scoring checks implemented; not proof of trajectory/terrain accuracy |
| E17 | Annotation | Shot/dataset + annotation identity/version | User-confirmed units/putt classification, motion offsets, optional path, calibration and editing provenance | Session inputs/export implemented; durable saved sessions planned |
| E18 | FetchJob / DatasetSnapshot | Job ID + explicit requested scope; child requests identify player-round | Scope, options, original/enriched data separation, progress, retries, unavailable/failed states and timestamps | Single player-round request implemented; resumable player/all-round and field/round jobs planned |
| E19 | AnalysisResult | Input snapshot IDs + algorithm/version + parameters | Result, units, classification, sample size, coverage and validation basis | Putt calculations implemented; flight/green prototypes separate; field/outcome analysis planned |
| E20 | FieldShotGroup | Event/round/hole/configuration + comparable shot filter | Member shot IDs, start/lie/club filters, endpoint/landing distinction and coverage | Required / planned: field spray charts and outcome zones |
| E21 | GreenSurfaceEstimate | Course/hole/configuration + evidence set + model/version | Supported local elevations, slope estimates, uncertainty, coverage mask, independent validation | Research/planned; one or many simulated paths do not establish surveyed terrain |
| E22 | PlayerClubTrajectoryGroup | Player + reliable club identity + explicit filters/frame | Driver/iron/etc. path groups, source club identity, shots and comparison alignment | Required / planned; unidentified clubs stay unidentified |
| E23 | WeatherRecord | Provider/location + observation time, or forecast issueTime + validTime | Wind, gusts, temperature, precipitation etc. when supplied; units and location distance | Required / planned; observations and forecast snapshots remain distinct |
| E24 | ShotWeatherAssociation | Shot + WeatherRecord + matching method/version | True shot timestamp/source, temporal/spatial offset, interpolation and uncertainty | Required / planned; no substitution of publication or tee times as exact shot times |
| E25 | Export / SavedSession | Dataset/session identity + schemaVersion | Scope, source/derived separation, annotations, calibration and provenance | CSV/JSON export implemented; session persistence and migration rules planned |
| F01 | NewsFeed | Verified feed URL + source identity | RSS/Atom format, source verification, fetch status, ETag/Last-Modified and freshness | Future release: Linear IVI-287 |
| F02 | NewsItem | NewsFeed + provider GUID or canonical URL | Title, article URL, supplied summary, published/updated/retrieved times, optional image/author and explicit entity links | Future release: Linear IVI-287; news is not shot/weather timing |

## Player headshot contract

The participant API now exposes:

| Field | Type | Meaning |
|---|---|---|
| `headshotUrl` | string or null | An explicit absolute HTTPS image URL supplied as `headshotUrl` or `headshot` on a roster/leaderboard player |
| `headshotSource` | string or null | Source path identifying which payload field supplied the retained URL |

No URL is fabricated from player ID, and null does not mean the player is invalid. Do not replace missing images with a guessed official URL. A newer merged player entry without a usable headshot retains the earlier valid value. The source envelope retains original values; the normalized URL may use standard URL normalization.

The adapter rejects empty/non-string, relative, non-HTTPS, malformed, or credential-bearing URLs. This is metadata validation, not an HTTP availability check or proof that the response is an image. No server-side image proxy, image fetch, or display component is added here. Consumers should provide an ordinary missing/broken-image state when display is later requested.

The current Field GraphQL query does not request a new unverified schema field. Headshots are available when an existing field/leaderboard payload supplies one. The saved player-round fixture has no discovered headshot fields. Live coverage, a dedicated biography fetch and provider-specific field availability remain unverified. This change guarantees the nullable contract and retention behavior, not a headshot for every player.

## Document review: questions, answers and confirmation

These are review questions derived from the existing documents. A confirmed requirement is supported by the conversation; an implementation fact is supported by source. Unanswered choices stay pending.

| Decision | Review question | Answer / confirmed finding | Basis and status |
|---|---|---|---|
| D01 | What program are we documenting? | The complete existing Shot Lab app plus extractor and flight/green prototypes in one repository with separate program folders. | User clarification and repository layout; confirmed |
| D02 | Is this already version 1.0 in production? | No. This is a version 1.0 working entity specification over the saved version-6 baseline. | Current guide/package; implementation fact |
| D03 | How is data currently pulled? | App: one player-round. Python extractor: one player with selectable rounds. Full field/round and one-click event jobs are requirements, not current capabilities. | Guide + Feature Scope; confirmed |
| D04 | What identifies a shot? | Preserve event/player/round/hole and provider record identity/type/sequence. Handle non-stroke and duplicate-sequence cases explicitly. | Current tracking behavior; detailed provider record uniqueness pending verification |
| D05 | Are standard and advanced shot measurements included? | Yes in the program model, but only supplied/supported fields display. Adapter gaps and metric precision remain documented bugs. | Guide/Bug Register; confirmed |
| D06 | Are flight, green and comparison diagrams part of the app? | They are required integrated views. Some are currently separate Python prototypes. Keep one selected-shot workflow and distinguish endpoint connector, flight, roll and putt. | User requirement; integration planned |
| D07 | Can we infer the whole green from putting trails? | Trails support route coverage and conditional local estimates; they do not establish independently surveyed terrain. Preserve simulated provenance and unknown areas. | Existing source classification and prior comparison; confirmed limitation |
| D08 | Does TOURCAST comparison validate real slope? | Shared-source replay tests decoding/rendering consistency. Independent slope/prediction validation needs independent evidence. | Existing prototype/report; confirmed limitation |
| D09 | What does the top 10% field zone mean? | A selected outcome metric with comparable starts/conditions and sample sizes. It is not automatically the longest or densest area. | Feature Scope; exact default ranking metric pending user confirmation |
| D10 | Are tee times and shot times interchangeable? | No. Retain scheduled group time separately from a verified actual shot timestamp. Video publication/availability also remains separate. | Guide + user requirements; confirmed |
| D11 | Are forecast and observed conditions interchangeable? | No. Preserve forecast issue/valid times and observations, plus matching offsets/uncertainty. | User weather requirement and Feature Scope; provider/cadence pending |
| D12 | Are clubs inferred from distance? | No. Use reliable club identity or explicit annotation; retain an unknown group. | Feature Scope; confirmed limitation |
| D13 | Can we store a headshot URL for future UI use? | Yes. Add optional nullable source URL/provenance to Player/Participant metadata, without forcing display or inventing links. | Current user request; retention adapter implemented in this change |
| D14 | Should PGA TOUR RSS be in version 1.0? | No. Add fetchable news ingestion to a future release, tracked as IVI-287. Release number and feed endpoint are not yet confirmed. | Current user request; task created |
| D15 | Is video playback fixed? | No. All 37 fixture share URLs are null; posters are not playable video. BUG-001 stays open. | Fixture audit/Bug Register; confirmed |
| D16 | Does a baseline branch enforce protection? | No. Snapshot refs and module separation support comparison; remote protection rules remain unconfigured. | GitHub import notes; confirmed |

## Future RSS task

[IVI-287 — Future release: fetch and normalize PGA TOUR RSS news](https://linear.app/nthezone/issue/IVI-287/future-release-fetch-and-normalize-pga-tour-rss-news)

Project: shot-tracking. Status at creation: Backlog. No due date or specific future release number assigned.

The task covers verified official source discovery, bounded on-demand fetch, normalization, deduplication, freshness/conditional requests, safe parsing, errors, attribution and tests. No scheduled task has been created. Attempting `https://www.pgatour.com/rss/top_stories.rss` through the research tool did not verify a working feed; retrieval of the official news page returned 403. Record this as unverified access, not proof that RSS is absent or operational. A permitted official news API fallback must be labeled as an API, not misrepresented as RSS.

## Shared data rules

1. Preserve raw payloads and add derived outputs separately; retain provider/source path and retrieval time.
2. Every geometric calculation identifies frame, axis meanings, physical units and measured/fit/simulated/estimated/user/unknown provenance.
3. Separate scheduled time, actual shot time, elapsed ball-motion time, video publication/availability, forecast issue/valid time and news publication time.
4. Keep reported total, carry, landing position, final rest and sampled ground movement distinct. Preserve disagreements rather than silently snapping/rescaling.
5. Scope joins to explicit event/player/round/hole/record identity and course/configuration where relevant. Ambiguous joins remain ambiguous.
6. Missing optional media, weather, radar or biography does not erase a valid shot or roster entry.
7. Any later persisted schema must version exported/derived contracts; these logical entities do not prescribe a database vendor or microservice architecture.

## Pending questions and evidence

- Which requested capabilities are required for the first shipped 1.0 release versus staged updates? This entity inventory does not mark every requested feature release-ready.
- Which outcome metric should be the default for top-decile landing zones, and what minimum sample/coverage thresholds should apply?
- Which supported provider supplies true shot timestamps, reliable club IDs, headshot coverage, full-field paths and ground-motion samples?
- Which weather provider, observation resolution and forecast archive should be used? What refresh cadence is needed?
- What supported official RSS/Atom feed is currently fetchable, and what permitted API fallback should be chosen if necessary?
- What source-resolution tolerances and independently validated coordinate transforms should each provider adapter use?
- Should saved sessions remain local or gain server persistence? No database choice is locked here.

## How to update this document as review continues

For each answer, add or revise a stable D-number with the question, answer, evidence/date, status and affected E/F entities. Record user decisions separately from implementation facts and engineering proposals. Leave pending questions visible until answered. Link changes to a bug/Linear task and the PR that implements them. Do not rewrite historical baseline claims or mark a feature complete solely because it is documented.

## Implementation Notes

- Assumptions: existing repository documents are the working review input; version 1.0 is a target specification.
- Risks: live source availability, unverified URLs/units/timestamps and simulated geometry remain evidence limits.
- Next Steps: continue confirming pending questions; implement core correctness fixes independently from future RSS work.
- Alternatives: retain prototypes and offline imports; use a separately identified permitted official news API if RSS cannot be verified.
- Performance Considerations: optional URL metadata adds no image/network fetch; future feed retrieval should be bounded and cached.
- Maintenance Considerations: update decisions, source adapters, validation evidence and task links together; preserve the baseline ref.
