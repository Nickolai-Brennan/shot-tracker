# Baseline validation

Performed October 27, 2026 in the Linux authoring environment with Node.js 24.22.1, pnpm 11.25.0 and Python 3.12.

| Check | Result |
|---|---|
| Preserved source/input hashes | PASS: all 155 manifest files; all 143 tracked app files retain original bytes |
| Frozen app dependency installation | PASS: lockfile unchanged, dependencies reused from available store |
| `node tests/data.test.mjs` | PASS |
| `node tests/metrics.test.mjs` | PASS |
| `node tests/scoring-catalog.test.mjs` | PASS |
| `node tests/video-putt.test.mjs` | PASS |
| `pnpm exec tsc --noEmit` | PASS before and after build |
| `pnpm build` | PASS; generated Worker config exists |
| Python syntax checks | PASS: tools, prototypes and repository scripts |
| Extractor and green CLI help | PASS |
| Green renderer using repository-relative fixture paths | PASS: PNG and JSON generated in ignored outputs directory |
| Video fixture audit | 37 videos; 37 null share URLs; 37 nonempty posters/thumbnails |
| Credential-pattern/source-field scan | No matching credential literals in inspected source patterns; no credential-like field names in supplied round fixture; not a complete security audit |

Green output: source classification simulation; chord deviation 0.8557338407 in; elevation change -1.15468608 in; sampled planar path length 4.1692087773 ft. These remain the prototype's inferred-unit calculations, not surveyed terrain validation.

Build printed its existing proxy-environment notice and a vinext static route-classification limitation. Build exit status was successful. No runtime code was changed to remove warnings.

## Not performed / not established

- No new live PGA retrieval, playable-video resolution or actual weather matching.
- No new browser walkthrough or production deployment.
- No independent green survey or calibrated TOURCAST camera comparison.
- No Windows/macOS installation validation; instructions are provided but not executed here.
- No clean third-party Python dependency resolution; rendering used the available Python environment.
- No claim that a passing test suite covers the newly documented bugs.
- GitHub Actions and remote branch/tag protections remain unverified until repository creation, upload and workflow execution.

The original user guide/report retain their earlier audit scope. This file records additional checks from repository preparation; it does not rewrite historical validation claims.
