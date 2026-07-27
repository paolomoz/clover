# EDS conversion log — clover prototypes → paolomoz/clover

Started 2026-07-27. Runtime: vanilla aem-boilerplate, current-main vintage
(see `stardust/runtime-contract.json`: formatted-only buttonization,
`p.button-wrapper`, `wrapTextNodes`, `.block` wrapper). Deploy: DA Source API,
org/repo `paolomoz/clover`, branch `stardust`, preview-only (`--no-publish`) —
user publishes to live after review.

## Locked decisions (naming + triage, Step 2)

Decided autonomously (user asked for end-to-end deploy, review after) — flag
any of these to revisit.

**Dual-generation styling:** interior pages are the classic generation
(Altform 400 headings, #228800 buttons), home is new-gen (PP Formula, lime/ink
buttons). Global default = classic; home carries `template: home` metadata →
`body.home` scopes new-gen button/heading overrides in styles.css.

**Chrome:**
- `/nav` = offer strip section + brand + links + tools (interior pages).
- `/nav-home` = same minus the offer strip (approved home has none). Home page
  metadata: `nav: /nav-home`.
- `/footer` shared; footer.css styles classic by default, `body.home` new-gen
  (small Graphik heads vs green Altform heads).
- header/footer blocks: template-slotted (Step 6), stock hamburger machinery kept.

**Blocks (one per distinct pattern; collection names where they match — D11):**
| block | pages | model (rows) | tier |
|---|---|---|---|
| `hero` | home | video-url link / h1 / lede / CTAs | template-slotted |
| `segment-band` | home | label / pill links / specialists link | template-slotted |
| `cards` | home ×2 (plain), pricing (`tools`), restaurant (`segments`) | 1 row per card: image / h3 / p / link | reconstructive |
| `hardware` | home | 1 row per device: name / caption / thumb img / media (video link or img) | reconstructive (radio CSS carousel) |
| `stats` | home | 1 row per stat: value / h3 / p | reconstructive |
| `quote` | home | quote / cite (name, org, avatar img) / video link | template-slotted |
| `hero-split` | pos-systems | h1 / lede / CTA / image | template-slotted |
| `photo-hero` | restaurant | eyebrow / h1 / lede / CTAs / bg image | template-slotted |
| `tiles` | pos-systems ×3 | 1 row per tile: icon img / label / body? | reconstructive |
| `moving-parts` | pos-systems | 1 row per stage: copy cell (h3 + list + CTA) / image | reconstructive (sticky stage media) |
| `columns` | pos-systems (setup `pale`, payment-options, vt `vt`, apps `apps`), restaurant (front/back/office, online-ordering, kiosk `kiosk`, back-of-house `stacked`), pricing (consultation `consult`) | 1 row: copy cell / image cell | reconstructive |
| `carousel` | restaurant ops (`ops`), tools (`tools`) | 1 row per slide: image / h3 / p? | reconstructive |
| `segment-router` | pricing | 1 row per tile: icon img / label / price | reconstructive |
| `accordion` | pos-systems faq, pricing faq, contact | 1 row per item: Q cell / A cell | reconstructive |

**Default content (D1 — NOT blocks):**
- device-band (pricing/pos/restaurant): heading + p + `<strong><a>` CTA +
  picture, section style `alt`.
- pricing hero copy (h1 + rate + fine print): default content in a `deep`
  section; the `segment-router` block sits in the same section.
- restaurant `everything-intro` (centered green h2): style `intro`.
- restaurant image-stage (full-bleed picture): style `stage`.
- contact h1: plain default content.
- Section heads above cards/accordion/carousel blocks: default content,
  styled in place via `.<name>-container .default-content-wrapper`.

**Section-metadata `style` closed set:** `alt`, `deep`, `intro`, `stage`.

**Buttons:** classic pair = primary green fill / secondary white+green outline;
home = primary lime / secondary ink (via `body.home`). Encode: `<strong><a>`
primary, `<em><a>` secondary. Nav commercial pair is chrome (header block),
not authored buttons.

**Fonts (#80 — LICENSING ALERT):** Altform (×3 weights), Graphik (×2), PP
Formula Condensed Black — ALL proprietary; self-hosted from the captured woff2
mirrors for fidelity. Licensing alert in styles.css banner + fonts/LICENSING.md
+ this log + hand-off. Fallbacks: Graphik→arial (computed metrics),
Altform→arial, PP Formula Condensed→"Arial Narrow", arial (condensed class).

**Images:** all `../current/assets/media/*` refs uploaded to DA
`media/clover/<file>` and authored as `https://content.da.live/paolomoz/clover/media/clover/<file>`.
Icons (SVG) are pure-vector (verified small text files) — OK to ingest.
Videos stay on `videos.ctfassets.net` (external host — correct per #103).
Footer wordmark SVG stays inline in footer block JS (fixed brand asset).

**Deliberate drops (recorded, not accidents):**
- JSON-LD / OG beyond Title+Description: EDS metadata block carries
  Title/Description (mirrored to og:/twitter:); FAQPage/Organization JSON-LD
  from the prototypes is NOT ported (would require head.html/script changes —
  out of contract). Revisit post-launch if needed.
- Prototype scroll-reveal `view()` animations: kept per-block (CSS-only,
  reduced-motion guarded) — content visible by default (no JS-hidden state).
- Home offer strip: home approved without one; interior pages get it via /nav.

## Anti-patterns consciously avoided
- No `text`/`heading` blocks around prose (D1 triage above).
- Section `style` values only on default-content sections.
- No button anchors manufactured in block JS (clone decorated cells).
- Block CSS scoped under block class; wrap containers styled (#13/#74).
- No fonts in head.html; fstab.yaml added (DA mount) — head.html untouched.

## Gate results (pre-deploy, 2026-07-27)

- davids-model-lint: PASS 0 🔴 across all 7 documents. 🟡 justified: SVGs
  verified pure-vector (no base64/`<image>`); segment-band/hardware/stats are
  genuine bespoke widgets (D1); columns `apps` is a painted band, not prose.
- qa-gate (harness): all schema unit counts render (router 6, cards 3/4/2,
  accordion 10/12/10, tiles 4×3, stages 5, hardware 5, stats 3, ops 6,
  tools 8). Header/footer empty in harness = documented limitation
  (fragments not in routing index); verified on deployed preview instead.
- block-roundtrip: closed on all pages. Verified-false-positive classifications:
  - pos-systems tiles[0] "Why Clover": sr-only anchor invented in the
    prototype (never captured content) — deliberately not authored.
  - CTA MISSING/EXTRA pairs (Shop now, Payments, CRM, Contact sales, Learn
    more): prototype sr-only link suffixes + D4 URL qualification; same
    links, same targets, verified paired.
  - moving-parts "01/02/03": step numerals moved to CSS counters.
  - columns instance-count deltas: one-map-per-name limit (proto vt/apps are
    section.band; extra online-ordering split) — each instance verified ✓.
  - carousel chevrons ROLE SWAP: prototype used <a> chevrons; block uses
    <button> (better semantics for scroll controls) — intentional.
- Real fixes from the gates: home hero CTA decode now falls back to
  emphasis-wrapped links (was requiring a.button); segment-band label
  renders uppercase (captured).

## Deployed (2026-07-27) — preview only, not published to live

Branch `stardust` @ github.com/paolomoz/clover; content + 78 media assets in
DA (paolomoz/clover). Preview: https://stardust--clover--paolomoz.aem.page/
(/, /pricing, /pos-systems, /pos-solutions/restaurant, /contact).

Post-deploy reconcile (Step 10):
- .plain.html: all 5 pages 200, exactly one h1, 0 about:error, img counts as
  authored (15/11/22/24/0).
- Computed-style guard: all grids compute grid, chrome loaded, 0 pageerrors,
  0 broken imgs, all 5 pages.
- Deployed eyeball caught + fixed: (1) quote block's <footer> hijacked
  loadFooter's querySelector — chrome footer mounted inside the blockquote
  (renamed to div.quote-attribution); (2) edge-bleed wrapper overrides lost
  to stock `main > .section > div` specificity (now `main .section >
  .x-wrapper`); (3) pricing hero missing its deep-green ground (block now
  paints its section via .segment-router-container).
- CLS (fetch-delayed probe, deployed): home 0.027, pos-systems 0.000,
  pricing 0.024 (after offer-strip height reservation). All < 0.1.
- Interactive drive: hardware radio rail switches slides + media on live.

Open items for the user:
1. FONT LICENSING before live publish (fonts/LICENSING.md).
2. Publish to live: re-run deploy-batch WITHOUT --no-publish after review.
3. PR stardust → main for the production URL.
4. Known deltas vs prototypes: scroll-reveal entrance animations not ported
   (content renders visible; CSS-only reveals could be added per-block);
   FAQPage/Organization JSON-LD not ported (needs head/script decision);
   nav vertical-market links point at converted pages/clover.com (only 5
   pages exist in this migration).
