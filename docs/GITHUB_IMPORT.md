# GitHub baseline import

Date: October 27, 2026. Repository: https://github.com/Nickolai-Brennan/shot-tracker

## Preserved source

- Uploaded archive: `shot-tracker (1).zip`.
- All 173 baseline files match the previously prepared repository byte-for-byte.
- All 155 program/input files match `baselines/source-manifest.json`.
- Original hosted Shot Lab version: 6.
- Original app source commit: `1706677a7a9a22f8221c77521b948e10c31b11af`.
- Original offline preservation commit: `76e9473b2284f027bf7e44475c38b8b1ace1ef3e`.
- Uploaded snapshot commit: `65058362462e3c88d1ffb667944885fb7b3246fa`.
- Remote snapshot branch: `baseline/2026-10-27`.

The baseline branch points at the import commit before repository-specific setup documentation and baseline-ref lookup adjustments. Runtime app/extractor/prototype source and supplied inputs are unchanged.

## Layout

The ZIP's `tourcast-shot-data-baseline/tourcast-shot-data/` directory is unpacked at repository root so GitHub recognizes workflows and developers can edit/run the programs directly. `styles/style.css` is retained from the wrapper. Existing root `index.html`, `RESTORE.md` and `shot-tracker.zip` are preserved. The deleted Git bundle is not reintroduced.

## Baseline refs and verification

The connector supports branches but does not expose tag creation. This import therefore creates a named snapshot branch, not remote module tags or enforced protections. The offline archive's original module tags are documented separately.

```bash
git clone https://github.com/Nickolai-Brennan/shot-tracker.git
cd shot-tracker
python scripts/verify_baseline.py
```

Verification checks the snapshot under a local baseline ref or `origin/baseline/2026-10-27`, allowing later program changes without rewriting the original snapshot. Never force-update the baseline branch. GitHub rules/protection must be configured separately.

## Validation scope

Source/input hashes were checked again for this upload. Four app suites, typechecks and the production build passed during baseline preparation, as recorded in `VALIDATION.md`. This import does not claim a new live video/API test or production deployment. Repository workflows provide independent checks after upload. The baseline verifier's remote-branch lookup is checked with a local clone-style fixture.
