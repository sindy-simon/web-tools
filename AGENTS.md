# Repository instructions

## Working mode

- Before asking the user a question, inspect the repository, its documentation, tests, and relevant sources. Answer from evidence when possible.
- Proceed autonomously through reversible work: investigation, draft specifications, ticket breakdown, implementation, testing, and review.
- Ask the user only when a product, user-experience, monetization, or other hard-to-reverse decision remains unresolved, or when credentials or additional authority are required.
- Do not merge a pull request or publish to production without the user's explicit approval.
- Keep changes small enough to test and review. Run `npm test` for behavior changes and report any validation that could not be completed.

## Agent skills

### Issue tracker

Specifications and implementation tickets are tracked in GitHub Issues for `sindy-simon/web-tools`. Use the connected GitHub tools first and the GitHub CLI only for operations the connector cannot cover. See `docs/agents/issue-tracker.md`.

### Domain docs

This repository uses a single-context domain-documentation layout. Read `CONTEXT.md` and relevant records in `docs/adr/` when they exist. See `docs/agents/domain.md`.
