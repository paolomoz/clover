<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-07-23T10:20:00Z
  page:             pricing
  pageUrl:          https://www.clover.com/pricing
  againstDirection: stardust/direction.md (Active 2026-07-23T08:20:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/pricing.json
    - stardust/current/_brand-extraction.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
    - stardust/prototypes/pricing-improvements.md
  stardustVersion:  0.10.0

  capturedSourceLineage:
    - section: offer-strip
      lineage: "site-wide system-component (carried from _brand-extraction.json#systemComponents[kind=cross-promo] — 'ONLINE ONLY OFFER: Get $450 statement credit when you buy Station, Mini or Flex*'); adjacent key-terms line is direction-authorized (improvements #4/F-012), phrased from the captured footer legalese ('Requires a 3-year contract', 'subject to approval, including credit approval')"
    - section: header
      lineage: "site-wide system-component (kind=header), new-generation tokens per improvements #2; commercial pair per home precedent (direction-authorized)"
    - section: hero
      lineage: "captured hero (pricing.json headings[0] H1 + headings[1] rate line + 'Prices shown are only available on Clover.com.'); forest ground is the captured hero ground"
    - section: segment-router
      lineage: "captured 6-card business-type router (pricing.json ctas: Full service dining / Quick-service restaurant / Retail shops / Professional services / Personal services / Home & field services with /pricing/* hrefs); anchor-price slots are direction-authorized additions (improvements #1) sourced live at render"
    - section: consultation
      lineage: "captured section ('Let's work together to find the right system for your business' + body + 'Call now (844) 291-1950' + Schedule a call -> /contact/connect-to-sales + Women-at-counter photo); MOVED above the tools cards per improvements #1 (direction-authorized sequence exception)"
    - section: built-in-tools
      lineage: "captured 3-card section ('Every Clover system has business built-in tools': Get paid faster/Payments, Run your business/Tracking & reporting, Engage your customers/Customer loyalty; Clover Payments 01-03 local images)"
    - section: faq
      lineage: "captured FAQ (pricing.json qa[] — all 12 q/a pairs with full captured answers; 'View More FAQs' becomes unnecessary since all 12 render)"
    - section: device-band
      lineage: "captured CTA band ('Want to purchase a device with Clover?' + body + Contact sales + 'Solo, Mini and Flex devices' 1440w local image)"
    - section: footer
      lineage: "site-wide system-component (kind=footer), carried per approved home deployment (2 rows × 4, legal at 76em per user override)"

  antiTemplatePass:
    - pattern: "6-card segment router"
      defaultReflex: "identical icon-card grid"
      alternatives: ["typed ledger list of segments", "2-column split router with featured segment"]
      picked: "captured 6-card router at 3×2, upgraded with per-card anchor-price line"
      rationale: "the router IS the captured conversion mechanism (locked commercial-conversion iaPriority); the anchor price per card converts it from a self-classification gate into an answer (audit F-001) — the change is additive content, not structure."
    - pattern: "FAQ accordion"
      defaultReflex: "3 visible + view-more gate (captured)"
      alternatives: ["render all 12 as <details> accordion", "two-column static Q/A list"]
      picked: "all 12 as native <details> accordion, first item open"
      rationale: "the captured 'View More FAQs' gate hid 9 of 12 answers behind JS; native details renders all content crawlable + JS-free and feeds the FAQPage JSON-LD (improvements #3). Content beats identical — presentation honest."
    - pattern: "hero + rate teaser"
      defaultReflex: "type-only hero"
      alternatives: ["forest color-block hero (captured)", "photo hero"]
      picked: "captured forest color-block hero, new-gen display type"
      rationale: "captured ground carried verbatim; only the type system upgrades per improvements #2."
    - pattern: "cta band with device photo"
      defaultReflex: "generic gradient CTA band"
      alternatives: ["captured device-photo band on countertop ground", "forest band with lime CTA"]
      picked: "captured device-photo band"
      rationale: "captured composition and image reused at captured semantic position (image-reuse contract)."

  substrateTransitions:
    default: "counter-white (#ffffff)"
    exceptions:
      - { substrate: "forest (#004400)", sections: ["hero"], purpose: "captured hero ground (classic page's dark-green hero carried into the new-gen system)" }
      - { substrate: "fresh-lime (#b6fb6f)", sections: ["offer-strip"], purpose: "promo utility strip in the captured lime family (live strip is green-family; lime is the new-gen token)" }

  voiceClassification:
    - { section: offer-strip, classification: "captured-verbatim + direction-authorized key-terms line", copy: "'ONLINE ONLY OFFER: Get $450 statement credit when you buy Station, Mini or Flex*' + 'Key terms: subject to credit approval; requires a 3-year contract*' (phrased from captured legal)" }
    - { section: header, classification: "captured-verbatim + direction-authorized consolidation (commercial pair)" }
    - { section: hero, classification: "captured-verbatim", copy: "H1 'Find the right solution to power your business' + 'Pay as little as 2.3% + 10¢ per transaction' + 'Prices shown are only available on Clover.com.'" }
    - { section: segment-router, classification: "captured-verbatim labels + live-sourced anchor prices (direction-authorized; placeholder signature when unavailable)" }
    - { section: consultation, classification: "captured-verbatim", copy: "heading + body + 'We're here to help—always.' + 'Call now (844) 291-1950' + 'Schedule a call'" }
    - { section: built-in-tools, classification: "captured-verbatim", copy: "h2 + 3 cards + link labels (Payments / Tracking & reporting / Customer loyalty)" }
    - { section: faq, classification: "captured-verbatim", copy: "all 12 q/a pairs from pricing.json qa[]" }
    - { section: device-band, classification: "captured-verbatim" }
    - { section: footer, classification: "captured-verbatim (deployment per approved home)" }
    - { section: "head metadata", classification: "direction-authorized rewrite", source: "title kept ('Clover POS System Pricing and Cost' — already intent-true); OG set + FAQPage/Organization/WebSite JSON-LD per improvements #3" }

  signatureElements: []
  # no §8b trigger on this page: captured pricing has no hero video/canvas/motion signature.
  # Site-wide consistency: the CSS scroll-reveal system from the approved home carries over
  # (same view() timeline rules) — recorded here as chrome consistency, not signature.
-->
---
slug: pricing
url: https://www.clover.com/pricing
register: brand
surprise: low
dominantDimension: decade/2025-now-consolidation
---

# Page shape: pricing

Variant A under `ia-fidelity: verbatim`, Mode A. Captured sections and
content beats carried verbatim, re-rendered in the new-generation
system (improvements #2). One authorized sequence exception: the
consultation block moves above the tools cards (improvements #1).

## Sections (in render order)

1. **offer-strip** — lime utility strip: captured offer line verbatim
   + the direction-authorized key-terms summary ("subject to credit
   approval; requires a 3-year contract*") at `--body-sm`, adjacent —
   not buried in the footer alone (F-012 adjacency).
2. **header** — new-gen system, solid white (no video on this page),
   sticky; nav + utility + commercial pair (Shop + Contact sales),
   full wordmark. Same deployment as approved home.
3. **hero** — forest `#004400` ground (captured), display H1
   "Find the right solution to power your business" (Formula
   Condensed, uppercase, 2 lines max at 1440), the rate line as a
   styled `<p>` (NOT an h4 — fixes the captured h1→h4 skip):
   "Pay as little as 2.3% + 10¢ per transaction" + italic
   "Prices shown are only available on Clover.com."
4. **segment-router** — 6 captured cards, 3×2 grid (2×3 at tablet,
   1-col mobile), each: captured icon-ish label + captured href +
   **anchor-price line** ("from $X/mo + hardware") **live-sourced at
   render** from the captured /pricing/* subpage targets via
   Playwright; any segment whose price can't be sourced renders the
   mandatory PLACEHOLDER signature (type: price) instead — never
   invented.
5. **consultation** (moved up, improvements #1) — split: copy +
   phone ("Call now (844) 291-1950" as tel: link) + "Schedule a
   call" CTA left, captured photo right.
6. **built-in-tools** — H2 + 3 cards (H3s — fixes captured h2-card
   levels): Get paid faster / Run your business / Engage your
   customers, captured images + link labels.
7. **faq** — H2 "Frequently Asked Questions"; all 12 captured q/a as
   native `<details>` (summary = H3-styled question), first open.
   Feeds FAQPage JSON-LD (improvements #3).
8. **device-band** — countertop ground, H2 "Want to purchase a
   device with Clover?", captured body + Contact sales CTA +
   captured Solo/Mini/Flex device image.
9. **footer** — per approved home deployment (2 rows × 4 columns,
   legal verbatim at 76em, ≥1.5 line-height).

## Layout strategy

- Density: balanced (64px sections); container 1280px; new-gen tokens
  throughout — no Altform, no #228800 button fills, no 1158px
  container (improvements #2).
- Cinematic consistency: the approved home's CSS `view()` reveal
  rules apply to section heads/cards; `prefers-reduced-motion`
  disables; no JS.

## Key states

- FAQ: `<details>`-native open/close; all answers in DOM (crawlable,
  JS-free).
- Anchor prices: live value | placeholder signature. No third state.

## Interaction model

- Router cards → captured `/pricing/<segment>` hrefs.
- Phone → `tel:+18442911950`; Schedule a call →
  `/contact/connect-to-sales` (captured).
- Contact sales → `https://sales.clover.com/connect` (captured).

## Data attributes

- `header[data-section="header"][data-intent="navigate + commercial pair"][data-layout="full-width"][data-canon]`
- `section[data-section="offer-strip"][data-intent="cross-promo"][data-layout="edge-to-edge"]`
- `section[data-section="hero"][data-intent="value proposition"][data-layout="edge-to-edge"]`
- `section[data-section="segment-router"][data-intent="drive action + self-qualification"][data-layout="grid"][data-items="6"]`
- `section[data-section="consultation"][data-intent="assisted-sales reassurance"][data-layout="split-media"]`
- `section[data-section="built-in-tools"][data-intent="value proposition"][data-layout="grid"][data-items="3"]`
- `section[data-section="faq"][data-intent="answer objections"][data-layout="stack"][data-items="12"][data-interactive="accordion"]`
- `section[data-section="device-band"][data-intent="drive action"][data-layout="split-media"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="mega"][data-canon]`
- `body[data-template="landing"]`

## Unsourced content (placeholder list)

- `section[data-section="segment-router"] .anchor-price` × up to 6 —
  type: price; live-sourced at render from the captured /pricing/*
  targets; each failure renders the PLACEHOLDER signature and lands
  in `_provenance.unsourcedContent[]`. Nothing else on the page is
  unsourced.

## Open questions for craft

- Anchor-price phrasing: prefer the subpage's own wording (e.g.
  "from $X.XX/mo") over any normalized format — reuse the scraped
  string verbatim with a `per month` qualifier only when the source
  states it.
- Router card icons: the captured cards use line icons (icon font on
  the live classic page); render with inline SVG equivalents only if
  trivially faithful, otherwise omit icons (labels carry the cards).

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
