---
id: adr-0001-methodology-expansion-2026-09-07
category: adrs
tags:
- adr
- methodology
- contract
- lifecycle
- validation
aliases:
- ADR-0001
- Methodology Expansion 2026-09-07
related:
- adr-index
- adr-0003-lowercase-kebab-names-2026-09-12
- 02-document-contract
- 03-lifecycle-and-generated-files
- 04-validation
- 06-project-md
- 08-brownfield
version: 1.2
status: active
---

# ADR-0001: Methodology Expansion (2026-09-07)

## Problem

The corpus described a documentation system but could not certify itself: no generated `index.md`,
no tag index, no formal contract for context-docs (the guidelines ran on an implicit key set), no
machine walk of the review catalog, no decision records for the schema itself, and the brownfield
generalities example shipped a non-contract `slice:` key. The gaps were harvested from a
production corpus, not invented.

## Solution

Fifteen changes across three tracks — A: corpus completeness, B: contract formalization, C:
tooling — landed as one batch (the batch counts as a single version change per touched file).

**Changes, itemized:**

1. Root `index.md` created as a generated artifact (region `index`).
2. Root `tag-index.md` created as a generated artifact (region `tags`) (A1).
3. `ADRs/` folder created at the repo root behind its `adr-index.md` hub; naming
   `adr-NNNN-<slug>.md` (B4).
4. This record — the registration of the schema change in item 10.
5. `Templates/adr-template.md` added — copyable decision-record shape.
6. `Templates/hub-template.md` added — copyable `<folder>-index.md` shape.
7. `Templates/project-md-template.md` added — the nine-section `project.md` skeleton.
8. `Templates/slice-generalities-template.md` added — contract-only generalities shape.
9. Context-doc contract formalized in guideline 02 §4 (B3).
10. Note contract extended to 7 required + 3 optional via `moved_from` — a schema change;
    `document-template` bumped to 1.3.
11. Version-bump policy added at guideline 03 §4 (B4).
12. `doc_language` restricted to the entry point, declared once corpus-wide (A6).
13. docs-override-code promoted to principle 9 in guideline 00, scoped to refactor windows (A7);
    the precedence list lives in 00, anchored from the README (C3).
14. Slices table gained the Keywords column; `project.md` gained the Common Lookups section
    (guideline 06) (A2/A3).
15. `validate.js` added at the repo root (C1); the README navigation table registers every
    artifact, template, checklist, hub, and the validator.

**Decisions:**

- **Context-doc contract formalized**: required `last_updated`/`status`/`description`/`tags`/`version`;
  optional `related` (entries resolve as filename stems) and `moved_from`; `doc_language` is an
  entry-point-only key (B3/A6).
- **Note contract extended to 7+3 via `moved_from`** — a schema change; this ADR is its
  registration, and `document-template` was bumped to 1.3.
- **Version-bump policy**: `MAJOR.MINOR`, baseline `1.0`, an ADR required for schema/MAJOR changes
  (guideline 03 §4) (B4).
- **ADRs live at the root in `ADRs/`** with hub `adr-index.md`, named `adr-NNNN-<slug>.md` (B4).
- **The tag index lives at the ROOT** (`tag-index.md`), same generator/pipeline as `index.md`,
  region `tags` (A1).
- **Schema-folder hub fallback**: folders without a hub (`Templates/`, `Checklists/`) register
  their files in the README entry table — giving the missing-from-hub check objective semantics.
- **docs-override-code is principle 9**, scoped to refactor windows (A7); the precedence list
  lives in guideline 00, anchored from the README (C3).
- **Validator**: root `validate.js`, zero-dependency Node, eight errors / three warnings, exit 1
  on errors, `--write` is write-if-diff, and it NEVER echoes secret values; fenced blocks and
  inline-code spans are exempt from link scanning — a citation is not a link (C1).
- **Common Lookups + the Keywords column** generalize the harvested production patterns (exact
  symptom string → doc + heading anchor; routing tokens per slice row) with neutral examples
  (A2/A3).

**Accepted debt** (recorded honestly per guideline 04's calibration rule):

- `diagrams/documentation-architecture.html` still depicts the pre-expansion system (eight
  principles, no tag index, no ADRs folder, no validator). It is a derived artifact at the lowest
  precedence; the refresh is deferred.
- The pre-existing fenced marker example in guideline 09 still uses region name `overview` while
  the real artifacts use per-artifact regions (`index`, `tags`); reconciled in guideline 03,
  whose §2 example now shows `index` as the region name.

### Addendum (2026-09-07)

Corrections to this record, appended per its own append-only rule (see *When not to use*) — the
original text above stands unedited.

**Corrections to the record:**

- The itemized changes omit three expansion items: **A4** — the gap-close loop (guideline 08);
  **A5** — the optional ` (CRITICAL)` heading decoration (guideline 02 §2, a contract change);
  **A8** — the placement-decisions subsection (guideline 01).
- Item 12 mislabels the `doc_language` entry-point restriction as **A6**; it is **B2**
  (A6 is `moved_from`).
- The version-bump-policy decision overstates the ADR mandate: guideline 03 §4 requires an ADR
  only for contract-breaking **MAJOR** changes. This record documents the schema (**MINOR**)
  change voluntarily, as good practice — not as a policy requirement.

**Post-review corrections (same batch):**

- Guideline 04's dangling-link row made explicit: both wikilinks and relative markdown links are
  checked unconditionally; the syntax-citation exemption (fenced blocks exempt both kinds, inline
  code spans exempt wikilinks only) moved from code comments into the contract text.
- The A3 residue in guideline 08 fixed — the slice-row bullet now reads "whose Keywords column
  carries the routing tokens".
- README "Repo anatomy" extended with `index.md`, `tag-index.md`, `ADRs/` and `validate.js`.
- This addendum appended to ADR-0001 (`version` 1.0 → 1.1 — an appended entry is growth of the
  record).
- `project-md-template.md` now linked from guideline 06's Examples.
- A Templates row added to guideline 01's placement-decisions table.
- Guideline 02 §2 gained the generalities-doc exception sentence: 08's section shape is the one
  contracted exception; the frontmatter contract is unchanged for those docs.
- `validate.js` gained an id-slug format check.

## When to use

When a rule's *why* is questioned — "why is the tag index at the root?", "why does a MAJOR bump
need an ADR?", "what did the expansion tolerate?" — and when calibrating the validator against
the intent it encodes.

## When not to use

Do not edit this record: corrections arrive as an addendum block below, reversals as a successor
ADR carrying `supersedes`. Do not read the accepted-debt list as a contract-enforced to-do — it is
what review explicitly tolerates, revisited by the next change that touches those files.

## Examples

The expansion is self-certifying: this repo now carries its own `index.md` and `tag-index.md`
(marker regions, filled by `node validate.js --write`), `ADRs/` behind its hub, four new templates
beside the original, and `validate.js` as guideline 04's machine walk — every claim in the
guidelines is checkable by walking the corpus.

## Common mistakes

Reading the itemized changes as fifteen independent merges: they landed as one batch, which is
why touched files carry a single version bump. And treating the debt entries as endorsements —
the diagram is the *lowest*-precedence artifact precisely because it is derived and stale.

## References

- [adr-index.md](adr-index.md) — this record's hub.
- [../guidelines/02-document-contract.md](../guidelines/02-document-contract.md) — the contracts as they now stand.
- [../guidelines/03-lifecycle-and-generated-files.md](../guidelines/03-lifecycle-and-generated-files.md) — lifecycle, generated regions, version policy.
- [../guidelines/04-validation.md](../guidelines/04-validation.md) — the catalog `validate.js` walks.
- [../guidelines/06-project-md.md](../guidelines/06-project-md.md) — Keywords column and Common Lookups.
- [../guidelines/08-brownfield.md](../guidelines/08-brownfield.md) — the corrected generalities shape.
- [../templates/adr-template.md](../templates/adr-template.md) — the shape this record follows.
