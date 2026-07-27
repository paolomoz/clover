<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-07-24T09:05:00Z
  page:             pos-solutions__restaurant
  pageUrl:          https://www.clover.com/pos-solutions/restaurant
  againstDirection: stardust/direction.md (Active 2026-07-23T08:20:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/pos-solutions__restaurant.json
    - stardust/current/_brand-extraction.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
    - stardust/audit/clover-com/audit.json
  stardustVersion:  0.10.0

  capturedSourceLineage:
    - section: header
      lineage: "site-wide system-component (kind=header), new-generation tokens per audit F-002; commercial pair per approved home deployment (F-008)"
    - section: hero
      lineage: "captured photo hero (restaurant-hero-desktop-1440x520 chef photo, white display text overlay, formula-black — the page's hero is ALREADY new-gen) + H1 'You bring the flavor, Clover powers the pay' + heroLede + CTAs 'Get started with Clover' -> /build-your-own?step=BUSINESS_OFFERING + 'Contact sales' -> sales.clover.com/connect"
    - section: ops-carousel
      lineage: "captured Carousel ('Manage it all from one system built for restaurants' + 3 slides: Take and modify orders / Fire orders to the kitchen / Accept payments, body[1..3] + carousel_1 image); per-slide treatment per approved home carousel precedent"
    - section: front-to-back
      lineage: "captured trio of TextMediaModules under 'Everything your restaurant needs in one place': From the restaurant floor… (front-of-house webp, body[1]) / To the kitchen… (to-the-kitchen png, body[2]) / And everything in-between (tablet back-office png, body[3])"
    - section: online-ordering
      lineage: "captured split ('Online ordering made easy with eCommerce solutions' + body[4] + delivery-icons image + CTA Online ordering -> /pos-systems/online-ordering)"
    - section: kiosk
      lineage: "captured section ('Meet the future of restaurant ordering' + body[5] + Restaurant_video_thumbnail image + kiosk-qsr image + 3 features: Grow your average ticket value / Streamline operations / Integrated workflow, body[8]/[11]/[14])"
    - section: tools
      lineage: "captured device carousel ('Customize your restaurant tools' + 3 device blurbs body[15..17]: mobile POS / handheld Flex / Kitchen Display System)"
    - section: segment-cards
      lineage: "captured 2-card CardModule ('Take your restaurant to the next level with Clover': Full-service restaurant -> /pos-solutions/full-service-restaurant + body[18], Quick-service restaurant -> /pos-solutions/quick-service-restaurant + body[19], card bg image restaurant-all-in-one-kitchen)"
    - section: device-band
      lineage: "captured CTA band ('Want to purchase a device with Clover?' + body[20] + Contact sales + Solo/Mini/Flex image) — identical component to approved pricing/pos-systems deployment"
    - section: footer
      lineage: "site-wide system-component (kind=footer), carried per approved home deployment"

  antiTemplatePass:
    - pattern: "hero with photo + overlay text"
      defaultReflex: "dark-gradient-scrim centered hero"
      alternatives: ["captured left-aligned white display text over chef photo with luminance-matched scrim block (Poster Rule)", "split photo hero"]
      picked: "captured composition + opaque-scrim treatment per the Poster Rule (F-009 applied to photo, ≥4.5:1 in all states)"
      rationale: "the captured hero is already the new-gen signature composition; only the contrast hygiene is added (audit-authorized)."
    - pattern: "3-slide ops carousel"
      defaultReflex: "JS carousel with chevrons (captured)"
      alternatives: ["CSS scroll-snap carousel with anchor chevrons (approved home treatment)", "static 3-up grid"]
      picked: "CSS scroll-snap carousel, full-bleed per-slide media, per approved home precedent"
      rationale: "carousel IS the captured shape; home approval established the JS-free treatment site-wide."
    - pattern: "alternating text/media trio"
      defaultReflex: "uniform 50/50 splits"
      alternatives: ["captured alternating asymmetric splits under one H2 intro", "vertical narrative with sticky media"]
      picked: "captured alternating splits under the 'Everything your restaurant needs in one place' intro"
      rationale: "captured sequence is a narrative (floor → kitchen → in-between); verbatim carries it."
    - pattern: "2-card segment router"
      defaultReflex: "icon cards"
      alternatives: ["captured photo-backed cards (restaurant-all-in-one-kitchen bg)", "typed ledger rows"]
      picked: "captured 2 photo-backed cards with H3s + captured hrefs"
      rationale: "captured conversion mechanism (audience-routing iaPriority, locked)."

  substrateTransitions:
    default: "counter-white (#ffffff)"
    exceptions:
      - { substrate: "countertop (#ededed)", sections: ["device-band"], purpose: "captured alt-ground CTA band (captured #f8f8f8 maps to the target's single alt ground)" }
      - { substrate: "forest (#004400)", sections: ["kiosk"], purpose: "captured dark-text-on-tint kiosk moment promoted to the brand's captured forest block rhythm (the new-gen dark-section convention from home/pricing), keeping the kiosk imagery luminous" }

  voiceClassification:
    - { section: header, classification: "captured-verbatim + direction-authorized consolidation (commercial pair, F-008)" }
    - { section: hero, classification: "captured-verbatim", copy: "H1 'You bring the flavor, Clover powers the pay' + lede + 'Get started with Clover' + 'Contact sales'" }
    - { section: ops-carousel, classification: "captured-verbatim", copy: "H2 + 3 slide titles (h4->h3 per F-007) + body[1..3]" }
    - { section: front-to-back, classification: "captured-verbatim", copy: "H2 intro + 3 split H3s (captured h2s demoted under the intro H2 per F-007 single-hierarchy) + bodies" }
    - { section: online-ordering, classification: "captured-verbatim", copy: "H2 + body[4]" }
    - { section: kiosk, classification: "captured-verbatim", copy: "H2 + body[5] + 3 feature titles + bodies [8]/[11]/[14] (captured duplicate label pairs deduplicated — presentation artifact of the captured tab widget)" }
    - { section: tools, classification: "captured-verbatim", copy: "H2 + 3 device blurbs body[15..17]" }
    - { section: segment-cards, classification: "captured-verbatim", copy: "H2 + 2 card H3s + bodies + captured link labels" }
    - { section: device-band, classification: "captured-verbatim" }
    - { section: footer, classification: "captured-verbatim (deployment per approved home)" }
    - { section: "head metadata", classification: "direction-authorized rewrite", source: "title appended '| Clover' (F-005); OG set + Organization/WebSite JSON-LD (F-004)" }

  signatureElements:
    - { kind: "photo-hero with white display overlay", capturedSource: "pos-solutions__restaurant.json perSectionStyle[hero] (formula-black white text over restaurant-hero-desktop-1440x520)", mechanism: "captured photo as hero ground + opaque luminance-matched scrim panel behind the text region", fallback: "scrim is static CSS — identical in reduced-motion / no-JS states" }
-->
---
slug: pos-solutions__restaurant
url: https://www.clover.com/pos-solutions/restaurant
register: brand
surprise: low
dominantDimension: decade/2025-now-consolidation
---

# Page shape: pos-solutions/restaurant

Variant A under `ia-fidelity: verbatim`, Mode A. The captured restaurant
solution page — its hero is already new-generation; the interior modules
re-render from the classic template into the target system (F-002).

## Sections (in render order)

1. **header** — same deployment as approved home (sticky, white, nav +
   commercial pair).
2. **hero** — captured chef photo as ground (1440×520 crop), left-aligned
   display H1 "You bring the flavor, Clover powers the pay" (Formula
   Condensed, uppercase) on an opaque scrim panel (Poster Rule ≥4.5:1) +
   captured lede + dual CTA (primary "Get started with Clover", secondary
   "Contact sales").
3. **ops-carousel** — H2 "Manage it all from one system built for
   restaurants"; 3 slides (Take and modify orders / Fire orders to the
   kitchen / Accept payments) as CSS scroll-snap carousel with full-bleed
   slide media (carousel_1 image on slide 1; slides 2–3 text-led on white
   cards), chevrons as in-page anchors. H3 slide titles (F-007).
4. **front-to-back** — H2 "Everything your restaurant needs in one place"
   as intro; three alternating asymmetric splits, H3s: "From the restaurant
   floor…" / "To the kitchen…" / "And everything in‑between" with captured
   imagery per lineage.
5. **online-ordering** — split; H2 + captured body + delivery-app icons
   image (Uber Eats/Google/etc., captured) + CTA "Online ordering".
6. **kiosk** — forest ground; H2 "Meet the future of restaurant ordering" +
   captured intro + kiosk image (kiosk-qsr webp) + captured video-thumbnail
   image as secondary media; 3 features as H3 + body (Grow your average
   ticket value / Streamline operations / Integrated workflow). White text
   on forest (11.5:1); lime accents per On-Dark button spec if a CTA
   appears (none captured — no CTA added).
7. **tools** — H2 "Customize your restaurant tools"; 3 device cards
   (mobile POS / handheld Flex / Kitchen Display System) with captured
   blurbs; text-led cards (no captured per-card images).
8. **segment-cards** — H2 "Take your restaurant to the next level with
   Clover"; 2 photo-backed cards (H3s): Full‑service restaurant /
   Quick‑service restaurant → captured hrefs, captured card copy +
   captured link labels ("Full‑service restaurants" / "Quick‑service
   restaurants").
9. **device-band** — countertop ground; identical deployment to
   pricing/pos-systems.
10. **footer** — per approved home deployment.

## Layout strategy

- Density: balanced (64px); container 1280px; new-gen tokens only (F-002).
- Hero image height: captured 520px band at desktop, min 420px mobile crop.
- CSS `view()` reveals per approved home; reduced-motion disables; no JS.

## Key states

- Carousel: scroll-snap; all slides in DOM, keyboard-scrollable region with
  `tabindex="0"` and `aria-label`.
- No forms, no dynamic data. No placeholders expected.

## Interaction model

- Hero CTAs → captured hrefs.
- Online ordering → `/pos-systems/online-ordering`; segment cards →
  captured `/pos-solutions/*` hrefs; Contact sales → captured sales URL.

## Data attributes

- `header[data-section="header"][data-intent="navigate + commercial pair"][data-layout="full-width"][data-canon]`
- `section[data-section="hero"][data-intent="value proposition"][data-layout="edge-to-edge"]`
- `section[data-section="ops-carousel"][data-intent="value proposition"][data-layout="carousel"][data-items="3"][data-interactive="carousel"]`
- `section[data-section="front-to-back"][data-intent="value proposition"][data-layout="split-media"][data-items="3"]`
- `section[data-section="online-ordering"][data-intent="value proposition"][data-layout="split-media"]`
- `section[data-section="kiosk"][data-intent="value proposition"][data-layout="split-media"][data-items="3"]`
- `section[data-section="tools"][data-intent="value proposition"][data-layout="grid"][data-items="3"]`
- `section[data-section="segment-cards"][data-intent="drive action + self-qualification"][data-layout="grid"][data-items="2"]`
- `section[data-section="device-band"][data-intent="drive action"][data-layout="split-media"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="mega"][data-canon]`
- `body[data-template="program"]`

## Unsourced content (placeholder list)

(none) — all copy and imagery captured.

## Open questions for craft

- The kiosk section's captured video thumbnail has no captured video URL —
  render as a static image (no fake play button; a play affordance without
  a target is a dark pattern).
- Slides 2–3 of the ops-carousel have no captured per-slide imagery — keep
  them type-led on white cards rather than reusing unrelated photos.

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
