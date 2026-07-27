---
name: Clover (current state)
description: Descriptive capture of clover.com's live visual system — extracted 2026-07-23, 5 pages
colors:
  clover-green: "#228800"
  forest-deep: "#004400"
  pine-dark: "#004422"
  acid-lime: "#b6fb6f"
  ink: "#000000"
  charcoal: "#333333"
  mist: "#ededed"
  white: "#ffffff"
typography:
  display:
    fontFamily: "PP Formula Condensed, altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "92px"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "normal"
  headline:
    fontFamily: "altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "altform, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.1
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
  sm: "4px"
  md: "8px"
  lg: "16px"
  pill: "50px"
spacing:
  sm: "24px"
  md: "48px"
  lg: "64px"
  xl: "80px"
  2xl: "120px"
components:
  button-primary:
    backgroundColor: "{colors.clover-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-new-template:
    backgroundColor: "{colors.acid-lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
  input-pill:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "6px 15px"
---

# Design System: Clover (current state)

<!-- _provenance: written by stardust:extract 2026-07-23. DESCRIPTIVE snapshot of the
     live site (what IS), not a redesign target. Every value traces to
     _brand-extraction.json / pages/*.json. The target-state DESIGN.md is written
     later by `$stardust direct` at the project root. -->

## 1. Overview

**Creative North Star: "The Merchant's Corner"** *(descriptive label for the
observed system, not an authored direction)*

Clover.com's live system is flat, photographic, and green-blocked: a
single-hue brand (deep forest `#004400` → Clover green `#228800` → acid lime
`#B6FB6F`) deployed as full-section color grounds and CTAs over a white/gray
page, with real-merchant photography and video carrying all the atmosphere.
Depth is conveyed entirely by color blocking and imagery — zero box-shadows
were captured across five pages.

The system currently spans **two template generations**. The new home template
shouts: PP Formula Condensed Black at 92px, CSS-uppercased, acid-lime stat
bands, black and lime buttons over a full-bleed hero video. The classic
interior template speaks more quietly: Altform headings at 56/40px, mid-green
buttons, white sections in an 1158px container (vs 1280–1392px on home).

**Key Characteristics:**
- Monochromatic green brand; no second hue anywhere
- Flat (no shadows, no gradients); color-blocked sections
- Condensed-display shout on home; humanist-sans calm on interior pages
- Real-merchant photography/video, in-context device shots
- 8px radius signature; ad-hoc type scale; 8-column mega-footer

## 2. Colors

One green family plus neutrals — the palette is the brand's clover, literally.

### Primary
- **Clover Green** (#228800): CTA backgrounds and link/text green on classic
  template pages (34 weighted occurrences; `.Button_light`, FAQ view-more
  buttons on contact / pos-solutions / pos-systems).

### Secondary
- **Forest Deep** (#004400): dark-green section grounds and heading color —
  the pricing hero, stat-section grounds, contact H1 (71 occurrences, all 5
  pages). The "serious" end of the green ramp.
- **Acid Lime** (#b6fb6f): the new-template signature — stat-band ground and
  hero CTA fill on home (9 occurrences, home only).

### Tertiary
- **Pine Dark** (#004422): text-green on restaurant-page media modules
  (15 occurrences, pos-solutions__restaurant only).

### Neutral
- **White** (#ffffff): default page ground (133 occurrences).
- **Ink** (#000000): body and heading text; also the new-template dark button
  fill (103 occurrences).
- **Charcoal** (#333333): card-grid headlines on home (14 occurrences).
- **Mist** (#ededed): alternate section ground on home (8 occurrences).

### Named Rules
**The One-Hue Rule (observed).** Every non-neutral color captured on five pages
is a green. There is no secondary hue anywhere on the surface.

## 3. Typography

**Display Font:** PP Formula Condensed Black (private cut, `formula-black`) —
home template display only
**Headline Font:** Altform (private cut; Light/Regular/SemiBold/Bold files
captured) — classic-template headings, 55 of 88 captured headings
**Body Font:** Graphik (private cut; 300/400/500/600 files captured)

**Character:** A condensed black shout over a neutral humanist workhorse. Home
displays are CSS-uppercased and tightly leaded (92px/81); interior pages read
calm and geometric-humanist at 56/40px Altform with Graphik 16/24 prose.

### Hierarchy
- **Display** (900, 92px, 0.88): home hero + stat-band headlines ("RUN THE
  NUMBERS"), PP Formula Condensed, uppercase via CSS `text-transform`.
- **Headline** (400, 56px, 1.1): classic-template page heroes (pricing H1,
  contact H1), Altform.
- **Title** (400, 40px, 1.1): section headings on classic pages, Altform.
- **Body** (400, 16px/24): Graphik; 18px/26–27 on feature paragraphs
  (pos-systems uses Graphik Light 300 at 18px).
- **Label** (500, 15px): nav items, small buttons, Graphik Medium.

### Named Rules
**The Ad-hoc Scale (observed).** Consecutive heading ratios are 1.643 / 1.400 /
2.222 — no modular scale matches (a `T-scale` tension; the redesign target must
take a position).

**All four families are private cuts** (PP Formula, Altform, Graphik — flagged
`private` in `_brand-extraction.json#type.files[]`); verify licensing before any
redeploy. Font binaries are captured under `stardust/current/assets/fonts/`.

## 4. Elevation

Flat, full stop. Zero box-shadows captured across all five pages. Depth is
conveyed by section color blocking (white → mist → forest/lime), photography,
and scale contrast — never by elevation. Borders are nearly absent too; the
pill search input's `1px solid #707070` is the only captured stroke.

### Named Rules
**The No-Shadow Rule (observed).** If a surface needs separation, the site
changes its background color; it never lifts it.

## 5. Components

### Buttons
- **Shape:** softly rounded (8px) on both template generations; classic small
  buttons at 4–5px.
- **Primary (classic):** Clover green (#228800) fill, white label, 12px
  vertical padding.
- **Primary (new template):** acid lime (#b6fb6f) fill with ink label, or ink
  (#000000) fill with white label ("Get Clover") — the home hero pairs them.
- **Dual-CTA pattern:** primary-then-secondary ("Get Clover" + "Contact
  sales") in the home hero.
- **Hover / Focus:** not captured (animations disabled during extraction).

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** white on gray/mist grounds; dark-ink stat cards on the home
  feature strip.
- **Shadow Strategy:** none (see Elevation).
- **Internal Padding:** 24–48px observed rhythm.

### Inputs / Fields
- **Style:** pill (50px radius), `1px solid #707070`, 6px/15px padding
  (header search). Forms are minimal — zero `<form>` elements captured on the
  five pages; contact routes through disclosure links instead.

### Navigation
- **Header:** white bar, vertical-market nav (Restaurants / Services / Retail /
  Healthcare / Products / Resources), utility row with Log In / Help Center /
  Pricing / Shop systems, and a "Contact sales" button. New template header
  sits dark over the hero video with the clover mark only (24px); classic
  header carries the full wordmark (90×22px).
- **Utility promo strip:** "ONLINE ONLY OFFER: Get $450 statement credit…"
  (classic pages).
- **Footer:** 8-column mega-footer on every page, dark-green wordmark variant.

### Signature Component: Stat band
Full-width acid-lime section, condensed-black uppercase headline ("RUN THE
NUMBERS"), three display-size stats with Graphik captions (4M+ / #1 / $337B+).
The loudest, most distinctive block on the site.

## 6. Do's and Don'ts

*Descriptive mode: these record the observed conventions of the live site (what
it consistently does and visibly avoids), as the baseline `direct` will accept
or overturn.*

### Do (observed conventions):
- **Do** keep every accent within the green family — #004400 / #228800 /
  #b6fb6f are the only non-neutrals on the surface.
- **Do** use full-section color blocks (white → #ededed → green) for rhythm and
  separation.
- **Do** use 8px radii on buttons and cards; pill only on the search input.
- **Do** carry real-merchant photography and in-context device shots; the home
  hero is a fine-dining video (`voice.heroMedium`, Contentful mp4 — the page's
  signature; preserve under intent-dimensions § 8b).
- **Do** speak in short, second-person, benefit-led lines ("You bring the
  flavor, Clover powers the pay").

### Don't (visibly avoided by the current site):
- **Don't** use box-shadows or gradients — zero captured on five pages.
- **Don't** introduce a second hue; no blue/purple/orange exists anywhere.
- **Don't** use display fonts in body or label roles; Formula Condensed appears
  only at display size on home.
- **Don't** read as enterprise-fintech (the parent-company register the site
  visibly avoids — see PRODUCT.md anti-references: no navy palette, no
  glassmorphism, no jargon).
