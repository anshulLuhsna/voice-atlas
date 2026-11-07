# Optional local Whisper LoRA experiment

This recipe fine-tunes query and value projections in the multilingual Whisper tiny decoder. It requires your own permitted speech recordings and a local model snapshot. The fieldbook and the default acoustic adaptation exercise run independently of this setup.

## Verification boundary

The data validator and its rejection cases were tested with generated WAV fixtures. The model training path has been reviewed against the pinned Transformers API but has not been run with a pretrained checkpoint. Treat a first run as an experiment. A seed records random choices within a stack, and numerical equality across devices needs a separate check.

## Prepare a local manifest

Use 16 kHz mono signed 16-bit PCM WAV clips between 0.1 and 30 seconds, all inside the directory containing your JSONL manifest. Each line is a separate object, for example

```json
{"id":"t001","split":"train","domain":"target","speaker":"speaker-a","session":"session-a1","wav":"clips/t001.wav","text":"Read paragraph fourteen."}
```

Required split/domain combinations are train/target, dev/target, dev/control, test/target and test/control. Control means the original task you want to retain. Give every speaker and session to exactly one split. For a speaker-personalized experiment this strict independent-speaker validator would need a documented session-only split variant first. The current script deliberately tests cross-speaker adaptation.

Collect enough independent speakers and sessions for the claims you want to make. The manifest schema cannot check consent or transcription correctness. Keep those records separately and retain IDs needed to delete derived artifacts. The validator checks duplicate PCM, paths, duration, format, group leakage and required slices.

```sh
python3 recipes/asr_adapter.py --manifest /absolute/path/to/data/manifest.jsonl --check-data
```

## Prepare the optional environment

Use a separate Python 3.10 or 3.11 environment. These pinned packages are available through standard package registries. Installation needs network access and potentially several gigabytes of disk space.

```sh
python3.11 -m venv .venv-asr
.venv-asr/bin/python -m pip install -r recipes/asr-requirements.txt
```

Obtain the multilingual `openai/whisper-tiny` model through its official model distribution after reviewing its model card and license. Save the processor/tokenizer configuration, generation configuration and safetensors weights together. Record the repository revision. The recipe requires a local snapshot and sets local-only loading. It performs no automatic download.

Use a new output directory whose parent exists

```sh
.venv-asr/bin/python recipes/asr_adapter.py \
  --manifest /absolute/path/to/data/manifest.jsonl \
  --checkpoint /absolute/path/to/whisper-tiny-snapshot \
  --output /absolute/path/to/runs/first-adapter \
  --language english --device cpu --epochs 2 --rank 4 --seed 17
```

Device options are CPU, CUDA and MPS. Hardware and platform wheels determine availability. Begin with short clips and a tiny permitted training subset. Record elapsed time and peak resident/device memory on that run before budgeting a larger one. Approximately 39 million FP32 base parameters alone occupy 156 MB in decimal units. Activations, optimizer state, processor features and runtime overhead can require substantially more. This is a weight arithmetic estimate, not a measured training-memory requirement. No wall-clock performance is promised.

## Inspect the gate

The baseline has a zero-output low-rank update. Each epoch changes only the selected adapter parameters. Development-set target WER must improve, and control WER may increase by at most 0.02 absolute. The best qualifying epoch wins. Epoch zero keeps the base model. Test results are computed only after selection. Output includes a content hash of model files, a data fingerprint, package versions, training settings and cohort metrics in `report.json`. A selected nonzero epoch also writes `adapter.safetensors`.

WER uses Unicode NFC, casefolding and whitespace tokenization with punctuation retained. CER removes whitespace after that normalization. Inspect both scored conventions for the language. This recipe does not add a multilingual segmenter or a speaker-similarity evaluation.

Keep the original checkpoint immutable. Any unsuccessful run leaves a distinct output directory so a retry cannot silently overwrite a previous experiment. For deployment or an adapter-loading inference endpoint, build and test that integration separately. The included program is a controlled training experiment.

References are the fieldbook's [Whisper API source](../index.html#source/whisper-api), [LoRA source](../index.html#source/lora) and [reproducibility source](../index.html#source/torch-random).
