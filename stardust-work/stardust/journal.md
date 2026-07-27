# Journal — clover.com redesign

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## 2026-07-23T06:32:49.464Z — extract clover.com (5 pages, us/en)

**Prompt:** /stardust:extract clover.com — crawl the current site and produce the stardust current-state snapshot.

**Decisions:**
- Multi-locale sitemap index (us/en, ca/en, ca/fr, au/en, sg/en): extracted default locale us/en only, per the SKILL multi-locale rule.
- Default cap 5 held; template-variety selection: home (landing), /pos-systems (product pillar), /pos-solutions/restaurant (solution template, ~40-page family), /pricing, /contact (form/disclosure).
- Vision gate forced two recaptures: home (custom consent modal 'We need your choice to proceed' overlaid the hero and leaked into headings) and pricing (scroll-reveal opacity left plan sections blank in the raster). Fixed via text-based consent dismissal + force-reveal of opacity-0 main content + wait 'slow'; all five verdicts now ok.
- CTA capture extended: clover's new template puts the button surface on a CHILD of the anchor and hides descriptions in sr-only spans — effective-style resolution + visible-label TreeWalker added to the project crawler.
- Logo: header wordmark renders 90×22 (below the 32px chain threshold) but is unambiguously the brand wordmark — captured with the exception noted; dark-green + mark variants and favicon also saved.
- brand-review chrome: --primary #004400 (most frequent saturated), --primary-dark #003000 (derived, no darker same-hue candidate), --accent #b6fb6f (documented deviation: single-hue brand has no ≥60° hue candidate; the acid-lime signature was used instead of the monochromatic fallback).

**Artifacts touched:**
- stardust/current/pages/*.json (5) — created (live Playwright renders, provenance complete)
- stardust/current/_brand-extraction.json — created
- stardust/current/PRODUCT.md, DESIGN.md, DESIGN.json — created (descriptive)
- stardust/current/brand-review.html — created (6 tensions; validated 3 viewports, clean pass)
- stardust/current/assets/ — logo.svg (+2 variants), favicon.png, 11 font files, 31 media files, 5 screenshots
- stardust/current/_crawl-log.json — created (discovery, visionCheck, siblingCandidates)
- stardust/state.json, stardust/status.jsonl — created
- stardust/scripts/crawl.mjs — project copy of the bundled crawler, extended to full recipe schema

**Findings worth flagging:**
- clover.com spans two template generations (new home: PP Formula Condensed display + acid-lime + video hero; classic interior: Altform + #228800 buttons + 1158px container) — direct must decide which generation is the brand's future.
- Home hero is a background VIDEO (Contentful mp4) — voice.heroMedium is non-null; signature-preservation (§8b) applies at prototype time.
- All three text families (PP Formula, Altform, Graphik) are private cuts — licensing check needed before redeploy.
- Site ships essentially no design tokens (1 custom property) — the migration target introduces a token layer from scratch.
- Sibling candidates harvested (blog/sales/integrate/referrals.clover.com) — proposed, not crawled.

**Open questions:**
- Include sibling origins as --brand-source in a follow-up extract?
- Widen the crawl (--cap 25 / --all) before direct, or is the 5-page template sample sufficient?

## 2026-07-23T07:35:00Z — audit clover.com (site health 57/100)

**Prompt:** /stardust:audit clover.com — three-perspective audit (design, SEO/technical, LLM visibility) + CWV, scored report.

**Decisions:**
- Reused the same-day 5-page extraction (freshness < 7 days) instead of re-crawling at cap 8.
- impeccable critique ran as the mandated dual-agent pass (26/40, consistency 1/4 the worst heuristic); the audit-arm checks were computed directly with the detector bundle + Playwright (recorded in assumptions/degradations).
- PSI API quota-blocked (429) → Playwright lab CWV; mobile 4× CPU throttle; lab TBT labeled as INP proxy.
- Detector false positives verified and excluded (self-detection of gradient-text/theater-phrase; white-on-white heroes are text-over-video, contrast indeterminate). Gray-on-lime stat text computes 7.07:1 — passes AA, kept as aesthetic note only.
- Benchmarks via refero: Square (same vertical), GlossGenius (adjacent).

**Artifacts touched:**
- stardust/audit/clover-com/audit.json — created (scorecard 57; 13 findings 3 P1/7 P2/3 P3; 17 measurements, all status "measured")
- stardust/audit/clover-com/report.html — created (craft-delegated render, 425KB self-contained, post-render validation all-pass)
- .impeccable/critique/2026-07-23T07-00-58Z__www-clover-com.md — critique snapshot (26/40)

**Findings worth flagging:**
- P1s: pricing page withholds prices; two template generations on the purchase path; mobile lab TBT 1,124ms (poor).
- Zero JSON-LD and zero OG tags on all five pages; home <title> targets the F&B vertical, not the brand home.
- Sitemap ships 18 malformed <loc> URLs (missing slash → invalid hosts) + test/legacy pages; robots.txt has no Sitemap directive.
- /llms.txt (and unknown paths generally) soft-200 the SPA shell; content itself IS server-rendered (home: 1,730 words no-JS).
- brandColorShare 31.4% (pixel-sampled) — brand expression is strong where the new template runs.

**Open questions:**
- none

## 2026-07-23T08:28:49.483Z — direct: brand-faithful + verbatim, audit fixes as the brief

**Prompt:** /stardust:direct "brand faithful and content verbatim - and fix the issues identified in the audit"

**Decisions:**
- Mode A (brand-faithful) — default by signal-strong AND pinned by phrase; ia-fidelity: verbatim (auto-pinned by "content verbatim"); surprise capped at low site-wide.
- User pinned via AskUserQuestion: density = balanced (64px; multi-audience hard floor), target system = NEW GENERATION (audit F-002 consolidation; Altform retired with the classic template, PP Formula Condensed + Graphik carry the target).
- Seed rolled 2025-now × Terrazzo × Travel-agency-brochure × dark; ground overridden to brand stark-white (Mode C, brand-faithful); craft/register inert under verbatim (recorded honestly).
- Anti-toolbox: 3 hits (sticky nav, uppercase condensed display, stat-callout bar) — all justified as captured-surface inheritance; 5 brand-faithful inversions auto-emitted (pure white, pure black, hex format, saturated greens, CSS-uppercase display scoped).
- Improvements lists seeded from audit findings (audit-reuse path): home (6 items) + pricing (4 items); F-ids carried as evidence.
- iaPriorities locked: commercial-conversion, audience-routing, signature-hero-medium (the Contentful hero video — §8b, Poster Rule).

**Artifacts touched:**
- PRODUCT.md, DESIGN.md, DESIGN.json — created at project root (target spec)
- stardust/prototypes/home-improvements.md, pricing-improvements.md — created
- stardust/direction.md — created (active direction)
- stardust/state.json — direction block set; 5 pages extracted → directed

**Findings worth flagging:**
- The one real design decision was generation-consolidation, and it is now pinned: new-gen system site-wide.
- Type scale position taken: Major-Third (1.25) text scale with display-only jumps (56/92) — resolves T-scale without moving captured display sizes.

**Open questions:**
- none

## 2026-07-23T12:46:52.180Z — home prototype approved

**Prompt:** "approve home" (after one iteration round: 9 fidelity alignments + carousel full-bleed media fix).

**Decisions:**
- Approval under ia-fidelity: verbatim — fold-back is a no-op by construction (no structural moves to fold).
- User override recorded: footer legal measure widened to 76em (supersedes the F-012 38em fix; noted in file provenance).
- Signature preservation held through iteration: 3 ambient videos + per-slide carousel media, all under the Poster Rule with reduced-motion fallbacks; cinematic behaviors are CSS-only scroll-driven (no JS added).

**Artifacts touched:**
- stardust/state.json — home: prototyped -> approved
- stardust/prototypes/home-proposed.html — final approved surface (v3)

**Open questions:**
- none

## 2026-07-24T10:55:00Z — prototype pos-systems + restaurant + contact (all remaining directed pages)

**Prompt:** "do all the prototypes then I will review" (routed via /stardust:prototype pos-systems pos-solutions__restaurant contact).

**Decisions:**
- User pre-confirmed the shape briefs in the prompt ("then I will review") — Phase 1 brief-confirmation waits skipped on that basis; briefs authored, validated, and on disk for review.
- Provenance validation: all 3 pages carry live-render evidence; `waitMode: "slow"` is outside the spec regex but is the project crawler's own vocabulary (crawl.mjs WAIT_MS maps slow→5000ms) and identical on the approved home — treated as pass with the deviation recorded, not a synthesis marker.
- Accordion gap-fill: extract never expanded the pos-systems FAQ (10 items, 3 captured) or the contact directory (10 items, labels only). Live-sourced both from the same pages via Playwright into `stardust/current/_accordion-content.json` (pricing anchor-price precedent) — zero placeholders shipped; content verbatim incl. tel:/mailto:/inline links.
- Icon mirror: 12 captured Contentful icon SVGs weren't mirrored at extract; downloaded to `current/assets/media/` (`_icon-mirror-map.json`) per the image-reuse contract.
- Canon reuse: header/footer chrome, :root tokens, and FAQ/device-band treatments carried verbatim from the approved pricing prototype; page-specific CSS added per brief.
- F-007 heading hygiene per page: pos-systems captured h1→h5 tiles render as non-heading labels (+sr-only H2); restaurant's captured h2-trio demoted to h3 under one intro H2, h4 slide titles promoted to h3; contact directory summaries are non-heading labels (pricing FAQ precedent).
- Design hook: recurring design-system-font-size hits (13/18/20/28px) classified canon-inherited false positives — the values ship verbatim in the user-approved home/pricing files; one real hit (22px tile label) fixed to 25px. Recorded per-file in `designHookNotes`.
- Substrate exceptions declared: pos-systems countertop (setup-support + device-band; captured #eeffee has no target token under Mode A pins); restaurant forest kiosk block + countertop device-band; contact none.
- Poster Rule applied to the restaurant photo-hero (opaque forest panel, 11.5:1) — signature composition carried, recorded in `_provenance.signatureElements`.

**Artifacts touched:**
- stardust/prototypes/{pos-systems,pos-solutions__restaurant,contact}-shape.md — created (briefs)
- stardust/prototypes/{pos-systems,pos-solutions__restaurant,contact}-proposed.html — created; gates clean (0 P0/P1/P2 across critique/audit/adapt/motion; computed contrast, 9-viewport sweep, reduced-motion, scroll-end reachability)
- stardust/current/_accordion-content.json — created (live-sourced accordion content, playwright provenance)
- stardust/current/assets/media/ — 12 icon SVGs mirrored (+_icon-mirror-map.json)
- stardust/scripts/{fetch-accordions,assemble-fragments,gate-validate}.mjs — created (gap-fill, canon-fragment assembly, gate runner)
- stardust/validation/<slug>/{1440,768,390}.png — clean-pass screenshots (animations force-disabled for the raster; view() reveals verified opacity-1 at element level)
- stardust/state.json — 3 pages directed → prototyped; stardust/status.jsonl — 3 lines

**Findings worth flagging:**
- Full-page rasters of any page using the canon view() scroll-reveal blank out pre-scroll headlines — same artifact extract hit on the live site. Archival screenshots now force-disable animations; anyone eyeballing raw Playwright fullPage captures of these prototypes should expect it.
- Device-band image on disk is `.webp` (the `.png` name in the media dump is a truncation); pos-systems/restaurant initially referenced `.png` — caught by the lazy-load probe during gates, fixed.
- pos-systems "apps" section renders text-led: the captured page's app-logo collage was never captured as an asset. If the brand team wants the collage, re-extract that section's media before migrate.

**Open questions:**
- none — all five pages now at prototyped-or-better; awaiting user review ("approve <slug>") before migrate.

## 2026-07-26T11:30:00Z — re-direct (per-page captured generation) + re-render of all 4 interior prototypes

**Prompt:** "apart from the home page keep the Altform font for headings. keep cinematic effects when the original page has them ... just reproduce all the designs for all the sections, including full page stages, cinematic effects, fine border cards, include all the images that are present in the original page. ... I want to keep the internal page style, is our direction wrong? In this migration I want to keep the original design, except where we see an issue we can correct it proactively. Refactor for this"

**Decisions:**
- **Re-direct:** the 2026-07-23 direction's Q2 answer (new-generation site-wide) is superseded — target is now **per-page captured generation**: home keeps its new-gen surface (approved, unaffected); interior pages keep the classic style (Altform headings sentence-case, #228800 button pair, fine-border cards, captured grounds incl. #eeffee/#f8f8f8/#012906, 1158px container, classic footer with green Altform column heads, offer strip). **Audit F-002 consciously user-overridden** — recorded in direction.md and DESIGN.md/json; other audit fixes stay (F-003/4/5/7/8/9/12 + F-001 anchor prices).
- DESIGN.md/DESIGN.json gained the classic layer (headline-classic/title-classic type roles, buttonsClassic, cardClassic, countertop-classic #f8f8f8, hairline #dcdcdc, generationRule).
- **Media gap-fill (playwright 2026-07-26):** 20 assets the extract missed — restaurant ops-carousel card images (6 slides incl. "Map your tables"/"Speed up service"/"Create menu categories" the capture never saw), tools carousel device images (8 cards: Flex Pocket/Flex/KDS/Solo/Duo/Mini/Go/Kiosk, with copy), segment-card photos, pricing router icons. `stardust/current/_media-gapfill.json` carries per-section inventory of all 4 live pages.
- **Cinematics reproduced CSS-first:** entrance reveals (view()), pos-systems controlled-scroll as sticky stage media (no JS scroll-jack — F-003), restaurant carousels as scroll-snap fine-border card tracks, full-page image stage restored (no fake play affordance — no captured video URL).
- pricing: prior consultation-above-tools sequence exception REVERTED (captured order restored); anchor prices kept; hero re-rendered on the captured #012906 deep green with the 6 icon router cards inside the hero; FAQ q/a preserved via stardust/current/_pricing-faq.json.
- pos-systems: live page has drifted (VT/apps no longer top-level modules; apps collage unavailable) — captured record stays source of truth; VT renders as the captured green #228800 band, apps as the forest #004400 band, text-led.
- Copy-verbatim repair during render: pricing tools-card + consultation bodies were initially paraphrased from memory; caught and restored to pricing.json body[11]/[13]/[15]/[17]/[18] verbatim; invented "See … pricing" router hints removed.
- Canon fragments extracted to stardust/canon/ (favicon.html, footer.html) — assemble script now composes from there.

**Artifacts touched:**
- stardust/direction.md — re-direct addendum (new Active 2026-07-26); DESIGN.md + DESIGN.json — dual-generation layer
- stardust/prototypes/{pos-systems,pos-solutions__restaurant,contact,pricing}-proposed.html — re-rendered; gates clean (0 P0/P1/P2: heading hygiene, computed contrast incl. white-on-#228800 4.58:1, 9-viewport adapt, reduced-motion, scroll-end reachability)
- stardust/prototypes/*-shape.md — re-direct addenda appended
- stardust/current/_media-gapfill.json, _pricing-faq.json — created; 20 media downloads
- stardust/canon/{favicon,footer}.html — created
- stardust/state.json — 4 pages stale→re-prototyped (stale cleared); status.jsonl — re-direct + 4 re-render lines

**Findings worth flagging:**
- The pos-systems live page changed between the 2026-07-23 capture and 2026-07-26 (VT/apps modules restructured) — future re-extracts will diff against a moving target; the capture remains authoritative for this migration.
- Vision gates passed against captured screenshots; the restaurant and pos-systems renders now track the originals section-for-section.

**Open questions:**
- none — all 4 interior prototypes awaiting review under the new direction.

## 2026-07-26T13:00:00Z — iteration: low-weight headings + big-image/edge-bleed traits

**Prompt:** "keep heading low weight, and never reduce the size of images that are bigger than 600px because that is an explicit design trait of the clover design system. and images that have no border with the window"

**Decisions:**
- Two traits pinned as named DESIGN rules (user-pinned 2026-07-26): **The Big-Image Rule** (natural width >600px never renders below 600px on desktop) and **The Edge-Bleed Rule** (large section media has no border with the window — bleeds to the viewport edge, square outer corners, radius inner edge only; copy stays on the 1158px container grid via --content-pad).
- **Headings to low weight:** all Altform heading roles across the four interior prototypes moved to Regular 400 (display, section, card heads, tile labels, step numerals, band heads, footer column heads, consultation phone number). DESIGN.md headline-classic/title-classic re-pinned at 400; SemiBold/Bold captured but not deployed on heading roles.
- Bleed implementation CSS-only: split sections un-container (max-width none), media column minmax(min(600px,50%),1fr) to the window edge, alternating sides; carousels bleed right with scroll-padding; to-the-kitchen image full-bleed both edges; ≤1024px stacks with full-bleed media and padded copy.

**Artifacts touched:**
- stardust/prototypes/{pos-systems,pos-solutions__restaurant,pricing,contact}-proposed.html — weights + bleed layer
- DESIGN.md / DESIGN.json — weight re-pin + two named rules
- Gates re-run: all four clean (0 P0/P1/P2; zero overflow at 9 viewports with the bleed layout); screenshots re-captured

**Open questions:**
- none — awaiting review.

## 2026-07-27T13:10:00Z — impeccable live session (pricing segment-router)

**Prompt:** /impeccable live; in-browser pick on pricing `.router-grid` with freeform "make these cards more unique, find a creative design solution".

**Decisions:**
- Live mode served the prototypes over `http://127.0.0.1:8402` (file:// pages cannot reach the localhost live helper — null-origin CORS).
- Three variants generated within the pinned identity (default mode, three axes): receipt tiles (price-first hierarchy), green-blocked split cards (color commitment), menu-board rows with dot leaders (topology). All captured labels/prices/hrefs/icons verbatim.
- **User accepted variant 1 (receipt tiles)** with knobs at dividers=dashed, price-scale=1. Carbonized: CSS retargeted to semantic classes in the page stylesheet, params baked, scaffolding/markers removed, dead `.router-label`/`.anchor-price` rules dropped.
- 36px price numeral is off the documented ramp; recorded as the live-accepted value in provenance. A persisted hook ignore was attempted and denied by the permission classifier (browser acceptance is not chat-verifiable) — pending explicit user confirmation in chat.

**Artifacts touched:**
- stardust/prototypes/pricing-proposed.html — router cards now the accepted receipt-tile design; provenance `liveIteration` block added
- .impeccable/live/config.json — live-mode config created (prototype glob)
- Gates re-run post-cleanup: clean except the known 36px design-hook flag

**Open questions:**
- Persist the design-hook ignore for the accepted 36px price numeral? (needs user chat confirmation)

## 2026-07-27T18:30:00Z — deploy: all 5 prototyped templates → EDS (paolomoz/clover), preview

**Prompt:** /stardust:deploy all the templates prototyped to the eds project github.com/paolomoz/clover, DA paolomoz/clover, token in ~/.claude/.env.

**Decisions:** vanilla-boilerplate runtime probed (current-main vintage; formatted-only buttonization); naming/triage locked autonomously in stardust/eds-conversion-log.md (dual-generation styling via `template: home` body class; 14 authored block types + template-slotted chrome; device-band/intros/image-stage as default content per D1); proprietary fonts self-hosted with a three-place licensing alert; all 78 images rehosted to DA media; videos stay on Contentful (#103).
**Gates:** davids-model-lint 0 🔴; qa-gate schema unit counts all pass; block-roundtrip closed on all 5 pages (2 real decode fixes: home hero CTA fallback, segment-band label); deployed .plain.html + computed-style guard clean; CLS < 0.03 everywhere after fixes; deployed eyeball caught 3 integration bugs (blockquote footer hijack, wrapper specificity, missing pricing hero ground) — all fixed.
**Artifacts:** eds/ (repo clone, branch `stardust`, pushed), content/ (8 DA documents), stardust/eds-schema/*, stardust/runtime-contract.json, stardust/eds-conversion-log.md.
**Open:** font licensing before live; publish (--no-publish was used); PR stardust→main; scroll-reveal + JSON-LD deltas recorded.
