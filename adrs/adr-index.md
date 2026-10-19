---
id: adr-index
category: adrs
tags:
- adr
- hub
- index
aliases:
- ADR Index
- Decision Records
related:
- adr-0001-methodology-expansion-2026-09-07
- adr-0002-doc-classes-expansion-2026-09-07
- adr-0003-lowercase-kebab-names-2026-09-12
- adr-0004-protocols-replace-checklists-2026-09-12
- 03-lifecycle-and-generated-files
version: 1.3
status: active
---

# ADRs Index

The hub of `adrs/` — a gatekeeper, not a content page.

**What belongs here:** decision records — structural or contract-schema choices that were
actually debated: key-set changes, folder anatomy, the generated-artifact pipeline, the
version-bump policy. Append-only, named `adr-NNNN-<slug>.md`; the four-digit sequence is the next
free number, never reused.

**Contents:**

- [adr-0001-methodology-expansion-2026-09-07.md](adr-0001-methodology-expansion-2026-09-07.md) —
  the 2026-09-07 expansion: context-doc contract, note contract 7+3, version policy, `adrs/`
  itself, the root tag index, the schema-folder hub fallback, principle 9, `validate.js`, and the
  Common Lookups + Keywords generalizations.
- [adr-0002-doc-classes-expansion-2026-09-07.md](adr-0002-doc-classes-expansion-2026-09-07.md) —
  the doc-classes expansion: three registered classes (interface-surface, ui-inventory,
  troubleshooting), one-class-two-modes for the surface sheet, the widened 02 §2 body-shape
  exception, and the deliberate no-validator-change.
- [adr-0003-lowercase-kebab-names-2026-09-12.md](adr-0003-lowercase-kebab-names-2026-09-12.md) —
  the naming correction: the lowercase kebab-case file/folder rule in 02 §3 and 01 rule 5, the
  schema-folder rename with every reference rewritten, the `non-kebab-case-name` validator error,
  and the `README.md` exemption.
- [adr-0004-protocols-replace-checklists-2026-09-12.md](adr-0004-protocols-replace-checklists-2026-09-12.md) —
  the procedure-container correction: `protocols/` replaces `checklists/` (Option B — protocols
  absorb the checklist role; protocols belong to the project), the two protocol docs migrated with
  `moved_from` provenance, the validator/class/tag/category rename, and the consumer layout
  `docs/context/` + `docs/protocols/`.

**What belongs elsewhere:** current rules live in the guidelines and the contract — a decision
explains *why*, the guideline states *what*; transient working notes never enter this folder;
superseded decisions stay here with their successor's `supersedes` pointer — nothing is deleted.

New records: copy [../templates/adr-template.md](../templates/adr-template.md) and list the result
in Contents above, in the same commit.
