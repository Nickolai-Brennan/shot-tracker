# Restore the baseline repository

The tourcast-shot-data directory contains source files.
The tourcast-shot-data.bundle contains the new repository history, main/develop branches and module baseline tags.

To restore history after extracting this archive, run:

```bash
git clone tourcast-shot-data.bundle tourcast-shot-data-restored
cd tourcast-shot-data-restored
git branch develop origin/develop
python scripts/verify_baseline.py
```

Read docs/ENVIRONMENT_SETUP.md to install and run the programs.
GitHub remote creation/upload is pending; this bundle does not establish a GitHub repository.
