---
id: adr-0004-protocols-replace-checklists-2026-09-12
category: adrs
tags:
- adr
- methodology
- structure
- contract
aliases:
- ADR-0004
- Protocols Replace Checklists
related:
- adr-index
- adr-0003-lowercase-kebab-names-2026-09-12
- 01-structure
- 06-project-md
- 04-validation
- bootstrap-protocol
- new-note-protocol
version: 1.0
status: active
---

# ADR-0004: Protocols Replace Checklists as the Procedure Container (2026-09-12)

## Problem

The schema layer exposed two cross-cutting folders: `templates/` for copyable shapes and
`checklists/` for "validation you run by hand". Two defects hid in that split:

- **"Checklist" named a shape, not a role.** A checklist is one *form* a procedure can take
  (checkboxes); the folder's actual role was to hold the project's repeatable procedures. Naming
  the container after one shape meant a procedure that is not a checklist (a scripted run, a
  decision tree) had no declared home.
- **Consumer projects had no procedure folder.** The consumer layout
  (`guidelines/06-project-md.md`, `templates/project-md-template.md`) prescribed `docs/project.md`
  + `docs/context/*.md` only. Project procedures — "how to create a permission", "how to bootstrap
  the corpus", "how to review a note" — are not strategic *facts*, so they either polluted
  `docs/context/` or were not written down at all.

The methodology was also inconsistent with the vocabulary it expects elsewhere: the agent system
treats "protocol" as the project-owned procedure document, so the corpus modeled a second,
competing name.

## Solution

A human decision (2026-09-12) fixed the container: **Option B — `protocols/` absorbs the procedure
role; `checklists/` is deprecated as the procedure container.** Procedures belong to the project.
The change landed as one batch:

1. **Consumer layout is now two folders.** `guidelines/06-project-md.md` and
   `templates/project-md-template.md` prescribe `docs/context/` for strategic docs and
   `docs/protocols/` for project procedures; the section-8 Context Index and the Slices
   entry-point column name `docs/protocols/`.
2. **The generic anatomy follows.** `guidelines/01-structure.md`'s folder anatomy, three-layer
   diagram, rule 2, rule 5 and placement-decision table now route a hand-run procedure to a
   **Protocol** in `protocols/`.
3. **The two existing checklists migrate in place.** `checklists/bootstrap-checklist.md` →
   `protocols/bootstrap-protocol.md` (id `bootstrap-protocol`) and
   `checklists/new-note-checklist.md` → `protocols/new-note-protocol.md` (id
   `new-note-protocol`), moved with `git mv`. Their bodies — the checkbox procedure shape — are
   preserved; only the frontmatter model moved: `category: checklists` → `protocols`, tag
   `checklist` → `protocol`, titles/aliases renamed, and each carries
   `moved_from: [checklists/<old>.md]` provenance.
4. **The validator class follows the folder.** `validate.js` classifies `protocols/` as
   `protocol` (was `checklists/` → `checklist`), and the generated index counts/labels report
   `protocols`.
5. **Every inbound reference was repointed.** README navigation and repo anatomy, the runbook
   (`09`), the review catalog (`04`), `document-template`, `hub-template` and the precedence list
   in `00`; `index.md` and `tag-index.md` were regenerated. No `checklists/` link remains.

**Decisions:**

- **Protocols are project-owned.** This is deliberately distinct from the agent-system repository's
  own root `protocols/` (engine behavior, out of scope here): `docs/protocols/` holds the consuming
  *project's* procedures.
- **The checklist shape survives; the container is a protocol.** A protocol may still be a
  checkbox list — the migration renames the role, not the document's internal form.
- **Rename, not alias.** The old `bootstrap-checklist` / `new-note-checklist` ids are retired in
  favor of the protocol ids; `moved_from` records the former paths for provenance.
- **`protocols/` remains a hub-less schema folder.** Like `templates/`, its files register through
  the entry point's navigation table, so the missing-from-hub check keeps objective semantics.
- **Option A (keep `checklists/` under a new role) was rejected** — it preserves the
  shape-as-role confusion and leaves the consumer layout without its procedure folder.

## When to use

When the destination of a repeatable procedure is questioned — "where does 'how to create a
permission' live?" — or when calibrating the `protocol` folder class in `validate.js` against the
intent it encodes.

## When not to use

Do not read `protocols/` as a second context store: it holds *procedures* (how to run a task),
never strategic facts (what the project is, how it is shaped). Facts go in `docs/context/`.
Do not resurrect `checklists/` as a container; the shape can be a checklist, the folder cannot.

## Examples

After the batch, the repo's schema folder spells:

```
protocols/
├── bootstrap-protocol.md   (id: bootstrap-protocol)
└── new-note-protocol.md    (id: new-note-protocol)
```

replacing `checklists/bootstrap-checklist.md` and `checklists/new-note-checklist.md`. A consumer
project receives:

```
docs/
├── project.md
├── context/    ← strategic facts
└── protocols/  ← project procedures
```

`node validate.js --write` regenerates `index.md` (overview: `... protocols: 2`) and
`tag-index.md` (tag `protocol`), and `node validate.js` exits 0.

## Common mistakes

- **Accepted debt:** `diagrams/documentation-architecture.html` is a derived, lowest-precedence
  artifact and still depicts `checklists/`; it was already tracked as stale (ADR-0001, ADR-0002)
  and was not refreshed here.
- **Append-only history:** ADR-0001 and ADR-0003 quote `Checklists/`/`checklists/` in their
  historical prose and stay unedited; their live reference links were already valid and untouched.
  The rename is recorded here, not by rewriting them.
- Treating "protocol" as the agent-system's runtime protocol files: those live in a separate
  repository and are outside this methodology's `docs/protocols/` scope.
- Migrating the folder but not `category:` / the validator class — that yields a
  category-mismatch warning and files classified as plain `note`s (the exact half-done-rename
  failure ADR-0003 warns about).

## References

- [adr-index.md](adr-index.md) — this record's hub.
- [../guidelines/01-structure.md](../guidelines/01-structure.md) — folder anatomy and the placement table.
- [../guidelines/06-project-md.md](../guidelines/06-project-md.md) — the consumer layout.
- [../guidelines/04-validation.md](../guidelines/04-validation.md) — the missing-from-hub fallback and the review catalog.
- [../protocols/bootstrap-protocol.md](../protocols/bootstrap-protocol.md) — a migrated procedure.
- [../protocols/new-note-protocol.md](../protocols/new-note-protocol.md) — a migrated procedure.
- [adr-0003-lowercase-kebab-names-2026-09-12.md](adr-0003-lowercase-kebab-names-2026-09-12.md) — the preceding folder/validator correction.
