{"id":"acoustics","title":"A wave in the room","part":"Sound & signal","level":"Foundation","minutes":22,"question":"Why can the same sentence be perfectly audible and still hard to understand?","goals":["Translate a pressure trace into frequency, phase and level.","Predict what a reflection does to a harmonic.","Separate a level problem from a speech-intelligibility problem."],"prereqs":[],"related":["capture","spectrum","articulation"],"labs":["sampling","spectrum"],"summary":"Follow a spoken vowel through air, reflections and the ear before a single sample reaches a model.","sources":["phys","superposition","hearing","convolution"]}

Imagine reading one sentence from a book in a carpeted bedroom. Now read it at the same level in a tiled stairwell. A meter can show equal average levels while a listener struggles with the second sentence. The microphone receives pressure at one point in space. It cannot attach labels saying which part came straight from your mouth and which bounced off the wall.

## What travels

Air molecules oscillate around their local positions. A pattern of compression and rarefaction travels down the room. At a fixed point a simple model is `p(t) = A sin(2πft + φ)`. Here p is the change in air pressure in pascals (Pa), A is peak pressure in Pa, t is time in seconds, f is cycles per second (Hz) and φ is the starting angle in radians. One cycle advances the angle by 2π. At 200 Hz the period is 1/200 s, or 5 ms. In air at roughly 20 °C, using a sound speed of 343 m/s, its wavelength is 343/200 ≈ 1.72 m. Wavelength measures a distance along the room. Period measures a duration at the microphone.

A periodic voiced sound contains energy near multiples of a fundamental frequency. If vocal-fold vibration repeats around 125 times per second, harmonics occur near 125, 250, 375 Hz and so on. Their relative strengths help determine the tone quality. Whispering and fricatives such as the first sound in “ship” can carry information through aperiodic noise. Finding a pitch everywhere in speech would manufacture a periodicity in some frames.

## What a second path changes

In a small-signal approximation pressures add. Imagine two equal copies of a 500 Hz sine arriving 1 ms apart. The delay is half its 2 ms period. A crest of one meets a trough of the other. Their sum vanishes in this ideal example. At 1 kHz the same delay is a whole period, so crests coincide and peak pressure doubles. One fixed delay therefore selects frequencies. Move a microphone by a fraction of a wavelength and the balance changes. Real reflections have lower amplitudes, frequency-dependent absorption and many delays, so a perfect null is unusual. [Superposition and interference](#source/superposition)

Write the two-path model as `y(t) = x(t) + 0.5 x(t − τ)`, with τ in seconds. The room's impulse response contains a direct arrival of amplitude 1 and a later arrival of amplitude 0.5. Convolution adds such scaled, shifted copies for every arrival. A separated strong return may be perceived as an echo. Many closely spaced returns produce reverberation, which can spread a loud vowel into the interval occupied by a weak consonant. RT60 describes the time for a 60 dB decay under a specified measurement condition. Two rooms with similar RT60 can differ in early reflections and intelligibility. [Impulse responses](#source/convolution)

## What a level meter means

An oscillating signed pressure averages toward zero. Square it before averaging, then take the square root to obtain RMS pressure. A sine with peak 0.0283 Pa has RMS ≈ 0.0200 Pa. Sound-pressure level in air is `20 log10(p_rms / 20 µPa)` dB SPL. The ratio here is 1,000, so the level is 60 dB SPL. Doubling pressure adds about 6 dB. For intensity or power ratios use 10 log10 instead, because power is proportional to pressure squared under the same propagation conditions. A digital value such as −18 dBFS refers to a converter's full scale. Converting it to Pa needs a calibration. [Levels and their references](#source/phys)

The outer and middle ear transfer vibration to fluid in the cochlea. Different regions respond preferentially to different frequencies. Hair cells transduce motion into neural activity. Loudness depends on frequency, level and duration. Two signals with the same RMS pressure need not sound equally loud. A masker in the same band and time interval can obscure a cue even when total speech power exceeds noise power. [The auditory pathway](#source/hearing)

## A useful diagnostic

For uncorrelated signal and noise measured over the same bandwidth and time, `SNR = 10 log10(Pspeech / Pnoise)`. Speech RMS of 0.10 and noise RMS of 0.01 in the same units give 20 dB. Raise digital gain by two and both RMS values double. SNR stays at 20 dB until clipping or another noise source enters. Moving closer to the talker can improve the direct-to-reverberant ratio before conversion. A denoiser may remove the very consonant the recognizer needs. Compare specific words and time spans, as well as level.

## Try it

Open the [sampling bench](#lab/sampling) at 500 Hz. Find the time from one positive crest to the next and predict how many fit in 6 ms. You should find three cycles. On paper add a half-strength copy delayed by 1 ms. At 500 Hz the resulting amplitude is half the original. At 1 kHz it is 1.5 times the original. Compare with the actual single-tone trace in the bench, which omits the room. The difference is a prediction of the two-path model.

## Check your reasoning

**A recording sounds muddy. Would a gain boost restore the consonants?** Multiplying the mixed waveform scales the late vowel energy too. Inspect the timing of decay and recapture closer to the mouth to see whether the consonant emerges.

**Two independent equal-power noise sources start together. Does the meter rise by 6 dB?** Their average powers add, giving approximately 3 dB. Two coherent, perfectly aligned equal pressures double amplitude and can give 6 dB. The relationship between the signals decides which arithmetic applies.
