<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-07-23T08:40:00Z
  page:             home
  pageUrl:          https://www.clover.com/
  againstDirection: stardust/direction.md (Active 2026-07-23T08:20:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/home.json
    - stardust/current/_brand-extraction.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
    - stardust/prototypes/home-improvements.md
  stardustVersion:  0.10.0

  capturedSourceLineage:
    - section: header
      lineage: "site-wide system-component (carried from _brand-extraction.json#systemComponents[kind=header]); commercial-pair consolidation per home-improvements.md #4 (direction-authorized)"
    - section: hero
      lineage: "captured hero (pages/home.json#landmarks[main].children[0] hero region; heroHeadline/heroLede; media.videos[0] background video)"
    - section: segment-band
      lineage: "captured sticky vertical router (pages/home.json innerText 'CUSTOMIZED BY Food & beverage / Retail / Services' + 'SHOP ONE-ON-ONE WITH OUR SPECIALISTS' callout; audience-routing IA priority)"
    - section: flow-cards
      lineage: "captured feature card row (h2 'Keep things flowing…' + 4× h4 cards, media.images CardRow1 01-04 + product-UI vignette video media.videos[1])"
    - section: hardware
      lineage: "captured hardware section (heading 'Restaurant-grade hardware that hustles as hard as you do' over media.videos[2]; 'Mini' device rail; CTAs Shop devices / Explore Mini)"
    - section: stat-band
      lineage: "captured signature stat band (h2 'Run the numbers'; 4M+ / #1 / $337B+ with captions — _brand-extraction.json systemComponent-adjacent signature; DESIGN.json systemComponentRoles.stat-band)"
    - section: testimonial
      lineage: "captured quote ('I consider clover our third arm … allowing us to focus on business not paperwork' — Robert Cucco, Table 87, pages/home.json landmark innerText) over video ground"
    - section: online-orders
      lineage: "captured card row (h2 'All of your online orders, in one place' + 4× h4 cards, media.images CardRow2 01-04, CTA Explore Online Ordering)"
    - section: footer
      lineage: "site-wide system-component (carried from _brand-extraction.json#systemComponents[kind=footer]); legal-type fix per home-improvements.md #6 (direction-authorized)"

  antiTemplatePass:
    - pattern: "full-bleed video hero + dual CTA"
      defaultReflex: "centered-stack hero with two-button CTA pair"
      alternatives: ["split 5/3 hero with static photo", "type-led hero, video demoted to section 2"]
      picked: "full-bleed video hero, left/center headline, captured CTA pair"
      rationale: "the video hero IS the captured signature (§8b — voice.heroMedium non-null); flattening or demoting it is a render-refusal condition. Composition preserved verbatim per ia-fidelity."
    - pattern: "4-up image-card grid (flow-cards, online-orders)"
      defaultReflex: "5-up image-card grid as category nav / identical card grid"
      alternatives: ["typed ledger list", "2×2 editorial grid with one expanded card"]
      picked: "captured 4-up product-UI vignette rows"
      rationale: "the vignettes are real product-UI compositions (shift clock, Order #568, loyalty balance 2,817) — the brand's hardest-won asset per the audit's strengths; the 4-up rhythm is the captured shape and content beats are verbatim-locked."
    - pattern: "stat-callout bar"
      defaultReflex: "3-4 large numbers as generic trust bar"
      alternatives: ["inline prose stats", "vertical stat column beside testimonial"]
      picked: "captured acid-lime stat band, full-bleed"
      rationale: "captured signature with real numbers — anti-toolbox hit justified in DESIGN.json divergence; §8b reproduction, not a reach."
    - pattern: "sticky segment router band"
      defaultReflex: "drop secondary sticky chrome for a cleaner scroll"
      alternatives: ["fold router into hero as tabs", "static (non-sticky) band"]
      picked: "captured sticky segment band"
      rationale: "audience-routing IA priority (locked, DESIGN.json iaPriorities) — the band is the captured deployment of that priority and the only home of 'Shop one-on-one with our specialists'."

  substrateTransitions:
    default: "counter-white (#ffffff)"
    exceptions:
      - { substrate: "fresh-lime (#b6fb6f)", sections: ["stat-band"], purpose: "captured signature stat band ground" }
      - { substrate: "dark video-poster ground (forest-family, opaque, luminance-matched)", sections: ["hero", "hardware", "testimonial"], purpose: "captured video grounds — one shared treatment implementing the Poster Rule (audit F-009)" }

  voiceClassification:
    - { section: header, classification: "captured-verbatim + direction-authorized consolidation", source: "nav labels/pages/home.json; commercial pair per improvements #4 — labels 'Shop' (captured 'Shop systems'/'Shop devices' family) and 'Contact sales' (captured verbatim)" }
    - { section: hero, classification: "captured-verbatim", copy: "'A Clover for every small business' / 'Do what you do better with the world's smartest POS system.' / CTAs 'Get Clover' + 'Contact sales'" }
    - { section: segment-band, classification: "captured-verbatim", copy: "'Customized by' + Food & beverage / Retail / Services + 'Shop one-on-one with our specialists'" }
    - { section: flow-cards, classification: "captured-verbatim", copy: "h2 + 4 card h3s + card bodies from pages/home.json" }
    - { section: hardware, classification: "captured-verbatim", copy: "'Restaurant-grade hardware that hustles as hard as you do' / 'Mini — A small, efficient system made for countertops.' / CTAs" }
    - { section: stat-band, classification: "captured-verbatim", copy: "'Run the numbers' + 4M+ Devices shipped / #1 POS provider / $337B+ Annualized processing volume + captions" }
    - { section: testimonial, classification: "captured-verbatim", copy: "quote + attribution Robert Cucco, Table 87" }
    - { section: online-orders, classification: "captured-verbatim", copy: "h2 + 4 card h3s + bodies + CTA 'Explore Online Ordering'" }
    - { section: footer, classification: "captured-verbatim", source: "8-column footer from _brand-extraction.json#systemComponents; legal text verbatim, re-set typographically per improvements #6" }
    - { section: "head metadata", classification: "direction-authorized rewrite", source: "title + OG + JSON-LD per improvements #5 / audit F-005 (home title currently mis-targets the F&B vertical)" }

  signatureElements:
    - { kind: "hero background video", capturedSource: "pages/home.json#media.videos[0] — videos.ctfassets.net/...Clover-Hero-Shoot-Fine-Dining...mp4, rect 1440×900 y0, autoplay/loop/muted", mechanism: "video-file (mp4), muted loop playsinline autoplay", fallback: "opaque forest-family poster ground + scrim ≥4.5:1 under headline; prefers-reduced-motion renders the poster state; <noscript>-safe (text never depends on JS)" }
    - { kind: "section ambient video (flow-cards vignette)", capturedSource: "pages/home.json#media.videos[1] (y1820, 1392w)", mechanism: "video-file (mp4), muted loop", fallback: "same Poster Rule treatment; static vignette card grid unaffected without JS" }
    - { kind: "section ambient video (hardware)", capturedSource: "pages/home.json#media.videos[2] (y3206, 1392w)", mechanism: "video-file (mp4), muted loop", fallback: "opaque dark poster + scrim; reduced-motion = poster state" }
-->
---
slug: home
url: https://www.clover.com/
register: brand
surprise: low
dominantDimension: decade/2025-now-consolidation
---

# Page shape: home

Variant A (single-variant run) under `ia-fidelity: verbatim`, Mode A.
Same nine sections, same order, same content beats as the captured
page. All six items from `home-improvements.md` applied. Surprise
budget `low`; signature preservation (three ambient videos) is
budget-exempt and mandatory.

## Sections (in render order)

1. **header** (system role: `header`) — sticky, counter-white ground
   (transparent-over-video variant on the hero, gaining a solid ground
   on scroll is NOT required — keep it simple: solid white header,
   full wordmark ≥32px). Vertical nav (Restaurants / Services /
   Retail / Healthcare / Products / Resources) + utility (Log In /
   Help Center / Pricing) + **the commercial pair**: "Shop" +
   "Contact sales" (improvements #4). `data-nav-collapse` applied at
   Phase 2.7 if the 360px audit demands it.
2. **hero** — full-bleed captured background video (§8b signature),
   opaque forest-family poster ground + scrim under the text
   (improvements #2). The page's **only H1**: "A Clover for every
   small business"; lede "Do what you do better with the world's
   smartest POS system."; CTA pair "Get Clover" (ink) + "Contact
   sales" (lime). Composition: centered display over video, as
   captured.
3. **segment-band** — sticky under header; "Customized by" +
   Food & beverage / Retail / Services pills + "Shop one-on-one with
   our specialists" callout. Audience-routing IA priority (locked).
4. **flow-cards** — H2 "Keep things flowing with the all-in-one
   restaurant POS" + 4 product-UI vignette cards (**H3** each — fixes
   the captured h2→h4 skip, improvements #3): See top-performing
   dishes / Manage staff, payroll, and scheduling / Keep online
   orders on one platform / Turn first-time guests into regulars.
   Captured CardRow1 images (local copies available). CTA "Explore
   Food & Beverage". Ambient vignette video with Poster Rule.
5. **hardware** — **H2** (demoted from captured second H1,
   improvements #3): "Restaurant-grade hardware that hustles as hard
   as you do" over captured video ground (Poster Rule). "Mini" device
   rail (H3 + caption "A small, efficient system made for
   countertops."), CTAs "Shop devices" + "Explore Mini".
6. **stat-band** — signature: fresh-lime ground, H2 "Run the
   numbers", three captured stats (4M+ Devices shipped / #1 POS
   provider / $337B+ Annualized processing volume) with captured
   captions. Ink on lime (17:1).
7. **testimonial** — captured quote as **`<blockquote>`** (not a
   heading — improvements #3): "I consider Clover our third arm …
   allowing us to focus on business not paperwork." — Robert Cucco,
   Table 87. Dark video ground with Poster Rule; display-size quote
   set in Formula Condensed with full scrim legibility.
8. **online-orders** — H2 "All of your online orders, in one place"
   + 4 vignette cards (H3s): Third-party integrations / Custom
   website / Hosted checkout / Pickup and delivery. Captured CardRow2
   images. CTA "Explore Online Ordering".
9. **footer** (system role: `footer`) — 8-column mega-footer carried
   verbatim (Take payments / Run your business / Sell more / Business
   types / Hardware devices / Help / About / Integrations),
   dark-green wordmark, social links. Legal text re-set at ≥1.5
   line-height, ≤75ch (improvements #6) — copy verbatim.

## Layout strategy

- Density: balanced — `--section-padding: 64px` (DESIGN.md
  `spacing.section`); hard floor honored.
- Container: 1280px (`--max-width`, new-generation value; recorded in
  DESIGN.json breakpoints note) — the captured new-template runs
  1280–1392px; 1280 is the captured mode's lower bound, no step-up
  invented.
- Cards: 4-up grid desktop → 2-up ≤1024px → 1-up ≤640px.
- Hero: full-viewport-height cap ~720px desktop; video absolutely
  positioned under a scrimmed content layer.

## Key states

- Default — described above.
- No-JS / reduced-motion / data-saver — every video section renders
  its opaque poster ground; text legibility identical (the scrim is
  CSS, not JS). No content is gated on JS (improvements #2; audit
  JS-dependent-hidden-state detector).

## Interaction model

- All CTAs link to captured hrefs (Get Clover →
  `/build-your-own?step=BUSINESS_OFFERING`, Contact sales →
  `https://sales.clover.com/connect`, Shop → `/shop`, Explore
  Food & Beverage → `/pos-solutions/food-beverage`, Explore Online
  Ordering → `/pos-solutions/online-ordering`).
- Segment pills: links (`/m/food-beverage` captured), no JS tabs.
- Videos: `autoplay muted loop playsinline`; no controls; decorative
  (`aria-hidden="true"`, empty alt equivalents).

## Data attributes

- `header[data-section="header"][data-intent="navigate + commercial pair"][data-layout="full-width"][data-canon]`
- `section[data-section="hero"][data-intent="emotional hook + primary action"][data-layout="full-bleed"][data-media="video"]`
- `section[data-section="segment-band"][data-intent="audience routing"][data-layout="edge-to-edge"][data-items="3"]`
- `section[data-section="flow-cards"][data-intent="value proposition"][data-layout="grid"][data-items="4"][data-media="video"]`
- `section[data-section="hardware"][data-intent="product showcase"][data-layout="full-bleed"][data-media="video"]`
- `section[data-section="stat-band"][data-intent="build trust"][data-layout="edge-to-edge"][data-items="3"][data-module="stat-band"]`
- `section[data-section="testimonial"][data-intent="social proof"][data-layout="full-bleed"][data-media="video"]`
- `section[data-section="online-orders"][data-intent="value proposition"][data-layout="grid"][data-items="4"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="mega"][data-canon]`
- `body[data-template="landing"]`

## Unsourced content (placeholder list)

(none) — every literal value on the page traces to
`current/pages/home.json` or `_brand-extraction.json`; head metadata
rewrites are direction-authorized (improvements #5). Captured images
have local copies under `stardust/current/assets/media/`; videos
reference their captured Contentful URLs.

## Open questions for craft

- Hero headline color over the scrim: counter-white (as captured) —
  scrim must bring the region to ≥4.5:1; verify against the poster
  ground, not the video frame.
- Card image treatment: captured vignettes are already brand-colored
  compositions — render untreated at 4:3-ish captured aspect.
