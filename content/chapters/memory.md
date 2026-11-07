{"id":"memory","title":"What a voice system should remember","part":"Interaction","level":"Advanced","minutes":25,"question":"How can Murmur remember a preferred pace while forgetting the conversation that established it?","goals":["Choose a representation and lifetime for each kind of memory","Implement scoped writes, correction, expiry and deletion","Evaluate the full lifecycle across audio, text and derived data"],"prereqs":["grounding"],"related":["interruption","privacy","evaluation","qa"],"labs":["interruption","evaluation"],"summary":"Give each remembered fact an owner, evidence, validity interval and deletion path.","sources":["rt-provenance","rt-longmem","rt-locomo","rt-vap","rt-injection"]}

“Read this paragraph slowly” is a valid request. Five days later, playing every book slowly can feel like a bug. The word *this* set a scope. A voice system that simply appends every utterance to a searchable history can retrieve the sentence perfectly and still act incorrectly.

## Choose the store from the question

**Session state** answers “what operation is live?” It includes the active narration epoch, cancellation token and open question. Its lifetime ends with the operation. **Conversation history** preserves the ordering and speaker of exchanges. Keep only the history needed to resolve references such as “the second one.” **Document position** is a structured, versioned playback checkpoint. It needs exact lookup, atomic updates and explicit seek semantics. Recovering it from the nearest semantically similar transcript risks jumping to another page.

**Preferences** express a choice within a named scope, such as normal speed for fiction or slow pace for one paragraph. An explicit setting is stronger evidence than a model guessing from a pause. **Episodic memory** records a prior event with who, when, context and supporting evidence, for example that a listener asked about the gauge in an earlier session. **Retrieval** is the process of selecting evidence when answering. It can access an authorized source passage, a permitted memory or neither. A book's claim belongs to its author. Keep it separate from the listener's preferences and from an assistant's previous speculation.

## The lifecycle of one preference

A write begins with the actual listener channel, a resolved principal and a purpose. A speaker label or a quoted imperative in the book is insufficient authorization. With an explicit persistent choice, write a record containing an opaque ID, owner, scope, key, value, validity interval, evidence reference, version and retention rule. Use the request ID as an idempotency key. On a retry of “use 1.2×,” return the existing write. For a paragraph-only instruction, use a scoped session override that expires on leaving the paragraph. [Indirect prompt injection](#source/rt-injection)

Suppose an explicit default of 1.2× was set on Monday. On Tuesday the listener selects 0.9× for one book. On Wednesday a general question about the usual speed should retrieve 1.2×. Playback *inside that book* resolves to 0.9×. Apply identity, authorization, expiry, deletion and scope filters before ranking. For settings, use a deterministic precedence rule: a current paragraph override wins over book override, which wins over account default. A nearest-neighbor index is useful for loosely worded recollections. An obsolete but similar preference should never win this lookup.

When correcting an assertion, close or supersede the previous version and invalidate summaries or embeddings that stated the old value. Distinguish **valid time**, when the preference applies, from **write time**, when the system learned it. An offline device can deliver Monday's old write on Thursday. Use expected-version checks or a declared merge policy so that replay cannot resurrect an overridden setting. Keep provenance at the level of individual facts instead of one generic “from conversation” tag. The W3C PROV model supplies vocabulary for entities, derivations and invalidation. A small application can use those ideas without implementing the entire standard. [Provenance data model](#source/rt-provenance)

Expiry stops use after a predefined lifetime. Deletion also needs a path through primary records, derived summaries, vector indexes and caches. Revoke serving access first, propagate removal by stable IDs, and block stale replicas from returning deleted records. A minimal tombstone can prevent restoration while containing none of the deleted utterance. Define backup retention and reapply deletion markers before a restored system serves traffic. If raw audio is deleted, independently decide which expressly requested settings may persist. State this policy in the product so a listener knows what “forget” covers.

## Decide what survives transcription

A transcript preserves words yet often omits duration, intonation, laughter and overlapping speakers. “Right?” and “right” can have nearly identical text and different conversational functions. Prosodic manipulations in Voice Activity Projection experiments help isolate timing cues. A waveform can support later listening, but it also carries voices, background conversations and room details. A typed setting such as “prefer explicit resume after questions” may meet the product need without retaining the clip. Treat an inferred mood or identity as uncertain, and avoid turning a delivery style into a lasting user attribute. [Prosody and future activity](#source/rt-vap)

A short context window is simple and cheap to query. Summaries compress long histories but can silently promote an assistant's guess into a user fact. A vector index can recover paraphrases but can return a stale fact or the wrong speaker. A structured store supports corrections and exact scope but demands schema decisions. In Murmur, combine the smallest sufficient stores and require every retrievable fact to carry an evidence link and a way to stop using it.

## Exercise · build a memory regression fixture

Create two listeners, one shared document, and a chronological stream: set A's global speed to 1.2×, set A's book speed to 0.9×, issue a paragraph-only slowdown, finish that paragraph, correct the book speed to 1.0×, expire the session and delete the book override. Query both listeners after each step. Expected results include A returning to 1.0× after correction, then 1.2× after deletion, and B always using its own default. Replay the corrected request twice and inject a delayed write based on the prior version. Neither should create a second active preference.

Measure correct scoped answers over eligible queries, stale answers after correction, unauthorized retrievals and deletion propagation time. An answer can be factually accurate yet violate owner isolation. Inspect the selected record, source version and final action independently. LongMemEval offers tasks around updates, temporal reasoning and abstention. LoCoMo explores long conversations and multimodal evidence. Both motivate test design; adapt their questions to spoken ambiguity, playback anchors, consent and cross-user isolation. [LongMemEval](#source/rt-longmem) · [LoCoMo](#source/rt-locomo)

Here is a runnable Python 3 read-path fixture. Time is an integer event tick. Each row is an already-validated record with a half-open validity interval. The records use one speed per owner and scope at any tick.

```python
records = [
    ("A", "global", 1.2, 0, 99),
    ("A", "book-7", 0.9, 1, 4),
    ("A", "book-7", 1.0, 4, 6),
    ("A", "p8", 0.8, 2, 3),
]

def resolve(owner, book, paragraph, tick):
    active = {scope: value for who, scope, value, start, end in records
              if who == owner and start <= tick < end}
    for scope in (paragraph, book, "global"):
        if scope in active:
            return active[scope]
    return 1.0

assert resolve("A", "book-7", "p8", 2) == 0.8
assert resolve("A", "book-7", "p9", 3) == 0.9
assert resolve("A", "book-7", "p9", 4) == 1.0
assert resolve("A", "book-7", "p9", 6) == 1.2
assert resolve("B", "book-7", "p8", 2) == 1.0
```

At tick 4 the corrected value becomes active exactly as its predecessor expires. At tick 6 the default is visible again. Change the owner filter or make both ends of each interval inclusive and inspect which tests distinguish the change. To expose the end-boundary bug even with dictionary overwrite order, reverse the two book records and rerun. A production write transaction must enforce non-overlapping active intervals for each key and reject stale revisions. This fixture isolates the read path.

## Check your reasoning

**Why keep a deletion marker if the utterance is gone?** A replica or backup can deliver an old event later. A scoped opaque marker lets the system suppress that event without retaining its text.

**If the database has 100% retrieval recall, is memory good?** Recall says the desired item appeared among candidates. A stale item could still be selected, a correct answer could use another listener's evidence, or the interface could apply a paragraph preference to every book. Score the applied action and its scope.
