{"id":"adaptation","title":"Adapting a voice model","part":"Deep dives","level":"Advanced","minutes":38,"question":"Which weights should change when a model fails on your listener, language or narration style?","goals":["Separate data, decoding and model causes before training.","Build speaker- and session-disjoint splits and a reversible adaptation experiment.","Explain a low-rank update and evaluate both improvement and forgetting."],"prereqs":["math","recognition","synthesis","evaluation"],"related":["qa","inference","privacy","researchers"],"labs":["evaluation"],"summary":"Run a small acoustic learning experiment, then design a consented speech adaptation with clear gates and provenance.","sources":["lora","ft-whisper","whisper-api","augment","indic","fleurs","torch-random"]}

Murmur mispronounces a character's name throughout a novel. An engineer proposes fine-tuning the whole synthesizer. First trace the error. If text normalization expanded the spelling incorrectly, fix that rule. If a pronunciation override changes the result reliably, preserve it with the document revision. If the audio is clipped, repair capture. Training is justified when a repeatable distribution mismatch remains after these cheaper, inspectable corrections.

## Choose the learning problem

**ASR adaptation** changes how audio maps to text. Examples might add a domain vocabulary, a different microphone or spontaneous code-switching. Keep a confusable negative set so recognizing a rare name does not turn ordinary words into that name. Contextual decoding can solve a vocabulary problem with fewer changed weights.

**TTS adaptation** conditions or updates a model for a consenting speaker or style. Speaker timbre, articulation, accent and delivery are related but separable targets. A short voice reference at inference is an enrollment/conditioning procedure. Parameter training changes stored weights. A style corpus needs suitable labels or examples of the intended delivery and text coverage. Hold out unfamiliar sentences, names and cross-paragraph transitions for listening.

**Audio-model training** can change a codec's reconstruction representation or a speech-token model's prediction objective. If you change the codec codebook, the token IDs may acquire new meanings. A downstream model trained with the old vocabulary then receives incompatible symbols. Version the entire encoder/codebook/decoder contract. Waveform reconstruction, perceptual losses and language prediction each reward different properties.

**Agent language-model adaptation** changes choices over text, tools or structured actions. Use examples of source citation, permission checks and correction. A model that learns a pleasing speaking style may still issue the wrong tool call. Preserve outside-model ownership checks and test state transitions separately.

## Build a dataset you can explain

For each utterance record the audio hash, sampling format, speaker and session IDs, language or switching spans, transcript convention, consent scope, license, permitted uses and removal key. Listening to a recording publicly does not establish the right to train on its speaker. Keep source records separate from derived, resampled files so corrections and deletions propagate.

Inspect clipped and near-silent intervals, duration, channel consistency, text duplication and recording conditions. Segment at meaningful boundaries and retain surrounding context where annotation needs it. Use alignment to flag implausible timing, then listen to disputed cases. An aligner forced to the wrong transcript can look confident. Check that a sentence split did not place two adjacent segments from the same conversation on opposite sides of the train/test boundary.

Assign all clips from a speaker and session to one split for a speaker-independent experiment. For a personal model, hold out sessions and contexts from that consenting person instead and describe the narrower claim. Freeze a development split for selection and a test split for one final comparison. Data such as IndicVoices motivates checking spontaneous and conversational speech separately. Read-speech datasets such as FLEURS provide another controlled condition. Their totals and language lists do not establish coverage of your listener's device or variety. [IndicVoices](#source/indic) · [FLEURS](#source/fleurs)

Augment training with plausible noise, room responses or feature masks. Match the assumptions of the task. Time masking can teach robustness to missing acoustic evidence, but a mask over a short command might remove the only label-bearing cue. Voice-changing augmentations can corrupt speaker-identity labels. Synthesized speech often shares a generator's rhythm and pronunciation. Hold out real, independently recorded speech when testing a product intended for people. [SpecAugment](#source/augment)

## Make a small update inspectable

For a frozen weight matrix W of shape d_out × d_in, a low-rank update uses `W′x = Wx + sBAx`. A has shape r × d_in and B has shape d_out × r. The scale s controls update strength. When r is small, the update has fewer trainable parameters. With d_in = d_out = 384 and r = 4, the two matrices have 4×384 + 384×4 = 3,072 parameters, compared with 147,456 in the full weight. This arithmetic concerns one projection, excluding biases, optimizer state and other layers. The frozen model still occupies memory.

Initialize B to zero and A to small nonzero values. The initial effective weight equals W, so you can compare with the baseline before optimization. In the first step B can receive a gradient through A, while A initially receives none through zero B. Initializing both to zero can prevent either factor learning. Apply adapters to identified attention projections and verify which parameters require gradients. Reducing trainable parameters helps fit small datasets and memory budgets, but leaves data bias and forgotten behavior as empirical questions. [LoRA formulation](#source/lora)

## Run the offline experiment

From the project directory execute:

```sh
python3 recipes/adapt.py
python3 recipes/adapt.py --seed 17 --json
```

The script generates nonspeech clips with three spectral categories, extracts band-power features and fits a softmax classifier. It shifts the target-domain frequencies, then compares a target-only update with rehearsal that mixes old training clips into adaptation. Groups, clips, initialization, updates and scoring are explicit in the source. Python 3.9 or newer is enough. The documented verification run needed about 15 MiB and less than one second on the development machine.

With seed 17, the baseline correctly classifies 47/72 target examples and 72/72 original examples. Target-only adaptation reaches 71/72 target and 61/72 original. Rehearsal reaches 62/72 target and 72/72 original. Selection uses development groups before these held-out results. The muted negative control obtains 24/72 in each domain. These are measurements from the included fixture. Each clip is a generated signal. A grouped bootstrap describes variation among the simulated acquisition groups and cannot establish uncertainty for real speech.

## Carry the protocol to a pretrained recognizer

The optional local Whisper experiment lives in `recipes/asr_adapter.py`, with setup in `recipes/ASR.md`. It validates a JSONL manifest and 16 kHz mono 16-bit WAVs, rejects shared speaker/session IDs across splits and exact duplicate PCM, then fits query/value projection adapters in the tiny multilingual model's decoder. It uses a local safetensors checkpoint and performs no automatic model download. Run its data check before installing the optional training packages.

The gate selects an epoch only if target development WER improves and control development WER is within two absolute percentage points of baseline. It scores the held-out test only after selection. A selected adapter, hashes, version information and the evaluation report go to a new run directory. The default loss uses transcripts as targets. Keep contextual instructions outside the transcription labels. Long or badly segmented clips undermine the experiment before optimizer choice matters. [Whisper training reference](#source/ft-whisper) · [Versioned model interface](#source/whisper-api)

The data validator is tested with synthetic WAV fixtures. The pretrained-model training path still needs a local checkpoint, suitable dependencies and consented speech to verify. Plan a small CPU pilot or a compatible GPU, measure peak memory after one forward/backward example, and scale only after the baseline fits. FP32 tiny-model weights alone occupy roughly 156 MB, while activations, audio processing, optimizer state and library overhead require more. Avoid treating that weight figure as a full resource requirement. Seeds, checkpoints and package versions aid reproduction. Exact results can still differ across hardware and library algorithms. [Reproducibility limits](#source/torch-random)

## Exercise · set a gate you could fail

Run the included recipe twice with seed 17, then with seed 29. Write the selection rule before inspecting test scores. Compare which classes lose accuracy under target-only training. Expected observation is a tradeoff between target fit and original-domain retention, with results changing across generated groups. If you change the rehearsal ratio after seeing a held-out failure, create a fresh final test draw. For a speech experiment, add name errors, code-switch points, silence hallucinations and speaker-stratified results to WER. For a TTS experiment, add blinded intelligibility, pronunciation and identity listening checks.

## Check your reasoning

**Can better target WER justify shipping if original-language recognition degrades?** Only a documented product decision and user population can set that tradeoff. Report both populations with counts and uncertainty. Keep the base checkpoint and adapter independently versioned so rollback is immediate.

**Can a cloned narrator with excellent speaker similarity establish permission or emotional fidelity?** Similarity is one measured property. Consent and reuse rights require their own records, and expressive fidelity requires a listener task that tests the intended delivery.
