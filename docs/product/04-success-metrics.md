# Success Metrics

## MVP Success Metrics

Signal Vault v0.1 is successful when:

1. A player can open an object page from an in-game-style URL.
2. The object page renders safely even when the object is unresolved.
3. A player can log a Signal in less than 10 seconds.
4. Signals attach to object context.
5. Every Signal stores author and entity-resolution snapshots.
6. Anonymous users cannot publish shared/tribe Signals.
7. Access-code session fallback works.
8. Manual classification is visibly marked.
9. Staleness states appear correctly.
10. Build/test/typecheck remain clean.

## Product Usage Metrics

Track:

- Signals created per session
- average time to create Signal
- Signals created from in-game mode vs external mode
- objects with at least one Signal
- unresolved object rate
- manual classification rate
- stale Signal count
- contradiction count
- access-code success rate
- anonymous vs wallet vs character-resolved sessions

## Quality Metrics

Track:

- resolver failure rate
- session restore failure rate
- local draft recovery success
- API error rate
- slow page loads in in-game mode
- bundle size
- test coverage of pure engines
- typecheck pass rate
- production console errors

## In-Game UX Metric

A player should be able to answer this within 3 seconds of opening an object page:

> Is this object safe/useful, and what do we know about it?
