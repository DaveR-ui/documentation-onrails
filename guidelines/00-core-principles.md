---
last_updated: 2026-09-12
status: active
description: The nine load-bearing principles of documentation deployment, and the anti-patterns each one kills.
tags: [principles, core, anti-patterns]
version: 1.3
related:
- 01-structure
- 02-document-contract
---

# Core Principles

## Problem

Documentation collections decay in predictable ways: duplicated truths, orphaned notes, metadata
drift, generated indexes that no longer match the files they describe, and readers (human or AI)
who guess where things live. Each symptom has a structural cause.

## Solution

Nine principles. They are ordered by leverage — earlier ones make later ones obvious.

### 1. The files ARE the store

Markdown on disk is the single source of truth. Every other artifact — generated indexes,
diagrams, navigation pages — is derived from the files and rebuildable by rerunning the
generator.

> Kills: the *second-master bug class*. A generated file that gets hand-patched becomes a rival
> truth that rots on every rename; rebuilding from the files instead of patching makes that bug
> structurally impossible.

### 2. Navigation is designed, top-down

Every corpus has exactly **one entry point** (a root README/index). Every folder has exactly **one
gatekeeper** (a hub). A reader — human or agent — should never need to *guess* a path; the route
`entry → hub → note` is always walkable.

### 3. Contracts over conventions

Required metadata and fixed section headings, **validated by code**, not by good intentions.
"A convention that isn't checked is folklore." The contract is the template; the template is
enforced (see [02-document-contract.md](02-document-contract.md)).

### 4. One topic per file, one language per corpus

Files split by topic, never by author or date. The corpus picks one `doc_language` and applies it
without exception (including headings and metadata keys). Bilingual drift doubles the search space
and halves consistency.

### 5. Two vocabularies, one resolver

Stable semantic **ids** (`payments-flow`) live in metadata; structural **filename stems**
(`payments`) live in links. Both resolve to the same document, case-insensitively, everywhere.
Never make a reader convert between them manually (see [02-document-contract.md](02-document-contract.md)).

### 6. Decision records are append-only

ADRs and changelogs are never rewritten — corrections are *new* entries. A decision record
documents its own supersession (`supersedes: old-id`) instead of being edited. This preserves the
archaeology that makes the corpus trustworthy.

### 7. Machine-owned and human-owned content coexist via markers

Generated files delimit regenerated regions with HTML comments (`<!-- BEGIN GENERATED: x -->`).
Everything outside belongs to humans and survives regeneration. Generation is **write-if-diff**:
unchanged input produces zero written bytes, so diffs stay meaningful and the artifacts stay
committable.

### 8. Health is a routine review

An explicit catalog of checks — errors that block the merge, warnings that advise — walked
before each change lands, turns "is this corpus trustworthy?" into a finishable walk, not a
feeling. Acceptance criteria are testable, not vague (see [04-validation.md](04-validation.md)).

### 9. During refactors, docs override code

When the corpus documents a codebase *mid-refactor*, the wiki layer is the implementation
reference: code in flight is **not** to be mimicked. The rule is scoped to the refactor window —
outside a refactor, merged reality wins and the docs must catch up. Changing code against the
docs still requires updating the docs in the same change.

> Kills: the *legacy-imitation bug*. A reader that copies the dominant pattern it finds in the
> source tree re-seeds the anti-pattern the refactor exists to remove.

### Source-of-truth precedence (methodology artifacts)

When artifacts disagree, the winner is fixed, not negotiated:

1. **The contract** ([02-document-contract.md](02-document-contract.md))
2. **An individual guideline**
3. **Template / protocol wording**
4. **Generated artifacts & diagram styling**

A generated artifact that disagrees with the prose is a bug in the generator. A validator that
disagrees with 02 is a bug in the validator. Recorded decisions (ADRs) are the archaeology of
*why* — never a rival source of *what is*.

## When to use

As a checklist when designing any new documentation system, or to diagnose an existing one:
each violated principle predicts a concrete failure mode.

## When not to use

Do not cargo-cult the tooling. The principles survive without any particular binary or toolchain; a plain repo
with a review checklist gets 90% of the value.

## Examples

Diagnosing a rotting corpus — symptom to likely violated principle:

| Symptom | Likely violated principle |
|---|---|
| Two places describe one fact, and they disagree | 1 (files are the store) or 4 (one topic per file) |
| Readers guess at paths; notes reachable only by luck | 2 (navigation designed top-down) |
| "It's just a convention" drift; tools can't rely on metadata | 3 (contracts over conventions) |
| A decision contradicts documentation that denies it ever existed | 6 (append-only decision records) |
| A generator silently clobbered someone's edits | 7 (markers) |
| Nobody can say whether the corpus is trustworthy | 8 (health is a routine review) |

## Common mistakes

- Reaching for retrieval tooling before navigation design — it masks the structural rot that
  principles 2–4 would have prevented.
- Treating principle 6 as "never touch docs again" — content edits are normal; it is *decision
  records* that are append-only.
- Markers without write-if-diff — regenerating byte-identical files on every run pollutes the
  VCS history and destroys the signal in `git diff`.

## References

- The principles applied to a folder layout: [01-structure.md](01-structure.md)
