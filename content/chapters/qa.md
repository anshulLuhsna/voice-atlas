{"id":"qa","title":"Breaking a voice agent on purpose","part":"Systems","level":"Advanced","minutes":32,"question":"Which replay would catch an old audio frame speaking over the listener’s question?","goals":["Turn a conversation into a time-stamped scenario with a test oracle.","Inject delayed packets, duplicate tool calls and cross-session races.","Design release gates and trace a failed invariant back to its owner."],"prereqs":["interruption","evaluation"],"related":["inference","privacy","streaming-asr"],"labs":["interruption","evaluation","partials"],"summary":"Build reproducible tests for the races, retries and acoustic conditions that decide whether a conversation works.","sources":["sy-voicebench","sy-duplex","sy-trace","sy-monitor","sy-canary"]}

A listener interrupts narration. The assistant correctly answers the question. Half a second later the previous sentence plays over the answer. A transcript-only test records an ideal conversation. To reproduce the defect, keep the timing and identity of each event as well as what was said.

## Give the scenario a clock and an oracle

An **oracle** is a rule deciding whether an observed result is acceptable. Write the precondition, event timeline, expected state, tolerance and severity before choosing a model. In a replay, one logical clock advances only when the fixture asks it to. Replace network, recognizer and synthesis outputs with recorded or scripted events at that clock. Pin source version, audio rate, fixture seed and all model, prompt and normalizer revisions. For variable wording, assert that the answer cites a supporting span and conveys its claim. Exact string comparison is appropriate for a span ID, session ID or tool argument.

Try a cancellation fixture. At 0 ms, document D/version 3 is playing generation 7. At 100 ms the client has presented audio through sample 2,400 at 24 kHz. At 110 ms a barge-in triggers generation 8 and invalidates queued generation 7 frames. At 140 ms an old packet arrives. The oracle expects a frozen resume point at the confirmed word boundary associated with sample 2,400, no newly accepted generation 7 frame and no second answer. A real device may already have old samples in a hardware buffer. Record the last old sample actually heard in a loopback test and give it a separate recovery budget. [Full-duplex event families](#source/sy-duplex)

## Build a suite by failure owner

Use a small set of fixtures that distinguish mechanisms. Expand the following cases across languages, noise and devices as evidence accumulates.

- **Capture and endpoint.** Insert a 450 ms pause inside a number, then complete it. Label the silence and the intended turn separately. Sweep endpoint policy and measure cut-offs alongside response delay.
- **Recognition and tools.** Emit “delete my mark” as a partial, then revise it to “keep my mark.” Assert that no destructive mutation occurs from the unstable hypothesis.
- **Grounding.** Put an imperative inside a quoted article and ask what the author said. Expect an attributed answer with the exact document version and an empty tool ledger.
- **Transport.** Drop one 20 ms frame, delay the next three and reconnect with the last acknowledgement repeated. Assert bounded queues, monotonic playout within an epoch, and one durable effect per idempotency key.
- **Isolation.** Run sessions A and B on the same worker. Give both turn number 1 and interleave them. Cancel A, then release a delayed B frame. B’s output and bookmark must stay associated with B.

A failing probe should identify a stage: capture clipping, false endpoint, word substitution, premature intent, unsupported citation, tool authorization, queue spill, stale playout or resume drift. Log the **first diverging observation** and downstream effects separately. For example, a missed “not” and a destructive action are two failures with different fixes. VoiceBench’s controlled variations can guide fixture design; full conversations are needed to learn whether people repair or abandon a turn. [VoiceBench](#source/sy-voicebench)

## Make the race reproducible

Use this Python fragment as a miniature sink for the isolation case. Each successive event arrives in listed order. “Play” here means the simulated device confirmed the end offset. This convention lets the test separate a presentation receipt from a generation receipt.

```python
def replay(events):
    epoch = {"A": 0, "B": 0}
    heard = {"A": 0, "B": 0}
    for session, kind, generation, sample_end in events:
        if kind == "cancel":
            epoch[session] = max(epoch[session], generation)
        elif kind == "play" and generation == epoch[session]:
            heard[session] = max(heard[session], sample_end)
    return heard

events = [
    ("A", "play", 0, 2400), ("B", "play", 0, 1200),
    ("A", "cancel", 1, 0), ("A", "play", 0, 4800),
    ("B", "play", 0, 3600),
]
assert replay(events) == {"A": 2400, "B": 3600}
```

Repeat the cancel event and the last play receipt. The result stays the same. Replace the session-indexed epoch with a global one and the final B receipt gets dropped. Removing the generation guard accepts A’s stale audio. The fixture isolates two bugs with five events. In a production player, check the epoch **before** enqueueing as well as when receiving a position update. Persist tool effects and their deduplication keys in one transaction so a lost acknowledgement can be retried safely.

## Observe failures under load

Put spans around receive, decode, queue wait, inference, synthesis and playback confirmation. Carry a pseudonymous trace ID, session-scoped epoch, chunk sequence, queue depth and release fingerprint. Capture clocks and their uncertainties; compare monotonic timestamps on the same device or use a known clock mapping. Keep raw audio out of default logs. Counters for timeouts and stale drops need denominators, e.g. late frames discarded per cancelled turn. A successful drop can indicate correct recovery. [Trace concepts](#source/sy-trace) · [Monitoring distributed systems](#source/sy-monitor)

Drive arrivals at a fixed offered rate, including during slow responses. A closed-loop client that waits for completion before sending can hide the backlog caused by real arrivals. Mix short questions with long narration, run enough time for caches and connections to stabilize, then inject a worker exit. Count requests offered, admitted, rejected, timed out and finished. Track p50 and p95 first audible response, stale samples after cancellation, maximum queue age and cross-session failures. Define a zero-tolerance gate for cross-user leakage and repeated destructive effects. Set timing tolerances from listener studies and hardware measurements.

## Exercise · reduce a regression

Use [interruption recovery](#lab/interruption) to place an interruption while audio is buffered. Write a fixture recording generated extent, played extent and chosen resume anchor. Run the Python example, change exactly one guard, and keep the shortest failing event sequence. Expect the correct guard to preserve both sessions. Then use the [partial transcript lab](#lab/partials) to construct an intent-changing revision. Keep it as a regression whenever a real incident exposes the same mechanism.

For a release, run offline fixtures first, then seeded simulations over adversarial interleavings, then consented live sessions. A synthetic user can replay the same pause perfectly. A real listener may hesitate because the system spoke too soon. Compare a small canary with a concurrent control under similar traffic, pin versions, and rehearse rollback while turns are in flight. [Canarying releases](#source/sy-canary)

## Check your reasoning

**All calls returned HTTP 200. Can playback still be broken?** A server response can precede buffering, device rendering and stale-frame rejection. Assert a client-side presentation outcome and inspect late-cancellation audio.

**Why store an incident after fixing it?** A permanent fixture captures the triggering interleaving and its oracle. A later dependency update can reintroduce the race under different wording.
