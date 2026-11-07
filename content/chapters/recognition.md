{"id": "recognition", "title": "Learning an alignment", "part": "Speech & models", "level": "Intermediate", "minutes": 24, "question": "How can a recognizer learn from a sentence transcript when nobody marked the instant each letter began?", "goals": ["Factor a classical recognizer into acoustic, pronunciation and language scores", "Compute a CTC transcript probability from several frame paths", "Choose a decoding and alignment strategy for a constrained task"], "prereqs": ["articulation", "spectrum", "math"], "related": ["streaming-asr", "adaptation", "evaluation"], "labs": ["partials"], "summary": "Compare hidden-state, CTC, attention and transducer models by the alignments each permits.", "sources": ["sp-hmm", "ctc", "rnnt", "las", "whisper"]}

Imagine the transcript is the single syllable “go.” One person takes 180 ms and another takes 420 ms. Assigning an equal slice of time to every letter would teach inconsistent targets. ASR learns how several acoustic frames support a shorter output sequence. An **alignment** connects frames to labels, allowing uncertain timing to be handled during training.

## Build a classical recognizer

Let X denote a sequence of acoustic observations and W a candidate sequence of words. Bayes' rule lets a decoder rank W by `log P(X | W) + log P(W)` because the evidence P(X) is the same for every candidate. A pronunciation dictionary maps words into sequences of phones. In a hidden Markov model, successive frames depend on hidden states. A state can stay put or advance, allowing variable phone duration. A Gaussian mixture can model each state's feature distribution. A word-level language model contributes contextual probability. This decomposition explains why a new name could be added to a dictionary even before anyone recorded many examples. Its probability in context and the correctness of the pronunciation still mattered. [Rabiner's HMM tutorial](#source/sp-hmm)

Suppose two state paths explain one pronunciation. The forward algorithm adds their probabilities, reusing sums for shared prefixes. Viterbi instead finds a most probable single path. Use the sum to train with uncertain alignments and the best path when one timing hypothesis is useful. A forced aligner constrains this search to a supplied transcript. If the transcript omits a word, the constraint can push adjacent boundaries into the omitted audio. A plausible time stamp alone offers weak evidence that the text was actually spoken.

## Sum over blanks

Connectionist temporal classification, or CTC, lets each encoder frame emit a label or a special blank. To read a path, first merge consecutive identical labels, then remove blanks. Thus `a a _ b` yields “ab,” and `a _ a` yields “aa.” The blank means “emit no label at this frame.” It can occur during audible speech. The order of operations matters whenever labels repeat. [CTC objective and decoding](#source/ctc)

Here is a complete calculation. Use two time steps and only labels *a* and blank. Assume the model predicts `P(a)=0.6` at step one and `P(a)=0.4` at step two. The remaining mass at each step belongs to blank. The paths that collapse to “a” are *aa*, *a blank* and *blank a*. Their probabilities are `0.6 × 0.4 = 0.24`, `0.6 × 0.6 = 0.36` and `0.4 × 0.4 = 0.16`. The target probability is 0.76. Its loss is `−ln(0.76) ≈ 0.274`. The all-blank path supplies the other 0.24. A forward recursion computes this sum efficiently on long utterances.

CTC multiplies frame-label probabilities conditional on the encoded input. An encoder can use wide acoustic context, but this output factorization makes it hard to express a dependence on which labels the decoder already emitted. Greedy decoding picks a best path and collapses it. Multiple smaller paths may jointly favor another transcript. Prefix beam search combines probability mass by prefix and tracks whether the prefix last ended in blank. Beam size bounds work and can prune the correct answer early. [CTC beam search](#source/ctc)

## Give the decoder a history

A transducer puts an acoustic encoder and a representation of the previous output labels into a joint network. At a lattice position (time t, emitted length u), a blank can advance time, or a label can advance the output sequence while holding time fixed. Training sums valid monotonic paths. A bounded-lookahead encoder and a limited label-expansion policy are still needed to fit a live deadline. A classical attention encoder-decoder instead lets its decoder weight encoder positions while predicting the next symbol from label history. Flexible attention helps with difficult correspondences and can skip or revisit material. A whole-utterance encoder introduces a dependency on future frames. [Transducer formulation](#source/rnnt) · [Listen, Attend and Spell](#source/las)

Whisper is a multilingual encoder-decoder trained on weakly supervised speech and text. Broad training coverage offers robustness across tasks, while the decoder's language prior can supply plausible words on weak acoustic evidence. In a noisy request involving a number, keep the acoustic confidence, competing number and sentence context available. An assistant should repeat the proposed quantity before a costly action when the evidence is weak. [Whisper research](#source/whisper)

## Exercise · make a vocabulary list compete with the audio

Give “Raman” and “Roman” illustrative model log scores of −3.2 and −2.7. With a glossary bonus of 0.8 for *Raman*, the adjusted scores are −2.4 and −2.7, so the winner flips. Now test a sentence that really says *Roman*. The same bonus can introduce an error. In a real decoder, external language-model shallow fusion often adds a weighted log probability, with separately tuned length or insertion terms. Build a positive and a confusable negative set, tune on validation utterances, and report both name recall and unintended substitutions. Murmur can select a glossary by the current book to narrow that tradeoff.

## Check your reasoning

**Can two frames encode “aa” under ordinary CTC?** Each *a* needs its own emission and a separating blank, so this target needs at least three frames after encoder subsampling. A too-aggressive subsampling rate makes some training examples impossible.

**If final word error drops after widening the beam, will captions appear earlier?** More search work can delay results. Measure first partial, stable prefix and final accuracy separately, using the same hardware and chunk schedule.
