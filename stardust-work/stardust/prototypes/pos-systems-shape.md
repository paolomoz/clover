<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-07-24T09:00:00Z
  page:             pos-systems
  pageUrl:          https://www.clover.com/pos-systems
  againstDirection: stardust/direction.md (Active 2026-07-23T08:20:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/pos-systems.json
    - stardust/current/_brand-extraction.json
    - stardust/current/_accordion-content.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
    - stardust/audit/clover-com/audit.json
  stardustVersion:  0.10.0

  capturedSourceLineage:
    - section: header
      lineage: "site-wide system-component (kind=header), new-generation tokens per audit F-002; commercial pair (Shop + Contact sales) per approved home deployment (F-008)"
    - section: hero
      lineage: "captured hero (pos-systems.json heroHeadline H1 'Win the daily race against the clock with a Clover POS System.' + heroLede + CTAs Get started -> /build-your-own?step=BUSINESS_OFFERING, Shop now -> /shop + Station-Duo/Mini product photo clover-duo-printer-mini3-facing-customer)"
    - section: quick-benefits
      lineage: "captured 4-tile GridModule (Packed with power / Any time anywhere / Completely customizable / Real-time reporting + captured icons + body[1..4])"
    - section: steps
      lineage: "captured ControlledScrollModule ('A POS that can manage all your moving parts' + Start with software / Hand-pick your hardware / Add accessories and apps from body[5..7] + mini-3-solo-flex-3 image)"
    - section: feature-splits
      lineage: "captured alternating TextMediaModules + GridModules: Customize your system (body[8..9], clover-mini-total-screen), Process more payments (body[8..10]), Optimize ordering (body[10..14], pos-clover-station-manage-orders), Expand your audience (body[15..18], clover-mini-customer-profile-screen), Teaming made simple (body[19..21], flex-3-top-Employees-Screen) — copy assignments per pos-systems.json section order"
    - section: setup-support
      lineage: "captured section ('Faster, stress-free set-up – with a little help from our team' + body[22] concierge copy + features-woman-on-phone photo); captured pale-green tint #eeffee maps to countertop (target palette has no pale-green; Mode A pins)"
    - section: more-features
      lineage: "captured 4-tile GridModule ('More POS features, more for your business': gift cards / feedback / manage customers+employees / deals with captured icons)"
    - section: virtual-terminal
      lineage: "captured split ('Take payments anywhere, anytime with Virtual Terminal' + virtual-terminal-browser image + CTA Virtual Terminal -> /pos-systems/virtual-terminal)"
    - section: payment-options
      lineage: "captured section ('Get paid in more ways – 'cause we all like options.' + body[23..24] + Fiserv Learn more -> merchants.fiserv.com)"
    - section: apps
      lineage: "captured section ('Access to all kinds of apps...' + body[25] Yelp/Homebase/MailChimp/QuickBooks + CTA Apps -> /pos-systems/apps)"
    - section: peace-of-mind
      lineage: "captured 4-tile GridModule ('Peace of mind with your system': Free overnight shipping* / Quick and easy set up / Consistent rates / Help when you need it + body[26..29])"
    - section: faq
      lineage: "captured FAQ ('Got questions? We got answers.', accordion itemCount 10); Q/A content live-sourced 2026-07-24 into stardust/current/_accordion-content.json#pages.pos-systems (extract did not expand the accordion; live-sourcing follows the pricing anchor-price precedent — content verbatim from the same live page)"
    - section: device-band
      lineage: "captured CTA band ('Want to purchase a device with Clover?' + Contact sales -> sales.clover.com/connect + Solo/Mini/Flex 7040x1798 image) — identical component to the approved pricing device-band"
    - section: footer
      lineage: "site-wide system-component (kind=footer), carried per approved home deployment (2 rows x 4, legal at 76em per user override)"

  antiTemplatePass:
    - pattern: "4-up icon-tile grid (x3 occurrences)"
      defaultReflex: "identical centered icon-card grid"
      alternatives: ["typed ledger rows with hairline rules", "2x2 stat-tile treatment (ink cards per home vignette)"]
      picked: "captured 4-up tile rows, icons preserved, labels as non-heading strong text (quick-benefits) / H3s (more-features, peace-of-mind)"
      rationale: "the captured page uses this exact shape three times — it IS the page's rhythm; replacing it would be structural divergence under verbatim. Differentiation comes from the new-gen type system, not the grid."
    - pattern: "alternating text/media feature splits (x5)"
      defaultReflex: "same-width 50/50 splits all the way down"
      alternatives: ["7/5 asymmetric splits with alternating direction (captured)", "full-bleed media bands"]
      picked: "captured alternating splits, asymmetric, media side alternates per captured order"
      rationale: "captured composition carried verbatim; product-screen imagery reused at captured semantic positions (image-reuse contract)."
    - pattern: "FAQ accordion"
      defaultReflex: "3 visible + 'View More FAQs' JS gate (captured)"
      alternatives: ["all 10 as native <details>, first open", "two-column static Q/A"]
      picked: "all 10 as native <details> accordion, first open"
      rationale: "the captured gate hid 7 of 10 answers behind JS; native details renders all content crawlable + JS-free and feeds FAQPage JSON-LD (F-004 precedent from approved pricing)."
    - pattern: "3-step scroll module"
      defaultReflex: "JS scroll-jacked step reveal (captured ControlledScrollModule)"
      alternatives: ["static numbered 3-step split with single product image", "CSS scroll-driven step highlight"]
      picked: "static numbered 3-step split (01/02/03 in Formula Condensed) + captured product image"
      rationale: "content beats identical; drops the JS scroll-jack (audit F-003 TBT gate) while keeping the captured step sequence."
    - pattern: "device CTA band"
      defaultReflex: "generic gradient CTA band"
      alternatives: ["captured device-photo band on countertop ground", "forest band with lime CTA"]
      picked: "captured device-photo band on countertop (identical deployment to approved pricing)"
      rationale: "site-wide consistency with the two approved/prototyped pages."

  substrateTransitions:
    default: "counter-white (#ffffff)"
    exceptions:
      - { substrate: "countertop (#ededed)", sections: ["setup-support", "device-band"], purpose: "captured alt-ground moments (captured #eeffee tint and #f8f8f8 band both map to the target's single alt ground per Mode A palette pins)" }

  voiceClassification:
    - { section: header, classification: "captured-verbatim + direction-authorized consolidation (commercial pair, F-008)" }
    - { section: hero, classification: "captured-verbatim", copy: "H1 + lede + 'Get started' + 'Shop now'" }
    - { section: quick-benefits, classification: "captured-verbatim", copy: "4 tile labels + body[1..4]" }
    - { section: steps, classification: "captured-verbatim", copy: "H2 + 3 step titles/bodies (body[5..7])" }
    - { section: feature-splits, classification: "captured-verbatim", copy: "5 H2s + sub-feature titles/bodies from body[8..21]" }
    - { section: setup-support, classification: "captured-verbatim", copy: "H2 + body[22]" }
    - { section: more-features, classification: "captured-verbatim", copy: "H2 + 4 tiles" }
    - { section: virtual-terminal, classification: "captured-verbatim", copy: "H2 + body[23]" }
    - { section: payment-options, classification: "captured-verbatim", copy: "H2 + body[23..24]" }
    - { section: apps, classification: "captured-verbatim", copy: "H2 + body[25]" }
    - { section: peace-of-mind, classification: "captured-verbatim", copy: "H2 + 4 tiles + body[26..29]" }
    - { section: faq, classification: "captured-verbatim (live-sourced 2026-07-24, _accordion-content.json)", copy: "10 Q/A pairs incl. inline links" }
    - { section: device-band, classification: "captured-verbatim" }
    - { section: footer, classification: "captured-verbatim (deployment per approved home)" }
    - { section: "head metadata", classification: "direction-authorized rewrite", source: "title appended '| Clover' (F-005 intent-true); OG set + Organization/WebSite/FAQPage JSON-LD (F-004)" }

  signatureElements: []
  # no §8b trigger: captured pos-systems has no video/canvas/motion hero.
  # Site-wide CSS view() scroll-reveal from approved home carries over as chrome consistency.
-->
---
slug: pos-systems
url: https://www.clover.com/pos-systems
register: brand
surprise: low
dominantDimension: decade/2025-now-consolidation
---

# Page shape: pos-systems

Variant A under `ia-fidelity: verbatim`, Mode A. The captured product-pillar
page carried beat-for-beat, re-rendered from the classic template (Altform,
#228800 fills) into the new-generation system (audit F-002). FAQ content
gap-filled by live-sourcing (see lineage).

## Sections (in render order)

1. **header** — new-gen system, solid white, sticky; vertical-market nav +
   utility + commercial pair (Shop + Contact sales). Same deployment as
   approved home.
2. **hero** — white ground, display H1 (Formula Condensed, uppercase, ≤3
   lines at 1440) "Win the daily race against the clock with a Clover POS
   System." + captured lede paragraph + dual CTA (primary "Get started",
   secondary "Shop now") + Station Duo/Mini product photo right (7/5 split).
3. **quick-benefits** — 4-up tile row: captured icons + labels (Packed with
   power / Any time anywhere / Completely customizable / Real-time
   reporting) as **strong labels, not headings** (fixes captured h1→h5 skip,
   F-007) + captured body copy.
4. **steps** — H2 "A POS that can manage all your moving parts"; numbered
   3-step list (Start with software / Hand-pick your hardware / Add
   accessories and apps) with Formula Condensed 01/02/03 numerals + captured
   devices image. Static (drops captured JS scroll-jack).
5. **feature-splits** — five H2 sections as alternating asymmetric splits
   with captured product-screen imagery: Customize your system / Process
   more payments / Optimize ordering / Expand your audience / Teaming made
   simple. Sub-features render as Title-level (Graphik 500) run-in heads +
   body, NOT h5s (F-007).
6. **setup-support** — countertop ground; H2 "Faster, stress-free set-up –
   with a little help from our team" + concierge copy + captured photo.
7. **more-features** — H2 "More POS features, more for your business" +
   4-up tiles (H3s): gift cards / feedback / customers & employees / deals.
8. **virtual-terminal** — split; H2 + captured browser screenshot + CTA
   "Virtual Terminal".
9. **payment-options** — H2 "Get paid in more ways ‑ 'cause we all like
   options." + captured body + Fiserv "Learn more" link.
10. **apps** — H2 "Access to all kinds of apps to help you do things
    better" + captured Yelp/Homebase/MailChimp/QuickBooks copy + CTA "Apps".
11. **peace-of-mind** — H2 "Peace of mind with your system" + 4-up tiles
    (H3s) with captured icons + body; keep the captured asterisk footnote
    "*Online orders only." adjacent to "Free overnight shipping*" (F-012
    adjacency).
12. **faq** — H2 "Got questions? We got answers."; all 10 live-sourced Q/A
    as native `<details>` (summary = H3-styled question), first open; inline
    answer links preserved verbatim. Feeds FAQPage JSON-LD.
13. **device-band** — countertop ground; H2 "Want to purchase a device with
    Clover?" + Contact sales CTA + captured Solo/Mini/Flex device image
    (identical deployment to pricing).
14. **footer** — per approved home deployment (2 rows × 4 columns, legal at
    76em, ≥1.5 line-height).

## Layout strategy

- Density: balanced (64px sections); container 1280px; new-gen tokens only —
  no Altform, no #228800 fills, no 1158px container (F-002).
- Cinematic consistency: the approved home's CSS `view()` reveal rules on
  section heads/cards; `prefers-reduced-motion` disables; no JS.

## Key states

- FAQ: `<details>`-native; all 10 answers in DOM (crawlable, JS-free).
- No forms, no dynamic data. No placeholders expected.

## Interaction model

- Hero: Get started → `/build-your-own?step=BUSINESS_OFFERING`; Shop now →
  `/shop` (captured).
- Feature CTAs → captured `/pos-systems/*` hrefs; Fiserv → captured external
  URL (`rel="noopener"`).
- FAQ inline links → captured hrefs (relative kept relative).
- Contact sales → `https://sales.clover.com/connect` (captured).

## Data attributes

- `header[data-section="header"][data-intent="navigate + commercial pair"][data-layout="full-width"][data-canon]`
- `section[data-section="hero"][data-intent="value proposition"][data-layout="split-media"]`
- `section[data-section="quick-benefits"][data-intent="value proposition"][data-layout="grid"][data-items="4"]`
- `section[data-section="steps"][data-intent="how it works"][data-layout="split-media"][data-items="3"]`
- `section[data-section="feature-splits"][data-intent="value proposition"][data-layout="split-media"]` (× 5, each with its own `data-section` suffix: `feature-customize`, `feature-payments`, `feature-ordering`, `feature-audience`, `feature-teams`)
- `section[data-section="setup-support"][data-intent="assisted-sales reassurance"][data-layout="split-media"]`
- `section[data-section="more-features"][data-intent="value proposition"][data-layout="grid"][data-items="4"]`
- `section[data-section="virtual-terminal"][data-intent="value proposition"][data-layout="split-media"]`
- `section[data-section="payment-options"][data-intent="value proposition"][data-layout="stack"]`
- `section[data-section="apps"][data-intent="value proposition"][data-layout="split-media"]`
- `section[data-section="peace-of-mind"][data-intent="answer objections"][data-layout="grid"][data-items="4"]`
- `section[data-section="faq"][data-intent="answer objections"][data-layout="stack"][data-items="10"][data-interactive="accordion"]`
- `section[data-section="device-band"][data-intent="drive action"][data-layout="split-media"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="mega"][data-canon]`
- `body[data-template="program"]`

## Unsourced content (placeholder list)

(none) — all copy captured or live-sourced; FAQ answers trace to
`stardust/current/_accordion-content.json#pages.pos-systems` (playwright,
2026-07-24).

## Open questions for craft

- The five feature-split H2s each have 2–4 run-in sub-features whose copy
  concatenates title+body in the captured body[] (e.g. "Get paid in all
  kinds of waysTap, dip, swipe…"). Split at the camel-boundary exactly as
  captured; do not rephrase.
- Icon tiles: captured SVG icons mirrored locally 2026-07-24 into
  `stardust/current/assets/media/` (see `_icon-mirror-map.json`) — render
  tiles with the captured icons via relative paths; never hotlink.

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
