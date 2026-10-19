---
id: adr-0002-doc-classes-expansion-2026-09-07
category: adrs
tags:
- adr
- methodology
- doc-class
aliases:
- ADR-0002
- Doc Classes Expansion
related:
- adr-index
- adr-0003-lowercase-kebab-names-2026-09-12
- 01-structure
- 02-document-contract
- 06-project-md
- interface-surface-template
- ui-inventory-template
- troubleshooting-template
version: 1.1
status: active
---

# ADR-0002: Doc Classes Expansion (2026-09-07)

## Problem

The methodology recognized notes, hubs, ADRs and checklists but had no registered *doc classes* —
named shapes a corpus can mandate and readers can navigate by fixed anatomy. A production corpus
showed three high-value sheet shapes: group-keyed endpoint/interface sheets, UI/components/styles
inventories, and symptom-keyed troubleshooting sheets. Without a class spec, each project re-invents
the shape, cross-linking conventions drift per corpus, and no check can certify that a sheet
conforms to its class.

## Solution

Six decisions, landing as one batch:

1. **Three doc classes registered in guideline 01**, each with a copyable template:
   `interface-surface-template`, `ui-inventory-template`, `troubleshooting-template`. The guideline
   names the class and its registration route; the template carries the shape.

2. **One class, two modes for the interface-surface sheet.** Catalog and contract flavors share
   every structural invariant — group keying, fixed per-entry anatomy, slice cross-linking, note
   frontmatter, README/hub registration — and differ in content, not contract. Two classes would
   double the registration surface and split routing keywords; one class freely mixing both modes in
   a single sheet would lose the fixed-entry-shape guarantee. The mode is recorded via `tags`
   (`interface-catalog` / `interface-contract`), never invented keys. Rejected alternatives:
   (a) two classes; (b) one mixed-mode class.

3. **Guideline 02 §2's body-shape exception WIDENED** from "slice generalities only" to "registered
   doc classes" — a MINOR normative change. The frontmatter contract is untouched, and classes may
   never invent keys; only body anatomy is contracted per class.

4. **Troubleshooting defined as the write-up layer**, with Common Lookups (guideline 06) as the
   routing layer: the entry-point table holds the exact symptom string and points at the sheet's
   heading; the sheet holds Context / Root cause / Fix / Reference. An explicit non-duplication
   contract — a fix pasted into the routing table is a second truth.

5. **No validate.js changes — recorded as a deliberate non-change.** Class membership rides on
   `tags`; templates register via the schema-folder hub fallback (README navigation rows); this
   record sits behind `adr-index`. The existing eight-error catalog already certifies every
   registration the classes need; class-specific structural checks are accepted debt, not an
   oversight.

6. **Harvested and generalized.** Production specifics — framework names, GUID tables, real service
    names — were stripped to the corpus's established neutral domains (payments/refunds,
    build-failure strings), extended to their natural siblings (orders, a generic `GET /orders`),
    per the micro-vault precedent.

## When to use

Reading back why the class set is three-and-not-four, why the surface sheet is one class in two
modes, or why the validator stayed untouched.

## When not to use

Do not edit this record: corrections arrive as an addendum block, reversals as a successor ADR
carrying `supersedes`. Do not read the class list as closed — a fourth class is a new ADR, not a
new template.

## Examples

The batch's version ledger: touched guidelines 01/02/05/06/08 and the README bumped 1.1 → 1.2;
`adr-index` 1.0 → 1.1; the batch's four new files — the three templates and this record — at the
1.0 baseline (guideline 03 §4: new artifacts start at 1.0).

## Common mistakes

Accepted debt, stated honestly:

- **Class shapes are not machine-validated.** No check inspects per-entry fields — a surface entry
  missing `**Owner:**` passes. The calibration rule says do not ship an uncalibrated noisy check;
  revisit when drift actually bites.
- **`diagrams/documentation-architecture.html` is still stale**, carried over from ADR-0001's debt
  list: this expansion predates its refresh and does not excuse it.

## References

- [adr-index.md](adr-index.md) — this record's hub.
- [../guidelines/01-structure.md](../guidelines/01-structure.md) — where the classes are registered.
- [../guidelines/02-document-contract.md](../guidelines/02-document-contract.md) — the widened §2 exception.
- [../guidelines/06-project-md.md](../guidelines/06-project-md.md) — Common Lookups, the routing layer.
- [../templates/interface-surface-template.md](../templates/interface-surface-template.md) — class one, both modes.
- [../templates/ui-inventory-template.md](../templates/ui-inventory-template.md) — class two.
- [../templates/troubleshooting-template.md](../templates/troubleshooting-template.md) — class three.
