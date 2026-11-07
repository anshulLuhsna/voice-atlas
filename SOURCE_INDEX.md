# Annotated source index

Reviewed 7 November 2026. Each ID is a citation target in the reader.

## phys

[Sound intensity and sound level](https://openstax.org/books/physics/pages/14-2-sound-intensity-and-sound-level)

OpenStax · 2020 · Textbook

Derives intensity level and relates it to hearing. Use the pressure reference separately when computing SPL.

Reviewed 2026-11-07.

## superposition

[Wave interaction](https://openstax.org/books/physics/pages/13-3-wave-interaction-superposition-and-interference)

OpenStax · 2020 · Textbook

Connect constructive and destructive superposition to the two-path room example. Ideal waves simplify a real room.

Reviewed 2026-11-07.

## mic

[Microphone techniques for recording](https://www.shure.com/en-US/docs/education/Microphone-Techniques-for-Recording)

Shure · Living guide · Technical guide

Read the operating-principle and directionality sections. Frequency-specific polar plots matter more than the name of the pattern.

Reviewed 2026-11-07.

## mems

[Analog and digital MEMS microphone design considerations](https://www.analog.com/media/en/technical-documentation/technical-articles/Analog-and-Digital-MEMS-Microphone-Design-Considerations-MS-2472.pdf)

Analog Devices · Technical article · Technical guide

Follows the transducer and signal conditioning inside a miniature microphone. Device-specific interface details vary.

Reviewed 2026-11-07.

## sampling-guide

[ADC and DAC](https://www.dspguide.com/ch3.htm)

Steven W. Smith · 1997 · Textbook

Chapter 3 treats quantization, sampling and reconstruction as separate operations. Useful before experimenting with resampling.

Reviewed 2026-11-07.

## convolution

[Convolution](https://www.dspguide.com/ch6/1.htm)

Steven W. Smith · 1997 · Textbook

Build a filter output from scaled, shifted impulse responses. The model assumes a linear time-invariant system.

Reviewed 2026-11-07.

## fourier

[The discrete Fourier transform](https://www.dspguide.com/ch8.htm)

Steven W. Smith · 1997 · Textbook

Use sine and cosine correlation to understand a spectral bin before using an FFT implementation.

Reviewed 2026-11-07.

## praat

[Configuring the spectrogram](https://www.fon.hum.uva.nl/praat/manual/Intro_3_2__Configuring_the_spectrogram.html)

Paul Boersma & David Weenink · Praat manual · Technical guide

Connect window duration to spectral bandwidth. Its Gaussian window constants differ from the Hann-window lab.

Reviewed 2026-11-07.

## mel

[Mel-scaled spectrogram](https://librosa.org/doc/latest/generated/librosa.feature.melspectrogram.html)

librosa contributors · API reference · Technical guide

Shows how a power spectrum is projected onto a mel filterbank. Check centering, exponent and mel convention when reproducing features.

Reviewed 2026-11-07.

## opus

[RFC 6716 · Definition of the Opus audio codec](https://datatracker.ietf.org/doc/html/rfc6716)

IETF · Valin, Vos & Terriberry · 2012 · Standard

Read the encoder modes and frame-duration rules to distinguish speech coding, transform coding and their hybrid.

Reviewed 2026-11-07.

## phonemes

[Phonemic contrast](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/11-3-phonemic-contrast/)

Essentials of Linguistics, 2nd ed. · Open textbook · Textbook

Use contrast in a language to test whether a sound distinction can change meaning. Symbols alone cannot establish contrast.

Reviewed 2026-11-07.

## hindi

[A practical guide to Hindi script](https://iu.pressbooks.pub/hindiscript/chapter/5-1-discussion/)

Indiana University Pressbooks · Open textbook · Textbook

Consult the consonant distinctions in the teaching material. A writing-system example does not describe all varieties or spontaneous speech.

Reviewed 2026-11-07.

## indic

[IndicVoices](https://arxiv.org/abs/2403.01926)

AI4Bharat and collaborators · 2024 · Dataset paper

Compare read, extempore and conversational collection across Indian languages. Check transcription coverage separately from total recorded hours.

Reviewed 2026-11-07.

## ctc

[Sequence modeling with CTC](https://distill.pub/2017/ctc/)

Awni Hannun · 2017 · Research exposition

Work through blank-separated repeats and the sum over alignments. The illustrations make independence assumptions visible.

Reviewed 2026-11-07.

## rnnt

[Sequence transduction with recurrent neural networks](https://arxiv.org/abs/1211.3711)

Alex Graves · 2012 · Paper

Read the joint acoustic and label-history lattice. A transducer architecture still needs a bounded-lookahead encoder to stream.

Reviewed 2026-11-07.

## las

[Listen, attend and spell](https://arxiv.org/abs/1508.01211)

Chan and colleagues · 2015 · Paper

Follow the encoder, attention and autoregressive decoder as an alternative to a latent monotonic alignment.

Reviewed 2026-11-07.

## whisper

[Robust speech recognition via large-scale weak supervision](https://arxiv.org/abs/2212.04356)

Radford and colleagues · 2022 · Paper

Study multilingual weak supervision and transfer tests. The offline objective does not specify a product's partial-result commit policy.

Reviewed 2026-11-07.

## diarization

[pyannote.audio](https://pyannote.github.io/pyannote-audio/)

pyannote contributors · Project documentation · Project

Trace segmentation, overlap and diarization through a practical toolkit. Diarization returns local speaker labels.

Reviewed 2026-11-07.

## ecapa

[ECAPA-TDNN](https://arxiv.org/abs/2005.07143)

Desplanques, Thienpondt & Demuynck · 2020 · Paper

Examine a speaker-verification embedding network. A similarity score needs domain-specific threshold calibration.

Reviewed 2026-11-07.

## tacotron

[Natural TTS synthesis by conditioning WaveNet on mel spectrogram predictions](https://arxiv.org/abs/1712.05884)

Shen and colleagues · 2017 · Paper

Separate acoustic prediction from waveform synthesis. The evaluation is tied to this particular system and data.

Reviewed 2026-11-07.

## encodec

[High fidelity neural audio compression](https://arxiv.org/abs/2210.13438)

Défossez and colleagues · 2022 · Paper

Study the streaming encoder, residual quantization and decoder. Good reconstruction and good linguistic tokens are different objectives.

Reviewed 2026-11-07.

## voicebox

[Voicebox](https://arxiv.org/abs/2306.15687)

Le and colleagues · 2023 · Paper

A concrete conditional flow-matching speech model. Check which segments are given as context and which are generated.

Reviewed 2026-11-07.

## moshi

[Moshi · a speech-text foundation model for real-time dialogue](https://arxiv.org/abs/2410.00037)

Défossez and colleagues · 2024 · Paper

Trace two streams of discrete audio and the time-aligned text stream. Reported latency belongs to the authors' setup.

Reviewed 2026-11-07.

## reader-price

[ElevenReader plans](https://elevenreader.io/pricing)

ElevenReader · Product page · Product claim

Consumer import/listening allowances, playback features, download availability and billing cadence. Prices and entitlements can change by time and region.

Reviewed 2026-11-07.

## api-price

[ElevenLabs plans](https://elevenlabs.io/pricing)

ElevenLabs · Product page · Product claim

Separate API/creator credits from the consumer reader subscription. Character charges depend on model and plan.

Reviewed 2026-11-07.

## piper

[Piper local speech synthesis](https://github.com/OHF-Voice/piper1-gpl)

Open Home Foundation Voice · Source repository · Project

Inspect local inference and voice configuration. Check the engine license and each selected voice's model card separately.

Reviewed 2026-11-07.

## kokoro

[Kokoro-82M model card](https://huggingface.co/hexgrad/Kokoro-82M)

hexgrad · 2025 · Model card

Lists model size, voice assets and language coverage for offline synthesis. Compare pronunciation with your own text rather than assuming quality from parameter count.

Reviewed 2026-11-07.

## lora

[LoRA · low-rank adaptation of large language models](https://arxiv.org/abs/2106.09685)

Hu and colleagues · 2021 · Paper

Derives a low-rank weight update. Applying it to speech modules requires a target-layer choice and separate speech evaluation.

Reviewed 2026-11-07.

## ft-whisper

[Fine-tune Whisper for multilingual ASR](https://huggingface.co/blog/fine-tune-whisper)

Sanchit Gandhi · Hugging Face · 2022 · Training recipe

A traceable reference for pairing 16 kHz waveforms with labels and evaluating WER. Use currently permitted data and record exact revisions.

Reviewed 2026-11-07.

## fleurs

[FLEURS](https://arxiv.org/abs/2205.12446)

Conneau and colleagues · 2022 · Dataset paper

Parallel read speech provides a controlled cross-language comparison. It cannot establish performance on spontaneous code-switching.

Reviewed 2026-11-07.

## skantze

[Gabriel Skantze · professional profile](https://www.kth.se/profile/skantze/)

KTH · Lab profile · Professional profile

Use the profile to locate conversational systems and turn-taking publications and verify authorship.

Reviewed 2026-11-07.

## murthy

[Hema A. Murthy · research](https://www.cse.iitm.ac.in/~hema/)

IIT Madras · Lab profile · Professional profile

A route into speech signal processing and synthesis in Indian languages, including publications and student theses.

Reviewed 2026-11-07.

## watanabe

[Shinji Watanabe · professional profile](https://www.lti.cs.cmu.edu/people/faculty/watanabe-shinji.html)

Carnegie Mellon Language Technologies Institute · Lab profile · Professional profile

Connect end-to-end speech research and reproducible ESPnet experiments through an institutional profile.

Reviewed 2026-11-07.

## espnet

[ESPnet speech processing toolkit](https://github.com/espnet/espnet)

ESPnet contributors · Source repository · Project

Use recipe manifests, stage boundaries and environment details to reproduce one component at a time.

Reviewed 2026-11-07.

## kyutai

[Moshi source implementation](https://github.com/kyutai-labs/moshi)

Kyutai · Source repository · Project

Trace a full-duplex speech model's codec and streaming loop. Verify model and implementation licenses and hardware separately.

Reviewed 2026-11-07.

## duplex

[Full-Duplex-Bench](https://arxiv.org/abs/2503.04721)

Lin and colleagues · 2025 · Benchmark paper

Study operational definitions of backchannels, interruption and pause handling before interpreting aggregate scores.

Reviewed 2026-11-07.

## overlap

[Full-Duplex-Bench v1.5](https://arxiv.org/abs/2507.23159)

Benchmark authors · 2025 · Benchmark paper

Uses controlled overlap scenarios to isolate conversational behaviors. Synthetic playback and a live listener can react differently.

Reviewed 2026-11-07.

## longmem

[LongMemEval](https://arxiv.org/abs/2410.10813)

Wu and colleagues · 2024 · Benchmark paper

Tests information extraction, temporal reasoning, knowledge updates and abstention across text histories. Audio provenance needs additional tests.

Reviewed 2026-11-07.

## vap

[Voice activity projection](https://arxiv.org/abs/2205.09812)

Ekstedt & Skantze · 2022 · Paper

Predicts future joint voice activity from conversational audio. A probability of future activity still needs a product action policy.

Reviewed 2026-11-07.

## voicebench

[VoiceBench](https://arxiv.org/abs/2410.17196)

Chen and colleagues · 2024 · Benchmark paper

Probe voice assistants across acoustic variation and tasks. Clip-driven tests cannot measure every interactive recovery behavior.

Reviewed 2026-11-07.

## hearing

[How do we hear?](https://www.nidcd.nih.gov/health/how-do-we-hear)

National Institute on Deafness and Other Communication Disorders · Educational guide · Technical guide

Follows vibration from the outer ear to cochlear hair cells and the auditory nerve. It explains the sensory pathway; it is not a speech-intelligibility benchmark.

Reviewed 2026-11-07.

## rt-webrtc

[Media Transport and Use of RTP in WebRTC · RFC 8834](https://www.rfc-editor.org/rfc/rfc8834.html)

C. Perkins, M. Westerlund & J. Ott · 2021 · Standard

Read sections 4 and 6 for protected media, receiver feedback and the deadline tradeoff in packet repair. Use measurements for the behavior of a particular implementation.

Reviewed 2026-11-07.

## rt-rtp

[RTP: A Transport Protocol for Real-Time Applications · RFC 3550](https://www.rfc-editor.org/rfc/rfc3550.html)

H. Schulzrinne and colleagues · 2003 · Standard

Section 6.4.1 defines interarrival jitter from differences in relative transit time. Interpret a timestamp in the payload's specified clock before converting it to a duration.

Reviewed 2026-11-07.

## rt-opusclock

[RTP Payload Format for the Opus Speech and Audio Codec · RFC 7587](https://www.rfc-editor.org/rfc/rfc7587.html)

J. Spittka, K. Vos & J.-M. Valin · 2015 · Standard

Look up the fixed 48 kHz RTP clock in section 4.1. Use it when estimating elapsed time from Opus timestamps, even with narrower-band capture.

Reviewed 2026-11-07.

## rt-websocket

[The WebSocket Protocol · RFC 6455](https://www.rfc-editor.org/rfc/rfc6455.html)

I. Fette & A. Melnikov · 2011 · Standard

Sections 1 and 5 separate the TCP transport from application messages and frames. The application defines audio format, timestamps, queue bounds and reconnect behavior.

Reviewed 2026-11-07.

## rt-sip

[SIP: Session Initiation Protocol · RFC 3261](https://www.rfc-editor.org/rfc/rfc3261.html)

J. Rosenberg and colleagues · 2002 · Standard

Follow the INVITE and dialog examples to separate call signaling from media delivery. A media path requires its own negotiation and verification.

Reviewed 2026-11-07.

## rt-audio

[WebRTC Audio Codec and Processing Requirements · RFC 7874](https://www.rfc-editor.org/rfc/rfc7874.html)

J.-M. Valin & C. Bran · 2016 · Standard

Read the echo-cancellation section before designing a speakerphone barge-in test. Its implementation guidance leaves room for different acoustic paths and devices.

Reviewed 2026-11-07.

## rt-stats

[Identifiers for WebRTC's Statistics API](https://www.w3.org/TR/webrtc-stats/)

W3C WebRTC Working Group · 2025 draft · Specification

The receiver-statistics definitions distinguish jitter-buffer delay, emitted samples and packet concealment. Compare interval deltas from the same stream. Browser field availability varies.

Reviewed 2026-11-07.

## rt-twilio

[Media Streams WebSocket messages](https://www.twilio.com/docs/voice/media-streams/websocket-messages)

Twilio · Living documentation · Product documentation

Check start, media, mark and clear in the bidirectional protocol. A clear flushes queued audio and can release pending marks, so a mark's meaning requires context. This is one gateway's contract.

Reviewed 2026-11-07.

## rt-stivers

[Universals and cultural variation in turn-taking in conversation](https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/)

Tanya Stivers and colleagues · 2009 · Paper

Examine the distribution and causes of response timing across ten languages in question–response sequences. Ground a latency discussion in observed variation while designing a separate interaction study for narration.

Reviewed 2026-11-07.

## rt-turngpt

[TurnGPT: A Transformer-based Language Model for Predicting Turn-taking in Spoken Dialog](https://aclanthology.org/2020.findings-emnlp.268/)

Erik Ekstedt & Gabriel Skantze · 2020 · Paper

Study how context, syntax and pragmatic completeness help a text model predict shifts. A word-based prediction leaves out cues carried by the audio.

Reviewed 2026-11-07.

## rt-vap

[How Much Does Prosody Help Turn-taking? Investigations using Voice Activity Projection Models](https://aclanthology.org/2022.sigdial-1.51/)

Erik Ekstedt & Gabriel Skantze · 2022 · Paper

Trace the future-activity training target and follow the signal-manipulation experiments. The hypotheses concern specific conversational recordings and models.

Reviewed 2026-11-07.

## rt-turnbench

[TurnBench: A Multi-Domain Benchmark for Turn-Taking Dynamics in Spoken Dialogue](https://turnbench.sesame.com/)

Freeman Jiang and colleagues · 2026 preprint · Benchmark

Compare false positives, recall and timing for end-of-turn and interruption events. The hand-annotated dual-channel studio speech gives timing references. Field conditions and user satisfaction need separate tests.

Reviewed 2026-11-07.

## rt-moshi

[Moshi: a speech-text foundation model for real-time dialogue](https://arxiv.org/abs/2410.00037)

Alexandre Défossez and colleagues · 2024 · Paper

Inspect the two audio streams and internally generated text. The architecture shows how overlap can be represented. Deployment timing depends on clocks, devices and serving load.

Reviewed 2026-11-07.

## rt-webaudio

[Web Audio API · output timestamps](https://www.w3.org/TR/webaudio-1.0/#dom-audiocontext-getoutputtimestamp)

W3C Audio Working Group · 2021 · Standard

The output timestamp associates the audio context's presented sample with a performance-clock estimate. It supports alignment and leaves device uncertainty and listener attention to the application.

Reviewed 2026-11-07.

## rt-epub

[EPUB 3.3 · media overlays](https://www.w3.org/TR/epub-33/#sec-media-overlays)

W3C Publishing Maintenance Working Group · 2026 · Standard

Follow the text and audio children of a parallel media-overlay element. This models the relationship between a source fragment and a timed rendition. Automatically generated alignment still needs verification.

Reviewed 2026-11-07.

## rt-annotation

[Web Annotation Data Model · text quote and position selectors](https://www.w3.org/TR/annotation-model/#text-quote-selector)

W3C Web Annotation Working Group · 2017 · Standard

Use exact quotes with prefix and suffix context to distinguish repeated passages. Combine them with document identity and version when restoring a bookmark after edits.

Reviewed 2026-11-07.

## rt-rag

[Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://proceedings.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html)

Patrick Lewis and colleagues · 2020 · Paper

Separate retrieval of external evidence from answer generation. The paper's open-domain task motivates evidence-aware design. It does not validate grounding in a user's specific book.

Reviewed 2026-11-07.

## rt-dpr

[Dense Passage Retrieval for Open-Domain Question Answering](https://aclanthology.org/2020.emnlp-main.550/)

Vladimir Karpukhin and colleagues · 2020 · Paper

Follow a question and passage through separate encoders into a dot-product score. Evaluate retrieval on paraphrases and rare names using your own passages.

Reviewed 2026-11-07.

## rt-context

[Lost in the Middle: How Language Models Use Long Contexts](https://aclanthology.org/2024.tacl-1.9/)

Nelson F. Liu and colleagues · 2024 · Paper

Inspect the experiments that vary the position of relevant evidence. Repeat them with the actual model, chunk order and type of question instead of extrapolating a headline result.

Reviewed 2026-11-07.

## rt-cite

[Enabling Large Language Models to Generate Text with Citations](https://aclanthology.org/2023.emnlp-main.398/)

Tianyu Gao, Howard Yen, Jiatong Yu & Danqi Chen · 2023 · Paper

Use the citation evaluation framework to separate whether supporting citations are present from whether the cited material entails the claim. Human review helps on nuanced book passages.

Reviewed 2026-11-07.

## rt-injection

[Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection](https://arxiv.org/abs/2302.12173)

Kai Greshake and colleagues · 2023 · Paper

Read the examples where external content tries to act as instructions. Build an attack fixture for an imported article or quoted command and enforce tool authorization outside generation.

Reviewed 2026-11-07.

## rt-provenance

[PROV-DM: The PROV Data Model](https://www.w3.org/TR/prov-dm/)

W3C Provenance Working Group · 2013 · Standard

Borrow the concepts of entities, derivations and invalidation when designing a memory record. The standard supplies vocabulary. Retention periods and deletion implementation remain application decisions.

Reviewed 2026-11-07.

## rt-longmem

[LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory](https://arxiv.org/abs/2410.10813)

Di Wu and colleagues · 2025 · Benchmark

Adapt its update, temporal reasoning and abstention questions to a listener's scoped preferences. Evaluate separate voice, consent and ownership failures.

Reviewed 2026-11-07.

## rt-locomo

[Evaluating Very Long-Term Conversational Memory of LLM Agents](https://aclanthology.org/2024.acl-long.747/)

Adyasha Maharana and colleagues · 2024 · Benchmark

Study long-session construction, question answering and multimodal evidence. Distinguish success on constructed conversations from success recovering a position during real playback.

Reviewed 2026-11-07.

## math-prob

[Probability and information theory](https://www.deeplearningbook.org/contents/prob.html)

Ian Goodfellow, Yoshua Bengio & Aaron Courville · 2016 · Textbook

A reference for conditional probability, information and cross-entropy. Work the fieldbook's small numerical examples before applying the notation to sequences.

Reviewed 2026-11-07.

## math-linear

[Linear algebra](https://www.deeplearningbook.org/contents/linear_algebra.html)

Ian Goodfellow, Yoshua Bengio & Aaron Courville · 2016 · Textbook

Defines vectors, matrix products and norms. Shapes can reveal a mistaken attention or adapter calculation before any weights are trained.

Reviewed 2026-11-07.

## augment

[SpecAugment](https://arxiv.org/abs/1904.08779)

Daniel S. Park and colleagues · 2019 · Paper

Masks regions in time and frequency on feature inputs. Verify that the perturbation preserves the label in your task and keep validation clean.

Reviewed 2026-11-07.

## whisper-api

[Whisper model API · Transformers 4.46.3](https://huggingface.co/docs/transformers/v4.46.3/en/model_doc/whisper)

Hugging Face contributors · Versioned API · Technical guide

The optional recipe targets this version's local model, processor, generation and training interfaces. Version pins do not establish that a particular hardware stack works.

Reviewed 2026-11-07.

## torch-random

[Reproducibility](https://docs.pytorch.org/docs/stable/notes/randomness.html)

PyTorch contributors · Living documentation · Technical guide

Seeds control selected random generators; algorithm choices, devices and library versions can still change numerical behavior.

Reviewed 2026-11-07.

## rs-king

[Simon King · professional profile](https://www.research.ed.ac.uk/en/persons/simon-king/)

University of Edinburgh · living · Profile

Start with King’s interest in speech perception, then follow the publications on how listeners evaluate synthesized speech. The profile records research activity and affiliations.

Reviewed 2026-11-07.

## rs-tmh

[Department for Speech, Music and Hearing](https://www.kth.se/tmh/)

KTH Royal Institute of Technology · living · Lab

Use the department’s speech communication research pages to trace questions about production, perception and interaction back to experiments.

Reviewed 2026-11-07.

## rs-cstr

[Research at the Centre for Speech Technology Research](https://www.cstr.ed.ac.uk/research/)

University of Edinburgh · living · Lab

The centre’s research archive connects acoustic measurements, synthesis and evaluation. Follow project dates and use the linked papers for specific results.

Reviewed 2026-11-07.

## rs-kyutai

[Kyutai · open-science AI lab](https://kyutai.org/)

Kyutai · living · Lab

Pair the lab’s speech demos with the papers and corresponding code. A short demo demonstrates behavior on one interaction.

Reviewed 2026-11-07.

## rs-prakash

[Generic Indic Text-to-Speech Synthesisers with Rapid Adaptation in an End-to-End Framework](https://www.isca-archive.org/interspeech_2020/prakash20_interspeech.html)

Anusha Prakash and Hema A. Murthy · 2020 · Paper

Examine the within-language-family transfer design and how the authors assessed adaptation to a target language. Keep speaker identity, language membership and data quantity separate in a replication.

Reviewed 2026-11-07.

## rs-effort

[Measuring the Cognitive Load of Synthetic Speech Using a Dual Task Paradigm](https://www.isca-archive.org/interspeech_2018/govender18b_interspeech.html)

Avashna Govender and Simon King · 2018 · Paper

Read the unexpected result involving natural speech before interpreting secondary-task reaction time as a pure measure of effort. The study compares several synthesizers with natural recordings.

Reviewed 2026-11-07.

## rs-espnet-paper

[ESPnet · End-to-End Speech Processing Toolkit](https://www.isca-archive.org/interspeech_2018/watanabe18_interspeech.html)

Shinji Watanabe and colleagues · 2018 · Paper

Trace the recipe from data preparation to scoring. Use a matching historical recipe before comparing the paper’s results with the evolving repository.

Reviewed 2026-11-07.

## rs-blizzard

[Data and tools related to the Blizzard Challenge](https://www.cstr.ed.ac.uk/projects/blizzard/)

Centre for Speech Technology Research · living · Benchmark

Find listening-test tools, results and audiobook datasets. Availability and reuse conditions differ by challenge year and corpus.

Reviewed 2026-11-07.

## rs-praat

[Praat · doing phonetics by computer](https://praat.org/)

Paul Boersma and David Weenink · living · Software

Use the manual and scripting tools to extract reproducible acoustic measurements. Report window and pitch settings when comparing speakers.

Reviewed 2026-11-07.

## rs-speechbrain

[Contributing to SpeechBrain](https://speechbrain.github.io/contributing.html)

SpeechBrain contributors · living · Software

The maintainers describe contribution types, runnable documentation and tests. A small reproducible example can be prepared locally under their conventions.

Reviewed 2026-11-07.

## rs-atypical

[Automatic Speech Recognition of Conversational Speech in Individuals with Disordered Speech](https://research.google/pubs/automatic-speech-recognition-of-conversational-speech-in-individuals-with-disordered-speech/)

Jimmy Tobin and colleagues · 2024 · Paper

Read the paired read/conversational comparison across 27 participants, including personalized models. The population and tasks limit transfer to a different user or device.

Reviewed 2026-11-07.

## rs-personal

[Personalized Automatic Speech Recognition Trained on Small Disordered Speech Datasets](https://research.google/pubs/personalized-automatic-speech-recognition-trained-on-small-disordered-speech-datasets/)

Jimmy Tobin and Katrin Tomanek · 2022 · Paper

Study the relationship between per-speaker data quantity and success criteria. The authors evaluate selected scenarios and report substantial variation across speakers.

Reviewed 2026-11-07.

## sp-hi-words

[Hindi word list · New Delhi](https://archive.phonetics.ucla.edu/Language/HIN/hin_word-list_1974_01.html)

UCLA Phonetics Lab Archive · 1974 · Recording index

Compare entries 3–6 and 23–24 to hear aspiration and place contrasts. A single speaker's word list illustrates a distinction; it cannot estimate population performance.

Reviewed 2026-11-07.

## sp-prosody

[Tone and intonation](https://ecampusontario.pressbooks.pub/essentialsoflinguistics2/chapter/3-12-tone-and-intonation/)

Essentials of Linguistics, 2nd ed. · Open textbook · Textbook

Distinguish pitch patterns that differentiate words from patterns that convey meaning across phrases. Intonation conventions vary.

Reviewed 2026-11-07.

## sp-mucs

[MUCS 2021 · multilingual and code-switching ASR challenges](https://www.isca-archive.org/interspeech_2021/diwan21_interspeech.html)

Diwan and colleagues · 2021 · Benchmark paper

Includes separate multilingual and Hindi–English/Bengali–English code-switching tasks. Inspect the data and scoring policy before comparing systems.

Reviewed 2026-11-07.

## sp-hmm

[A tutorial on hidden Markov models and selected applications in speech recognition](https://www.fceia.unr.edu.ar/prodivoz/Rabiner_1989.pdf)

Lawrence R. Rabiner · 1989 · Paper

Compare the forward sum, Viterbi maximum and parameter estimation. The factorization helps explain how pronunciation dictionaries and language models remained independently editable.

Reviewed 2026-11-07.

## sp-stream

[Turning Whisper into real-time transcription system](https://arxiv.org/abs/2307.14743)

Macháček, Dabre & Bojar · 2023 · Paper

Read the local-agreement update and audio-buffer policy. Latency depends on the utterance, hardware and benchmark conditions.

Reviewed 2026-11-07.

## sp-join

[Optimising selection of units from speech databases for concatenative synthesis](https://www.isca-archive.org/eurospeech_1995/black95b_eurospeech.html)

Black & Campbell · 1995 · Paper

Connect unit selection to competing target and splice costs. The approach needs recorded units that cover the requested context.

Reviewed 2026-11-07.

## sp-parametric

[Speech parameter generation algorithm considering global variance for HMM-based speech synthesis](https://www.isca-archive.org/interspeech_2005/toda05b_interspeech.html)

Toda & Tokuda · 2005 · Paper

Use the authors' trajectory example to understand how smoothing can reduce variation and muffle speech.

Reviewed 2026-11-07.

## sp-fastspeech

[FastSpeech 2](https://arxiv.org/abs/2006.04558)

Ren and colleagues · 2020 · Paper

Trace pitch, energy and duration through a variance adaptor. Editable intermediate values need calibration against listening outcomes.

Reviewed 2026-11-07.

## sp-diffwave

[DiffWave](https://arxiv.org/abs/2009.09761)

Kong and colleagues · 2020 · Paper

A concrete waveform diffusion model that uses a sequence of denoising steps. Inspect the conditioning and step count when comparing latency.

Reviewed 2026-11-07.

## sp-cloning

[Transfer learning from speaker verification to multispeaker text-to-speech synthesis](https://arxiv.org/abs/1806.04558)

Jia and colleagues · 2018 · Paper

Separates speaker encoder, synthesizer and vocoder. The example distinguishes conditioning on an embedding from training a new voice.

Reviewed 2026-11-07.

## sp-audiolm

[AudioLM](https://arxiv.org/abs/2209.03143)

Borsos and colleagues · 2022 · Paper

Studies semantic and acoustic tokens with different time scales. Audio continuation differs from grounded question answering.

Reviewed 2026-11-07.

## sp-reader-announce

[Our best, most affordable ElevenReader yet](https://elevenreader.io/blog/best-pricing-more-value)

ElevenReader · 2026 · Product claim

Confirms the monthly versus annual billing amounts and the free allowance. Use the current pricing page for entitlements.

Reviewed 2026-11-07.

## sp-piper-cli

[Piper command-line interface](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md)

Open Home Foundation Voice · Project documentation · Technical guide

Verify the exact voice-download and WAV-render commands. The CLI loads the voice each run, so benchmark cold and warm configurations separately.

Reviewed 2026-11-07.

## sp-specaug

[SpecAugment](https://arxiv.org/abs/1904.08779)

Park and colleagues · 2019 · Paper

Time and frequency masks perturb training features without a new transcript. Evaluate masking settings against real target speech.

Reviewed 2026-11-07.

## sp-whisper-doc

[Whisper model and generation API · Transformers 4.46.3](https://huggingface.co/docs/transformers/v4.46.3/en/model_doc/whisper)

Hugging Face · Versioned documentation · Technical guide

Version-specific reference for language/task prompts, feature masks and conditional generation in the optional example.

Reviewed 2026-11-07.

## sp-tiny-card

[Whisper tiny · multilingual model card](https://huggingface.co/openai/whisper-tiny)

OpenAI model repository · Model card · Model card

Use the multilingual tiny checkpoint for a resource-bounded illustration. Check the limitations and preserve its exact local snapshot hash.

Reviewed 2026-11-07.

## sy-sctk

[SCLITE scoring documentation](https://github.com/usnistgov/SCTK/blob/master/doc/sclite.htm)

NIST Speech Group · living · Software

Inspect reference–hypothesis alignment and counts of substitutions, deletions and insertions. Record the scoring and normalization configuration alongside a reported WER.

Reviewed 2026-11-07.

## sy-p808

[P.808 · Subjective evaluation of speech quality with a crowdsourcing approach](https://www.itu.int/rec/T-REC-P.808/en)

ITU-T · 2021 · Standard

Use its listening-test design, listener qualification and environment controls to structure a study. Its speech-quality task has a different construct from literary performance or speaker consent.

Reviewed 2026-11-07.

## sy-disparities

[Racial disparities in automated speech recognition](https://www.pnas.org/doi/10.1073/pnas.1915768117)

Allison Koenecke and colleagues · 2020 · Paper

The authors audited commercial recognition on US sociolinguistic interviews. Read cohort construction before interpreting disparities or extrapolating to other languages and communities.

Reviewed 2026-11-07.

## sy-indicfdb

[IndicFDB · Benchmarking Full-Duplex Voice Agents across Indian Languages](https://arxiv.org/abs/2609.31967)

Rajarshi Roy and colleagues · 2026 · Preprint

Study the ten-language benchmark’s conversational event construction, synthetic interruptions, timing heuristics and translation-based judging. Translation and the selected conversations bound the conclusions.

Reviewed 2026-11-07.

## sy-stats

[The Hitchhiker’s Guide to Testing Statistical Significance in Natural Language Processing](https://aclanthology.org/P18-1128/)

Rotem Dror, Gili Baumer, Segev Shlomov and Roi Reichart · 2018 · Paper

Work through the conditions each significance test assumes. Use the paper to motivate an explicit sampling unit and metric when comparing systems on the same data.

Reviewed 2026-11-07.

## sy-judge

[Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685)

Lianmin Zheng and colleagues · 2023 · Paper

Inspect position and verbosity biases and where model judges agreed with humans on text tasks. A speech rubric needs fresh validation with people who heard the audio.

Reviewed 2026-11-07.

## sy-voicebench

[VoiceBench · Benchmarking LLM-Based Voice Assistants](https://arxiv.org/abs/2410.17196)

Yiming Chen and colleagues · 2024 · Paper

Read how controlled speaker, acoustic and content variations probe voice assistants. Its trials can motivate test fixtures, though an interactive listener may change behavior in response to the system.

Reviewed 2026-11-07.

## sy-duplex

[Full-Duplex-Bench · A Benchmark to Evaluate Full-Duplex Spoken Dialogue Models on Turn-taking Capabilities](https://arxiv.org/abs/2503.04721)

Guan-Ting Lin and colleagues · 2025 · Paper

The paper separates pause handling, backchannels, turn transitions and interruption. Use these event families to label replay cases and compare those results with a live conversation.

Reviewed 2026-11-07.

## sy-trace

[Traces](https://opentelemetry.io/docs/concepts/signals/traces/)

OpenTelemetry · living · Documentation

Read the span and parent–child model before designing a voice trace. A boundary such as audio reaching a listener’s ear still requires its own instrumentation.

Reviewed 2026-11-07.

## sy-canary

[Canarying Releases](https://sre.google/workbook/canarying-releases/)

Google Site Reliability Workbook · 2018 · Book chapter

Use its control-versus-canary method, exposure window and attribution discussion to design a rollback gate. Choose listener-facing indicators for speech workloads.

Reviewed 2026-11-07.

## sy-monitor

[Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

Rob Ewaschuk · Google SRE Book · 2016 · Book chapter

Use latency, traffic, errors and saturation to structure a dashboard. Complement service metrics with playback, stale-audio and resume outcomes.

Reviewed 2026-11-07.

## sy-orca

[Orca · A Distributed Serving System for Transformer-Based Generative Models](https://www.usenix.org/conference/osdi22/presentation/yu)

Gyeong-In Yu and colleagues · 2022 · Paper

Follow insertion and removal of sequences at generation iterations. Its comparisons are specific to the tested model, hardware and workload.

Reviewed 2026-11-07.

## sy-paged

[Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)

Woosuk Kwon and colleagues · 2023 · Paper

Trace how KV blocks reduce fragmentation under variable sequence lengths. The paper evaluates autoregressive language-model serving.

Reviewed 2026-11-07.

## sy-flash

[FlashAttention · Fast and Memory-Efficient Exact Attention with IO-Awareness](https://papers.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html)

Tri Dao and colleagues · 2022 · Paper

Its tiled computation illustrates the cost of moving data between GPU memory levels. Gains depend on workload shape and memory hierarchy.

Reviewed 2026-11-07.

## sy-triton

[Batchers · Triton Inference Server](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html)

NVIDIA · living · Documentation

Inspect dynamic queue delays and the sequence batcher for ordered, stateful requests. Trace the full client queue as well as the scheduler.

Reviewed 2026-11-07.

## sy-smooth

[SmoothQuant · Accurate and Efficient Post-Training Quantization for Large Language Models](https://arxiv.org/abs/2211.10438)

Guangxuan Xiao and colleagues · 2022 · Paper

Track how rescaling addresses activation outliers for W8A8 transformer inference. Validate an ASR encoder or vocoder separately before borrowing that conclusion.

Reviewed 2026-11-07.

## sy-whisper

[whisper.cpp](https://github.com/ggml-org/whisper.cpp)

ggml-org contributors · living · Software

See supported CPU and accelerator backends, quantized weights and the sample-file CLI. Benchmark a specific revision and model on the target device.

Reviewed 2026-11-07.

## sy-capture

[Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)

W3C WebRTC Working Group · living · Standard

Consult device-privacy indicators, capture permissions and track termination for a browser product. The specification concerns media access while a product also needs its own recording and retention state.

Reviewed 2026-11-07.

## sy-gdpr

[Regulation (EU) 2016/679 · General Data Protection Regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32016R0679)

European Parliament and Council · 2016 · Legislation

Read Articles 4, 5, 9 and 17 for biometric identification, storage limitation, conditions and erasure exceptions. Determine applicability for the actual actors, jurisdictions and purposes.

Reviewed 2026-11-07.

## sy-nist

[Digital Identity Guidelines · Authentication and Authenticator Management (SP 800-63B-4)](https://pages.nist.gov/800-63-4/sp800-63b.html)

NIST · 2025 · Standard

Read §3.2.3 on biometric comparisons, presentation attacks and the voice restriction in this guideline. It addresses authentication assurance within its scope.

Reviewed 2026-11-07.

## sy-spoof

[ASVspoof 5 evaluation plan · phase 2](https://www.asvspoof.org/file/ASVspoof5___Evaluation_Plan_Phase2.pdf)

ASVspoof organizers · 2024 · Benchmark

Examine the spoofing and spoofing-aware verification tasks, operating costs and evaluation protocol. Re-evaluate against new generators and replay channels.

Reviewed 2026-11-07.

## sy-injection

[LLM01:2025 · Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

OWASP GenAI Security Project · 2025 · Guidance

Study indirect instructions in retrieved or multimodal content. Use the threat model to define independent authorization at each tool boundary.

Reviewed 2026-11-07.

## sy-slsa

[SLSA v1.2 · Provenance](https://slsa.dev/spec/v1.2/provenance)

OpenSSF SLSA contributors · v1.2 · Specification

Use build and artifact identity to reconstruct which inputs produced a release. A provenance statement still requires verification against a trusted builder.

Reviewed 2026-11-07.
