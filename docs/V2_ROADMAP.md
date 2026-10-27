# Version 2 roadmap

Updated: October 27, 2026. Version 1 source is frozen as an as-is snapshot; new development is separated from `release/v1.0.0`.

## Confirmed scope: weather application

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

## Branch and release policy

Use `version/2.0` for new integration and focused feature/fix branches for individual work. The version 1 release snapshot and its manifest remain unchanged. No background automation, provider subscription, weather API key or hosted deployment has been created by this planning change.

RSS/news ingestion remains future work in IVI-287. Other requested features retain their existing status until separately prioritized; they are not automatically added to version 2 by this weather deferral.
