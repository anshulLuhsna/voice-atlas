{"id":"sampling","title":"What sampling forgets","part":"Sound & signal","level":"Foundation","minutes":24,"question":"Why can a 5.5 kHz tone turn into a 2.5 kHz tone without changing any samples?","goals":["Compute a folded frequency and explain why ambiguity arises.","Estimate storage and quantization step from a PCM format.","Design a resampling boundary that preserves time."],"prereqs":["acoustics","capture"],"related":["spectrum","codecs","transport"],"labs":["sampling"],"summary":"Separate samples in time from levels in amplitude, then watch two different tones produce the same observations.","sources":["sampling-guide"]}

A recorder writes one signed number for each channel at each tick of its sample clock. At 8,000 ticks per second, ticks arrive every 125 µs. Between ticks the recorder stores nothing. A reconstruction rule and assumptions about the input are what let you draw a continuous curve through those numbers. Aliasing occurs when different input frequencies become indistinguishable on that grid.

## Two different waves, one sequence

Sampling a sinusoid gives `x[n] = sin(2π f n / Fs + φ)`. The integer n counts samples. Replace f by f + kFs for any integer k. The extra phase is 2πkn, a whole number of turns at every sample, so the sequence is identical. For a real cosine with zero starting phase, f and Fs − f also agree. A real sine can fold with a phase or sign change. The ambiguity exists in the data even if your plot connects the dots neatly. [Sampling and reconstruction](#source/sampling-guide)

With Fs = 8 kHz and f = 5.5 kHz, the apparent frequency is |5.5 − 8| = 2.5 kHz. Folding into [0, Fs/2] gives the magnitude of the alias. The sampling theorem assumes a band-limited signal and sufficient sampling frequency for its band. At exactly Fs/2 a sine sampled at zero crossings can vanish entirely. In practice leave a transition band below the Nyquist frequency for a realizable anti-alias filter. Remove out-of-band energy *before* the sampling operation that would fold it. A filter afterward sees a perfectly plausible 2.5 kHz component.

## Bit depth controls another error

Time discretization chooses *when*. Quantization chooses *which amplitude*. For a uniform B-bit quantizer spanning range R, step size is about `Δ = R / 2ᴮ`. With round-to-nearest inside the supported range, absolute error is at most Δ/2. An ideal uniform 16-bit signed PCM format normalized to a range of width 2 has Δ = 1/32768. An overloaded sample violates the in-range assumption. Truncation or a quiet periodic input may correlate quantization error with the signal, producing distortion. Dither adds controlled noise to decorrelate that error. It trades a small noise floor for less signal-dependent distortion. [Quantization](#source/sampling-guide)

A frame contains a simultaneous sample for each channel. At 16 kHz mono, 16-bit PCM, one minute occupies 16,000 × 1 × 2 × 60 = 1,920,000 bytes before headers. At 48 kHz stereo and 24 bits packed, it is 17,280,000 bytes per minute. A WAV container can describe different encodings. A raw buffer needs an agreed rate, sample representation, byte order and channel layout. Interpreting little-endian PCM as big-endian creates noise even if all bytes arrive.

## Downsampling is a filtering operation

To convert 48 kHz to 16 kHz, first low-pass the 48 kHz signal for the *destination* bandwidth. Then take every third sample. A 10 kHz tone would otherwise fold to 6 kHz. To upsample, reconstruct or interpolate a band-limited waveform and evaluate it at the new instants. New samples cannot restore information removed at capture. Averaging stereo channels can cancel speech when their polarities are opposed. Inspect individual channels before choosing a mono mix.

In a live pipeline, keep filter history and fractional phase across chunk boundaries. Resetting a resampler every 20 ms can introduce clicks and drift when the rates have a non-integer ratio. A 10 ms callback at 48 kHz carries 480 frames per channel. The same duration at 16 kHz carries 160. Reinterpreting 480 numbers as 16 kHz without conversion stretches 10 ms to 30 ms and lowers pitch. Track samples and rates together all the way to playback.

## Try it

Open the [sampling explorer](#lab/sampling). Keep Fs at 8 kHz and choose 2,500 Hz, then 5,500 Hz. The bench uses a cosine so the sample dots match in both cases. The high-frequency continuous trace oscillates faster between dots. Play the folded tone at low volume using the explicit playback button. Its pitch follows the folded samples. Next change the sample rate to 16 kHz. The 5,500 Hz tone lies below Nyquist and the indicated folded frequency becomes 5,500 Hz. Predict all three readouts before looking.

## Check your reasoning

**Will saving an 8 kHz capture as 48 kHz repair the fold?** The original sequence is consistent with multiple continuous signals. Upsampling chooses one reconstruction and cannot identify which input produced it.

**Why would a model reject a “16-bit WAV”?** Bit depth alone leaves the sample rate, channel count and encoding unspecified. Inspect the header and actual frame count, then transform to the model's documented input format.
