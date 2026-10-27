# TOURCAST shot extractor

Configured example: Butterfield Bermuda Championship (R2026528), Austin Smotherman (50095).
These names were matched against the supplied lookup files. The player lookup contains 218 entries;
it should be treated as a lookup, not a verified complete PGA TOUR directory or event field.

## Setup and run

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python pull_tourcast.py --event R2026528 --player 50095 --rounds 4
python pull_tourcast.py --event R2026528 --player 50095 --rounds 1 2 3 4
python pull_tourcast.py --event R2026528 --player 50095 --rounds 4 --hole 1
```

Windows activation: `.venv\Scripts\activate`.

URLs can be supplied with `--url "URL"`; replace an empty pid or pass `--player 50095`.
The URL round is used unless --rounds overrides it. The URL hole and gv are display settings:
the exporter saves all holes unless --hole is explicitly supplied. It never requests group data.

## Output

One raw JSON and one CSV per available player-round, timestamped to preserve extraction snapshots.
The optional hole filter applies only to CSV; raw JSON retains the full response.
Nested shot fields are flattened into dotted column names. Arrays remain JSON in CSV cells.
Radar is requested and preserved if the server returns it; its availability is not guaranteed.
Distances and coordinates retain source values: units and coordinate systems have not been normalized.
Retrieval time is not shot time. Penalty/drop records should be classified by source stroke type.

## Validation and limitations

Compare stroke types and hole scores with the official scorecard before analysis.
An empty round or missing player is not evidence of zero strokes or a completed round.
The player lookup is not the tournament field; obtain and verify the leaderboard before field-wide runs.
The dependency is unofficial and uses undocumented upstream operations. Private helper changes can break it.
Pin a tested dependency commit before production. This package does not grant data redistribution rights.

Sources: https://github.com/WalrusQuant/pgatourPY and https://www.pgatour.com/tourcast/about

Validation on 2026-10-25: live shot endpoint returned HTTP 403 in the execution environment. No live shots were retrieved. Synthetic fixture checks passed for URL routing, hole filtering, radar retention, and full-round raw preservation.
