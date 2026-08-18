# Domain documentation

This repository uses a single-context domain-documentation layout.

## Before working

Read these sources when they exist:

- `CONTEXT.md` at the repository root for canonical product and domain terminology.
- Relevant Architecture Decision Records (ADRs) in `docs/adr/` for hard-to-reverse technical decisions.

If these files do not exist, proceed without creating placeholders. The domain-modeling workflow creates them only when a term or decision has actually been resolved.

## Vocabulary

Use the terms defined in `CONTEXT.md` consistently in specifications, issue titles, code, tests, and user-facing copy. If current code and the glossary disagree, surface the conflict rather than silently choosing a new term.

## Architecture decisions

If proposed work contradicts an existing ADR, identify the conflict explicitly. Create a new ADR only when the decision is hard to reverse, surprising without context, and the result of a genuine trade-off.
