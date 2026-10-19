---
id: bootstrap-protocol
category: protocols
tags:
- protocol
- bootstrap
aliases:
- Bootstrap Protocol
related:
- 09-bootstrap-workflow
moved_from: [checklists/bootstrap-checklist.md]
version: 1.7
status: active
---

# Corpus Bootstrap Protocol

## Problem

The first ten minutes of a new documentation repo decide whether it becomes a navigable corpus
or a pile. The mistakes made here compound into migration debt.

## Solution

Order matters: each step makes the next one checkable.

**Skeleton**
- [ ] Create root `README.md` — THE single entry point: what the corpus is, how to navigate, the
      rules, the table of docs (`File | Purpose | When to read`).
- [ ] Declare `doc_language` once, in the README frontmatter. No exceptions after that.
- [ ] Bring the schema layer in: copy or link `templates/document-template.md` and the two protocols.
- [ ] Create 2–4 topic folders *only when the first real note needs one* — no speculative tree. Each starts with its hub `<folder>-index.md`.

**Runbook**
- [ ] Follow the ordered agent runbook: [`../guidelines/09-bootstrap-workflow.md`](../guidelines/09-bootstrap-workflow.md).

**Store guarantees**
- [ ] `index.md` and `tag-index.md` generated (create the two files with their marker pairs by hand
      to start; `node validate.js --write` fills both regions): overview stats +
      tree + hub list, and the tag → docs inverted index.
- [ ] Generated aids (index regions, diagrams) are marked as generated and rebuildable — never hand-patched.

**Review discipline from day one**
- [ ] Adopt the review catalog (see [`../guidelines/04-validation.md`](../guidelines/04-validation.md)) — walk it over your first notes; the two protocols are the mechanism, no tools required.
- [ ] Calibrate: walk it against the corpus *as it exists* and demand zero gaps — or write down, explicitly, what you tolerate (accepted debt).
- [ ] Make the walk a step of every merge the day it catches a real error you agree with.
- [ ] Walk the catalog with code where it exists: `node validate.js` (errors exit 1).

Those root commands target this methodology-reference corpus only, not a copied consumer
layout. For consumer `docs/project.md`, `docs/context/` and `docs/protocols/`, invoke the
read-only subset checker as `node validate-consumer.js --root <project>` from the methodology
checkout, or use its actual available script path from elsewhere. It is not implicitly copied
by bootstrap and does not replace the manual catalog walk (see [04](../guidelines/04-validation.md)).
Consumer tag navigation, when present, is `docs/tag-index.md`; optional directories/index may
be absent at bootstrap, but linked targets must exist and the project entry is required.

**Agent-readiness (skip only if this stays a human-only corpus for now)**
- [ ] Query path is read-only; sandbox rejects absolute paths / `..` / symlink escapes.
- [ ] Not-found semantics chosen (`null` / `[]`), documented next to the tool surface.
- [ ] Snapshot staleness visible (a footer date on generated files is the minimum).

## When to use

Starting any new documentation repo, or auditing an existing one that "grew naturally".

## When not to use

Mid-scale restructuring of a healthy corpus — there, walk the review catalog first and follow its
findings; this protocol is for when there is no catalog walk yet.

## Examples

This repo dogfoods the protocol: README entry point, numbered guidelines 00–09 (09 is the runbook), `templates/`/`protocols/` as the schema layer and the review mechanism, and the micro-vault inline in guideline 09.

## Common mistakes

- Bootstrapping the tooling before the content. One real note + hub beats an empty perfect repo.
- Skipping the calibration step: an unchecked catalog graduates from advisor to nuisance in a week.
- Writing two entry points ("see also START-HERE.md") — navigation dies by branching at the root.

## References

- [../guidelines/01-structure.md](../guidelines/01-structure.md) — the layout being bootstrapped.
- [../guidelines/04-validation.md](../guidelines/04-validation.md) — the catalog being adopted.
- [../guidelines/09-bootstrap-workflow.md](../guidelines/09-bootstrap-workflow.md) — the runbook that sequences this protocol.
