# Issue tracker: GitHub

Specifications and implementation tickets for this repository live as GitHub Issues in `sindy-simon/web-tools`.

## Tooling

- Prefer the connected GitHub tools for creating, reading, updating, commenting on, labeling, and closing issues.
- Use the GitHub CLI only when the connector cannot perform the required operation, such as a missing native dependency or project-board operation.
- Treat GitHub as the source of truth. Do not maintain a duplicate local issue backlog.

## Conventions

- A specification is one parent issue describing the problem, solution, user stories, implementation decisions, testing decisions, and out-of-scope work.
- Implementation work is split into one issue per independently verifiable vertical slice.
- Each implementation issue states its acceptance criteria and blockers.
- Prefer GitHub's native issue dependencies. If unavailable, begin the issue body with `Blocked by: #<number>`.
- An issue is ready for autonomous implementation only when all blockers are closed and the specification or ticket has been approved.
- Keep pull requests small and traceable to their originating issue.

## Pull requests as a request surface

**PRs as a request surface: no.**

Pull requests implement approved work; they are not used as the primary place to submit new feature requests.

## Skill mappings

- When a skill says “publish to the issue tracker,” create a GitHub Issue.
- When a skill says “fetch the relevant ticket,” read the complete issue body, labels, comments, and dependency state.
- `to-spec` creates the parent specification issue.
- `to-tickets` creates the dependency-aware vertical-slice issues used as the Kanban backlog.
