# Shot Lab workspace expansion — Version 2

## Implemented navigation and routes

- `/`: existing Shot Explorer with links to the expanded workspace.
- `/bulk-download`: event participant selection; selected round or rounds 1–4; combined source shot-record CSV; JSON error manifest; cancel remaining requests.
- `/round-tracker`: official player round scorecard plus shot-record-derived FIR, GIR, and tracked-putt indications; downloadable scorecard CSV.
- `/players` and `/player-profile?event=...&player=...`: searchable event participants and selected profile.
- `/events` and `/event-details?event=...`: season schedule, event info and reserved sections for results, perks, and schedule details.
- `/courses` and `/course-profile`: course feature navigation and explicit missing-data states.
- `/stats-values`: parameter taxonomy and filter-definition JSON export.

## Evidence boundaries

- Existing `/api/catalog`, `/api/participants`, and `/api/shots` are reused.
- Official round scoring comes from the existing scorecard adapter; counts of tracking rows are **not** official scores.
- FIR counts only known first tee-shot outcomes on par-4 and par-5 holes. A tee result without a supported destination remains unknown.
- GIR counts only green arrivals whose stroke number satisfies `stroke <= par - 2`. Missing green arrival evidence remains unknown.
- Putts are shot-record counts, not verified official putt totals; missing shot coverage can undercount them.
- Course ratings, grass, historical player rankings, career thresholds, complete event results and purse/perk information are not derived or guessed from shot endpoints.
- Stats & Values configuration is exportable; it does **not** imply that all custom filters can already be executed on the backend.
- Bulk requests are sequential to limit upstream pressure; missing/failed rounds generate a separate manifest, not fabricated zero records.

## Follow-up engineering

1. Run typecheck, lint and build from `apps/shot-lab`; add UI tests for all new routes and deep links.
2. Test live round scoring on complete, incomplete, and withdrawn player cases; validate tee and putting location aliases and recorded penalties.
3. Add explicit server-managed export jobs for high-volume customer requests, authenticated quotas and rate limiting, and resumable archives.
4. Add player, course, hole and event stats adapters with provenance, metric definitions, units and history.
5. Add a source-backed course catalog, course geometry, hole characteristics and course similarity computation.
6. Implement persistence, authenticated user access, and downloadable export job history.
7. Validate production deployment and accessibility, including keyboard navigation and responsive layouts.

## Local validation

```bash
cd apps/shot-lab
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm dev
```

Routes to manually verify: `/`, `/bulk-download`, `/round-tracker`, `/players`, `/player-profile`, `/events`, `/event-details`, `/courses`, `/course-profile`, `/stats-values`.

Set `PGA_API_KEY` only in the local/server environment. Do not expose it in client-side files.
