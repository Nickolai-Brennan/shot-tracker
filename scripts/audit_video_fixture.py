"""Report video-link coverage from saved JSON without requesting remote media."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
args = parser.parse_args()
try:
    data = json.loads(args.source.read_text(encoding="utf-8"))
    videos = data.get("videos")
    if not isinstance(videos, list) or not all(isinstance(v, dict) for v in videos):
        raise ValueError("Expected a videos array of objects")
    print(json.dumps({
        "videos": len(videos),
        "null_share_urls": sum(v.get("shareUrl") is None for v in videos),
        "nonempty_share_urls": sum(isinstance(v.get("shareUrl"), str) and bool(v["shareUrl"].strip()) for v in videos),
        "nonempty_posters": sum(isinstance(v.get("poster"), str) and bool(v["poster"].strip()) for v in videos),
        "nonempty_thumbnails": sum(isinstance(v.get("thumbnail"), str) and bool(v["thumbnail"].strip()) for v in videos),
        "basis": "metadata coverage only; image URLs are not playable-video evidence",
    }, indent=2))
except (OSError, ValueError, TypeError) as error:
    parser.exit(1, f"Fixture audit failed: {error}\n")
