{"id":"spectrum","title":"Reading a spectrogram","part":"Sound & signal","level":"Intermediate","minutes":28,"question":"Why does a clearer view of two pitches make a consonant look less precisely timed?","goals":["Interpret the axes and color scale of an STFT.","Predict how window length changes frequency and time detail.","Trace power through a mel filterbank and identify what it discards."],"prereqs":["sampling"],"related":["articulation","recognition","synthesis"],"labs":["spectrum"],"summary":"Decompose a short signal into weighted sinusoids and measure what changes as the analysis window grows.","sources":["convolution","fourier","praat","mel"]}

A waveform makes it easy to locate a plosive onset and hard to read its frequency content. A single spectrum makes it easy to locate a sustained tone and hard to say *when* it occurred. Speech changes within a syllable. A spectrogram repeats a spectral measurement on overlapping excerpts and lays those measurements side by side.

## From projection to bins

A sine at one frequency is a measuring template. Multiply the signal by that template and sum over a finite interval. Matching oscillations accumulate, while mismatches tend to cancel. A second template, shifted by a quarter cycle, captures a component at a different phase. The discrete Fourier transform packs those two projections into one complex number per bin. An FFT is a faster algorithm for computing the same transform. For N samples at rate Fs, bin k corresponds to kFs/N Hz. A real-valued signal has conjugate-symmetric bins, so a plot commonly shows only frequencies through Nyquist. [Discrete Fourier transform](#source/fourier)

A bin is not a tiny perfect filter. If a tone falls between bin centers, cutting off the frame spreads its energy across neighboring bins. A window weights the ends of the frame toward zero. A Hann window reduces leakage away from the tone in exchange for a broader main lobe. Increasing the FFT length by padding zeros gives more samples of the same windowed spectrum. It cannot separate two unresolved tones. The actual observation time matters. [Window length and bandwidth](#source/praat)

## Put time back into the picture

For frame m, multiply samples starting at mH by a window w of length N. H is the hop in samples. Compute a DFT and record `|X[m,k]|²`. Overlapping windows create columns separated by H/Fs seconds. At 8 kHz, N = 256 and H = 64 give 32 ms of support, bins 31.25 Hz apart and columns 8 ms apart. Changing H alone samples the changing spectrum more densely but leaves each column supported by the same 32 ms. Choose whether timestamps mean frame start or center. A centered analysis can use future audio and silently introduce lookahead in a streaming model.

Color often represents `10 log10(power/reference)` with a floor. A per-image maximum as reference shows within-image differences, but prevents reliable loudness comparisons across two independently normalized images. An almost-silent noise recording can appear bright. Always inspect the scale. Magnitudes omit phase. Multiple waveforms can share similar magnitude patterns.

## From filters to features

A linear filter combines delayed input samples. For example `y[n] = (x[n] + x[n−1])/2` passes a constant input unchanged but cancels a perfectly alternating sequence. Its impulse response is two half-weight taps. Longer designs shape the response more precisely, sometimes adding delay. Designing the waveform anti-alias filter and computing a feature filterbank are different operations. [Convolution mechanics](#source/convolution)

A mel filterbank groups spectral power into overlapping frequency bands, more densely placed at lower frequencies under common conventions. Each band is a weighted sum across bins. A log compresses the resulting dynamic range. This trades detailed high-frequency structure for fewer features. Two configurations can both say “80 mel bands” and disagree on sample rate, bounds, window, normalization, log floor or mel formula. Save all parameters with a model and compare one known input feature array before debugging recognition. [Mel spectrogram parameters](#source/mel)

## Try it

In the [spectrogram bench](#lab/spectrum), select the close tone pair. Compare 64-sample and 512-sample windows at 8 kHz. Bin spacing changes from 125 Hz to 15.625 Hz. The longer window resolves the two nearby ridges better, but the abrupt onset extends across more frame centers. Then select the sweep. Describe its rising ridge and compare its thickness. The lab computes the windowed spectrum of a constructed waveform, so you can change one parameter and obtain the same result every time.

## Check your reasoning

**Can an 8 ms hop guarantee the time of an event to 8 ms?** Adjacent estimates may share most of their samples. An event contributes to every window that includes it. Threshold and window shape affect the apparent boundary.

**Why can a vocoder use a mel spectrogram if phase is absent?** A learned generator uses regularities of speech to synthesize a plausible waveform conditional on that representation. Many possible waveforms fit it. Reconstruction quality must be assessed by listening as well as inspecting a plot.
