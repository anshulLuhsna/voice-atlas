# Signal Atlas

A local voice AI fieldbook with 24 substantial chapters, four guided paths, seven browser experiments, a glossary, a researcher/project directory and annotated primary sources. The default experience works offline after the files are available. It needs Python 3.9 or newer and a modern browser.

## Start

Open Terminal and run

```sh
cd /Users/anshul.kalbande/Desktop/p/atlas
python3 serve.py
```

Open http://127.0.0.1:8765/ in your browser. Keep the Terminal process running while you use the platform. Press Control-C in that Terminal to stop it. If the port is busy, use `python3 serve.py --port 8767` and open http://127.0.0.1:8767/.

The server rebuilds the book on startup and binds only to this computer. The build uses an included Python-Markdown wheel. The default installation needs no package download or credentials.

## Learn

1. Open **Foundations** on the study desk. Read the sound, capture, sampling, spectrum and codec chapters, then the mathematics primer.
2. Use **Library** to search full chapter text and linked glossary terms. Filter by subject and reading state.
3. Follow the prerequisites on a chapter before attempting unfamiliar material. Use the section navigation to move through the lesson.
4. Open each linked lab. Change one control at a time and compare the result with the expected observation.
5. Select **Mark as read** when you finish a chapter. **Continue reading** returns to the saved position. The progress icon opens all reading states and the reset control.
6. Use **Voice products**, **Research** or **Inference engineering** for the next path. These paths overlap because the same mechanisms support several goals.
7. Open **Reference** for annotated papers, definitions, professional profiles and projects.

Progress belongs to the browser and origin, including the port. Switching ports, browser profiles or devices creates a separate progress store. Clearing site data deletes that store. The interface reports a storage failure if the browser prevents saving.

## Experiments

| Experiment | What runs |
| --- | --- |
| Sampling and aliasing | Sampled cosines, folded-frequency calculation and optional synthesized tone playback |
| Spectrogram | A computed FFT/STFT with adjustable Hann windows and constructed signals |
| Endpointing | A threshold and hold-time rule over deterministic energy frames |
| Transcript revisions | A labeled sequence of provisional and final recognition fixtures |
| Latency | A serial/overlapped timing calculation with adjustable delays |
| Interruption | A source-span player model with generated/heard cursors and stale-epoch rejection |
| Evaluation | Word-edit scoring and a separate playback regression, with normalization and fault injection |

The pages identify signal experiments, deterministic fixtures and simulations. The audio example contains two synthesized vowel-like sounds and its text description. Playback requires an intentional action.

Run the actual small acoustic training experiment with

```sh
python3 recipes/adapt.py
```

The recipe uses synthetic nonspeech signals and Python's standard library. Read [the recipe guide](recipes/README.md) for the split design, measured results and limits. The separate [Whisper LoRA experiment](recipes/ASR.md) requires your permitted recordings, a local checkpoint and optional dependencies. Its data validator was tested. Its pretrained training path still requires a real run.

## Files and editing

| Location | Purpose |
| --- | --- |
| `app/` | Browser layout, styles, navigation and experiment code |
| `content/chapters/` | Original Markdown lessons with a one-line JSON metadata header |
| `content/curriculum.json` | Chapter order, status, paths, deep dives and future extensions |
| `content/sources/` | Annotated source records and review dates |
| `content/glossary.json` | Definitions linked to chapters |
| `content/directory.json` | Verified public people, labs and projects |
| `recipes/` | Runnable adaptation exercises and optional setup |
| `tests/` | Numerical, content and data-validation checks, plus an optional accessibility audit |
| `dist/` | Generated, portable website |
| `SOURCE_INDEX.md` | Readable source index |
| `VERIFICATION.md` | Tests performed and their scope |
| `LIMITATIONS.md` | Known boundaries and optional work |
| `CHECKPOINT.md` | Instructions for continuing development |

Edit the source lessons and metadata, then run `python3 build.py`. Reload your browser after rebuilding. Avoid editing `dist/` directly because the next build replaces its generated assets.

A chapter starts with JSON containing `id,title,part,level,minutes,question,goals,prereqs,related,labs,summary,sources`, followed by a blank line and Markdown. IDs are stable route identifiers. Link citations as `[label](#source/id)`, chapters as `[label](#chapter/id)`, and labs as `[label](#lab/id)`. Add source records with title, author or organization, year, URL, type, annotation and review date.

The browser reads one generated data bundle and renders the chosen hash route. The Python build creates HTML, original SVG diagrams and a synthetic WAV example. LocalStorage holds reading progress. The server only serves files.

## Tests

Run from the project folder

```sh
python3 build.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/engine.test.cjs
python3 recipes/adapt.py --seed 17 --json
```

Python checks need no extra packages. The JavaScript tests require Node.js with the built-in test runner.

For the included axe-core 4.11.0 accessibility audit, run

```sh
python3 serve.py --audit --port 8766
```

Open http://127.0.0.1:8766/. After each route changes, the audit writes a JSON report into the page element `#accessibility-audit`. Inspect its text with browser developer tools. The audit runs WCAG 2 A/AA and 2.1 AA rules. Manual keyboard, reading and visual checks remain necessary.

## Continue development

Read [the checkpoint](CHECKPOINT.md), [verification](VERIFICATION.md), [limitations](LIMITATIONS.md) and the curriculum manifest. Select one documented extension or observed failure. Preserve existing IDs and teaching examples. Rebuild, run relevant tests and check the changed page before recording a new completion state.

## Included dependencies

Python-Markdown 3.7 retains its BSD license inside the bundled wheel. DM Sans and Instrument Serif include their SIL Open Font Licenses in `app/fonts/`. The optional audit retains axe-core's MPL-2.0 license in `tests/vendor/`. Original lesson text, diagrams and synthetic examples were written for this project. Linked papers and model assets retain their owners' terms.
