{"id":"narration-design","title":"Designing a better reader","part":"Deep dives","level":"Intermediate","minutes":28,"question":"What would make a dramatized reader worth choosing when a listener already has inexpensive text-to-speech?","goals":["Compare a consumer listening plan, a metered API and local synthesis on comparable units","Represent narration as source-grounded performance directions","Design a listening trial that tests comprehension, interruption and cost"],"prereqs":["synthesis","codecs"],"related":["interruption","grounding","evaluation","inference"],"labs":["interruption","latency"],"summary":"Use ElevenReader, Piper and Kokoro as concrete baselines for a Murmur listening experiment.","sources":["reader-price","sp-reader-announce","api-price","piper","sp-piper-cli","kokoro","sp-fastspeech"]}

A listener imports a long article, changes speed, sets a bookmark and later taps play. Which of those steps should Murmur improve? A useful comparison begins with a task that can fail: while cooking, the listener hears an unfamiliar claim, asks what evidence the author gives, then returns to the exact clause. Completion time, source accuracy and the number of repeated or missed words make this a testable product question.

## Establish the baseline

On 7 November 2026, ElevenReader's English-language pricing page displayed a free plan with **10 hours of text-to-audio per month**, web/mobile sync, bookmarks, a sleep timer and up to 4× speed. Ultra listed **US$11 monthly** or **US$99 annually**, equivalent to $8.25 per month when billed annually. The page described smart import cleanup, offline downloads and a fair-use cap of up to 24 hours of import generation per calendar day at normal speed. It separately listed 150 hours per month and 20 hours per day for offline downloads. These are advertised entitlements. Check the purchase screen for storefront, taxes, promotions and changes. We have not run a head-to-head listening study. [ElevenReader plans and FAQ](#source/reader-price) · [Vendor's monthly and annual pricing announcement](#source/sp-reader-announce)

An individual reading subscription covers its consumer experience. To generate audio inside your own service, price the intended API, model, text unit, regeneration and distribution permissions separately. ElevenLabs' pricing page distinguishes free credits and paid tiers. A consumer listening hour cannot be converted to API capacity without the API's billing terms and actual text distribution. For instance, expanding abbreviations can lengthen speech while consuming few original characters. A paid API can be appropriate for occasional generation even where sustained local generation is cheaper per completed passage. [ElevenLabs API and creator pricing](#source/api-price)

## Local baselines and their real costs

Piper supplies a local synthesis engine with downloadable voice models; review each voice's license and language. The CLI can save a WAV file, control inter-sentence pauses and accept phoneme overrides. A fresh process loads the voice on each invocation, so a cold single-sentence run and a warm persistent worker answer different performance questions. Kokoro's model card describes 82 million parameters, downloadable voices and Apache-licensed model weights. Pronunciation, language coverage, voices, front-end dependencies and the rights attached to inputs still need inspection for your deployment. Neither library supplies bookmarks, a question policy, reading-order extraction or a verified heard-position ledger. [Piper project](#source/piper) · [Piper CLI](#source/sp-piper-cli) · [Kokoro model card](#source/kokoro)

An optional real-engine exercise uses an isolated Python environment with network access for the initial package and voice download. Select a voice whose license fits the intended use. For the upstream example voice, the documented commands include:

```sh
python -m pip install piper-tts
python -m piper.download_voices en_US-lessac-medium
python -m piper -m en_US-lessac-medium -f passage.wav -- 'She put the letter down.'
```

The audio file's transcript is “She put the letter down.” Record the installed package version, voice-file hash, device, clip duration and elapsed wall time. Compare a second run on the same configuration. The textbook and its simulations work without this optional download. [Upstream CLI instructions](#source/sp-piper-cli)

Use real-time factor `RTF = render seconds / audio seconds`. Suppose your *measured* RTF later turns out to be 0.5. Producing 10 hours of unique audio then takes 5 render-hours. Under hypothetical incremental draw of 12 W and an illustrative energy price of $0.20/kWh, that is `5 h × 0.012 kW × $0.20/kWh = $0.012` of incremental electricity. These are example inputs, not a measurement or hardware quote. Device purchase, maintenance, thermal throttling, background idle time, storage, bandwidth and failed generations can dominate electricity. A household device with spare capacity has a different marginal cost from an always-on hosted worker. Divide costs by hours *heard* as well as hours *generated* to expose waste when listeners abandon chapters.

## Direct the performance

Keep original source text, immutable span IDs and the narration script separate. For “Mira looked up. ‘Again?’ she said,” assign the description and attribution to the narrator. Assign only the quoted token to Mira, give it a questioning contour and a short preceding pause. Store the intent, character ID, pronunciation overrides and revision alongside the span. The renderer may approximate direction with a duration or pitch control, an appropriate reference style or just explicit pauses. A new voice alone cannot determine which “she” is speaking. If attribution is ambiguous, use the narrator and retain the words. Review multi-paragraph transitions with the same character, and version the script so a regenerated take invalidates its old timing map. [Examples of acoustic control variables](#source/sp-fastspeech)

For a question, freeze the last presented source boundary, cancel unplayed audio and map “that claim” to what the listener actually heard. Cite the original passage and announce when an explanation is your interpretation. On return use a conservative clause boundary and offer a short contextual replay. Tune that replay length with listeners. A one-word repeat can preserve the argument more effectively than an exact mid-phoneme restart. [Try the interruption simulation](#lab/interruption)

## Exercise · define “better” before listening

Choose six licensed or original passages containing a quote, a name, a number, an ambiguous speaker reference, a footnote and a cross-paragraph interruption. Compare a fixed local narrator with a directed rendering, holding text, loudness and playback rate constant. Counterbalance order, conceal the engine names and ask each listener to identify the speaker, answer one source-grounded question and resume. Record repeated/missed words, attribution errors, preference, first-audible delay and hours actually heard. A predicted benefit is fewer attribution or resume errors. If listeners prefer the baseline, dislike role changes or answer just as accurately with bookmarks, narrow or reject the dramatization hypothesis. A small pilot reveals failures; add people and passages before claiming an advantage.

## Check your reasoning

**Does downloading an offline book imply synthesis ran on the phone?** Offline playback establishes only that audio is available locally at listening time. A service can generate it on a server and then download it.

**When can caching make narration worse?** If a corrected pronunciation or speaker map reuses an old cached take, the text and audio diverge. Key the cache by source revision, script, engine and voice versions, then regenerate timing information for changed segments.
