<!-- _provenance: written by stardust:direct 2026-07-23 (TARGET strategy).
     Direction: "brand faithful and content verbatim - and fix the issues identified in the audit"
     Mode A (brand-faithful) · ia-fidelity: verbatim · target system: new generation.
     Sources: stardust/current/PRODUCT.md (descriptive), stardust/audit/clover-com/audit.json,
     stardust/current/_brand-extraction.json. Strategy is inherited, not invented —
     this file restates the captured strategy as the target, with the audit's
     execution fixes folded into the design principles. -->

# PRODUCT.md — Clover (target)

## Register

`brand`

Marketing surface: the site sells the Clover POS platform; the product itself
lives elsewhere. Design IS the product here.

## Users

Small-business owners and operators — restaurateurs, retailers, service
providers — evaluating point-of-sale systems, addressed in the second person
as time-pressed owner-operators. The IA routes them by vertical (Restaurants /
Services / Retail / Healthcare) and that routing is preserved verbatim.
Buying context: a high-stakes, comparison-shopped purchase (10 open tabs,
Square and Toast among them), frequently on mobile between rushes.

## Product Purpose

Convert small-business owners into Clover customers through two clear paths —
self-serve ("Shop") and assisted ("Contact sales") — with vertical-specific
persuasion and honest, findable pricing. Scope: the marketing site only;
content carried verbatim from the current site.

## Brand Personality

**Bold, direct, hustle-adjacent — in one voice.** Short benefit-led heroes
("A Clover for every small business", "You bring the flavor, Clover powers
the pay"), stat-band bragging with real numbers (4M+ / #1 / $337B+),
real-merchant photography and ambient video, and a single-hue green identity
stretched from forest to acid lime. The target commits fully to the brand's
new-generation expression: condensed display type that shouts, flat
color-blocked sections, product-UI vignettes instead of generic illustration.
Traits for downstream register selection: `signage-led`,
`display-typography-signature`, `bold-direct`.

## Anti-references

- **Enterprise-fintech gravitas** — no navy, no glassmorphism, no gradient
  meshes, no jargon; the site must not read as its parent company.
- **The Generic-2026-SaaS silhouette** (oversized neutral sans hero +
  dual-CTA pair + sticky nav composite) — the display register here is the
  brand's own condensed uppercase, not an interchangeable template. Guarded
  because "fix the issues" is a common trigger for template-shaped output.
- **Two-voice inconsistency** — the current site's split personality (2017
  template beside the new system) is the named defect being fixed; no target
  surface may mix the generations.
- **Fabricated content** — no invented stats, prices, names, or quotes;
  every number and claim traces to the captured pages or live commerce data.
  Missing data renders as a declared placeholder.

## Design Principles

1. **One generation, everywhere.** The new-generation system (Formula
   Condensed display, acid-lime + ink CTAs, forest color-blocks) is the only
   system; the classic template is retired on sight (audit F-002).
2. **Green is the brand, used in blocks.** Full-section grounds in forest
   `#004400` / acid lime `#B6FB6F` over white; no second hue, no gradients,
   no shadows — separation is a background change (captured No-Shadow rule).
3. **The signature moves; the text always survives it.** Hero and section
   videos are preserved (§8b) and always ride an opaque luminance-matched
   poster + scrim, with an equivalent reduced-motion state (audit F-009).
4. **Content verbatim, structure honest.** Captured copy, images, and video
   carry at their captured semantic positions; one H1 per page, quotes are
   blockquotes, heading levels never skip (audit F-007).
5. **Two doors, clearly labeled.** One commercial pair — Shop (self-serve)
   and Contact sales (assisted) — everywhere; pricing states an anchor
   figure before it asks the visitor to self-classify (audit F-001, F-008).
6. **Fast and findable by machines.** Organization/Product/FAQPage JSON-LD
   and full OG on every page; third-party scripts deferred past first
   interaction; mobile TBT under 600 ms is a ship gate (audit F-003–F-005).

## Accessibility & Inclusion

Inherit impeccable defaults (WCAG AA floor), plus the audit-specific gates:
text-over-video always scrimmed to AA against the poster state; legal/
disclosure text ≥1.5 line-height and ≤75ch (audit F-012); alt coverage stays
≥95% meaningful; `prefers-reduced-motion` honored on every moving surface.
