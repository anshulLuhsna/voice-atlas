#!/usr/bin/env python3
"""An offline, small-data Whisper decoder LoRA experiment. See ASR.md."""
import argparse
import hashlib
import json
import os
import random
import re
import sys
import unicodedata
import wave
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Example:
    id: str
    split: str
    domain: str
    speaker: str
    session: str
    wav: Path
    text: str
    frames: int
    pcm_sha: str


def read_pcm(path):
    with wave.open(str(path), "rb") as wav:
        if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(),
                wav.getcomptype()) != (1, 2, 16000, "NONE"):
            raise ValueError(f"{path.name}: expected mono 16 kHz signed 16-bit PCM WAV")
        count = wav.getnframes()
        if count < 1600 or count > 30 * 16000:
            raise ValueError(f"{path.name}: clips must last 0.1 through 30 seconds")
        data = wav.readframes(count)
    if len(data) != count * 2:
        raise ValueError(f"{path.name}: truncated PCM data")
    return count, data


def read_manifest(path):
    base = path.resolve().parent
    seen_ids, seen_audio = set(), set()
    group_splits = {}
    examples = []
    with path.open(encoding="utf-8") as source:
        for line, raw in enumerate(source, 1):
            if not raw.strip():
                continue
            item = json.loads(raw)
            keys = ("id", "split", "domain", "speaker", "session", "wav", "text")
            if not isinstance(item, dict) or any(
                    not isinstance(item.get(k), str) or not item[k].strip() for k in keys):
                raise ValueError(f"manifest line {line}: expected nonempty strings for {keys}")
            row = {k: item[k].strip() for k in keys}
            identity, split = row["id"], row["split"]
            if split not in {"train", "dev", "test"} or row["domain"] not in {"target", "control"}:
                raise ValueError(f"{identity}: unsupported split or domain")
            if identity in seen_ids:
                raise ValueError(f"{identity}: duplicate example ID")
            seen_ids.add(identity)
            for key in ("speaker", "session"):
                group = (key, row[key])
                if group_splits.setdefault(group, split) != split:
                    raise ValueError(f"{identity}: {key} {row[key]} crosses splits")
            wav = (base / row["wav"]).resolve()
            if Path(row["wav"]).is_absolute() or base not in wav.parents:
                raise ValueError(f"{identity}: WAV must be inside the manifest directory")
            count, data = read_pcm(wav)
            digest = hashlib.sha256(data).hexdigest()
            if digest in seen_audio:
                raise ValueError(f"{identity}: duplicate PCM content")
            seen_audio.add(digest)
            examples.append(Example(identity, split, row["domain"], row["speaker"],
                                    row["session"], wav, row["text"], count, digest))
    present = {(x.split, x.domain) for x in examples}
    required = {("train", "target"), ("dev", "target"), ("dev", "control"),
                ("test", "target"), ("test", "control")}
    if required - present:
        raise ValueError(f"missing required split/domain groups: {sorted(required - present)}")
    return sorted(examples, key=lambda x: x.id)


def inventory(items):
    counts = Counter((x.split, x.domain) for x in items)
    fingerprint = hashlib.sha256()
    for x in items:
        row = [x.id, x.split, x.domain, x.speaker, x.session, x.text, x.pcm_sha]
        fingerprint.update((json.dumps(row, ensure_ascii=False) + "\n").encode())
    return {"utterances": len(items), "seconds": sum(x.frames for x in items) / 16000,
            "groups": {f"{k[0]}/{k[1]}": n for k, n in sorted(counts.items())},
            "manifest_and_pcm_sha256": fingerprint.hexdigest()}


def edit_distance(reference, hypothesis):
    previous = list(range(len(hypothesis) + 1))
    for index, token in enumerate(reference, 1):
        current = [index]
        for j, candidate in enumerate(hypothesis, 1):
            current.append(min(previous[j] + 1, current[j-1] + 1,
                               previous[j-1] + (token != candidate)))
        previous = current
    return previous[-1]


def score_pairs(pairs):
    counts = Counter()
    for reference, hypothesis in pairs:
        clean = lambda s: unicodedata.normalize("NFC", s).casefold().split()
        words, predicted = clean(reference), clean(hypothesis)
        chars, pred_chars = "".join(words), "".join(predicted)
        counts.update(word_edits=edit_distance(words, predicted), words=len(words),
                      character_edits=edit_distance(chars, pred_chars), characters=len(chars),
                      utterances=1)
    return dict(counts, wer=counts["word_edits"]/counts["words"],
                cer=counts["character_edits"]/counts["characters"])


def checkpoint_hash(path):
    # Include all files needed for this recipe, without hashing unrelated copied docs.
    inputs = sorted(f for f in path.iterdir() if f.is_file()
                    and f.suffix in {".safetensors", ".json", ".txt", ".model"})
    if not any(f.suffix == ".safetensors" for f in inputs):
        raise ValueError("expected a local Whisper snapshot with safetensors weights")
    fingerprint = hashlib.sha256()
    for f in inputs:
        digest = hashlib.sha256()
        with f.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1048576), b""):
                digest.update(chunk)
        fingerprint.update((f.name + " " + digest.hexdigest() + "\n").encode())
    return fingerprint.hexdigest()


def install_adapter(model, rank):
    import torch
    from torch import nn

    class AdaptedProjection(nn.Module):
        def __init__(self, original):
            super().__init__()
            self.original = original
            self.down = nn.Linear(original.in_features, rank, bias=False)
            self.up = nn.Linear(rank, original.out_features, bias=False)
            torch.nn.init.zeros_(self.up.weight)

        def forward(self, x):
            return self.original(x) + self.up(self.down(x))

    model.requires_grad_(False)
    for layer in model.model.decoder.layers:
        for name in ("q_proj", "v_proj"):
            original = getattr(layer.self_attn, name)
            setattr(layer.self_attn, name, AdaptedProjection(original))
    return {name: tensor for name, tensor in model.named_parameters() if tensor.requires_grad}


def snapshot(params):
    return {name: param.detach().cpu().contiguous().clone() for name, param in params.items()}


def restore(params, state):
    import torch
    if set(params) != set(state):
        raise ValueError("adapter parameter names differ from this checkpoint")
    with torch.no_grad():
        for name, tensor in params.items():
            tensor.copy_(state[name])


def run_experiment(args, examples, model_sha):
    import torch
    import numpy as np
    import transformers
    from transformers import WhisperForConditionalGeneration, WhisperProcessor
    from safetensors.torch import save_file

    os.environ["HF_HUB_OFFLINE"] = "1"
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    device = torch.device(args.device)
    model = WhisperForConditionalGeneration.from_pretrained(
        args.checkpoint, local_files_only=True, use_safetensors=True,
        attn_implementation="eager")
    if model.config.d_model != 384 or model.config.decoder_layers != 4 or not getattr(
            model.generation_config, "lang_to_id", None):
        raise ValueError("this recipe expects the multilingual Whisper tiny checkpoint")
    processor = WhisperProcessor.from_pretrained(args.checkpoint, local_files_only=True)
    processor.tokenizer.set_prefix_tokens(language=args.language, task="transcribe",
                                         predict_timestamps=False)
    params = install_adapter(model, args.rank)
    model.to(device)
    initial = snapshot(params)
    optimizer = torch.optim.AdamW(params.values(), lr=args.learning_rate, weight_decay=0)

    def features(example):
        _, pcm = read_pcm(example.wav)
        if hashlib.sha256(pcm).hexdigest() != example.pcm_sha:
            raise ValueError(f"{example.id}: WAV changed after validation")
        samples = np.frombuffer(pcm, dtype="<i2").astype("float32") / 32768
        result = processor.feature_extractor(samples, sampling_rate=16000,
                    return_tensors="pt", return_attention_mask=True)
        return {k: result[k].to(device) for k in ("input_features", "attention_mask")}

    def evaluate(split):
        model.eval()
        groups = {"target": [], "control": []}
        with torch.inference_mode():
            for x in examples:
                if x.split != split:
                    continue
                ids = model.generate(**features(x), language=args.language, task="transcribe",
                                     do_sample=False, num_beams=1, max_new_tokens=224)
                text = processor.batch_decode(ids, skip_special_tokens=True)[0]
                groups[x.domain].append((x.text, text))
        return {key: score_pairs(pairs) for key, pairs in groups.items()}

    baseline_dev = evaluate("dev")
    best_wer = baseline_dev["target"]["wer"]
    best_epoch, best = 0, initial
    history = []
    train = [x for x in examples if x.split == "train"]
    for epoch in range(1, args.epochs + 1):
        model.train()
        random.Random(args.seed + epoch).shuffle(train)
        for example in train:
            ids = processor.tokenizer(example.text).input_ids
            if ids[0] == model.config.decoder_start_token_id:
                ids = ids[1:]
            if len(ids) > model.config.max_target_positions:
                raise ValueError(f"{example.id}: transcript exceeds model label window")
            labels = torch.tensor([ids], dtype=torch.long, device=device)
            optimizer.zero_grad(set_to_none=True)
            loss = model(**features(example), labels=labels, use_cache=False).loss
            if not torch.isfinite(loss):
                raise ValueError("training loss is non-finite")
            loss.backward()
            torch.nn.utils.clip_grad_norm_(params.values(), 1.0)
            optimizer.step()
        scores = evaluate("dev")
        history.append({"epoch": epoch, "dev": scores})
        gain = scores["target"]["wer"] < best_wer
        general_ok = scores["control"]["wer"] <= baseline_dev["control"]["wer"] + 0.02
        if gain and general_ok:
            best_wer, best_epoch, best = scores["target"]["wer"], epoch, snapshot(params)

    # Both test passes happen only after the epoch has been selected on dev.
    restore(params, initial)
    baseline_test = evaluate("test")
    restore(params, best)
    selected_test = evaluate("test") if best_epoch else baseline_test
    report = {"data": inventory(examples), "checkpoint_sha256": model_sha,
              "python": sys.version.split()[0], "torch": str(torch.__version__),
              "transformers": transformers.__version__, "device": str(device),
              "language": args.language, "rank": args.rank, "scale": 1,
              "seed": args.seed, "learning_rate": args.learning_rate, "epochs": args.epochs,
              "trainable_parameters": sum(p.numel() for p in params.values()),
              "baseline_dev": baseline_dev, "history": history, "selected_epoch": best_epoch,
              "baseline_test": baseline_test, "selected_test": selected_test}
    if best_epoch:
        save_file(best, str(args.output / "adapter.safetensors"))
    stage = args.output / "report.partial"
    stage.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    stage.replace(args.output / "report.json")
    print(f"selected epoch {best_epoch}; results in {args.output}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--check-data", action="store_true", help="only audit WAVs and splits")
    parser.add_argument("--checkpoint", type=Path, help="local multilingual tiny snapshot")
    parser.add_argument("--output", type=Path, help="new run directory with existing parent")
    parser.add_argument("--language", default="english", help="language name or Whisper code")
    parser.add_argument("--device", choices=("cpu","cuda","mps"), default="cpu")
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--rank", type=int, default=4)
    parser.add_argument("--learning-rate", type=float, default=0.001)
    parser.add_argument("--seed", type=int, default=17)
    args = parser.parse_args()
    try:
        examples = read_manifest(args.manifest)
        info = inventory(examples)
        if args.check_data:
            print(json.dumps(info, indent=2))
            return
        if not args.checkpoint or not args.checkpoint.is_dir() or not args.output:
            parser.error("training requires a local --checkpoint and a new --output directory")
        if not (1 <= args.epochs <= 20 and 1 <= args.rank <= 64 and
                0 < args.learning_rate <= 0.1 and 0 <= args.seed < 2**32):
            parser.error("use epochs 1–20, rank 1–64, learning rate in (0, .1], and a uint32 seed")
        digest = checkpoint_hash(args.checkpoint)
        args.output.mkdir(exist_ok=False)
        run_experiment(args, examples, digest)
    except (OSError, ValueError, RuntimeError, EOFError, wave.Error, ImportError) as error:
        parser.exit(2, f"{parser.prog}: {error}\n")


if __name__ == "__main__":
    main()
