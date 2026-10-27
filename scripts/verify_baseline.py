"""Verify preserved source against its manifest without blocking later features."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--working-tree", action="store_true", help="Compare current files instead of the tagged snapshot")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    baseline = "baseline/2026-10-27"
    try:
        # A clean clone keeps snapshot branches under origin until checked out.
        # Prefer the original local ref when restoring the offline bundle.
        if not args.working_tree:
            found = False
            for candidate in (baseline, f"refs/remotes/origin/{baseline}"):
                check = subprocess.run(
                    ["git", "rev-parse", "--verify", f"{candidate}^{{commit}}"],
                    cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
                )
                if check.returncode == 0:
                    baseline = candidate
                    found = True
                    break
            if not found:
                raise ValueError("Baseline ref unavailable; run git fetch origin --tags")
        # Read the authoritative manifest from the tag for historical verification.
        raw = (root / "baselines/source-manifest.json").read_bytes() if args.working_tree else subprocess.check_output(
            ["git", "show", f"{baseline}:baselines/source-manifest.json"], cwd=root
        )
        manifest = json.loads(raw)
        failures = []
        for name, expected in manifest["files"].items():
            path = Path(name)
            if path.is_absolute() or ".." in path.parts:
                raise ValueError("Manifest contains an unsafe path")
            try:
                content = (root / path).read_bytes() if args.working_tree else subprocess.check_output(
                    ["git", "show", f"{baseline}:{name}"], cwd=root, stderr=subprocess.DEVNULL
                )
            except (OSError, subprocess.CalledProcessError):
                failures.append(name + " (missing)")
                continue
            if hashlib.sha256(content).hexdigest() != expected:
                failures.append(name + " (changed)")
        if failures:
            raise ValueError("Baseline mismatches:\n" + "\n".join(failures))
        print(f"Verified {len(manifest['files'])} preserved files ({'working tree' if args.working_tree else baseline}).")
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        parser.exit(1, f"Baseline verification failed: {error}\n")


if __name__ == "__main__":
    main()
