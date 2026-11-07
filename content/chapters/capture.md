{"id":"capture","title":"From diaphragm to samples","part":"Sound & signal","level":"Foundation","minutes":20,"question":"Where in the capture chain did the distortion enter?","goals":["Trace pressure through a transducer, gain stage and converter.","Use sensitivity to predict a voltage.","Distinguish room noise, self-noise and overload."],"prereqs":["acoustics"],"related":["sampling","transport","streaming-asr"],"labs":["sampling"],"summary":"Read a microphone specification as a chain of physical conversions and locate the first irreversible overload.","sources":["mic","mems","sampling-guide"]}

A listener interrupts a narration with the word “pause.” On headphones the initial burst rattles, though the saved file peaks at only −9 dBFS. A level meter at the end can hide an overload further upstream. Follow one burst from air to samples to see how.

## Three ways to build the front end

A moving-coil dynamic microphone suspends a diaphragm attached to a coil in a magnetic field. Pressure moves the assembly. Motion induces a voltage. A condenser uses a diaphragm and backplate as a variable capacitor. Motion changes capacitance, and a powered circuit converts that tiny change to a usable output. Implementations differ in how the capsule is polarized and the electronics are powered. Treat “needs phantom power” as a property to check on the particular device. [Microphone operating principles](#source/mic)

MEMS describes fabrication on a chip. A common capacitive MEMS microphone also uses a moving membrane and backplate, paired with an integrated circuit. An analog-output part supplies a conditioned voltage. A digital part can include conversion and produce a pulse-density stream. A decimation filter converts that high-rate stream to lower-rate PCM values. A phone presenting 48 kHz PCM may already have beamforming, gain control or noise suppression in its path. The application sees a processed signal unless capture settings and the actual device establish otherwise. [MEMS signal paths](#source/mems)

## Work through one voltage budget

Suppose a microphone has sensitivity 10 mV/Pa at 1 kHz. A calibration tone at 1 Pa RMS produces 10 mV RMS under the specified load. A preamp gain of 40 dB means voltage gain `10^(40/20) = 100`, giving 1 V RMS. Suppose the ADC full-scale sine is 2 V RMS. The tone is at 20 log10(1/2) ≈ −6 dBFS on a full-scale-sine reference. A fourfold pressure peak relative to this sine's peak exceeds the available margin. Speech has transient peaks. Average level alone cannot set a safe gain.

The physical path is **pressure → diaphragm → electrical signal → preamp → analog anti-alias filter → ADC → PCM frames**. A digital microphone moves some of those boundaries inside the capsule. The preamp adds its own noise. The capsule has self-noise, often specified as an equivalent acoustic level under a stated weighting. Converter bit depth cannot recover detail buried under either. Decreasing gain after a clipped preamp only makes a quieter clipped waveform. [Converter stages](#source/sampling-guide)

## Treat position as a control

A polar pattern is sensitivity as a function of direction at a stated frequency. An ideal cardioid's normalized response is `(1 + cos θ)/2`: at 0° it is 1, at 90° it is 0.5 (about −6 dB in amplitude), at 180° it is zero. Diffraction, ports, reflections and frequency dependence reshape real plots. Aim the least-sensitive direction at a steady fan, keep distance from the talker repeatable, and test plosives with a windscreen. Two people using the same headset at different angles can present different spectra to an ASR system. [Directionality and placement](#source/mic)

## Diagnose before tuning a model

Capture a quiet interval, ordinary speech and a deliberately firm phrase at the same gain. Keep the microphone and room fixed for that trial. A flat plateau at the largest representable PCM value is strong evidence of digital saturation. Rounded distortion below full scale can come from an earlier stage. Repeat at lower analog gain, then repeat farther from the source if the capsule itself might overload. A distant microphone can make the ratio of speech to room worse while improving headroom. Change one factor at a time.

## Try it

Draw a table for 0.1, 1 and 3 Pa RMS with the hypothetical mic, preamp and ADC above. The predicted preamp outputs are 0.1, 1 and 3 V RMS before clipping. Only the last sine exceeds the 2 V RMS full-scale sine specification. Repeat with 20 dB preamp gain. All three fit, but the quietest signal now occupies less of the converter range. State which noise source would have to dominate for extra preamp gain to help.

## Check your reasoning

**Can changing software volume repair the clipped “p”?** The overload has mapped different inputs to the same recorded value. Volume changes scale the surviving samples. Move the adjustment to the stage before overload and recapture.

**Would an omnidirectional capsule always be worse for speech?** A close, stable omnidirectional microphone can have a strong direct signal. A distant directional microphone still receives reverberant energy and can attenuate a moving talker. Compare recordings in the intended geometry.
