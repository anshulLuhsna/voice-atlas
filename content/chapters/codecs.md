{"id":"codecs","title":"What a codec spends","part":"Sound & signal","level":"Intermediate","minutes":19,"question":"Why can two calls with the same bitrate fail in different ways?","goals":["Budget payload and packet overhead independently.","Explain predictive, transform and learned representations.","Choose a packet duration using both latency and loss exposure."],"prereqs":["sampling","spectrum"],"related":["audio-tokens","transport","inference"],"labs":["latency"],"summary":"Count the bits and milliseconds in a speech packet and trace the audible cost of a missing frame.","sources":["opus","encodec"]}

A PCM recorder commits a fixed number of bits for every sample. A network voice codec asks which parts of that representation a listener can tolerate losing. A lossless codec exploits predictable structure while allowing exact recovery of samples. A lossy speech codec also changes the signal. A container such as Ogg groups encoded packets and metadata. Changing the filename extension does not transcode the contents.

## Spend the bits where the ear needs them

Nearby speech samples are correlated. In a predictive coder the decoder estimates a sample from earlier reconstructed samples. The encoder sends information about the prediction error and parameters needed to make a matching prediction. Where vocal-tract shape changes slowly, this can save bits. If the excitation or transitions are poorly represented, the output may sound buzzy or lose consonant detail.

A transform coder works on blocks, assigning precision to frequency regions with perceptual importance. Opus includes a linear-prediction layer based on SILK, a transform layer based on CELT, and a hybrid mode. Mode, bandwidth, frame duration and bitrate jointly determine behavior. Speech can be intelligible at a setting that makes music or a dramatic whisper sound poor. Encode the product's actual content before deciding. [Opus specification](#source/opus)

A neural codec learns an encoder, quantized intermediate representation and decoder. With K = 1,024 choices an ideal fixed-width code index occupies 10 bits. Four codebooks at 50 frame instants per second would require 4 × 50 × 10 = 2,000 bits/s before entropy coding or headers. This is an illustrative configuration. A decoder may reconstruct plausible detail even where the representation lost exact waveform information. A codec trained for listening quality can preserve cues that help a generator, but its indices need not correspond to words or phonemes. [EnCodec](#source/encodec)

## Work one packet budget

Uncompressed 48 kHz, 16-bit mono PCM needs 768,000 payload bits/s. At a nominal 24 kbit/s, a 20 ms coded frame uses 24,000 × 0.020 / 8 = 60 payload bytes on average. Suppose one frame per RTP packet and 40 bytes of IPv4, UDP and basic RTP headers with no extensions, encryption overhead or link framing. Fifty packets/s add 16,000 header bits/s. Wire rate in that simplified model is 40 kbit/s. Smaller packets reduce capture waiting time but increase headers per second. Larger packets lose more contiguous audio per dropped packet. Variable bitrate means a single frame may deviate substantially from 60 bytes.

Packetization delay and codec lookahead both precede network transit. The receiver may wait again to smooth arrival jitter. Losing a packet does not always produce silence. Packet-loss concealment extrapolates missing sound from decoder state, while in-band forward error correction can let a later packet help recover an earlier frame. Waiting for that later packet needs playout slack. Reliable retransmission arriving after the speaker's deadline cannot repair what the listener already heard. [Opus loss handling](#source/opus)

## Try it

For a one-minute call at the illustrative 24 kbit/s payload, compare 10 and 20 ms packet durations under the same 40-byte header assumption. Codec data is 180,000 bytes either way. Headers are 240,000 bytes at 10 ms and 120,000 bytes at 20 ms. A single lost packet covers 10 or 20 ms respectively. In the [latency bench](#lab/latency), add 10 ms of capture delay and observe which stages move. Timing and bitrate answer different questions.

## Check your reasoning

**A podcast and a phone call use the same codec. Should they use identical settings?** A podcast can buffer and may need music and expressive voices preserved. A live call is sensitive to packetization, loss recovery and the time until a reply becomes audible.

**Can a smaller file prove better compression for Murmur?** It only proves fewer bytes. At matched content and level, compare intelligibility, character consistency and listener preference, then check time to first audio and device energy. A benefit on one axis can cost another.
