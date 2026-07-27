<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-07-24T09:10:00Z
  page:             contact
  pageUrl:          https://www.clover.com/contact
  againstDirection: stardust/direction.md (Active 2026-07-23T08:20:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/contact.json
    - stardust/current/_brand-extraction.json
    - stardust/current/_accordion-content.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
    - stardust/audit/clover-com/audit.json
  stardustVersion:  0.10.0

  capturedSourceLineage:
    - section: header
      lineage: "site-wide system-component (kind=header), new-generation tokens per audit F-002; commercial pair per approved home deployment (F-008)"
    - section: hero
      lineage: "captured hero (contact.json H1 'Contact us', white ground, ink text)"
    - section: contact-accordion
      lineage: "captured 10-item accordion (contact.json widgets.accordions itemCount 10; labels captured as h5s); item content live-sourced 2026-07-24 into stardust/current/_accordion-content.json#pages.contact (extract did not expand the accordion; live-sourcing follows the pricing anchor-price precedent — content verbatim from the same live page, incl. tel:/mailto:/partner links)"
    - section: footer
      lineage: "site-wide system-component (kind=footer), carried per approved home deployment"

  antiTemplatePass:
    - pattern: "contact accordion list"
      defaultReflex: "3-column contact-card grid with icons (the universal contact-page template)"
      alternatives: ["captured single-column accordion as native <details>", "two-column static directory"]
      picked: "captured single-column accordion as native <details>, all 10 items, first (Get sales help) open"
      rationale: "the captured page IS a flat accordion directory; verbatim keeps the shape. Native details drops the JS dependency and renders every answer crawlable — same treatment approved on pricing's FAQ."
    - pattern: "utility hero"
      defaultReflex: "oversized display hero with decorative media on a utility page"
      alternatives: ["captured compact type-only hero (H1 + one press line)", "forest color-block hero"]
      picked: "captured compact type-only hero, display H1 at headline clamp (40–56px) not full display size"
      rationale: "a directory page's job is the list; the captured hero is compact and the target keeps it that way (density: balanced, not theatrical)."

  substrateTransitions:
    default: "counter-white (#ffffff)"
    exceptions: []

  voiceClassification:
    - { section: header, classification: "captured-verbatim + direction-authorized consolidation (commercial pair, F-008)" }
    - { section: hero, classification: "captured-verbatim", copy: "H1 'Contact us'" }
    - { section: contact-accordion, classification: "captured-verbatim (live-sourced 2026-07-24, _accordion-content.json)", copy: "10 items: Get sales help / Where to buy Clover / Get help with your existing system / Support outside of the U.S. / Installation support / Make a suggestion / Developers / Partners / Resellers / Press — answers + links verbatim incl. (833) 318-0794, media@fiserv.com, business@clover.com, international support numbers" }
    - { section: footer, classification: "captured-verbatim (deployment per approved home)" }
    - { section: "head metadata", classification: "direction-authorized rewrite", source: "title kept 'Contact us | Clover' (already intent-true); OG set + Organization (with contactPoint telephone +1-833-318-0794 from captured content) + WebSite + ContactPage JSON-LD (F-004)" }

  signatureElements: []
  # no §8b trigger: captured contact page has no video/canvas/motion signature.
-->
---
slug: contact
url: https://www.clover.com/contact
register: brand
surprise: low
dominantDimension: decade/2025-now-consolidation
---

# Page shape: contact

Variant A under `ia-fidelity: verbatim`, Mode A. A compact utility
directory: H1 + 10-item accordion, re-rendered from the classic template
into the new-generation system (F-002). Accordion content gap-filled by
live-sourcing (see lineage).

## Sections (in render order)

1. **header** — same deployment as approved home (sticky, white, nav +
   commercial pair).
2. **hero** — compact: H1 "Contact us" (Formula Condensed, uppercase,
   headline clamp 40–56px), ink on white. No lede (the captured "For press
   inquiries…" line belongs to the Press accordion item, not the hero).
3. **contact-accordion** — all 10 captured items as native `<details>`
   (summary = H2-styled item label per F-007: single H1 → H2 items), first
   item (Get sales help) open. Answers verbatim from
   `_accordion-content.json#pages.contact` with every captured link
   preserved: `tel:` links (e.g. (833) 318-0794, international numbers),
   `mailto:` (business@clover.com, media@fiserv.com), partner/support URLs
   (external links `rel="noopener"`). Multi-paragraph answers keep their
   captured paragraph breaks; the international-support item renders its
   country lines as a definition-style list for readability (presentation
   only; copy verbatim).
4. **footer** — per approved home deployment (2 rows × 4, legal at 76em).

## Layout strategy

- Density: balanced (64px); accordion column max-width 75ch on the 1280px
  container; generous summary hit-targets (min 48px).
- CSS `view()` reveals per approved home on summary rows; reduced-motion
  disables; no JS.

## Key states

- Accordion: `<details>`-native; all answers in DOM (crawlable, JS-free).
- No forms captured on this page (contact routes are links/phone/email) —
  none invented.

## Interaction model

- Item links → captured hrefs verbatim (tel:/mailto:/https).
- Header Contact sales → captured sales URL.

## Data attributes

- `header[data-section="header"][data-intent="navigate + commercial pair"][data-layout="full-width"][data-canon]`
- `section[data-section="hero"][data-intent="orientation"][data-layout="stack"]`
- `section[data-section="contact-accordion"][data-intent="answer objections + route to help"][data-layout="stack"][data-items="10"][data-interactive="accordion"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="mega"][data-canon]`
- `body[data-template="form"]`

## Unsourced content (placeholder list)

(none) — all copy captured or live-sourced with playwright provenance.

## Open questions for craft

- The captured page renders item labels as h5s with no visual hierarchy;
  target renders summaries at Title scale (Graphik 500, 20–25px) rather
  than Formula Condensed — headline voice on 10 stacked summaries would
  shout the whole page (Case Split rule: uppercase display is for
  headline roles, and a directory row is a label role).

---

## Re-direct addendum (2026-07-26)

Re-rendered under the 2026-07-26 direction: **per-page captured
generation** (F-002 user-overridden). Style layer supersedes the brief's
new-generation references: Altform headings (sentence case, pine/green
ink), classic `#228800` button pair, fine-border cards, captured grounds
(`#f8f8f8` alt, `#eeffee` setup tint, `#012906` pricing hero), 1158px
container, offer strip on all interior pages, classic footer (green
Altform column heads). Captured cinematics reproduced CSS-first
(entrance reveals; pos-systems controlled-scroll as sticky stage media;
restaurant carousels as fine-border card scroll-snap; full-page image
stage restored). Composition deltas vs the original brief are recorded
in the proposed file's provenance (`mediaGapfill`, `sequenceNote`).
Audit fixes retained: F-003/004/005/007/008/009/012 + anchor prices.
