# Acoustic adaptation on one CPU

A classifier works on three acoustic signals in the original domain. In a second domain the same three classes arrive at higher frequencies. Can a little target data improve recognition without sacrificing the original task? This exercise fits real weights, fine-tunes them in two ways and compares the resulting decisions on previously unseen fixture groups.

## Run the offline experiment

From the Signal Atlas project directory, run:

```sh
python3 recipes/adapt.py
python3 recipes/adapt.py --seed 17 --json
```

Python 3.9 or newer supplies all dependencies. The default uses one CPU process and holds generated clips only long enough to extract their features. It reads no microphone, credentials or network service and writes no files. On the verification machine, one run with CPython 3.9.6 on Apple arm64 took 0.71 seconds and reached about 15 MiB maximum resident memory. These are measurements of this fixture run. Other machines and Python builds can differ.

## Inspect the experiment

1. **Generate the signal.** Each 50 ms clip contains 400 samples at 8 kHz. Three class frequencies are 450, 750 and 1,050 Hz. Add a weaker second harmonic, random phase and additive noise. Inside a group, clips share a gain and frequency offset. A fresh per-clip variation prevents identical copies. In the target domain every center moves up by 170 Hz. All signals are synthetic, with no speech, human identity or borrowed recordings.
2. **Extract reproducible features.** Apply a Hann window and measure power at probes 25 Hz apart with the Goertzel recurrence. Pool into overlapping triangular bands, divide by total power and take square roots. The 13 band values plus a constant bias form a 14-element input. Nearby frequencies can activate neighboring bands. A higher gain mostly scales out of this representation.
3. **Fit the source model.** Three linear rows convert the features into three scores. Softmax maps them to class probabilities. For a training clip with label `y`, the loss is `−log p(y)`. The gradient for class `k` is `(p(k) − 1[k = y]) × features`. The script performs 65 full-batch steps at learning rate 1.0 from zero weights.
4. **Fine-tune two copies.** Starting from the fitted original, take 40 more steps at the same rate. One copy sees just 18 target-training clips. The other mixes them with 18 balanced clips sampled from original training. This rehearsal gives the loss a direct penalty when an update harms earlier decisions. Keeping old clips can be costly or impermissible with real voice data. Replay works with the consented or synthetic material that is available. [Experience Replay for Continual Learning](https://proceedings.neurips.cc/paper_files/paper/2019/hash/fa7cdfad1a5aaf8370ebeda47a1ff1c3-Abstract.html)
5. **Select on development groups.** Keep candidates whose original development accuracy stays within ten percentage points of the source baseline. Among them, pick the highest target development accuracy, with original accuracy breaking ties. The baseline is a candidate. Ties on both metrics keep the earlier, simpler candidate in iteration order. Freeze the procedure before evaluating held-out groups.

The script assigns a separate random generator to each group. Train, development and test group IDs are disjoint in both domains. Each group contains all three classes. A group is a synthetic acquisition setting, roughly analogous to a session with a shared gain and calibration. Splitting clips from the same acquisition setting across train and test would hide part of the generalization problem.

| Domain | Training clips / groups | Development clips / groups | Held-out clips / groups |
| --- | --- | --- | --- |
| Original | 72 / 8 | 24 / 4 | 72 / 12 |
| Target | 18 / 3 | 24 / 4 | 72 / 12 |

## Check the result

The default seed is 17. On the development sets the baseline scored 100% original and 66.7% target, target-only scored 75% and 100%, and replay scored 100% and 91.7%. The rule selects replay.

| Fixed model or control | Original held out | Target held out |
| --- | ---: | ---: |
| Original fit | 72/72 (100.0%) | 47/72 (65.3%) |
| Target-only update | 61/72 (84.7%) | 71/72 (98.6%) |
| Target plus rehearsal | 72/72 (100.0%) | 62/72 (86.1%) |
| Original fit with muted test input | 24/72 (33.3%) | 24/72 (33.3%) |

Muting replaces the waveform by zeros before extracting features. All examples then carry the same bias-only input, so the classifier chooses a constant label. Because the three labels have equal counts, this control scores exactly one third in every group. An unexpectedly high muted score would motivate a check for class imbalance or a side channel.

Compared on the same target test groups, replay gained 20.8 percentage points, with an approximate 95% paired group-bootstrap interval of +13.9 to +27.8. The script resamples 12 whole groups with replacement 2,000 times and computes percentile limits. This preserves correlated errors inside each group and pairs both models on the same clips. When every observed group scores 100%, that empirical bootstrap interval collapses to [100%, 100%]. It captures neither unobserved group types nor uncertainty about the generator. Twelve simulated test groups offer limited evidence even within this fixture.

Two seed-17 JSON runs from the verification environment were byte-identical. The SHA-256 of the JSON output with its final newline was `d0dd0d0073a6c084f9c03914da7a61f17164d0ad444c731a72bb1bfb5981134a`. Audio synthesis uses floating-point math, so compare counts first on a different implementation. A second tested seed, 29, selected replay and yielded 66/72 original and 69/72 target. The change in apparent retention illustrates why rerunning one favorable seed supplies weak evidence of generalization.

## Extend it deliberately

Reduce the target-training groups in `SPLITS`, preregister a tolerated original-domain drop, and compare the chosen policy using fresh held-out groups. Inspect which classes exchange errors around the new decision boundaries. If the domain shift is a known calibration error, repairing the feature or sample-rate path can be simpler than fine-tuning. Avoid using the reported test rows to tune the next configuration, since repeated selection turns a test into a development set.

This acoustic classifier teaches feature extraction, limited adaptation, forgetting, replay and split hygiene. It measures three synthetic categories and cannot establish speech-recognition accuracy, TTS quality, speaker fairness or production capacity. For the separate opt-in pretrained ASR recipe with consented local recordings, see [ASR adaptation](ASR.md).
