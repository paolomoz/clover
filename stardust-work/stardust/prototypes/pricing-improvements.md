<!--
_provenance:
  writtenBy: stardust:direct
  writtenAt: 2026-07-23T08:05:00Z
  readArtifacts:
    - stardust/audit/clover-com/audit.json
    - stardust/current/pages/pricing.json
    - stardust/current/assets/screenshots/pricing.png
  stardustVersion: 0.10.0
  note: items carried from stardust:audit findings (F-001, F-002, F-004, F-012).
-->

# Improvements — pricing

Variant A brief. Mode A, `ia-fidelity: verbatim` — the router, the
consultation block, and the FAQ all stay; these fixes change execution,
not the page's spine.

1. **[conversion / F-001]** The page shows one teaser rate ("Pay as
   little as 2.3% + 10¢ per transaction") and a six-way business-type
   self-classification — zero device costs, zero plan figures
   (pricing.png, hero + router). The reassuring human path (24/7 phone,
   "Schedule a call") sits two scrolls down.
   *Fix:* A representative anchor figure per segment rendered inside
   each router card (sourced from the live shop/plan data at build
   time — never invented; if a figure isn't available at render time it
   ships as a declared placeholder, not a fabricated number), and the
   phone + "Schedule a call" block moved above the feature cards.

2. **[dated-pattern / F-002]** The page runs the classic template
   (Altform sentence-case hero on forest ground, #228800 buttons,
   1158px container) one click from the new-gen home.
   *Fix:* Re-render in the new-generation system — the forest `#004400`
   hero ground is already brand-canonical; type, buttons, and container
   adopt the target tokens.

3. **[llm-visibility / F-004, F-010]** The FAQ accordion (12 items)
   carries exactly the content answer engines want, with no FAQPage
   JSON-LD, and the page's h2/h3s are mostly slogans.
   *Fix:* FAQPage + Product JSON-LD emitted from the rendered FAQ;
   section headings reshaped toward askable questions ("What does a
   Clover system cost?") with display sublines carrying the voice.

4. **[craft / F-012]** Same footer-legal readability failure as
   site-wide: 1.14–1.29× line-height, 111ch lines, and the offer
   disclaimers this page specifically depends on.
   *Fix:* ≥1.5 line-height, ≤75ch; key-terms summary line beside the
   $450 offer strip.
