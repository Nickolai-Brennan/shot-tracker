# Environment, extensions, installation and running

Date: October 27, 2026. This guide targets the preserved version-6 source. Commands below describe setup; see `VALIDATION.md` for what was actually executed in the authoring environment.

## 1. Choose the program

| Program | Runtime | Needs a live PGA connection? | Launch |
|---|---|---|---|
| Shot Lab web app | Node.js 24.x recommended; package minimum 22.13.0; pnpm 11.25.0 | Only for live requests; JSON import works offline after installation | `pnpm dev` from `apps/shot-lab` |
| Extractor | Python 3.12 recommended, Git, virtual environment | Yes for live extraction | `python pull_tourcast.py ...` |
| Flight prototype | Python 3.12, NumPy, Matplotlib | No, uses saved JSON | Existing scripts require path edits; see section 8 |
| Green-break prototype | Python 3.12, NumPy, Matplotlib, Pillow | No, uses saved JSON and green image | `python green_break_feature.py ...` |

Runtime versions are reproducibility targets; Python and system compatibility beyond this environment have not been tested. Keep each program's dependencies in its own directory/environment. Do not install a separate React/Next/TypeScript version globally to repair this snapshot.

## 2. Install base tools

Install Git, Node.js 24.x, Python 3.12 and VS Code from their official distributions:

- https://git-scm.com/downloads
- https://nodejs.org/en/download
- https://www.python.org/downloads/
- https://code.visualstudio.com/download

On Windows, enable Python in PATH in its installer if offered, then reopen the terminal. Use PowerShell commands where noted. On macOS/Linux, use your installed `python3` command to create virtual environments. Once activated, use `python` consistently.

```bash
git --version
node --version
npm --version
# macOS/Linux; Windows can use: py -3.12 --version
python3 --version
code --version
```

If `code` is unavailable, open VS Code manually. On macOS the Command Palette offers “Shell Command: Install 'code' command in PATH.” Editor CLI availability is optional for running the programs.

## 3. Install VS Code extensions

No editor extension is required to execute the programs. These support editing the included Python files:

| Extension | Identifier | Purpose |
|---|---|---|
| Microsoft Python | `ms-python.python` | Python interpreter selection, environments and tooling |
| Microsoft Pylance | `ms-python.vscode-pylance` | Python completion and type analysis |

```bash
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code .
```

Alternatively open Extensions, search each exact identifier and confirm the Microsoft publisher. The repository's `.vscode/extensions.json` contains the same recommendations. Pylance may already be installed alongside Python.

JavaScript, TypeScript, HTML, CSS, JSON and Markdown support ships with VS Code. The TypeScript compiler comes from the app's dependency installation. No Jupyter, Redis, SQL, AI extension or other project's tooling is required here.

For Python, open the Command Palette → **Python: Select Interpreter** → choose the `.venv` for the program you are editing. Switch the interpreter when switching programs. Virtual environments are intentionally not committed.

Official references:

- https://code.visualstudio.com/docs/languages/python
- https://marketplace.visualstudio.com/items?itemName=ms-python.python
- https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance
- https://code.visualstudio.com/docs/languages/typescript

## 4. Obtain and open the repository

After GitHub publication succeeds:

```bash
git clone https://github.com/Nickolai-Brennan/tourcast-shot-data.git
cd tourcast-shot-data
code .
```

Private GitHub cloning requires authentication through your normal Git credential flow. Never put a token in a remote URL or commit it to a file. If using the supplied archive before publication, extract it and open its `tourcast-shot-data` directory. A source ZIP alone does not contain Git tags/history; the companion Git bundle does.

## 5. Install the app dependencies

```bash
# Install the package-manager version declared in the preserved package.json.
npm install --global pnpm@11.25.0
pnpm --version
cd apps/shot-lab
pnpm install --frozen-lockfile
```

If npm cannot write the global installation, use a user-owned Node installation/version manager or your organization's approved setup. Do not run elevated installation merely to bypass a permissions error. An existing Corepack setup can activate the same pinned pnpm version instead.

The preserved dependency policy has minimum release age and build-script approval settings in `pnpm-workspace.yaml`. Keep the lockfile unchanged. If package/policy/network errors occur, capture the exact message; do not use `--no-frozen-lockfile`, remove policy checks or upgrade dependencies to force installation. Those would be a separate reviewed change.

## 6. Configure live access and launch the app

The server expects `PGA_API_KEY`. It must be an authorized credential accepted by the upstream service. This repository does not supply a key or a way to obtain access. Configured does not mean accepted.

macOS/Linux (Bash):

```bash
# Read without echoing or putting the key in shell history.
read -r -s -p 'PGA API key: ' PGA_API_KEY
echo
export PGA_API_KEY
pnpm dev
```

Windows PowerShell:

```powershell
# PowerShell 7: hide typed input. The server ultimately needs a string env value.
$pgaCredential = Read-Host 'PGA API key' -AsSecureString
$env:PGA_API_KEY = [System.Net.NetworkCredential]::new('', $pgaCredential).Password
pnpm dev
```

No key is required to start the app for JSON import. Run `pnpm dev` directly for that workflow. Portable mode defaults to port 5173; open the printed localhost URL.

First offline run:

1. Choose **Import JSON**.
2. Select `fixtures/R2026011_57366_r1.json` from the repository root.
3. Open **Hole map & metrics**, choose hole 14 and select shot 1.
4. Inspect the table, source fields and available metrics. Polynomial flight is a known integration gap.
5. Select the putting record to inspect the existing calculation controls; the green prototype is separate.
6. Export Shot JSON before refresh to retain annotations.

For live retrieval choose season, event, participant and round, then Fetch & verify. HTTP 403 indicates upstream rejection, not necessarily bad parsing. Optional video failure should not discard shot results. This fixture has 37 null share URLs; do not expect playable clips until BUG-001 is resolved.

Do not expose this local development server publicly. Production owner access is enforced by the existing hosting platform; this GitHub snapshot does not create equivalent access control on another host. Do not change `.openai/hosting.json` to point at a different project as a local setup step.

## 7. App tests, build and local built run

From `apps/shot-lab`, after dependencies install:

```bash
node tests/data.test.mjs
node tests/metrics.test.mjs
node tests/scoring-catalog.test.mjs
node tests/video-putt.test.mjs
pnpm build
pnpm exec tsc --noEmit
```

The four suites use synthetic/mocked inputs and are not a live provider test. Build creates Worker output; this is not a generic `next start` package.

```bash
# After a successful build; starts the packaged Worker locally through Wrangler.
pnpm start
```

Use the printed address; do not assume the dev port. For built local Worker live requests, configure `PGA_API_KEY` using Wrangler's supported local-secret mechanism (an ignored `.dev.vars` file in the app directory). Never commit the file. Starting a built Worker does not publish it. External host migration and production deployment are separate tasks; the current hosting identity is preserved.

## 8. Flight research environment

From the repository root, macOS/Linux:

```bash
cd prototypes/flight
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Windows PowerShell, in `prototypes/flight`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

If activation is blocked, use `.venv\Scripts\python.exe` directly instead of weakening execution policy. On macOS/Linux, `.venv/bin/python` also works without activation.

The preserved scripts have fixed scratch input/output paths (BUG-010). They are archival research examples, not yet portable CLIs. To run a local experiment without changing the baseline:

```bash
# Keep edits isolated in an ignored local work directory.
mkdir -p ../../outputs/flight
cp plot_hole14.py ../../outputs/flight/plot_hole14.local.py
```

On Windows use `New-Item -ItemType Directory -Force ..\..\outputs\flight` and `Copy-Item plot_hole14.py ..\..\outputs\flight\plot_hole14.local.py`.

In that local copy set `source` to the absolute path of `fixtures/R2026011_57366_r1.json`, and `output` to a PNG inside `outputs/flight`. Preserve the JSON's `decoded` wrapper. For `plot_drive.py`, create a separate local copy the same way.

```bash
python ../../outputs/flight/plot_hole14.local.py
```

Expected: a 3D/side/overhead radar-fit image; no course registration or bounce/roll. Hole-14 apex should be approximately 127.1 ft under the prototype's inferred units. The scripts' hardcoded captions/axis limits must not be reused for arbitrary shots. A reusable CLI is planned, not silently substituted into this baseline.

## 9. Green-break research environment and run

Open a new terminal at repository root to avoid mixing Python environments:

```bash
cd prototypes/green-break
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
mkdir -p ../../outputs/green-break
python green_break_feature.py --source ../../fixtures/R2026011_57366_r1.json --hole 14 --map ../../fixtures/hole14-green.png --output ../../outputs/green-break/hole14.png
```

Windows: create the venv with `py -3.12 -m venv .venv`, activate with `.\.venv\Scripts\Activate.ps1`, install requirements, and create the output directory with `New-Item -ItemType Directory -Force ..\..\outputs\green-break`. The Python command above accepts forward-slash paths on Windows too.

Optional `--reference /absolute/path/to/reference.png` adds a user-provided reference screenshot. A screenshot is not required and is not bundled here.

Expected: PNG and JSON metrics beside it. Hole 14's supplied simulated route has roughly 0.86 in chord deviation and a 1.15 in elevation drop under inferred feet. The prototype selects its first eligible green-origin sampled stroke and has fixed labels: see BUG-011. This is a provider-path replay, not a validated green survey or independent break prediction.

Python visualization requirements are preserved unpinned from the prototype; resolve and record exact dependency versions before declaring a reproducible research release. Do not claim the initial requirements fully lock the environment.

## 10. Extractor environment and run

Open a new terminal at repository root:

```bash
cd tools/extractor
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python pull_tourcast.py --help
python pull_tourcast.py --event R2026011 --player 57366 --rounds 1 2 3 4 --out data
```

Windows uses the venv creation/activation commands from section 8. Git is required because requirements install pgatourPY from a specific Git commit. This is a third-party dependency, not vendored project code. Its transitive dependencies are not fully locked.

The extractor delegates authentication and network behavior to pgatourPY's private helpers. Do not assume the app's `PGA_API_KEY` variable configures that dependency: inspect the installed dependency's documented behavior before live use. Avoid editing installed library credentials into tracked files. Live extraction can fail independently from the app. No local Python service is required by the web app.

`--rounds 1 2 3 4` requests four rounds; `--rounds 4` requests only round 4. `--hole 14` filters CSV locally while retaining the full raw round JSON. Output goes to the ignored `data` directory. This baseline does not yet perform full-field bulk pulls.

## 11. Common problems

| Symptom | Check |
|---|---|
| Runtime or pnpm not found | Reopen terminal; verify PATH and exact selected runtime |
| Dependency install fails | Preserve lockfile/policy; inspect registry, permissions and reported engine requirements |
| API key missing | Set the server variable in the same shell as dev; restart after changes |
| API returns 403 | Provider access rejected; use offline import and record response status |
| All video URLs null | Confirmed fixture limitation, BUG-001; poster is not video |
| App shows no flight | Polynomial adapter not yet integrated, BUG-004 |
| Putt endpoint rejection | Rounded-source tolerance issue, BUG-005; retain raw points |
| Flight script path error | Run the isolated local copy after replacing its fixed paths |
| Green renderer cannot write output | Create output directory first; check source/map paths |
| Python imports unavailable | Select/use the program's own virtual-environment Python |
| Refresh loses annotations | Existing memory-only lifecycle; export before refresh |

## 12. Safe development cycle

Create one module branch, reproduce one bug, run that module's checks, inspect the diff, and review through a PR. Keep baseline tags unchanged. See `BUILD_AND_RELEASE.md`. App, extractor and research programs do not share a single dependency environment or deploy together.
