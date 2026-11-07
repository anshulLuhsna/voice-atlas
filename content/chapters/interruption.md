{"id":"interruption","title":"A bookmark for the last sound heard","part":"Interaction","level":"Intermediate","minutes":23,"question":"If Murmur has generated two sentences ahead, where should it resume after a question?","goals":["Relate source spans to a device presentation estimate","Cancel stale audio across producer and consumer queues","Resume narration across interruptions, retries and document edits"],"prereqs":["transport","turn-taking"],"related":["grounding","memory","qa","narration-design"],"labs":["interruption","latency"],"summary":"Build a narration state machine around evidence of playback and a versioned source anchor.","sources":["rt-webaudio","rt-epub","rt-annotation","rt-twilio"]}

The narrator reads, “The team measured rainfall in May. By July, the river had moved.” A listener interrupts after *May*. A server has already synthesized *July*. Ask the server where to resume and the listener may lose an entire sentence. Ask the loudspeaker whether anyone paid attention and it has no way to know. A practical bookmark records the last reliably presented span, plus uncertainty about what reached the listener.

## Two coordinate systems

The source has a document version, block ID and character range. Choose the index unit and normalization, for example Unicode code points in normalized extracted text. The audio rendition has its own version, sample rate and sample ranges. A one-to-many map connects spans to spoken clips. “Dr.” can become “doctor,” footnotes can be skipped and a dramatization can insert a breath with no source characters. Save explicit alignment and identify added effects. EPUB media overlays offer a standard example of connecting text fragments and audio intervals. Quote selectors with surrounding text help re-anchor a changed document. [EPUB media overlays](#source/rt-epub) · [Web Annotation selectors](#source/rt-annotation)

At 24 kHz, 12,000 samples span 500 ms of media time. If playback is twice normal speed, that interval ideally occupies 250 ms of wall time. A duration measured at playback speed cannot serve as a character offset. Keep the original mapping when speeds change. If the mapping only reaches sentence precision, offer sentence-level rewind rather than inventing word boundaries.

Track four high-water marks in one contiguous rendition. **Generated** is ready at the synthesizer. **Sent** has left the server. **Queued** has reached the playback client. **Presented** estimates what the output device has rendered. For a contiguous, non-seeking run their ordered positions satisfy `presented ≤ queued ≤ sent ≤ generated`. A seek or replacement starts a new epoch. A logged chunk may arrive after its epoch was cancelled. The device timestamp and clock-mapping uncertainty matter more than whether a network acknowledgment arrived.

Web Audio's `getOutputTimestamp()` relates a context time to a performance time for output rendering. To interpret it, record each buffer's start on that context clock and its offset within the rendition. Wireless output and physical listening conditions can add uncertainty. A suspended context or newly initialized device may yield an unusable value. Recover from the last conservative rendered boundary. [Web Audio output timestamps](#source/rt-webaudio)

## Work an interruption

In a teaching trace at 24 kHz, the server has generated 144,000 samples (6.0 s), sent 120,000 (5.0 s), and the client has queued 108,000 (4.5 s). Its confirmed playback estimate within this rendition is 84,000 samples (3.5 s). The opening sentence ends at sample 81,600 (3.4 s). A question arrives. The queued-but-unpresented tail is 24,000 samples or 1.0 s. A bookmark at the generated boundary would skip 2.5 s. A sentence-boundary policy may repeat 0.1 s from the opening of the next sentence. This trades a short repetition for a gap in the argument.

1. While **Narrating**, ingest playback reports for the active rendition. On a confirmed interruption, latch the document anchor and epoch, request output stop, and obtain the best final presentation estimate for that epoch. Use a bounded stop and discard pending frames. Record any uncertainty about the device tail.
2. In **Listening**, keep the saved narration anchor immutable. Fence off the old epoch at the receiver and producer. Cancel pending inference where possible, and ignore completed late results everywhere the audio can enter a queue.
3. In **Answering**, give question audio, transcript revisions and spoken answers their own stream. An interruption of the answer can revise the question. It cannot advance the book's anchor.
4. On **Resume**, resolve the saved anchor in its original document version. Start a fresh epoch at a defensible sentence or aligned-word boundary. Return to **Narrating** only when the resume action is accepted. Repeated delivery of one resume command must produce one transition.

A gateway can acknowledge a marker after playing preceding audio *or* emit pending markers when told to clear buffered audio. A marker alone can therefore be ambiguous. Associate it with the generation, clear state and last confirmed prefix. If a platform cannot report exact final playout, preserve a lower bound and replay a brief prefix. [Bidirectional stream marks and clear](#source/rt-twilio)

## Exercise the races

Use the [interruptible narration lab](#lab/interruption). Advance until the generated position leads playback, interrupt, ask, answer and resume. Record the saved position before asking and after the answer. The answer must leave the book cursor anchored. Extend the trace on paper with a late frame from the cancelled epoch, a repeated resume command and a reconnect. Check the expected outcomes in order: silence from the old stream, one new narrator and a restart from the last persisted presentation boundary.

For an edited article, resolve a stable block ID plus surrounding text in the new version. If the sentence appears twice or disappeared, let the listener select a nearby passage. A guessed offset can jump into another paragraph. Preserve the pinned version when permitted. When the source is shared with another device, attach a sequence and an explicit seek event to playback updates. Sorting independently written positions by character offset would undo an intentional rewind.

## Check your reasoning

**Can playback always be monotonic?** Monotonicity is useful inside an uninterrupted rendition. An explicit seek, replay, new document version or correction intentionally changes that coordinate system.

**Why stop at the player before waiting for the server to cancel?** The listener is affected by already buffered output as well as ongoing generation. A local stop shortens the audible tail. An upstream cancellation reduces later stale work. Both are needed, and each has its own acknowledgment.
