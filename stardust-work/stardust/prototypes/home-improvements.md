<!--
_provenance:
  writtenBy: stardust:direct
  writtenAt: 2026-07-23T08:05:00Z
  readArtifacts:
    - stardust/audit/clover-com/audit.json
    - stardust/current/_brand-extraction.json
    - stardust/current/brand-review.html
    - stardust/current/pages/home.json
  stardustVersion: 0.10.0
  note: items carried from stardust:audit findings per direct SKILL § Phase 2.5 Audit reuse; finding IDs cited per item.
-->

# Improvements — home

Variant A brief. Mode A, `ia-fidelity: verbatim` — same sections, same
sequence, same content beats; these are execution fixes, not IA moves.

1. **[dated-pattern / F-002]** The header, buttons, and footer on interior
   pages still run the classic 2017 system while home runs the new one —
   and even on home the two systems meet (classic footer under new-gen
   sections). Audit heuristic "Consistency & standards" scored 1/4.
   *Fix:* Home renders the new-generation tokens end-to-end (PP Formula
   Condensed display, acid-lime `#B6FB6F`/ink `#000000` CTA pair,
   forest `#004400` color-block sections) and becomes the canonical
   reference the other pages consolidate toward.

2. **[contrast / F-009 + §8b]** The testimonial and hardware sections set
   white uppercase display text over a gray-to-white ground when their
   background videos haven't loaded — the captured fallback state
   dissolves the quote's third line (home.png ~y 6,100–8,300 at 2880px).
   *Fix:* Every video-backed section gets an opaque dark poster /
   `background-color` matched to the video's luminance plus a legibility
   scrim, and the same treatment renders under `prefers-reduced-motion`.
   The hero **video itself is preserved** (signature, §8b) — this item is
   the production hygiene that lets it stay.

3. **[a11y / F-007]** Home renders **two H1s** ("A Clover for every small
   business" + "Restaurant-grade hardware…"), the testimonial pull-quote
   is an H2, and the outline skips levels (h2→h4 ×2, h1→h3 — detector,
   3 pages).
   *Fix:* One H1 (the hero); hardware section heading demoted to H2;
   the quote marked up as `<blockquote>` with a cite, not a heading;
   no h→h+2 skips anywhere in the document outline.

4. **[ia-clutter / F-008, T-nav-conflict]** Four purchase doors coexist
   in the header (Pricing / Shop systems / cart / Contact sales) plus
   "Get Clover" in the hero, with no signal of which path suits whom;
   Pricing and Shop systems lead to different numbers.
   *Fix:* One commercial CTA pair in the header — "Shop" (self-serve)
   + "Contact sales" (assisted) — with Pricing as a first-class nav
   peer. Labels reuse the captured verbs verbatim; no new vocabulary.

5. **[metadata+perf / F-004, F-005, F-003]** The head is bare: zero
   JSON-LD, zero Open Graph on every audited page, and the home
   `<title>` targets the F&B vertical ("POS Solutions for Food &
   Beverage Businesses | Clover"). Mobile lab TBT is 1,124 ms (poor) —
   OneTrust/Adobe Target/Qualtrics/heap/Intercom load before first
   interaction; CLS 0.212.
   *Fix:* Organization + WebSite JSON-LD and the five core OG tags in
   the head; home title = brand + category head term; hero video
   carries poster + explicit dimensions; third-party scripts deferred
   until after first interaction (guides: mwg:optimize-script-priority,
   mwg:identify-heavy-scripts).

6. **[craft / F-012]** Footer legal text renders at 1.29× line-height
   and 104–111 characters per line on every page — the copy that
   qualifies the $450 offer (3-year contract) is effectively unreadable.
   *Fix:* Legal text at ≥1.5 line-height, ≤75ch measure; a one-line
   "key terms" summary adjacent to any promoted offer.
