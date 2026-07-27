<!-- stardust:provenance
  writtenBy: stardust:direct
  writtenAt: 2026-07-23T08:20:00Z
  readArtifacts:
    - stardust/state.json
    - stardust/current/_brand-extraction.json
    - stardust/current/PRODUCT.md
    - stardust/audit/clover-com/audit.json
    - stardust/current/pages/home.json
  synthesizedInputs: []
  stardustVersion: 0.10.0
-->
---
title: "brand faithful and content verbatim - and fix the issues identified in the audit"
resolvedAt: 2026-07-23T08:20:00Z
toolkitVersion: "v1.0 (stardust v2)"
schemaVersion: 1
---

# Active direction (2026-07-23T08:20:00Z)

## Phrase

> brand faithful and content verbatim - and fix the issues identified in the audit

## Restatement

Keep the brand exactly as captured — palette, type families, motifs, voice,
the hero video signature — and keep every content beat where it is: same
sections, same sequence, same copy, same images. The redesign's entire
energy goes into execution: consolidating the site's two template
generations onto the new-generation system and closing the thirteen
findings from the 2026-07-23 audit (site health 57/100). This is a
fidelity-and-fixes direction, not an exploration; the audit report is the
brief.

## Movements

- **register** — `brand` (inherited from `current/PRODUCT.md`)
- **expressive axis** — `committed` (inherited — the captured color-blocked
  green system; unchanged)
- **tone** — `bold-direct` (inherited; unchanged)
- **density** — `balanced` (resolved via Q1 — 64px section padding; the
  multi-audience hard floor applies: home >5 sections + commercial
  conversion priority)
- **distinctiveness** — `distinctive` (inherited; the move is consistency,
  not novelty)
- **audience** — inherited: small-business owner-operators routed by
  vertical (Restaurants / Services / Retail / Healthcare)
- **ia-fidelity** — `verbatim` (auto-pinned by phrase: "content verbatim")
- **constraints** — `brand-faithful` (phrase), `legacy-content-preserved`
  (phrase), audit fix-list as the improvements floor, `a11y` gates from
  audit (poster/scrim, heading semantics, legal-text readability),
  `perf` gate (mobile TBT ≤600 ms)

## Gaps and questions

1. **Q:** Density tuning — (a) balanced ~64px (recommended; hard floor
   applies) or (b) compact 48–56px (commercial-conversion preference)?
   **A:** (a) balanced.

2. **Q:** Which captured template generation becomes the site-wide target
   (the audit's F-002 consolidation): (a) new generation (home's system —
   recommended, the audit's direction A) or (b) classic generation?
   **A:** (a) new generation.

## Anchor references

- `stardust/audit/clover-com/audit.json` — the findings ledger IS the
  brief (13 findings, 3 P1 / 7 P2 / 3 P3); benchmarks cited there
  (Square's single-accent consistency discipline, GlossGenius's coherent
  scale) inform the consolidation without contributing any visual move —
  Mode A pins everything visual to the captured surface.

## Anti-references

- Enterprise-fintech gravitas (navy / glassmorphism / jargon) — carried
  from the captured brand's own visible avoidances.
- The Generic-2026-SaaS silhouette (toolkit § 1) — guardrailed because
  "fix the issues" is a common trigger for template-shaped output.
- Two-voice template mixing — the named defect (audit F-002).
- Fabricated content (toolkit § Universal hardening) — anchor prices on
  /pricing come from live commerce data or ship as declared placeholders.

## Divergence inputs

- **mode** — **Mode A (brand-faithful), default by signal-strong + pinned
  by phrase.** Palette and type inherited; image-reuse contract holds;
  §8b signature preservation fires on the hero video.
- **seed** — `Clover|2026-07-23` MD5 → `2025-now × Terrazzo ×
  Travel-agency-brochure × dark`; picked_by `deterministic`.
  - decade `2025-now` — ✓ has teeth: aligns with the new-generation target.
  - craft `Terrazzo`, register `Travel-agency-brochure` — inert under
    `ia-fidelity: verbatim`; recorded, no visual moves derive from them.
  - ground-family rolled `dark` → **Mode C override: `brand-faithful`** —
    the brand's captured `#ffffff` ground wins; the dark roll maps onto
    the brand's own forest `#004400` alt-section rhythm.
- **font deck** — `brand-inherited` (picked_by: user-constraint).
  Target deploys PP Formula Condensed (display) + Graphik (workhorse);
  Altform is retired with the classic template (both captured; the pick
  is generation-consolidation within the pins, not a new face).
- **palette** — inherited from `_brand-extraction.json`, brand-native
  role renaming applied (Counter White / Receipt Ink / Fresh Lime /
  Forest / Pine / Back Office / Countertop / Clover Green).
- **anti-toolbox audit** — 3 hits, each justified as captured-surface
  inheritance: sticky top nav (captured convention, all 5 pages);
  UPPERCASE condensed display (the captured PP Formula signature);
  stat-callout bar (the captured "Run the numbers" signature with real
  numbers — §8b reproduction).
- **brand-faithful inversions** — auto-emitted (full log in
  `DESIGN.json.extensions.divergence.brand_faithful_inversions[]`):
  - `#ffffff` retained as page ground (existing brand decision) — no-pure-white rule inverted.
  - `#000000` retained as text/dark-CTA (existing brand decision) — no-pure-black rule inverted.
  - Hex token format retained (matches captured surface + Stitch convention).
  - Saturated `#228800`/`#b6fb6f` retained (captured canonical greens) — tinted-neutral reflex inverted.
  - CSS-uppercase display retained, scoped to Formula Condensed headline
    roles (captured signature; heading *content* is 0% uppercase).

## Improvements floor (Phase 2.5, audit-sourced)

- `stardust/prototypes/home-improvements.md` — 6 items (F-002 template
  consolidation, F-009 poster/scrim, F-007 heading semantics, F-008
  commercial pair, F-003/4/5 head hygiene + perf, F-012 legal readability).
- `stardust/prototypes/pricing-improvements.md` — 4 items (F-001 anchor
  prices, F-002 re-render in target system, F-004/F-010 FAQPage JSON-LD +
  question-shaped headings, F-012).

## Command sequence (proposed)

1. `$stardust direct` (this command — direction + target spec) ✓
2. `$stardust prototype home` — variant A render against
   `home-improvements.md`; §8b hero-video reproduction with the Poster
   Rule; validation loop at 3 viewports
3. `$stardust prototype pricing` — variant A render against
   `pricing-improvements.md`
4. `$impeccable critique` on each prototype — verify the fixes landed
   without slop (target: consistency heuristic 1/4 → 4/4)
5. `$impeccable polish` — pre-approval pass
6. `$stardust migrate` — after approval, with JSON-LD/OG/metadata
   composition per `DESIGN.json.extensions.metadata`

## User confirmation

> Density: "Balanced (Recommended)" · Target system: "New generation
> (Recommended)" — 2026-07-23 (AskUserQuestion; plan presented in-chat
> beforehand)

## Pages in scope

- `home`, `pos-systems`, `pos-solutions__restaurant`, `pricing`, `contact`
  (all 5 extracted pages)

---

# Active direction (2026-07-26T09:00:00Z) — re-direct: per-page captured generation

<!-- stardust:provenance
  writtenBy: stardust:direct (re-direct via prototype-review feedback)
  writtenAt: 2026-07-26T09:00:00Z
  supersedes: Active direction 2026-07-23T08:20:00Z (one movement only: target system)
  userPhrase: "apart from the home page keep the Altform font for headings. keep cinematic effects when the original page has them ... just reproduce all the designs for all the sections, including full page stages, cinematic effects, fine border cards, include all the images that are present in the original page. ... I want to keep the internal page style ... In this migration I want to keep the original design, except where we see an issue we can correct it proactively."
-->

## What changes

**Target system: per-page captured generation** (supersedes Q2's
"new generation site-wide"). Each page keeps its own captured design:

- **home** — keeps its captured new-generation surface (PP Formula
  Condensed display, lime CTAs). Already approved; unaffected.
- **interior pages** (pos-systems, pos-solutions/*, pricing, contact) —
  keep the captured classic style: **Altform headings** (sentence case,
  forest/pine greens), Graphik body, `#228800` primary buttons,
  fine-border cards, captured section grounds (incl. full-width green
  bands), full-page image stages, and the captured cinematic effects
  (scroll reveals, controlled-scroll modules, carousels) reproduced
  with CSS-first mechanics.
- **Reproduction floor:** all the designs for all the sections, all
  images present on the original page (gap-filled from live where the
  extract missed them), cinematic effects wherever the original has them.

## What does NOT change

- Mode A brand-faithful, `ia-fidelity: verbatim`, surprise `low`.
- The audit fix-list as the improvements floor — issues are still
  corrected proactively: F-003 (perf/TBT: CSS-first effects, lazy
  media), F-004/F-005 (JSON-LD/OG/titles), F-007 (heading hygiene),
  F-008 (commercial pair), F-009 (poster/scrim over media), F-012
  (legal/key-terms readability), contrast fixes.

## Audit override recorded

**F-002 (template-generation consolidation, P1) is consciously
overridden by the user.** The two-generation surface (new-gen home,
classic interior) is retained by explicit direction: "I want to keep
the original design." The finding stays in the ledger; it is not a
defect for this migration.

## Stale effect (content-aware)

- `pos-systems`, `pos-solutions__restaurant`, `contact`, `pricing`
  prototypes (rendered against the new-generation target) → **stale**,
  re-prototype under this direction.
- `home` (approved) → NOT stale: its deployment consumed the captured
  new-gen system, which this re-direct preserves for home.
