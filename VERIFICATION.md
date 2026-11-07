# Verification record · 7 November 2026

## Build and numerical checks

The final Python build succeeded with 24 chapters, 121 source entries and seven labs. Ten Node tests passed. Eight Python tests passed.

The tests check sampled-frequency equivalence, FFT versus a direct DFT, energy conservation, known spectral peaks, endpoint timings, transcript commitment, timing dependencies, cancellation and session isolation, edit distance, normalization and injected playback failure. Content checks cover metadata, all rendered chapter links, prerequisite cycles, glossary and directory references, generated WAV format and reproducible content builds. The ASR data checks exercise valid splits, duplicate PCM, shared speaker rejection, path bounds and scoring.

The offline adaptation recipe ran with seed 17. Baseline original/target counts were 72/72 and 47/72. Target-only adaptation produced 61/72 and 71/72. Rehearsal produced 72/72 and 62/72. Muted-input controls produced 24/72 in both domains. Two same-seed reports matched. Seed 29 also ran. The recipe guide records its scope and resource measurement.

## Browser checks

The in-app Chromium browser rendered all 24 chapters, all seven labs, the library, paths, source detail, glossary, directory and progress views.

The tested flows included full-text search, glossary-assisted search for aliasing, subject and reading-state filters, global search, Escape to close search, completion persistence through reload, reset cancellation and confirmed reset. Each experiment's controls changed its outputs. The sample-audio play and stop controls responded.

The interruption scenario generated three words, presented one, interrupted, rejected an old callback, answered from the heard prefix and resumed at character 5. The evaluation bench scored three edits over 15 reference words. Normalization reduced that to two. Injecting a stale callback independently failed the playback check.

The bookmark test returned the selected heading to 90 pixels below the viewport top and preserved the Foundations path. The test used the visible fixed-header navigation. Locator-driven auto-scrolling can change the view before a simulated click, so the final check used an ordinary pointer click on that header.

Axe-core 4.11.0 checked all chapter views and 14 additional desktop routes. No automated violations remained on those routes. Responsive checks at 390 pixels covered the study desk, library, four representative chapters, all labs, two reference views and a path. They found no page-wide overflow or automated violations. Tables intentionally allow contained horizontal scrolling.

Manual screenshots covered the study desk, a long-form lesson, the spectrogram and mobile interruption controls. Keyboard range controls and disabled-state transitions worked. SVG labels have text descriptions and dark-background contrast. Broad assistive-technology certification remains outside this verification.

## Citation sample

The final sample checked the ElevenReader price and allowance pages, the official Twilio clear/mark behavior, NIST's voice-biometric restriction within its authentication framework, the VAP prosody study, IndicFDB's multilingual evaluation description and the 27-participant conversational-speech study. Each sampled claim matched its cited primary source. Sources and access dates are recorded in the source index.

## Boundaries

The optional Whisper model-training path was reviewed against the pinned API and its data validator was tested. A pretrained training run, live human listening study, real telephony run and GPU capacity measurement remain learner exercises. The default app performs no microphone capture.
