{"id":"audio-tokens","title":"Speaking in audio tokens","part":"Speech & models","level":"Advanced","minutes":24,"question":"What can a dialogue model hear after you replace each slice of audio with a handful of integers?","goals":["Calculate a neural codec's nominal bitrate from its codebooks and frame rate","Distinguish reconstruction, linguistic content and conversational modeling objectives","Compare a cascade and a direct speech system with the same listener task"],"prereqs":["codecs","recognition","synthesis"],"related":["transport","turn-taking","inference"],"labs":["latency"],"summary":"Trace discrete audio from a learned codebook to a full-duplex response, including what the representation can lose.","sources":["encodec","sp-audiolm","moshi","kyutai","duplex"]}

Consider two utterances with identical words, “you finished.” One expresses surprise and the other resignation. A plain transcript may collapse them. Retaining the whole waveform preserves the cues, at a high modeling rate. A mono stream at 24 kHz produces 24,000 consecutive amplitudes per second. A neural audio codec learns a shorter sequence from which a decoder reconstructs sound. The usefulness of that sequence for answering a question depends on what training rewarded.

## Quantize a latent vector

A learned encoder turns overlapping sample neighborhoods into vectors at a lower frame rate. A codebook is a learned table of candidate vectors. For each latent vector z, choose the entry closest under a specified distance and transmit its integer ID. With residual vector quantization, choose a first entry, subtract it from z and quantize the remaining error with a second table. The decoder receives the sum of the selected vectors.

Work through one 2D example. Let `z = (2.3, 0.8)`; a nearest first-stage entry `(2, 1)` leaves `(0.3, −0.2)`. Suppose the nearest second entry is `(0.25, −0.25)`. The reconstructed latent is `(2.25, 0.75)`. The transmitted data are the two IDs, and reconstruction still has error. A decoder can learn to produce perceptually convincing audio from an approximate latent. Listening for similarity to the input and detecting whether the spoken name survived are separate tests. [EnCodec architecture and training](#source/encodec)

Suppose each of eight codebooks contains 1,024 entries. A fixed-width index needs 10 bits. At 50 frames/s the nominal payload is `8 × 10 × 50 = 4,000 bit/s`. A one-second packetization budget must also include headers, timestamps and any error-protection bits. A 20 ms hop sets the rate of emitted frames in this illustration. It does not by itself bound codec lookahead, network buffering or the delay introduced by the decoder.

## Which tokens help which prediction?

A **semantic** representation aims to retain information useful for predicting linguistic content while reducing nuisance variation. An **acoustic** representation needs finer information for faithful reconstruction, including pitch, timing and timbre. These are objectives and tendencies. Token names alone do not guarantee invariance to speaker or language. AudioLM combines representations at different granularities so longer-range structure can be modeled separately from acoustic detail. In an autoregressive model, each next token is predicted given earlier tokens. A hierarchy can give coarse temporal organization to one model and local reconstruction to another. [AudioLM](#source/sp-audiolm)

More codebooks can improve fidelity and increase the number of decisions. Serializing eight codes for every 20 ms frame yields 400 code decisions per second in our example, a different quantity from 50 new time positions per second. A predictor can generate some codebooks in parallel or use separate within-frame and across-frame models. Count actual serial dependencies before claiming a speedup. A lossy codec may suppress quiet handover cues even when music or average speech sounds convincing.

## Two routes through a conversation

A cascade maps speech to text, sends text and context to a language model, then synthesizes the answer. Its transcript can be searched, inspected, corrected and aligned to source passages. Each stage can stream and overlap. An unannotated transcript can lose laughter, uncertainty, overlap and rhythm. Shipping aligned prosodic features or selected audio alongside the transcript can recover some cues at the cost of storage, privacy and a more complex evaluation.

A direct speech-to-speech model learns to generate speech representations conditioned on incoming speech. Moshi models user and system audio streams, with a time-aligned text stream supporting linguistic generation. Separate streams allow simultaneous input and output. This supplies information for barge-in and backchannels, but a model can still interrupt inappropriately or produce an ungrounded answer. A direct model's internal text can aid inspection where available. For Murmur, an external source-span checker, presentation-time checkpoint and explicit cancellation protocol are valuable under either design. [Moshi paper](#source/moshi) · [Research implementation](#source/kyutai)

## Exercise · put both graphs on the same clock

For one listener query, sketch the minimum path from the last question sound to the first *audible answer*. Use illustrative delays of 80 ms for residual ASR, 120 ms to first answer text, 100 ms to first synthesized audio and 40 ms for playout. A strictly serial cascade yields 340 ms. A direct model with 80 ms of codec lookahead, 180 ms first-generation delay and the same 40 ms playout yields 300 ms under those assumptions. Give the cascade a correctly predicted partial that allows 70 ms of language work to overlap ASR and it yields 270 ms. If that partial is wrong, discard the speculation and count the wasted work. Explore one stage at a time in the [latency experiment](#lab/latency).

Then score overlapping questions on interruption behavior, cited-source accuracy, transcription of names and listener preference. Full-Duplex-Bench supplies examples of how turn scenarios can be operationalized. Add live listeners because a recorded input keeps playing in exactly the same way even when the system responds rudely. [Full-Duplex-Bench](#source/duplex)

## Check your reasoning

**Does 4 kbit/s reveal the model's inference speed?** It specifies a representation budget. Code prediction order, model size, decoder cost, lookahead and hardware determine wall-clock behavior.

**If direct speech preserves laughter, can we assume it understood a joke?** The encoder may retain acoustic evidence while the model interprets it incorrectly. Compare pairs with the same words and differing delivery, check task outcomes and analyze errors with fluent listeners.
