#!/usr/bin/env python3
"""Fit and adapt a softmax classifier on small generated audio fixtures."""
import argparse
import json
import math
import random
import statistics
from dataclasses import dataclass

SAMPLE_RATE = 8000
FRAME_SIZE = 400
CLASSES = (450, 750, 1050)
BANK = tuple(range(250, 1451, 100))
PROBES = tuple(range(200, 1501, 25))
WINDOW = tuple(0.5 - 0.5 * math.cos(2 * math.pi * n / (FRAME_SIZE - 1))
               for n in range(FRAME_SIZE))
COEFFICIENTS = tuple(2 * math.cos(2 * math.pi * f / SAMPLE_RATE) for f in PROBES)
BOOTSTRAPS = 2000
# Group IDs and seeds are disjoint across all six partitions.
SPLITS = {
    "original_train": (100, 8, 3),
    "target_train": (200, 3, 2),
    "original_dev": (300, 4, 2),
    "target_dev": (400, 4, 2),
    "original_test": (500, 12, 2),
    "target_test": (600, 12, 2),
}


@dataclass(frozen=True)
class Clip:
    group: int
    label: int
    features: tuple


def waveform(frequency, gain, rng):
    phase = rng.uniform(0, 2 * math.pi)
    harmonic_phase = rng.uniform(0, 2 * math.pi)
    step = 2 * math.pi * frequency / SAMPLE_RATE
    return [
        gain * (math.sin(n * step + phase)
                + 0.17 * math.sin(2 * n * step + harmonic_phase))
        + rng.uniform(-0.055, 0.055)
        for n in range(FRAME_SIZE)
    ]


def filterbank(samples):
    """Windowed Goertzel powers, pooled into overlapping triangular bands."""
    windowed = [sample * weight for sample, weight in zip(samples, WINDOW)]
    powers = []
    for coefficient in COEFFICIENTS:
        recent, previous = 0.0, 0.0
        for sample in windowed:
            recent, previous = sample + coefficient * recent - previous, recent
        powers.append(max(0.0, recent ** 2 + previous ** 2
                          - coefficient * recent * previous))
    energies = []
    for center in BANK:
        energy = sum(power * max(0.0, 1 - abs(freq - center) / 100)
                     for power, freq in zip(powers, PROBES))
        energies.append(energy)
    total = max(sum(energies), 1e-12)
    return tuple(math.sqrt(energy / total) for energy in energies) + (1.0,)


def make_split(seed, name):
    first, count, repeats = SPLITS[name]
    domain_shift = 170 if name.startswith("target") else 0
    clips = []
    for group in range(first, first + count):
        rng = random.Random(seed * 10000 + group)
        offset = rng.uniform(-60, 60)
        gain = rng.uniform(0.25, 0.70)
        for label, nominal_hz in enumerate(CLASSES):
            for _ in range(repeats):
                hz = nominal_hz + domain_shift + offset + rng.uniform(-75, 75)
                clips.append(Clip(group, label, filterbank(waveform(hz, gain, rng))))
    return clips


def fit(clips, epochs, rate, start=None):
    """Full-batch cross-entropy gradient descent, starting at zero or a prior fit."""
    width = len(clips[0].features)
    weights = [row[:] for row in start] if start is not None else [
        [0.0] * width for _ in CLASSES
    ]
    for _ in range(epochs):
        grad = [[0.0] * width for _ in CLASSES]
        for clip in clips:
            scores = logits(weights, clip.features)
            top = max(scores)
            exp = [math.exp(score - top) for score in scores]
            denominator = sum(exp)
            for label, mass in enumerate(exp):
                error = mass / denominator - (label == clip.label)
                for i, value in enumerate(clip.features):
                    grad[label][i] += error * value
        for row, delta in zip(weights, grad):
            for i, value in enumerate(delta):
                row[i] -= rate * value / len(clips)
    return weights


def logits(weights, values):
    return [sum(w * x for w, x in zip(row, values)) for row in weights]


def by_group(weights, clips):
    correct = {}
    for clip in clips:
        scores = logits(weights, clip.features)
        predicted = max(range(len(scores)), key=scores.__getitem__)
        correct.setdefault(clip.group, []).append(int(predicted == clip.label))
    return correct


def fraction(groups):
    return sum(sum(row) for row in groups.values()), sum(len(row) for row in groups.values())


def interval(group_values, seed):
    """Resample entire equally sized held-out groups, with replacement."""
    rng = random.Random(seed)
    draws = sorted(statistics.mean(rng.choices(group_values, k=len(group_values)))
                   for _ in range(BOOTSTRAPS))
    return [round(draws[int((BOOTSTRAPS - 1) * p)], 4) for p in (0.025, 0.975)]


def muted(clips):
    silent = filterbank([0.0] * FRAME_SIZE)
    return [Clip(clip.group, clip.label, silent) for clip in clips]


def evaluate(weights, clips, seed):
    groups = by_group(weights, clips)
    correct, n = fraction(groups)
    group_scores = [sum(row) / len(row) for row in groups.values()]
    return {"correct": correct, "n": n, "accuracy": round(correct / n, 4),
            "group_interval": interval(group_scores, seed)}


def paired_change(weights, baseline, clips, seed):
    current = by_group(weights, clips)
    prior = by_group(baseline, clips)
    deltas = [(sum(row) - sum(prior[group])) / len(row) for group, row in current.items()]
    return {"delta": round(statistics.mean(deltas), 4), "group_interval": interval(deltas, seed)}


def experiment(seed):
    sets = {name: make_split(seed, name) for name in SPLITS}
    original = sets["original_train"]
    target = sets["target_train"]
    base = fit(original, epochs=65, rate=1.0)
    # Equal clip counts in the replay and new-domain batches. Sample balanced classes.
    replay = []
    for label in range(len(CLASSES)):
        pool = [clip for clip in original if clip.label == label]
        replay.extend(random.Random(seed + label).sample(pool, len(target) // len(CLASSES)))
    models = {
        "baseline": base,
        "target_only": fit(target, epochs=40, rate=1.0, start=base),
        "target_replay": fit(target + replay, epochs=40, rate=1.0, start=base),
    }
    # Predeclared development gate. The tests never select weights, thresholds or policy.
    base_dev = fraction(by_group(base, sets["original_dev"]))
    eligible = []
    dev = {}
    for name, weights in models.items():
        scores = {}
        for domain in ("original", "target"):
            n_ok, n = fraction(by_group(weights, sets[domain + "_dev"]))
            scores[domain] = n_ok / n
        dev[name] = scores
        if scores["original"] >= base_dev[0] / base_dev[1] - 0.10:
            eligible.append(name)
    selected = max(eligible, key=lambda name: (dev[name]["target"], dev[name]["original"]))
    report = {"seed": seed, "sample_rate_hz": SAMPLE_RATE,
              "examples": {k: len(v) for k, v in sets.items()},
              "group_counts": {k: v[1] for k, v in SPLITS.items()},
              "dev": dev, "selected_on_dev": selected, "held_out": {}, "paired_change": {}}
    for name, weights in models.items():
        report["held_out"][name] = {
            domain: evaluate(weights, sets[domain + "_test"], seed + 72)
            for domain in ("original", "target")
        }
        if name in ("target_only", "target_replay"):
            report["paired_change"][name] = {
                domain: paired_change(weights, base, sets[domain + "_test"], seed + 72)
                for domain in ("original", "target")
            }
    # Input ablation keeps cohort labels and IDs intact while removing acoustic evidence.
    report["held_out"]["muted_control"] = {
        domain: evaluate(base, muted(sets[domain + "_test"]), seed + 72)
        for domain in ("original", "target")
    }
    return report


def print_report(report):
    print(f"Synthetic acoustic adaptation | seed {report['seed']} | 8 kHz | 50 ms clips")
    print("Split sizes (clips / groups)")
    for name, count in report["examples"].items():
        print(f"  {name:15s} {count:3d} / {report['group_counts'][name]}")
    print("Development accuracy (original / target)")
    for name, values in report["dev"].items():
        print(f"  {name:17s} {values['original']:6.1%} / {values['target']:6.1%}")
    print(f"Selected on development data: {report['selected_on_dev']}")
    print("Held-out accuracy with approximate 95% group bootstrap intervals")
    for name, domains in report["held_out"].items():
        for domain, value in domains.items():
            lo, hi = value["group_interval"]
            print(f"  {name:17s} {domain:8s} {value['correct']:2d}/{value['n']}"
                  f" = {value['accuracy']:6.1%} [{lo:.1%}, {hi:.1%}]")
    print("Paired accuracy change from baseline (percentage points)")
    for name, domains in report["paired_change"].items():
        for domain, result in domains.items():
            lo, hi = result["group_interval"]
            print(f"  {name:17s} {domain:8s} {100 * result['delta']:+5.1f}"
                  f" [{100 * lo:+.1f}, {100 * hi:+.1f}]")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=17, help="deterministic fixture seed")
    parser.add_argument("--json", action="store_true", help="emit a machine-readable report")
    args = parser.parse_args()
    output = experiment(args.seed)
    if args.json:
        print(json.dumps(output, indent=2))
    else:
        print_report(output)
