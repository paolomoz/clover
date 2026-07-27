<!-- _provenance: written by stardust:extract 2026-07-23 (descriptive current-state snapshot, NOT authored intent).
     Sources: stardust/current/pages/*.json (5 live Playwright captures), _brand-extraction.json.
     Sections marked `_provenance: inferred` are agent judgment from captured copy; everything else is observed. -->

# PRODUCT.md — clover.com (current state)

## Register

`brand`

Marketing/landing surface throughout: hero with benefit-led copy over a full-bleed
video, social proof ("Run the numbers: 4M+ devices shipped, #1 POS provider, $337B+
processing volume"), pricing pages, "Contact sales" as the dominant CTA (11
occurrences across all 5 pages), no authentication required. The product itself
(the POS dashboard) lives elsewhere; clover.com sells it.

## Users

_provenance: inferred — from captured copy addressing "your business", vertical page structure._

Small-business owners and operators — restaurateurs, retailers, and service
providers — evaluating point-of-sale systems. The IA splits them by vertical
(top-nav: Restaurants, Services, Retail, Healthcare) and the `pos-solutions/*`
family addresses ~40 niches (bakery, barber shop, food truck, florist…). Copy
addresses a time-pressed owner-operator in the second person ("Win the daily race
against the clock", "Do what you do better"), not an IT buyer.

## Product Purpose

_provenance: inferred — from captured heroes, meta descriptions, and CTA structure._

Convert small-business owners into Clover POS customers through three funnels:
guided purchase ("Get Clover", "Shop systems" → shop), assisted sales ("Contact
sales", "Schedule a call", phone number on pricing), and vertical-specific
persuasion (solution pages per business type, case studies). Secondary jobs:
existing-customer support routing (contact page) and app-market/developer
ecosystem entry points.

## Brand Personality

_provenance: inferred — from captured voice samples and visual surface._

**Bold, direct, hustle-adjacent.** Heroes are short, benefit-led, and second-person:
"A Clover for every small business", "You bring the flavor, Clover powers the pay",
"Win the daily race against the clock." The stat band brags in display-condensed
uppercase ("RUN THE NUMBERS"). Photography is real-merchant, on-location
(restaurant kitchens, boutiques), not stock-corporate. The green family (deep
forest `#004400` → Clover green `#228800` → acid lime `#B6FB6F`) is the brand;
everything else is black/white/gray. Tone guess: `bold-direct` (heuristic, not
ground truth).

Note: the site currently spans **two template generations** — the new home
template (PP Formula Condensed display, acid-lime accents, video hero, black
buttons) and the classic template (Altform headings, mid-green buttons, white
sections). The brand reads noticeably younger on home than on interior pages.

## Anti-references

_provenance: inferred — patterns the captured site visibly avoids._

- Enterprise-fintech gravitas: no navy/blue-suit palette, no glassmorphism, no
  gradient meshes — the site avoids reading like its parent (Fiserv).
- Decorative chrome: zero box-shadows detected across all 5 pages; depth comes
  from photography and color blocking, not elevation.
- Jargon: captured copy has no "omnichannel/leverage/seamless" clusters; verbs
  are physical ("bring the flavor", "hustles as hard as you do").

## Design Principles

_provenance: observed (cross-page captured tokens) unless noted._

1. **Green is the brand, used in blocks.** Full sections carry `#004400`/`#B6FB6F`
   backgrounds; CTAs carry `#228800` or `#B6FB6F`. No other hue appears.
2. **Flat, photographic, color-blocked.** No shadows, no gradients; sections
   alternate white / gray `#ededed` / brand-green grounds.
3. **Condensed-display shout + workhorse body.** Display headlines (PP Formula
   Condensed Black 92px, uppercase via CSS) over Graphik 16px/24 body; classic
   pages use Altform 56/40px headings. Type scale is ad-hoc (ratios 1.64 / 1.40 /
   2.22 — no modular scale).
4. **8px radius as the signature shape** (31 occurrences; 4–5px secondary on
   classic-template buttons; inputs are pill 50px).
5. **Merchant reality as imagery.** Hero video of a fine-dining table; kitchen
   and boutique photography; device photos in-context on counters.
6. **Mega-footer as site map.** 8-column footer (Take payments / Run your
   business / Sell more / Business types / Hardware devices / Help / About /
   Integrations) on every page.
