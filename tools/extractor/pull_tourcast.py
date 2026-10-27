"""Export raw TOURCAST player-round data and a lossless flattened shot CSV."""
import argparse
import csv
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


def flatten(value, prefix="", result=None):
    """Keep nested fields, including radar; encode arrays as JSON in CSV cells."""
    result = {} if result is None else result
    if isinstance(value, dict):
        for key, item in value.items():
            flatten(item, f"{prefix}.{key}" if prefix else key, result)
    else:
        result[prefix] = json.dumps(value, ensure_ascii=False) if isinstance(value, list) else value
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', help='Quoted TOURCAST URL; explicit options override URL values')
    parser.add_argument('--event')
    parser.add_argument('--player')
    parser.add_argument('--rounds', type=int, nargs='+')
    parser.add_argument('--hole', type=int, help='Optional local filter; default exports every hole')
    parser.add_argument('--out', type=Path, default=Path('data'))
    args = parser.parse_args()
    url = urlsplit(args.url or '')
    query = parse_qs(url.query)
    fragment = parse_qs(url.fragment.partition('?')[2])
    event = args.event or query.get('id', [''])[0]
    player = args.player or fragment.get('pid', [''])[0]
    try:
        rounds = args.rounds or [int(fragment.get('round', ['4'])[0])]
    except ValueError:
        parser.error('URL round must be an integer')
    if not re.fullmatch(r'R\d{7}', event) or not re.fullmatch(r'\d+', player):
        parser.error('Supply event ID RYYYYNNN and numeric player ID (the supplied URL has an empty pid)')
    if any(r not in range(1, 5) for r in rounds) or (args.hole is not None and args.hole not in range(1, 19)):
        parser.error('Rounds must be 1–4 and hole must be 1–18')

    # Private helpers preserve the payload fields dropped by the high-level wrapper.
    from pgatourpy._api import graphql_request, decompress_payload
    args.out.mkdir(parents=True, exist_ok=True)
    failed = False
    for index, rnd in enumerate(dict.fromkeys(rounds)):
        if index:
            time.sleep(1)  # Space independent player-round requests.
        try:
            response = graphql_request('shotDetailsV4Compressed', {
                'tournamentId': event, 'playerId': player,
                'round': rnd, 'includeRadar': True,
            })
            payload = (response.get('shotDetailsV4Compressed') or {}).get('payload')
            if not payload:
                raise RuntimeError('No payload returned; coverage or round availability is unverified')
            raw = decompress_payload(payload)
            if not isinstance(raw, dict):
                raise RuntimeError('Unexpected payload format')
            stamp = datetime.now(timezone.utc)
            stem = f'{event}_{player}_r{rnd}_{stamp.strftime("%Y%m%dT%H%M%S%fZ")}'
            # Save raw response before transforming; keep full round even with a hole filter.
            (args.out / f'{stem}.json').write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding='utf-8')
            rows = []
            for hole in raw.get('holes') or []:
                if args.hole is not None and str(hole.get('holeNumber')) != str(args.hole):
                    continue
                metadata = flatten({k: v for k, v in hole.items() if k != 'strokes'}, 'hole')
                for stroke in hole.get('strokes') or []:
                    rows.append({**metadata, **flatten(stroke, 'shot'),
                                 'tournament_id': event, 'player_id': player,
                                 'round_number': rnd, 'retrieved_at_utc': stamp.isoformat()})
            if not rows:
                raise RuntimeError('Raw JSON saved, but no shots matched; do not interpret this as a completed round')
            fields = list(dict.fromkeys(key for row in rows for key in row))
            path = args.out / f'{stem}.csv'
            with path.open('w', newline='', encoding='utf-8') as handle:
                writer = csv.DictWriter(handle, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)
            print(f'{len(rows)} shot records saved: {path}')
        except Exception as exc:
            failed = True
            print(f'Round {rnd} failed: {exc}', file=sys.stderr)
    return 1 if failed else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except ImportError as exc:
        sys.exit(f'Missing dependency: {exc}. Install requirements.txt first.')
