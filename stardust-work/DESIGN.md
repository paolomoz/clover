---
name: Clover (target)
description: Brand-faithful target system — the new-generation Clover surface, consolidated site-wide, audit fixes applied
colors:
  clover-green: "#228800"
  forest: "#004400"
  pine: "#004422"
  fresh-lime: "#b6fb6f"
  receipt-ink: "#000000"
  back-office: "#333333"
  countertop: "#ededed"
  counter-white: "#ffffff"
typography:
  display:
    fontFamily: "PP Formula Condensed, altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(56px, 8vw, 92px)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "normal"
    scope: "home only (captured new-generation surface)"
  headline:
    fontFamily: "PP Formula Condensed, altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(40px, 5vw, 56px)"
    fontWeight: 900
    lineHeight: 0.95
    scope: "home only (captured new-generation surface)"
  headline-classic:
    fontFamily: "altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(32px, 4vw, 40px)"
    fontWeight: 400
    lineHeight: 1.1
    textTransform: "none"
    scope: "interior pages (captured classic surface) — sentence case, forest/clover-green ink"
  title-classic:
    fontFamily: "altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.25
    scope: "interior card/sub-section heads"
  lede:
    fontFamily: "Graphik, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    scope: "hero ledes, feature paragraphs, accordion summaries, tile labels (captured 18px step)"
  eyebrow:
    fontFamily: "Graphik, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.1em"
    scope: "uppercase eyebrows/kickers (captured classic convention)"
  caption:
    fontFamily: "Graphik, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
    scope: "footer legal, offer key-terms, card meta (captured caption step)"
  glyph-marker:
    fontFamily: "inherit"
    fontSize: "28px"
    fontWeight: 900
    lineHeight: 1
    scope: "decorative accordion +/− marker glyphs only — never running text"
  title:
    fontFamily: "Graphik, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "25px"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Graphik, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Graphik, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  md: "8px"
  pill: "50px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.fresh-lime}"
    textColor: "{colors.receipt-ink}"
    rounded: "{rounded.md}"
    padding: "16px 28px"
  button-secondary:
    backgroundColor: "{colors.receipt-ink}"
    textColor: "{colors.counter-white}"
    rounded: "{rounded.md}"
    padding: "16px 28px"
  button-on-dark:
    backgroundColor: "{colors.fresh-lime}"
    textColor: "{colors.forest}"
    rounded: "{rounded.md}"
    padding: "16px 28px"
  link:
    textColor: "{colors.clover-green}"
  card:
    backgroundColor: "{colors.counter-white}"
    rounded: "{rounded.md}"
    padding: "24px"
  input-search:
    backgroundColor: "{colors.counter-white}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
---

# Design System: Clover (target)

<!-- _provenance: written by stardust:direct 2026-07-23 (TARGET visual system).
     Mode A brand-faithful · ia-fidelity: verbatim · new-generation consolidation.
     Every token traces to stardust/current/_brand-extraction.json; the audit
     fixes (stardust/audit/clover-com/audit.json) shape the named rules.
     Site-level system only — page deployments live in stardust/prototypes/<slug>-shape.md. -->

## 1. Overview

**Creative North Star: "Run the Numbers"** — the brand's own stat band,
promoted to system: flat, loud, green-blocked, and honest.

**Re-directed 2026-07-26: the target is per-page captured generation.**
Each page keeps its own captured design. The home keeps the captured
new-generation surface (PP Formula Condensed display, lime CTAs). Interior
pages keep the captured classic surface: **Altform headings** in sentence
case over forest/clover-green ink, Graphik body, `#228800` primary buttons,
fine-border cards, full-width green bands, full-page image stages, and the
captured cinematic effects (scroll reveals, controlled-scroll, carousels)
reproduced CSS-first. One hue family (forest `#004400` → Clover green
`#228800` → fresh lime `#B6FB6F`) across both generations; photography and
video always over an opaque, luminance-matched poster so the words survive
the stream. Audit finding F-002 (generation consolidation) is **user-
overridden** — the dual-generation surface is the brief, not a defect.

This system explicitly rejects: enterprise-fintech gravitas (navy,
glassmorphism, gradient meshes), the Generic-2026-SaaS silhouette, two-voice
template mixing, and fabricated content (see PRODUCT.md anti-references —
carried into Do's and Don'ts by name).

**Key Characteristics:**
- Single green family; no second hue anywhere
- Flat: zero shadows, zero gradients; separation = ground change
- Condensed-black uppercase display over calm Graphik prose
- Video signatures preserved with poster + scrim + reduced-motion hygiene
- 8px radius; pill reserved for the search input
- 64px section rhythm (balanced tier; multi-audience hard floor honored)

## 2. Colors

The palette is inherited verbatim from the captured surface — role names are
Clover-native (counter, receipt, back office: the merchant's world).

### Primary
- **Fresh Lime** (#b6fb6f): the signature — primary CTA fill and the
  stat-band ground. Ink text only on lime (17.02:1).
- **Clover Green** (#228800): links, logo green, small accents on white
  (4.58:1 with white text — AA at any size; reserve for text/links and the
  wordmark rather than large fills on target surfaces).

### Secondary
- **Forest** (#004400): dark section grounds (pricing hero, stat sections)
  and display-heading color on white. White text on forest: 11.5:1.
- **Pine** (#004422): deep-green text accents within forest-family sections.

### Neutral
- **Counter White** (#ffffff): page ground. Retained pure per the
  brand-faithful inversion (existing brand decision).
- **Receipt Ink** (#000000): text and the dark CTA fill. Retained pure per
  the brand-faithful inversion.
- **Back Office** (#333333): card headlines, secondary text on white.
- **Countertop** (#ededed): alternate section ground.

### Named Rules
**The One-Hue Rule.** Every non-neutral surface is a green. A second hue on
any target surface is a defect, not a variation.
**The Lime Ration.** Fresh Lime is a signature, not a wash — one lime block
and/or the CTA pair per viewport; lime never carries body text.

## 3. Typography

**Display Font (home):** PP Formula Condensed Black (captured private cut;
files at `stardust/current/assets/fonts/`)
**Heading Font (interior pages):** Altform Regular 400 (captured private cut;
woff2 mirrored locally) — **headings stay low weight** (user-pinned trait,
2026-07-26): Regular at every heading size, sentence case, forest/clover-green
ink, tight 1.1 leading. SemiBold/Bold are captured but not deployed on
heading roles.
**Body Font:** Graphik 300/400/500/600 (captured private cut)

**Character:** Two captured voices, one per generation. Home: a condensed
black uppercase shout (Formula Condensed, 0.9 leading). Interior: Altform's
rounded geometric warmth in sentence case over green ink; small uppercase
Altform labels for icon tiles and eyebrows (captured convention). Everything
below headings is Graphik on every page.

### Hierarchy
- **Display** (900, clamp 56→92px, 0.9): hero headlines only. Uppercase.
- **Headline** (900, clamp 40→56px, 0.95): section headlines. Uppercase.
- **Title** (500, 25px, 1.25): card and sub-section headings, mixed case.
- **Body** (400, 16px, 1.5): prose; 18px on feature paragraphs. ≤75ch.
- **Label** (500, 15px, 1.2): nav, buttons, captions, eyebrows.

### Named Rules
**The Major-Third Rule.** Text sizes step at 1.25 (16 → 20 → 25 → 31); the
two display sizes (56, 92) are display-only jumps above the scale. This
replaces the captured ad-hoc scale (ratios 1.64/1.40/2.22 — audit T-scale).
**The Case Split.** Uppercase belongs to Formula Condensed at headline size
and short imperative labels; Graphik never renders uppercase body text.

## 4. Elevation

Flat, verbatim from the captured system: zero box-shadows, zero gradients.
Depth is a background change (white → countertop → forest/lime), photography,
and scale contrast. The only stroke in the system is the search input's
1px border.

### Named Rules
**The No-Shadow Rule (inherited).** If a surface needs separation, change
its ground; never lift it.
**The Big-Image Rule (user-pinned, 2026-07-26).** Images whose natural width
exceeds 600px are an explicit Clover design trait: never render them below
600px wide on desktop — give them the split's larger column or the full
container/viewport.
**The Edge-Bleed Rule (user-pinned, 2026-07-26).** Large section media has no
border with the window: split-section images bleed to the viewport edge
(square outer corners, radius on the inner edge only); full-page image stages
and carousels bleed likewise. Copy stays aligned to the 1158px container.
**The Poster Rule (audit F-009).** Any text over video sits on an opaque
poster/background-color matched to the video's luminance plus a scrim
bringing the text region to ≥4.5:1 — in every state: pre-load, data-saver,
and `prefers-reduced-motion`.

## 5. Components

### Buttons
- **Shape:** 8px radius, both variants; Label type (Graphik 500, 15–16px).
- **Primary:** Fresh Lime fill, Receipt Ink text ("Contact sales", "Get
  Clover" contexts on light grounds).
- **Secondary:** Receipt Ink fill, Counter White text — the pair partner in
  heroes ("Get Clover" + "Contact sales" dual-CTA pattern, captured).
- **On forest grounds:** Fresh Lime fill, Forest text.
- **The commercial pair (audit F-008):** exactly two commercial doors in
  the header — Shop (self-serve) + Contact sales (assisted). No third.

### Cards / Containers
- **Corner Style:** 8px. **Background:** Counter White on
  countertop/forest grounds; ink stat-cards on white (captured home
  vignette treatment). **Shadow:** none. **Padding:** 24px.

### Inputs / Fields
- **Search:** pill (50px), 1px `#707070` stroke, 8px/16px padding.
- **Forms:** 8px radius, Graphik 16px, labels always visible (no
  placeholder-as-label).

### Navigation
- **Header:** sticky (inherited convention), Counter White (dark-over-video
  variant on video heroes); vertical-market nav (Restaurants / Services /
  Retail / Healthcare / Products / Resources) + the commercial pair;
  full wordmark at ≥32px height (fixes the sub-threshold 22px capture).
- **Footer:** 8-column mega-footer carried verbatim; dark-green wordmark;
  legal text at ≥1.5 line-height, ≤75ch (audit F-012).

### Signature Component: Stat band
Full-width Fresh Lime section, Formula Condensed uppercase headline, three
display-size stats with Graphik captions — real captured numbers only
(4M+ / #1 / $337B+). The system's loudest block and its north star.

### Signature Medium: Ambient video
Hero/section background video (captured Contentful assets) preserved at its
captured roles per §8b — with the Poster Rule, explicit dimensions (CLS),
`muted loop playsinline`, and a reduced-motion still.

## 6. Do's and Don'ts

### Do:
- **Do** render every page in its own captured generation — home in the
  new-gen system; interior pages in the classic system (Altform headings,
  `#228800` buttons, fine-border cards, captured green bands and image
  stages). Reproduce captured cinematic effects CSS-first.
- **Do** carry captured copy, images, and video verbatim at their captured
  semantic positions (`ia-fidelity: verbatim`; image-reuse contract).
- **Do** ship Organization/Product/FAQPage JSON-LD, the five core OG tags,
  and an intent-true `<title>` on every page (audit F-004/F-005).
- **Do** keep one H1 per page, quotes as `<blockquote>`, heading levels
  without skips (audit F-007).
- **Do** defer the third-party stack past first interaction; mobile lab TBT
  ≤600 ms is a ship gate (audit F-003).

### Don't:
- **Don't** use box-shadows or gradients — flat is the brand (captured).
- **Don't** introduce a second hue, a new font, or any color outside the
  captured palette (Mode A pins).
- **Don't** cross the generations *within* a page — no Formula Condensed on
  interior pages, no Altform headings on home. (Site-wide consolidation
  F-002 is user-overridden; per-page purity is the rule instead.)
- **Don't** set display text over un-postered video, ever (audit F-009).
- **Don't** read as enterprise-fintech ("no navy palette, no glassmorphism,
  no jargon" — PRODUCT.md anti-reference, carried verbatim).
- **Don't** invent stats, prices, names, or quotes — placeholders declare
  themselves (`data-placeholder="true"` + visible signature treatment).
