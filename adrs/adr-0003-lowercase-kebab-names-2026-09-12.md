---
id: adr-0003-lowercase-kebab-names-2026-09-12
category: adrs
tags:
- adr
- methodology
- naming
- contract
- structure
aliases:
- ADR-0003
- Lowercase Kebab-Case Names
related:
- adr-index
- 01-structure
- 02-document-contract
- 04-validation
- adr-0001-methodology-expansion-2026-09-07
- adr-0002-doc-classes-expansion-2026-09-07
version: 1.0
status: active
---

# ADR-0003: Lowercase Kebab-Case File and Folder Names (2026-09-12)

## Problem

The corpus preached a lowercase `id` slug but never stated a filename or folder rule, and it
actively modeled capitals: the schema folders were spelled `ADRs/`, `Templates/` and `Checklists/`
across ~80 references, and `validate.js` classified folders by those literal capitalized names.
Consuming agents copied the modeled spelling, so every new corpus inherited capitalized paths. The
gap had a second cost: the shipped tree had already drifted — `Templates/` and `Checklists/` existed
on disk as `templates/`/`checklists/` while every link still pointed at the capitalized names — so
`node validate.js` opened at 49 errors and the folder classifier could not even see the schema
files. A rule that is not stated cannot be checked, and a spelling that is not enforced cannot stay
fixed.

## Solution

Seven changes, landed as one batch (a naming correction plus the rule that makes it hold):

1. **The naming rule is now in the contract** — `guidelines/02-document-contract.md` §3 states that
   file and folder names are lowercase kebab-case (same shape as the `id` slug), that the rule binds
   every depth including the schema folders, and that the conventional root `README.md` (and its
   non-Markdown siblings such as `LICENSE`) is the one documented exemption.
2. **The rule is mirrored in the structure guideline** — `guidelines/01-structure.md` gained rule 5
   in "Rules that make the tree navigable", so a reader creating a folder meets the rule where the
   tree is described.
3. **The schema folders are lowercased on disk** — `ADRs/` → `adrs/` (the only folder still
   capitalized; `templates/` and `checklists/` were already lowercase). The rename was performed
   with `git mv`, so history and recoverability are preserved.
4. **Every reference was rewritten** — ~80 capitalized path references across the README,
   guidelines, templates, checklists, generated artifacts and the diagram now point at the
   lowercase paths, and every `category:` value was normalized to its lowercase folder
   (`adrs`, `templates`, `checklists`, plus the example folders).
5. **The validator enforces the rule** — `validate.js` gained the `non-kebab-case-name` error
   (files and folders, `README.md` exempt), and its folder classifier now matches the lowercase
   schema folder names, restoring document-class detection.
6. **The review catalog names the check** — `guidelines/04-validation.md` lists
   *non-kebab-case name* as the ninth error, with a receipt; the catalog went from eight to nine
   errors.
7. **Conventional names are the sole exemption** — documented in §3 and encoded as `NAME_EXEMPT` in
   the validator, so the exemption is a stated contract term, not folklore.

**Decisions:**

- **Lowercase kebab-case is the one spelling for both files and folders**, aligned with the existing
  `id` slug so stem and id cannot disagree on case.
- **The rewrite covers the present corpus; the rule governs the future.** Existing capitalized
  references were corrected in place rather than tolerated as debt, because the drift was already
  breaking the review.
- **ADR-0001 and ADR-0002 are superseded for the naming spelling, not edited.** Their historical
  prose (which quotes `ADRs/`, `Templates/`, `Checklists/`) stands unedited per the append-only rule;
  the rename is recorded here. Only their live `## References` link targets — dead pointers, not
  historical claims — were repaired, because an unresolvable link is a dangling-link error, not
  archaeology.
- **The exemption is README.md (and non-Markdown root siblings).** The spelling every reader and
  tool already expects; any other uppercase name is now an error.
- **`non-kebab-case-name` is an error, not a warning.** A mis-cased name silently breaks links and
  folder classification — exactly the failure this ADR exists to end.

**Accepted debt:**

- The rename invalidates any external citation that spelled the old capitalized paths. The corpus
  has no `moved_from` entries for the folders (guidelines/08 offers the mechanism); the ADR is the
  pointer of record instead.
- `diagrams/documentation-architecture.html` is a derived artifact at the lowest precedence and was
  updated for the visible folder/path spellings only; its pre-existing staleness (noted in ADR-0001
  and ADR-0002) is unchanged and still tracked.

## When to use

When a rule's spelling is questioned — "why is it `adrs/` and not `ADRs/`?", "can I name a folder
`MyTopic/`?" — and when calibrating the `non-kebab-case-name` check against the intent it encodes.

## When not to use

Do not edit ADR-0001 or ADR-0002 to "fix" their capitalized examples: they are history. Do not read
the exemption as a license for arbitrary uppercase — it names `README.md` (and non-Markdown root
files) and nothing else.

## Examples

The batch is self-certifying: after it, `node validate.js` exits 0, `node validate.js --write`
regenerates `index.md` and `tag-index.md` byte-stably, and a grep for capitalized schema-folder
references in the corpus returns nothing. The tree now spells `adrs/`, `templates/`, `checklists/`
exactly as the contract requires — see the anatomy in
[../guidelines/01-structure.md](../guidelines/01-structure.md).

## Common mistakes

- Fixing the folder on disk but not the validator's classifier — the files then classify as plain
  `note`s and the missing-from-hub and metadata checks silently misfire (the exact 49-error state
  this batch started from).
- Rewriting ADR-0001/0002's historical prose to purge the capitals — that falsifies the archaeology;
  supersede via this record instead.
- Treating the naming rule as new for folders only, or as governing filenames only: it is one rule
  over both, at every depth.
- Forgetting the inherited `category:` values — a lowercase folder with `category: Templates` is a
  category-mismatch warning and a half-done rename.

## References

- [adr-index.md](adr-index.md) — this record's hub.
- [../guidelines/02-document-contract.md](../guidelines/02-document-contract.md) — the naming rule (§3).
- [../guidelines/01-structure.md](../guidelines/01-structure.md) — the folder anatomy and rule 5.
- [../guidelines/04-validation.md](../guidelines/04-validation.md) — the non-kebab-case-name check.
- [adr-0001-methodology-expansion-2026-09-07.md](adr-0001-methodology-expansion-2026-09-07.md) — the schema-folder and validator baseline this corrects.
