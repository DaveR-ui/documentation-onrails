---
last_updated: 2026-09-12
status: active
description: Retrofit playbook for already-started projects — slices first (the load-bearing move), one generalities doc per slice, then the ratchet.
tags: [brownfield, retrofit, slices, generalities, ratchet]
version: 1.4
related:
- 06-project-md
- 01-structure
- 04-validation
- 07-agent-consumption
---

# Brownfield: Documenting a Started Project

## Problem

The repo already exists: months of decisions live in commit messages, tribal knowledge, and the
heads of two people. The greenfield playbook (guidelines 00–07, sequenced as the runbook in 09)
assumes a clean start. Retrofits fail in three predictable ways — (a) documenting **files** drowns
in volume and rots at the first refactor, (b) big-bang application of the document contract drowns
every review in gaps about files nobody is touching and teaches everyone to wave the contract
away, (c) docs that never answer *"where does my task land?"* get ignored by every reader, human
or machine. The first artifact worth making is neither a tutorial nor an API reference: it's the
**territory map**.

## Solution

Six steps, ordered by leverage. Step 1 is the one that matters most; the rest make it survive.

```mermaid
flowchart TD
    S1[1 · SLICE the territory<br/>+ one generalities doc per slice] --> S2[2 · entry point<br/>README / project.md with the Slices table]
    S2 --> S3[3 · ratchet: contract applies<br/>to new and touched files only]
    S3 --> S4[4 · index.md generated from day one<br/>(git = history)]
    S4 --> S5[5 · review pass calibrated<br/>against the accepted-debt list]
    S5 --> S6[6 · machine wiring<br/>only if models read this]
    style S1 stroke-width:4px
```

### Step 1 — Slice the territory, write its generalities (the load-bearing move)

**Slice** = a major area of the codebase a human explicitly demarcates. 2–7 rows for a small
repo; territory, not org chart.

*How to find the slices* — evidence, not vibes:

| Signal | What it really indicates | Strength |
|---|---|---|
| Files that **co-change** in git history | functional cohesion — they *are* one slice | strong |
| Import/dependency direction | module boundaries; a slice is usually a cluster with few inbound edges | strong |
| Deployment / process boundaries | runtime slices (server vs CLI vs jobs) | strong |
| Content folders that already exist | slices admitted by the filesystem | medium |
| Team ownership | drifts with org changes — never the primary axis | weak |
| File type (`/utils`, `/handlers`) | anti-signal: type is metadata, not territory | negative |

*Then, for each slice, exactly one **generalities doc*** — the map of the territory, not a
walkthrough of it:

```markdown
---
id: <name>-slice
category: <topic-folder>
tags:
- slice
- generality
aliases:
- <Name> slice
related:
- <name>-index
version: 1.0
status: active
---
# <Name> — Slice Generalities
## What this slice is        ← purpose, form ("files ARE the store" style)
## Boundaries                ← explicitly IN and OUT; what belongs elsewhere and where
## Entry points              ← paths a reader starts from; the next read is determined, not guessed
## How it works              ← generalities: main flows, data shape, state ownership — high level
## Conventions of this slice ← the rules that hold *here* (may differ corpus-wide)
## Dependencies              ← upstream (what this needs) / downstream (what breaks)
## Known gaps & accepted debt ← honest "this is broken/unwritten" — feeds the accepted-debt list (Step 5)
```

Slice membership is metadata, not a key: it rides on `category` and `tags` — there is no `slice:`
frontmatter key, and inventing keys is a metadata-outside-contract error. The copyable version —
the same shape, complete — lives at
[`../templates/slice-generalities-template.md`](../templates/slice-generalities-template.md).

Why *this* step is the most important of all:

- It's the **routing unit**. Every reader's first question — "which part does my task touch?" —
  is answered by one table + one doc per slice, in ≤ 3 hops. The query loop of guideline 05 cannot
  run on a brownfield repo until this exists: the slices *are* the hubs of the retrofit.
- **It scales with areas, not files**: N slices mean N one-page docs — the map stays smaller than
  the territory. Per-file docs scale with the file count: the map grows toward the size of what it
  describes, and keeping it current becomes an unpaid second job nobody finishes. A 1:1-scale map
  is expensive to write and impossible to keep fresh.
- **It scales OUT through group-keyed sheets**: the doc classes of
  [01-structure.md](01-structure.md) — a surface catalog or payload contract
  ([../templates/interface-surface-template.md](../templates/interface-surface-template.md)),
  a UI inventory, troubleshooting entries — attach to the group and the slice row cross-links
  them. Per-file docs remain the anti-pattern.
- It's where **search-by-format starts working**: a question's vocabulary lands on a slice row
  (whose Keywords column carries the routing tokens), which resolves to a path. No cleverness required —
  the format does the routing.
- The **Known gaps** section is what makes the corpus trustworthy from day one: documented
  incompleteness beats silent staleness.

### Step 2 — The entry point

Register the slices in the Slices table of `docs/project.md` (anatomy in
[06-project-md.md](06-project-md.md)) and point the root README at it. One entry point, one
table, N generalities docs — the map is now walkable.

### Step 3 — The ratchet

The document contract ([02-document-contract.md](02-document-contract.md)) applies to **new and
touched files only**. Migration happens as work, never as a project: each edit leaves a file
closer to the contract. A big-bang retrofit produces thousands of contract gaps nobody reads, and
teaches everyone to wave the contract away.

### Step 4 — History is git until the corpus speaks

Everything before the retrofit stays in git — commits are the archaeology; do not fake an earlier
history. `index.md` gets generated from day one (markers from the start, even if hand-built) so
the entry point stays refreshable, and any structural decision made during the retrofit lands as
an append-only ADR (see [03-lifecycle-and-generated-files.md](03-lifecycle-and-generated-files.md)).

### Step 5 — Validation as a review pass

Adopt the review catalog ([04-validation.md](04-validation.md)) as a merge discipline with an
explicit **accepted-debt list**: errors block the merge only for the migrated subset; everything
else is treated as a warning until the ratchet shrinks the debt. The missing-from-hub check has a
brownfield twin: *a code area missing from the Slices table* — that's the first thing a review
should chase. The loop that closes it is the gap-close loop below.

### Step 6 — Machine wiring, conditionally

Only if models will read the repo: the five tiers and five rules of
[07-agent-consumption.md](07-agent-consumption.md). Brownfield repos usually have the lookup
targets (steps 1–2) before any wiring exists — which is exactly the right order.

### Gap-close loop (brownfield twin of "missing from its hub")

A review chases a missing area; the loop closes it:

1. **Search** the corpus for the topic — hub rows, the tag index, the Slices table.
2. **Absent? Write** the note per contract ([02-document-contract.md](02-document-contract.md)).
3. **Register** it in **both** its hub **and** the tag index — in the same commit.

The loop closes only when all three (note, hub row, tag entry) have landed.

### Moved notes leave provenance

When a note or context-doc moves path, old citations must still resolve. Two legal forms:

- **Tombstone stub** at the old path — a minimal forwarding note whose Solution is the pointer to
  the new path.
- **`moved_from:`** — the list of former paths recorded in the moved file's frontmatter.

Pick the stub when external citations are expected; `moved_from` when the move is internal.

## When to use

Any repo older than a week that has no entry point, or has docs nobody trusts. Also as the audit
order for "our docs exist but agents still misunderstand the project".

## When not to use

Throwaway prototypes (document the decision to throw). Greenfield starts (use the bootstrap
protocol instead). And where the docs *are* the product — API references get generated from code
and linked *from* slice docs; they never replace the generalities.

## Examples

A typical retrofit: the Slices table comes before any review process (a handful of rows, each with
entry-point paths), and exactly one generalities doc per slice follows — the generalities-first
order is why later agent wiring has anything to route into.

## Common mistakes

- **Documenting files instead of slices**: a map the size of the territory drowns the reader who
  still can't answer "where does my task land?".
- Slicing by team or by file type — the org chart drifts, the folders are arbitrary; co-change
  and dependency direction don't lie.
- Big-bang contract retrofit: review becomes noise, noise becomes "skip the review", and the
  corpus ends up worse — with distrust formalized.
- Thirty slices: routing dies of granularity; 2–7 areas, split only when tasks land repeatedly.
- Writing the first doc as a tutorial: generalities are the map (what, where, boundaries, gaps);
  walkthroughs are a different document type, linked from it.
- Treating step 1 as the finish: slices without the ratchet (step 3) rot at the next refactor —
  the map must be maintained by the same commits that change the territory.

## References

- The table Step 1 feeds: [06-project-md.md](06-project-md.md)
- The hubs this mirrors for code: [01-structure.md](01-structure.md)
- Calibrating Step 5's checks: [04-validation.md](04-validation.md)
- The consumer that routes via slices: [07-agent-consumption.md](07-agent-consumption.md)
