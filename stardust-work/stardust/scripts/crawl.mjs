#!/usr/bin/env node
/**
 * crawl.mjs — project copy of stardust:extract's reference crawler,
 * extended per reference/playwright-recipe.md to emit the FULL
 * current-state-schema.md record (the bundled reference implements the
 * core; SKILL.md instructs extending capture() to cover the rest).
 *
 * Extensions over the bundled reference:
 *   - full-schema capture(): heading styles + domPath, landmarks with
 *     structured children (body/lists/qa/quotes, purpose heuristic),
 *     heroHeadline/heroLede resolution with junk filter + meta fallback,
 *     CTA computed styles, internal/external link split, media with
 *     naturalWidth/srcset + cssBackgrounds incl. ::before/::after walk,
 *     forms, widgets, components closed-vocab inventory, perSectionStyle,
 *     embedDominance, themeColor, language, fontFaces (for Phase 3).
 *   - reveal pass (open <details>, click aria-expanded=false disclosures,
 *     activate tabs) before capture.
 *   - font-file network intercept -> assets/fonts/.
 *   - img/cssBackground `resolves` flag via in-page HEAD/GET.
 *   - hero-band media download -> assets/media/ (basename + short hash).
 *   - measured waitMs (actual elapsed wait+scroll+reveal+settle).
 *
 * Hardening from the bundled reference is preserved: visibility filter,
 * interstitial drop + count, modal textContent capture, tracking-pixel
 * discount, SPA-shell flag, cross-page duplicate detection, bot-management
 * fallback (headed real Chrome + stealth + challenge solve), slash-retry,
 * response validation, screenshot with viewport fallback.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const WAIT_MS = { fast: 1200, medium: 2500, slow: 5000, spec: 5000 };

const CRAWL_CONTEXT = { reducedMotion: 'reduce', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true, locale: 'en-US' };

function parseArgs(argv) {
  const a = { out: 'stardust/current', max: 25, wait: 'medium', consent: true, concurrency: 4 };
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    if (k === '--url') a.url = argv[(i += 1)];
    else if (k === '--pages') a.pages = argv[(i += 1)].split(',').map((s) => s.trim()).filter(Boolean);
    else if (k === '--out') a.out = argv[(i += 1)];
    else if (k === '--max') a.max = Math.max(1, +argv[(i += 1)] || 25);
    else if (k === '--wait') a.wait = argv[(i += 1)];
    else if (k === '--no-consent-dismiss') a.consent = false;
    else if (k === '--concurrency') a.concurrency = Math.max(1, +argv[(i += 1)] || 4);
    else throw new Error(`unknown arg: ${k}`);
  }
  if (!a.url) throw new Error('--url is required');
  a.origin = new URL(a.url).origin;
  return a;
}

const slugify = (u) => {
  const { pathname } = new URL(u);
  const s = pathname.replace(/^\/|\/$/g, '').replace(/\//g, '__').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  return s || 'home';
};

function assignSlugs(urls) {
  const bySlug = new Map();
  return urls.map((u) => {
    const base = slugify(u);
    const key = dedupeKey(u);
    if (!bySlug.has(base)) { bySlug.set(base, key); return base; }
    if (bySlug.get(base) === key) return base;
    const suffix = crypto.createHash('sha1').update(key).digest('hex').slice(0, 4);
    const alt = `${base}-${suffix}`;
    if (!bySlug.has(alt)) bySlug.set(alt, key);
    return alt;
  });
}

async function launchWithFallback() {
  const headless = await chromium.launch({ headless: true });
  return { browser: headless, technique: 'headless' };
}
const STEALTH_ARGS = ['--disable-blink-features=AutomationControlled'];
async function launchHeadedStealth() {
  return chromium.launch({
    headless: false,
    channel: 'chrome',
    args: STEALTH_ARGS,
    ignoreDefaultArgs: ['--enable-automation'],
  });
}
async function newContext(browser, stealth) {
  const ctx = await browser.newContext(CRAWL_CONTEXT);
  if (stealth) {
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
  }
  return ctx;
}
function isFingerprintBlock(err) {
  const m = String(err && err.message || err);
  return /ERR_HTTP2_PROTOCOL_ERROR|ERR_QUIC_PROTOCOL_ERROR|ERR_CONNECTION_RESET|net::ERR/.test(m);
}
function isChallengeResponse(resp) {
  if (!resp) return false;
  const status = resp.status();
  const h = resp.headers();
  if ((h['cf-mitigated'] || '').toLowerCase() === 'challenge') return true;
  if (status === 403 || status === 429 || status === 503) {
    const server = (h['server'] || '').toLowerCase();
    if (h['cf-ray'] || server.includes('cloudflare')) return true;
    if (h['x-akamai-transformed'] || server.includes('akamai')) return true;
    if (server.includes('big-ip') || server.includes('imperva') || h['x-iinfo']) return true;
  }
  return false;
}
async function clearChallenge(page, resp) {
  for (let attempt = 0; attempt < 3 && isChallengeResponse(resp); attempt += 1) {
    await page.waitForTimeout(4000);
    const reloaded = await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 })
      .catch(() => null);
    if (reloaded) resp = reloaded;
  }
  return resp;
}

function normalizeUrl(u, base) {
  const url = new URL(u, base);
  url.hash = '';
  return url.href;
}
function dedupeKey(href) {
  const url = new URL(href);
  return url.origin + url.pathname.replace(/\/+$/, '') + url.search;
}

async function discover(args, page) {
  const entry = normalizeUrl(args.url);
  if (args.pages) {
    const seen = new Set();
    const listed = args.pages.map((p) => normalizeUrl(p, args.url))
      .filter((u) => { const k = dedupeKey(u); if (seen.has(k)) return false; seen.add(k); return true; });
    const entryKey = dedupeKey(entry);
    const urls = listed.some((u) => dedupeKey(u) === entryKey) ? listed : [entry, ...listed];
    if (urls.length > args.max) {
      console.error(`[crawl] WARN --pages lists ${listed.length} page(s); with the entry URL the total is ${urls.length}, exceeding --max ${args.max} — crawling all of them`);
    }
    return urls;
  }
  const withEntry = (list) => {
    const seen = new Set(); const out = [];
    for (const u of [entry, ...list.map((x) => normalizeUrl(x, args.origin))]) {
      const k = dedupeKey(u);
      if (!seen.has(k)) { seen.add(k); out.push(u); }
    }
    return out.slice(0, args.max);
  };
  for (const sm of ['/sitemap.xml', '/sitemap_index.xml']) {
    try {
      const xml = await page.evaluate(async (u) => {
        const r = await fetch(u); return r.ok ? r.text() : '';
      }, new URL(sm, args.origin).href);
      const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1])
        .filter((u) => u.startsWith(args.origin));
      const isXml = (u) => /\.xml(?:[?#]|$)/i.test(u);
      let pageLocs = locs.filter((u) => !isXml(u));
      const childMaps = locs.filter(isXml).slice(0, 8);
      if (!pageLocs.length && childMaps.length) {
        for (const child of childMaps) {
          try {
            const cx = await page.evaluate(async (u) => {
              const r = await fetch(u); return r.ok ? r.text() : '';
            }, child);
            pageLocs = pageLocs.concat([...cx.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)]
              .map((m) => m[1]).filter((u) => u.startsWith(args.origin) && !isXml(u)));
          } catch { /* skip */ }
        }
      }
      if (pageLocs.length >= 1) return withEntry(pageLocs);
    } catch { /* fall through */ }
  }
  const links = await page.evaluate((origin) => [...document.querySelectorAll('a[href]')]
    .map((a) => a.href).filter((h) => h.startsWith(origin)), args.origin);
  return withEntry(links);
}

async function dismissConsent(page) {
  const sels = ['#onetrust-reject-all-handler', '#onetrust-accept-btn-handler', '.truste-button2', '[aria-label*="Accept" i]',
    'button[id*="accept" i]', 'button[class*="accept" i]'];
  for (const s of sels) {
    const el = await page.$(s);
    if (el) { await el.click().catch(() => {}); await page.waitForTimeout(300); break; }
  }
  // text-based fallback for custom banners (e.g. clover.com's "We need your
  // choice to proceed" modal, which carries no vendor id/class): click the
  // first visible Decline-all / Accept-all button by its label.
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button,[role="button"]')];
    const pick = (re) => btns.find((b) => re.test((b.textContent || '').trim()) && b.getBoundingClientRect().width > 0);
    const b = pick(/^(decline all|reject all|decline|reject)$/i) || pick(/^(accept all|allow all|accept)$/i);
    if (b) b.click();
  }).catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const root = document.querySelector('#usercentrics-root')?.shadowRoot;
    if (root) {
      const btn = root.querySelector('[data-testid="uc-deny-all-button"], [data-testid="uc-accept-all-button"]');
      if (btn) btn.click();
    }
  }).catch(() => {});
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    document.querySelectorAll('#onetrust-banner-sdk, #onetrust-consent-sdk, #truste-consent-track, #usercentrics-root, [class*="cookie" i][class*="banner" i], [id*="consent" i]')
      .forEach((n) => n.remove());
  });
}

// reveal pass: open closed <details>, click disclosure triggers, activate tabs.
async function revealPass(page) {
  await page.evaluate(() => {
    document.querySelectorAll('details:not([open])').forEach((d) => { d.open = true; });
    const inDialog = (el) => !!el.closest('[role="dialog"],[aria-modal="true"]');
    const triggers = [...document.querySelectorAll('[aria-expanded="false"]')]
      .filter((el) => !inDialog(el))
      .filter((el) => el.matches('button,[role="button"],[role="tab"],a[aria-controls],[aria-controls]'))
      .slice(0, 60);
    for (const t of triggers) {
      const href = t.getAttribute && t.getAttribute('href');
      if (href && !href.startsWith('#')) continue; // don't navigate away
      try { t.click(); } catch { /* skip */ }
    }
    const tabs = [...document.querySelectorAll('[role="tab"][aria-selected="false"]')].slice(0, 30);
    for (const t of tabs) { try { t.click(); } catch { /* skip */ } }
  }).catch(() => {});
  await page.waitForTimeout(700);
}

// ---- the capture, run in-page; full current-state-schema.md record ----
function capture() {
  const vis = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest('[aria-hidden="true"],[hidden]')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.bottom < -2000 || r.right < -2000) return false;
    return true;
  };
  const INTERSTITIAL = /(temporarily unavailable|page unavailable|continuing to a page|go back to spanish|continue in english|this site uses cookies|accept all cookies|change cookie settings|privacy notice|we need your choice to proceed|manage preferences|essential cookies|uses some cookies)/i;
  const isInterstitial = (t) => t && INTERSTITIAL.test(t.trim());
  // junk / hidden-state filter (recipe § 5-bis) for hero + label reuse
  const JUNK = [
    /^(thank you|our apologies|sign in|sign up|subscribe|newsletter|follow us|share this|related|contact us)\b/i,
    /(featured products|limited-time offer|% off|save \d+%)/i,
    /^\d[\d,]*\s*(products?|results?|items?)$/i,
    /^\d[\d,]*$/,
    /[{}]/,
  ];
  const isJunk = (t) => !t || JUNK.some((re) => re.test(t.trim()));

  let filtered = 0;
  const text = (el) => (el && (el.textContent || '').replace(/\s+/g, ' ').trim()) || '';
  const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.content
    || document.querySelector(`meta[property="${n}"]`)?.content || null;

  const domPath = (el) => {
    const parts = [];
    let n = el;
    let depth = 0;
    while (n && n.nodeType === 1 && depth < 7 && n !== document.documentElement) {
      let seg = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`${seg}#${n.id}`); break; }
      const cls = [...n.classList].slice(0, 2).join('.');
      if (cls) seg += `.${cls}`;
      else if (n.parentElement) {
        const sibs = [...n.parentElement.children].filter((c) => c.tagName === n.tagName);
        if (sibs.length > 1) seg += `:nth-child(${[...n.parentElement.children].indexOf(n) + 1})`;
      }
      parts.unshift(seg);
      n = n.parentElement;
      depth += 1;
    }
    return parts.join(' > ');
  };

  const styleOf = (el) => {
    const cs = getComputedStyle(el);
    return {
      fontFamily: cs.fontFamily,
      fontWeight: +cs.fontWeight || cs.fontWeight,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
    };
  };

  // ---- headings (visible, non-interstitial), with style + domPath ----
  const headingEls = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => {
    if (!vis(h)) return false;
    if (isInterstitial(text(h))) { filtered += 1; return false; }
    return !!text(h);
  });
  const headings = headingEls.map((h) => ({
    level: +h.tagName[1],
    text: text(h),
    id: h.id || null,
    domPath: domPath(h),
    style: styleOf(h),
  }));

  // ---- heroHeadline / heroLede (recipe § 5-bis) ----
  let heroSource = 'dom';
  let heroHeadline = '';
  let heroLede = '';
  {
    const cands = headingEls
      .filter((h) => ['H1', 'H2', 'H3'].includes(h.tagName))
      .map((h) => ({ el: h, r: h.getBoundingClientRect(), fs: parseFloat(getComputedStyle(h).fontSize) }))
      .filter((c) => c.r.top + window.scrollY <= 820 && c.r.width >= 120 && !isJunk(text(c.el)));
    cands.sort((a, b) => b.fs - a.fs);
    if (cands.length) heroHeadline = text(cands[0].el);
    const ps = [...document.querySelectorAll('p')].filter(vis)
      .map((p) => ({ p, r: p.getBoundingClientRect(), t: text(p) }))
      .filter((c) => c.r.top + window.scrollY <= 1300 && c.t.length >= 40 && c.t.length <= 400 && !isJunk(c.t) && !isInterstitial(c.t));
    if (ps.length) heroLede = ps[0].t;
    const md = meta('description') || '';
    if (!heroHeadline || isJunk(heroHeadline)) {
      heroHeadline = (md.split(/(?<=[.!?])\s/)[0] || '').trim();
      heroSource = 'meta-fallback';
    }
    if (!heroLede) heroLede = md;
  }

  // ---- landmarks with structured children ----
  const purposeOf = (sec) => {
    const cls = (sec.className || '').toString().toLowerCase();
    const t = text(sec).toLowerCase();
    const r = sec.getBoundingClientRect();
    if (/hero|banner|masthead/.test(cls) || (r.top + window.scrollY < 300 && sec.querySelector('h1'))) return 'hero';
    if (sec.querySelector('form')) return 'form';
    if (/testimonial|review|quote/.test(cls) || sec.querySelector('blockquote')) return 'social-proof';
    if (/cta|banner/.test(cls) && sec.querySelectorAll('a,button').length <= 4 && t.length < 400) return 'cta-band';
    if (/feature|benefit|grid|card/.test(cls)) return 'feature-list';
    if (sec.closest('footer')) return 'footer-nav';
    if (sec.querySelectorAll('p').length >= 3) return 'rich-text';
    return 'unknown';
  };
  const sectionChildren = (root) => {
    let secs = [...root.querySelectorAll(':scope > section, :scope > div > section, :scope > article')];
    if (!secs.length) secs = [...root.children].filter((c) => !['SCRIPT', 'STYLE', 'LINK'].includes(c.tagName));
    return secs.filter(vis).slice(0, 40).map((sec) => {
      const bodyPs = [...sec.querySelectorAll('p,blockquote')].filter((p) => {
        if (!vis(p) && !p.closest('[role="dialog"],.modal')) return false;
        const t = text(p);
        if (!t || t.length < 2) return false;
        if (isInterstitial(t)) { filtered += 1; return false; }
        return true;
      }).map(text);
      const lists = [...sec.querySelectorAll('ul,ol')].filter(vis).slice(0, 12).map((l) => ({
        ordered: l.tagName === 'OL',
        items: [...l.querySelectorAll(':scope > li')].map(text).filter(Boolean).slice(0, 30),
      })).filter((l) => l.items.length);
      const qa = [];
      for (const d of sec.querySelectorAll('details')) {
        const q = text(d.querySelector('summary'));
        const a = (d.textContent || '').replace(/\s+/g, ' ').trim().replace(q, '').trim();
        if (q) qa.push({ q, a: a || null });
      }
      for (const tgr of sec.querySelectorAll('[aria-expanded][aria-controls]')) {
        const q = text(tgr);
        const panel = document.getElementById(tgr.getAttribute('aria-controls'));
        const a = panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim() : null;
        if (q && !qa.some((e) => e.q === q)) qa.push({ q, a: a || null });
      }
      const quotes = [...sec.querySelectorAll('blockquote,[class*="testimonial" i]')].slice(0, 8).map((b) => {
        const t = text(b);
        const attr = text(b.querySelector('cite,figcaption,[class*="author" i],[class*="attribution" i]')) || null;
        const rEl = b.querySelector('[aria-label*="out of 5" i]');
        const rating = rEl ? parseFloat((rEl.getAttribute('aria-label').match(/([\d.]+)\s*out of/i) || [])[1]) || null : null;
        return t && t.length > 20 ? { text: t, attribution: attr, rating } : null;
      }).filter(Boolean);
      const headEl = sec.querySelector('h1,h2,h3,h4,h5,h6');
      const headText = headEl ? text(headEl) : null;
      const it = text(sec);
      return {
        tag: sec.tagName.toLowerCase(),
        role: sec.getAttribute('role') || null,
        id: sec.id || null,
        classes: [...sec.classList].slice(0, 5),
        purpose: purposeOf(sec),
        headlineRef: headText ? headings.findIndex((h) => h.text === headText) : null,
        innerTextSummary: it.slice(0, 240),
        wordCount: it ? it.split(/\s+/).length : 0,
        body: bodyPs.slice(0, 40),
        lists,
        qa: qa.slice(0, 20),
        quotes,
      };
    });
  };
  const landmarkEls = [...document.querySelectorAll('header,nav,main,aside,footer,[role="banner"],[role="navigation"],[role="main"],[role="complementary"],[role="contentinfo"]')]
    .filter((el, i, arr) => !arr.some((other) => other !== el && other.contains(el) && other.tagName === el.tagName));
  const landmarks = landmarkEls.slice(0, 12).map((lm) => ({
    tag: lm.tagName.toLowerCase(),
    role: lm.getAttribute('role') || ({ HEADER: 'banner', NAV: 'navigation', MAIN: 'main', ASIDE: 'complementary', FOOTER: 'contentinfo' }[lm.tagName] || null),
    id: lm.id || null,
    classes: [...lm.classList].slice(0, 5),
    innerText: (lm.innerText || '').replace(/\s+/g, ' ').trim(),
    children: (lm.tagName === 'MAIN' || lm.getAttribute('role') === 'main') ? sectionChildren(lm) : sectionChildren(lm).slice(0, 8),
  }));

  const main = document.querySelector('main') || document.body;

  // ---- body paragraphs (page-level, for hash + stats) ----
  const body = [...main.querySelectorAll('p,blockquote,li')].filter((p) => {
    if (!vis(p)) return false;
    const t = text(p);
    if (!t || t.length < 2) return false;
    if (isInterstitial(t)) { filtered += 1; return false; }
    return true;
  }).map(text);

  // ---- CTAs: visually button-like, with computed style ----
  // The visual button surface is often a CHILD of the anchor (anchor itself
  // transparent, e.g. clover.com's new template), so resolve an "effective
  // style element": the anchor itself, or the largest descendant (≤2 levels)
  // with a non-transparent background covering most of the anchor's area.
  const effectiveButtonEl = (el, r) => {
    const own = getComputedStyle(el);
    if (own.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(own.backgroundColor)) return el;
    let best = null;
    for (const child of el.querySelectorAll(':scope > *, :scope > * > *')) {
      const cs = getComputedStyle(child);
      if (!cs.backgroundColor || /rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor)) continue;
      const cr = child.getBoundingClientRect();
      if (cr.width >= r.width * 0.5 && cr.height >= r.height * 0.4) {
        if (!best || cr.width * cr.height > best.area) best = { el: child, area: cr.width * cr.height };
      }
    }
    return best ? best.el : null;
  };
  // visible label only: skip sr-only / clipped descendants (they fail vis()).
  const visibleLabel = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const parts = [];
    let n;
    while ((n = w.nextNode())) {
      const pe = n.parentElement;
      if (!pe || !vis(pe)) continue;
      const cs = getComputedStyle(pe);
      if (cs.position === 'absolute' && (parseFloat(cs.width) <= 2 || cs.clip !== 'auto' && cs.clip !== '')) continue;
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };
  const ctas = [...document.querySelectorAll('a[href],button,[role="button"]')].filter(vis).map((el) => {
    const r = el.getBoundingClientRect();
    const isButtonTag = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
    const surf = effectiveButtonEl(el, r);
    const scs = surf ? getComputedStyle(surf) : null;
    const looksButton = !!surf && parseFloat(getComputedStyle(surf === el ? el : surf).borderRadius) > 2;
    if (!isButtonTag && !looksButton) return null;
    const cs = getComputedStyle(el);
    return {
      label: visibleLabel(el) || text(el),
      href: el.getAttribute('href') || null,
      tag: el.tagName.toLowerCase(),
      domPath: domPath(el),
      style: {
        backgroundColor: scs ? scs.backgroundColor : cs.backgroundColor,
        color: scs ? scs.color : cs.color,
        fontFamily: cs.fontFamily,
        fontWeight: +cs.fontWeight || cs.fontWeight,
        borderRadius: scs ? scs.borderRadius : cs.borderRadius,
        padding: scs ? `${scs.paddingTop} ${scs.paddingRight}` : `${cs.paddingTop} ${cs.paddingRight}`,
        boxShadow: scs ? scs.boxShadow : cs.boxShadow,
      },
      appearsAbove: (r.top + window.scrollY) < 900 ? 'fold' : 'below-fold',
    };
  }).filter(Boolean).filter((c) => c.label && !isInterstitial(c.label)).slice(0, 80);

  // ---- links, internal/external split ----
  const seenLink = new Set();
  const linksInternal = []; const linksExternal = [];
  for (const a of document.querySelectorAll('a[href]')) {
    let href;
    try { href = new URL(a.href); } catch { continue; }
    if (!/^https?:$/.test(href.protocol)) continue;
    const t = text(a);
    const key = `${href.href}::${t}`;
    if (seenLink.has(key)) continue;
    seenLink.add(key);
    const entry = { href: href.host === location.host ? href.pathname + href.search : href.href, text: t, domPath: domPath(a) };
    (href.host === location.host ? linksInternal : linksExternal).push(entry);
  }

  // ---- media ----
  const imgs = [...document.querySelectorAll('img')].map((im) => {
    const r = im.getBoundingClientRect();
    return {
      src: im.src || null,
      currentSrc: im.currentSrc || im.src || null,
      srcset: im.getAttribute('srcset') || null,
      alt: im.alt || '',
      naturalWidth: im.naturalWidth,
      naturalHeight: im.naturalHeight,
      rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), width: Math.round(r.width), height: Math.round(r.height) },
      domPath: domPath(im),
    };
  });
  const realImgs = imgs.filter((im) => im.currentSrc && im.naturalWidth > 2 && im.naturalHeight > 2
    && !/(^data:|1x1|pixel|track|beacon|\/p\?|\/b\?)/i.test(im.currentSrc));
  const cssBgs = [];
  const pushBg = (el, bg, pseudo) => {
    const r = el.getBoundingClientRect();
    for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      const url = m[1];
      if (/^data:/.test(url)) continue;
      const cs = pseudo ? getComputedStyle(el, pseudo) : getComputedStyle(el);
      let abs; try { abs = new URL(url, location.href).href; } catch { abs = url; }
      cssBgs.push({
        url: abs,
        domPath: domPath(el) + (pseudo || ''),
        boundingClientRect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), width: Math.round(r.width), height: Math.round(r.height) },
        backgroundSize: cs.backgroundSize,
        backgroundPosition: cs.backgroundPosition,
        backgroundRepeat: cs.backgroundRepeat,
      });
    }
  };
  const allEls = [...document.querySelectorAll('*')];
  for (const el of allEls) {
    const r = el.getBoundingClientRect();
    if (r.width < 100 || r.height < 80) continue;
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none' && /url\(/.test(bg)) pushBg(el, bg, null);
    for (const pseudo of ['::before', '::after']) {
      const pbg = getComputedStyle(el, pseudo).backgroundImage;
      if (pbg && pbg !== 'none' && /url\(/.test(pbg)) pushBg(el, pbg, pseudo);
    }
  }
  const inlineSvgs = [...document.querySelectorAll('svg')].filter(vis).slice(0, 60).map((s) => ({
    viewBox: s.getAttribute('viewBox') || null,
    domPath: domPath(s),
    width: Math.round(s.getBoundingClientRect().width),
  }));
  const videos = [...document.querySelectorAll('video')].map((v) => {
    const r = v.getBoundingClientRect();
    return {
      src: v.currentSrc || v.src || v.querySelector('source')?.src || null,
      poster: v.poster || null,
      autoplay: v.autoplay, loop: v.loop, muted: v.muted,
      rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), width: Math.round(r.width), height: Math.round(r.height) },
      domPath: domPath(v),
    };
  });
  const iframes = [...document.querySelectorAll('iframe')].filter(vis).map((f) => {
    const r = f.getBoundingClientRect();
    return {
      src: f.src || null, title: f.title || null,
      rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), width: Math.round(r.width), height: Math.round(r.height) },
    };
  });

  // ---- embed dominance ----
  let embedDominance = { dominated: false, iframeSrc: null, viewportCoveragePct: null, mainHeightCoveragePct: null };
  const mainH = Math.max(1, (document.querySelector('main') || document.body).getBoundingClientRect().height);
  for (const f of iframes) {
    if (!f.src) continue;
    let host; try { host = new URL(f.src).host; } catch { continue; }
    if (host === location.host) continue;
    const vp = Math.round(100 * Math.min(f.rect.width, 1440) * Math.min(f.rect.height, 900) / (1440 * 900));
    const mh = Math.round(100 * f.rect.height / mainH);
    if (vp > 50 || mh > 80) { embedDominance = { dominated: true, iframeSrc: f.src, viewportCoveragePct: vp, mainHeightCoveragePct: mh }; break; }
  }

  // ---- modal / AJAX detail (textContent even when hidden) ----
  const modals = [...document.querySelectorAll('[role="dialog"],[aria-modal="true"],.modal,.modal-content')]
    .map((m) => text(m)).filter((t) => t && t.length > 40).slice(0, 10);

  // ---- forms ----
  const forms = [...document.querySelectorAll('form')].slice(0, 12).map((f) => {
    const action = f.getAttribute('action') || null;
    const fields = [...f.querySelectorAll('input,select,textarea')].filter((i) => i.type !== 'hidden').slice(0, 25).map((i) => ({
      type: i.tagName === 'TEXTAREA' ? 'textarea' : (i.tagName === 'SELECT' ? 'select' : (i.type || 'text')),
      name: i.name || null,
      label: (i.labels && i.labels[0] ? text(i.labels[0]) : (i.getAttribute('placeholder') || i.getAttribute('aria-label') || null)),
      required: i.required || false,
    }));
    const html = f.outerHTML.slice(0, 3000);
    const thirdParty = /stripe/i.test(html) ? 'stripe' : /calendly/i.test(html) ? 'calendly' : /typeform/i.test(html) ? 'typeform' : /mailchimp|mc4wp/i.test(html) ? 'mailchimp' : /marketo|mkto/i.test(html) ? 'marketo' : /hubspot|hs-form/i.test(html) ? 'hubspot' : null;
    return { action, method: (f.getAttribute('method') || 'get').toLowerCase(), fields, thirdParty };
  });

  // ---- widgets ----
  const widgets = {
    modals: [...document.querySelectorAll('dialog,[role="dialog"]')].slice(0, 8).map((m) => ({ trigger: null, domPath: domPath(m) })),
    accordions: document.querySelectorAll('details').length
      ? [{ domPath: 'details', itemCount: document.querySelectorAll('details').length }]
      : (document.querySelectorAll('[aria-expanded][aria-controls]').length >= 2
        ? [{ domPath: '[aria-expanded][aria-controls]', itemCount: document.querySelectorAll('[aria-expanded][aria-controls]').length }] : []),
    tabs: [...document.querySelectorAll('[role="tablist"]')].slice(0, 6).map((t) => ({ domPath: domPath(t), tabCount: t.querySelectorAll('[role="tab"]').length })),
  };

  // ---- components (closed vocabulary) ----
  const q = (sel) => { try { return [...document.querySelectorAll(sel)].filter(vis); } catch { return []; } };
  const comp = (els) => ({ count: els.length, examples: [...new Set(els.slice(0, 3).map((e) => domPath(e)))].slice(0, 2) });
  const cardEls = q('.card,[class*="card"]:not([class*="card-grid"])');
  const gridEls = allEls.filter((el) => {
    const cs = getComputedStyle(el);
    if (!(cs.display === 'grid' || (cs.display === 'flex' && cs.flexWrap === 'wrap'))) return false;
    const kids = [...el.children].filter(vis);
    if (kids.length < 3) return false;
    const w = kids.map((k) => Math.round(k.getBoundingClientRect().width));
    return w[0] > 100 && w.every((x) => Math.abs(x - w[0]) < 12);
  }).slice(0, 30);
  const statRowEls = gridEls.filter((el) => {
    const kids = [...el.children];
    const numKids = kids.filter((k) => /\d{2,}|[%$]/.test(text(k)) && text(k).length < 120);
    return kids.length >= 3 && numKids.length >= 3;
  });
  const components = {
    cards: comp(cardEls),
    grids: comp(gridEls),
    accordions: comp(q('details,[aria-expanded][aria-controls]')),
    tabs: comp(q('[role="tablist"]')),
    tables: comp(q('table:not([role="presentation"])')),
    modals: comp(q('dialog,[role="dialog"]')),
    carousels: comp(q('[class*="carousel" i],[class*="swiper" i],[class*="slick" i],[class*="slider" i]')),
    videos: comp(q('video')),
    iframes: comp([...document.querySelectorAll('iframe')]),
    dataVizEmbeds: comp(q('iframe[src*="datawrapper"],iframe[src*="flourish"],iframe[src*="tableau"],canvas[class*="chart" i]')),
    teamTiles: comp(q('[class*="team" i] [class*="member" i],[class*="staff" i]')),
    pricingTiles: comp(q('[class*="pricing" i] [class*="tier" i],[class*="pricing" i] [class*="card" i],[class*="plan-card" i]')),
    testimonialCards: comp(q('[class*="testimonial" i],blockquote')),
    logoStrip: comp(allEls.filter((el) => {
      const kids = [...el.children].filter((k) => k.matches('img,svg') || k.querySelector(':scope > img, :scope > svg'));
      if (kids.length < 4 || kids.length !== [...el.children].length) return false;
      const h = kids.map((k) => Math.round(k.getBoundingClientRect().height)).filter(Boolean);
      return h.length >= 4 && h.every((x) => Math.abs(x - h[0]) < 15) && text(el).length < 60;
    }).slice(0, 5)),
    timeline: comp(q('[class*="timeline" i],ol[class*="step" i]')),
    breadcrumbs: comp(q('nav[aria-label*="breadcrumb" i],[class*="breadcrumb" i]')),
    statRow: comp(statRowEls),
    ctaBand: comp(allEls.filter((el) => el.tagName === 'SECTION' && purposeOf(el) === 'cta-band').slice(0, 5)),
    formFields: comp(q('form input:not([type="hidden"]),form textarea,form select')),
    other: [],
  };

  // ---- per-section style ----
  const effBg = (el) => {
    let n = el;
    while (n && n.nodeType === 1) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
      n = n.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };
  const mode = (arr) => {
    const f = {};
    for (const v of arr) { if (v) f[v] = (f[v] || 0) + 1; }
    return Object.entries(f).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  };
  // outermost sections inside main (a lone <article> wrapper — the clover.com
  // home shape — would otherwise collapse per-section style to one entry)
  const mainRoot = document.querySelector('main') || document.body;
  let mainSections = [...mainRoot.querySelectorAll('section, article > section, :scope > div')]
    .filter((s) => { let a = s.parentElement; while (a && a !== mainRoot) { if (/^(SECTION)$/.test(a.tagName)) return false; a = a.parentElement; } return true; })
    .filter(vis).filter((c) => !['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT'].includes(c.tagName));
  if (!mainSections.length) mainSections = [...mainRoot.children].filter(vis).filter((c) => !['SCRIPT', 'STYLE', 'LINK', 'NOSCRIPT'].includes(c.tagName));
  mainSections = mainSections.slice(0, 25);
  const perSectionStyle = mainSections.map((sec) => {
    const cs = getComputedStyle(sec);
    const kids = [...sec.children].filter(vis);
    const textEl = sec.querySelector('p,h2,h3,li') || sec;
    const fams = new Set();
    for (const el of [sec.querySelector('h1,h2,h3'), sec.querySelector('p,li')].filter(Boolean)) {
      fams.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim());
    }
    const shadows = [...new Set(kids.map((k) => getComputedStyle(k).boxShadow).filter((s) => s && s !== 'none'))].slice(0, 3);
    return {
      sectionRef: domPath(sec),
      purpose: purposeOf(sec),
      background: {
        color: effBg(sec),
        hasImage: getComputedStyle(sec).backgroundImage !== 'none' || !!sec.querySelector(':scope > img, :scope > picture'),
        hasGradient: /gradient/.test(getComputedStyle(sec).backgroundImage),
      },
      text: { dominantColor: getComputedStyle(textEl).color },
      spacing: { paddingBlock: cs.paddingTop, paddingInline: cs.paddingLeft, gap: cs.gap !== 'normal' ? cs.gap : mode(kids.map((k) => getComputedStyle(k).gap).filter((g) => g && g !== 'normal')) },
      borderRadius: mode(kids.map((k) => getComputedStyle(k).borderRadius).filter((r) => r && r !== '0px')),
      fontFamilies: [...fams],
      shadowsUsed: shadows,
    };
  });

  // ---- css custom properties (declared-on-root walk + live values) ----
  const propNames = new Set();
  const declaredFallback = {};
  const isConditionalMedia = (media) => !!(media && media.mediaText && !/^(all)?$/i.test(media.mediaText.trim()));
  const walkRules = (rules, conditional) => {
    for (const rule of rules || []) {
      if (rule.type === 3 || (typeof CSSImportRule !== 'undefined' && rule instanceof CSSImportRule)) {
        try { if (rule.styleSheet) walkRules(rule.styleSheet.cssRules, conditional || isConditionalMedia(rule.media)); } catch { /* cross-origin */ }
        continue;
      }
      if (rule.style && rule.selectorText) {
        const selectors = rule.selectorText.split(',').map((s) => s.trim());
        if (selectors.some((s) => /^(:root|html)\b/.test(s))) {
          const unconditionalRoot = !conditional && selectors.some((s) => s === ':root' || s === 'html');
          for (const p of rule.style) {
            if (!p.startsWith('--')) continue;
            propNames.add(p);
            if (unconditionalRoot) declaredFallback[p] = rule.style.getPropertyValue(p).trim();
          }
        }
      }
      if (rule.cssRules && rule.cssRules.length) {
        const groupConditional = conditional || typeof rule.conditionText === 'string';
        try { walkRules(rule.cssRules, groupConditional); } catch { /* skip */ }
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try { walkRules(sheet.cssRules, isConditionalMedia(sheet.media)); } catch { /* cross-origin */ }
  }
  for (const p of document.documentElement.style) {
    if (p.startsWith('--')) { propNames.add(p); declaredFallback[p] = document.documentElement.style.getPropertyValue(p).trim(); }
  }
  const rootStyle = getComputedStyle(document.documentElement);
  const cssCustomProperties = [];
  for (const name of propNames) {
    const live = rootStyle.getPropertyValue(name).trim();
    const value = live || declaredFallback[name];
    if (value) cssCustomProperties.push({ name, value });
  }

  // ---- @font-face rules (metadata for Phase 3; files saved by network intercept) ----
  const fontFaces = [];
  const walkFonts = (rules) => {
    for (const rule of rules || []) {
      try {
        if (rule.type === 5 /* FONT_FACE_RULE */) {
          const s = rule.style;
          const src = s.getPropertyValue('src');
          const urls = [...src.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => { try { return new URL(m[1], rule.parentStyleSheet?.href || location.href).href; } catch { return m[1]; } });
          fontFaces.push({
            family: s.getPropertyValue('font-family').replace(/["']/g, '').trim(),
            weight: s.getPropertyValue('font-weight') || 'normal',
            style: s.getPropertyValue('font-style') || 'normal',
            display: s.getPropertyValue('font-display') || null,
            unicodeRange: s.getPropertyValue('unicode-range') || null,
            urls,
            cssRule: rule.cssText.slice(0, 500),
          });
        }
        if (rule.styleSheet) walkFonts(rule.styleSheet.cssRules);
        else if (rule.cssRules) walkFonts(rule.cssRules);
      } catch { /* cross-origin */ }
    }
  };
  for (const sheet of document.styleSheets) { try { walkFonts(sheet.cssRules); } catch { /* skip */ } }

  // ---- icon-font detection (recipe § 17) ----
  let iconFontProbe = null;
  {
    const glyphs = new Map();
    let family = null;
    for (const el of document.querySelectorAll('[class^="icon-"],[class*=" icon-"],i.icon,[data-icon]')) {
      const cs = getComputedStyle(el, '::before');
      const fam = cs.fontFamily.replace(/["']/g, '').split(',')[0].trim();
      const content = cs.content;
      if (!fam || /system-ui|arial|helvetica|sans-serif|serif|-apple-system/i.test(fam)) continue;
      if (!content || content === 'none' || content === '""' || content === 'normal') continue;
      const cls = [...el.classList].find((c) => c.startsWith('icon-')) || el.getAttribute('data-icon') || null;
      if (cls && !glyphs.has(cls)) glyphs.set(cls, content.replace(/["']/g, ''));
      family = family || fam;
    }
    if (family && glyphs.size) {
      iconFontProbe = { family, glyphs: [...glyphs.entries()].slice(0, 100).map(([cls, cp]) => ({ class: cls, codepoint: cp, name: cls.replace(/^icon-/, '') || null })) };
    }
  }

  // ---- theme color, language ----
  const themeColor = {
    light: document.querySelector('meta[name="theme-color"]:not([media*="dark"])')?.content || document.querySelector('meta[name="theme-color"]')?.content || null,
    dark: document.querySelector('meta[name="theme-color"][media*="dark"]')?.content || null,
  };

  // ---- favicon + apple-touch-icon hrefs (for Phase 3) ----
  const iconLinks = [...document.querySelectorAll('link[rel*="icon" i]')].map((l) => ({
    rel: l.rel, href: (() => { try { return new URL(l.getAttribute('href'), location.href).href; } catch { return l.href; } })(), sizes: l.getAttribute('sizes') || null,
  }));

  // ---- logo candidates (recipe § Logo locator chain, steps 1-2; resolved in Phase 3) ----
  const logoCandidates = [];
  for (const scopeEl of document.querySelectorAll('header,[role="banner"],nav')) {
    for (const svg of scopeEl.querySelectorAll('svg')) {
      const r = svg.getBoundingClientRect();
      if (r.width >= 60 && r.top <= 200 && vis(svg)) {
        logoCandidates.push({ kind: 'inline-svg', domPath: domPath(svg), width: Math.round(r.width), height: Math.round(r.height), markup: svg.outerHTML.length < 20000 ? svg.outerHTML : null, ariaLabel: svg.getAttribute('aria-label') });
      }
    }
    for (const im of scopeEl.querySelectorAll('img')) {
      const idStr = `${im.src} ${im.alt} ${im.className} ${im.id}`.toLowerCase();
      const r = im.getBoundingClientRect();
      if (/logo|brand/.test(idStr) && r.height >= 32 && r.width >= 40 && r.top <= 200) {
        const ar = r.width / Math.max(1, r.height);
        if (ar >= 0.5 && ar <= 3.0) logoCandidates.push({ kind: 'img', src: im.currentSrc || im.src, alt: im.alt, domPath: domPath(im), width: Math.round(r.width), height: Math.round(r.height) });
      }
    }
  }

  const mainText = text(main);
  const distinctHeadings = new Set(headings.map((h) => h.text)).size;
  const spaShellSuspect = distinctHeadings < 2 && mainText.length < 200 && realImgs.length === 0;
  const contentHash = `${headings.map((h) => h.text).join('|')}::${mainText.slice(0, 4000)}`;

  const codeBlocks = [...document.querySelectorAll('pre')].filter(vis)
    .map((el) => (el.innerText || '').trim()).filter(Boolean);

  return {
    finalUrl: location.href,
    title: document.title || null,
    metaDescription: meta('description'),
    heroHeadline, heroLede, heroSource,
    og: { title: meta('og:title'), description: meta('og:description'), image: meta('og:image'), type: meta('og:type'), siteName: meta('og:site_name') },
    themeColor,
    language: document.documentElement.lang || null,
    headings,
    landmarks,
    ctas,
    links: { internal: linksInternal, external: linksExternal },
    media: {
      images: realImgs,
      allImgCount: imgs.length,
      inlineSvgs,
      cssBackgrounds: (() => { const seen = new Set(); return cssBgs.filter((b) => { const k = b.url + b.domPath; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 60); })(),
      modals,
      videos,
      iframes,
    },
    forms,
    widgets,
    components,
    perSectionStyle,
    embedDominance,
    cssCustomProperties,
    codeBlocks,
    body,
    fontFaces,
    iconFontProbe,
    iconLinks,
    logoCandidates,
    stats: {
      wordCount: mainText ? mainText.split(/\s+/).length : 0,
      ctaCount: ctas.length,
      internalLinkCount: linksInternal.length,
      externalLinkCount: linksExternal.length,
      imageCount: realImgs.length,
    },
    _signals: {
      filteredInterstitials: filtered,
      distinctHeadings,
      mainTextLen: mainText.length,
      realImageCount: realImgs.length,
      trackingOnlyMedia: imgs.length > 0 && realImgs.length === 0,
      spaShellSuspect,
    },
    _contentHash: contentHash,
  };
}

async function capturePage(context, url, slug, args) {
  const page = await context.newPage();
  try {
    let resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!resp) throw Object.assign(new Error('no response'), { errorClass: 'TimeoutError' });
    resp = await clearChallenge(page, resp);
    let status = resp.status();
    let resolvedUrl = url;
    if (status === 404) {
      const u = new URL(url);
      if (u.pathname.length > 1) {
        u.pathname = u.pathname.endsWith('/') ? u.pathname.replace(/\/+$/, '') : `${u.pathname}/`;
        const retry = await page.goto(u.href, { waitUntil: 'domcontentloaded', timeout: 15000 })
          .catch(() => null);
        if (retry && retry.status() < 400) {
          console.error(`[crawl] slash-retry OK ${url} -> ${u.href}`);
          resp = retry; status = retry.status(); resolvedUrl = u.href;
        }
      }
    }
    if (status >= 400) throw Object.assign(new Error(`HTTP ${status}`), { errorClass: 'HTTPError' });
    const ct = resp.headers()['content-type'] || '';
    if (!/text\/html|application\/xhtml/.test(ct)) throw Object.assign(new Error(`content-type ${ct}`), { errorClass: 'ContentTypeError' });

    const waitStart = Date.now();
    if (args.consent) await dismissConsent(page);
    await page.waitForTimeout(WAIT_MS[args.wait] || WAIT_MS.medium);
    for (let y = 0; y <= 1; y += 0.34) {
      await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), y);
      await page.waitForTimeout(400);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await revealPass(page);
    // flat settle: entry animations must reach final state before the visibility
    // filter reads computed opacity (800ms floor is load-bearing — see reference).
    await page.waitForTimeout(800);
    // force-reveal scroll-reveal placeholders: content-bearing main elements
    // still at computed opacity 0 (IO-driven reveal libs that reset on
    // scroll-to-top) are forced visible so neither the visibility filter nor
    // the full-page screenshot drops real content. Dialogs / aria-hidden
    // regions are deliberately excluded — those are genuinely not-content.
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' }).catch(() => {});
    await page.evaluate(() => {
      const root = document.querySelector('main') || document.body;
      for (const el of root.querySelectorAll('*')) {
        if (el.closest('[role="dialog"],[aria-modal="true"],[aria-hidden="true"],[hidden]')) continue;
        const cs = getComputedStyle(el);
        if (+cs.opacity === 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
          && ((el.textContent || '').trim().length > 10 || el.querySelector('img,svg,video'))) {
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('transform', 'none', 'important');
        }
      }
    }).catch(() => {});
    await page.waitForTimeout(300);
    const waitMs = Date.now() - waitStart;

    const rec = await page.evaluate(capture);
    if (!rec.headings.length && rec._signals.mainTextLen === 0 && rec._signals.realImageCount === 0) {
      throw Object.assign(new Error('empty page — possibly soft-404'), { errorClass: 'EmptyPageError' });
    }

    // ---- resolves check: in-page HEAD (fallback GET) with page-context fingerprint ----
    const checkUrls = [...new Set([
      ...rec.media.images.map((i) => i.currentSrc),
      ...rec.media.cssBackgrounds.map((b) => b.url),
    ].filter(Boolean))].slice(0, 40);
    const resolved = await page.evaluate(async (urls) => {
      const out = {};
      await Promise.all(urls.map(async (u) => {
        try {
          let r = await fetch(u, { method: 'HEAD' });
          if (!r.ok) r = await fetch(u, { method: 'GET' });
          out[u] = r.ok && /^image\/|^video\/|octet-stream/.test(r.headers.get('content-type') || 'image/');
        } catch { out[u] = false; }
      }));
      return out;
    }, checkUrls).catch(() => ({}));
    for (const im of rec.media.images) im.resolves = resolved[im.currentSrc] ?? null;
    for (const bg of rec.media.cssBackgrounds) bg.resolves = resolved[bg.url] ?? null;

    // ---- download hero-band / large media (basename + short hash) ----
    const mediaDir = path.join(args.out, 'assets', 'media');
    await mkdir(mediaDir, { recursive: true });
    const seenDl = new Set();
    const dlCandidates = [
      ...rec.media.images.filter((i) => i.resolves && i.rect && i.rect.width * i.rect.height >= 60000).map((i) => ({ url: i.currentSrc, ref: i })),
      ...rec.media.cssBackgrounds.filter((b) => b.resolves && b.boundingClientRect.width * b.boundingClientRect.height >= 60000).map((b) => ({ url: b.url, ref: b })),
    ].filter((c) => { if (seenDl.has(c.url)) return false; seenDl.add(c.url); return true; }).slice(0, 10);
    for (const cand of dlCandidates) {
      try {
        const b64 = await page.evaluate(async (u) => {
          const r = await fetch(u);
          if (!r.ok) return null;
          const buf = await r.arrayBuffer();
          if (buf.byteLength > 4 * 1024 * 1024) return null;
          let s = '';
          const bytes = new Uint8Array(buf);
          for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
          return btoa(s);
        }, cand.url);
        if (!b64) { cand.ref.localPath = null; continue; }
        const u = new URL(cand.url);
        const base = path.basename(u.pathname).replace(/[^a-z0-9._-]+/gi, '-').slice(0, 60) || 'asset';
        const hash = crypto.createHash('sha1').update(cand.url).digest('hex').slice(0, 6);
        const fname = `${path.basename(base, path.extname(base))}-${hash}${path.extname(base) || '.img'}`;
        await writeFile(path.join(mediaDir, fname), Buffer.from(b64, 'base64'));
        cand.ref.localPath = `stardust/current/assets/media/${fname}`;
      } catch { cand.ref.localPath = null; }
    }

    // ---- screenshot (full page, viewport fallback) ----
    const shotsDir = path.join(args.out, 'assets', 'screenshots');
    await mkdir(shotsDir, { recursive: true });
    const shotPath = path.join(shotsDir, `${slug}.png`);
    let screenshotMode = 'fullPage';
    try {
      await page.screenshot({ path: shotPath, fullPage: true, timeout: 30000 });
    } catch {
      screenshotMode = 'viewport';
      try { await page.screenshot({ path: shotPath, fullPage: false, timeout: 30000 }); } catch { screenshotMode = 'failed'; }
    }
    rec.screenshot = screenshotMode === 'failed' ? null : `stardust/current/assets/screenshots/${slug}.png`;
    rec._signals.screenshotMode = screenshotMode;

    if (resolvedUrl !== url) rec._resolvedUrl = resolvedUrl;
    const heroSource = rec.heroSource; delete rec.heroSource;
    rec._provenance = {
      writtenBy: 'stardust:extract',
      writtenAt: new Date().toISOString(),
      readArtifacts: [resolvedUrl],
      synthesizedInputs: [],
      stardustVersion: '0.10.0',
      renderedBy: 'playwright',
      fetchedAt: new Date().toISOString(),
      waitMode: args.wait || 'medium',
      waitMs,
      httpStatus: status,
      contentType: ct.split(';')[0],
      heroSource,
    };
    return rec;
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const outPages = path.join(args.out, 'pages');
  await mkdir(outPages, { recursive: true });
  const fontsDir = path.join(args.out, 'assets', 'fonts');
  await mkdir(fontsDir, { recursive: true });

  // font-file network intercept: de-dupe by URL across pages/contexts
  const fontFiles = new Map(); // url -> localPath
  const attachFontSaver = (ctx) => {
    ctx.on('response', async (resp) => {
      try {
        const u = resp.url();
        const ct = (resp.headers()['content-type'] || '');
        if (!/\.(woff2?|ttf|otf|eot)([?#]|$)/i.test(u) && !ct.startsWith('font/')) return;
        if (fontFiles.has(u)) return;
        fontFiles.set(u, null); // claim before await (avoid double-save)
        const body = await resp.body();
        const base = path.basename(new URL(u).pathname).replace(/[^a-z0-9._-]+/gi, '-').slice(0, 80) || 'font';
        const hash = crypto.createHash('sha1').update(u).digest('hex').slice(0, 6);
        const fname = `${path.basename(base, path.extname(base))}-${hash}${path.extname(base) || '.woff2'}`;
        await writeFile(path.join(fontsDir, fname), body);
        fontFiles.set(u, `stardust/current/assets/fonts/${fname}`);
      } catch { /* best-effort */ }
    });
  };

  let stealth = false;
  let { browser, technique } = await launchWithFallback();
  let context = await newContext(browser, stealth);
  let probe = await context.newPage();

  let botBlock = null;
  try {
    const probeResp = await probe.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (isChallengeResponse(probeResp)) botBlock = 'challenge';
  } catch (err) {
    if (isFingerprintBlock(err)) botBlock = 'fingerprint';
    else throw err;
  }
  if (botBlock) {
    await browser.close();
    console.error(`[crawl] bot-management block (${botBlock}) — switching to headed real Chrome (channel:chrome) with stealth hardening`);
    browser = await launchHeadedStealth();
    technique = 'headed-chrome-stealth';
    stealth = true;
    context = await newContext(browser, stealth);
    probe = await context.newPage();
    let probeResp = await probe.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    probeResp = await clearChallenge(probe, probeResp);
    if (isChallengeResponse(probeResp)) {
      await browser.close();
      throw Object.assign(
        new Error(`bot-management challenge not cleared after headed real-Chrome + stealth fallback (entry status ${probeResp ? probeResp.status() : 'n/a'})`),
        { errorClass: 'BotChallengeError' },
      );
    }
  }

  let originRedirect = null;
  try {
    const landed = new URL(probe.url());
    if (landed.origin !== args.origin) {
      originRedirect = { from: args.origin, to: landed.origin };
      console.error(`[crawl] origin redirect ${args.origin} -> ${landed.origin} — adopting post-redirect origin`);
      args.origin = landed.origin;
      args.url = landed.href;
    }
  } catch { /* keep declared origin */ }

  const urls = await discover(args, probe);
  await probe.close();
  console.error(`[crawl] technique=${technique} pages=${urls.length}`);

  const log = { discovery: { fetchTechnique: technique, count: urls.length, concurrency: args.concurrency, ...(botBlock ? { botBlock } : {}), ...(originRedirect ? { originRedirect } : {}) }, consent: { method: args.consent ? 'auto' : 'skipped' }, crawl: { startedAt: new Date().toISOString(), failures: [] } };
  let ok = 0;
  await context.close();

  const results = new Array(urls.length).fill(null);
  const slugs = assignSlugs(urls);
  let nextIdx = 0;
  async function worker() {
    const ctx = await newContext(browser, stealth);
    attachFontSaver(ctx);
    while (nextIdx < urls.length) {
      const idx = nextIdx;
      nextIdx += 1;
      const url = urls[idx];
      const slug = slugs[idx];
      try {
        const rec = await capturePage(ctx, url, slug, args);
        const hash = crypto.createHash('sha1').update(rec._contentHash).digest('hex');
        delete rec._contentHash;
        const recordUrl = rec._resolvedUrl || url;
        if (rec._resolvedUrl) {
          log.crawl.slashRetries = log.crawl.slashRetries || [];
          log.crawl.slashRetries.push({ requested: url, resolved: rec._resolvedUrl, slug });
          delete rec._resolvedUrl;
        }
        const file = path.join(outPages, `${slug}.json`);
        const { _provenance, ...rest } = rec;
        await writeFile(file, JSON.stringify({ _provenance, slug, url: recordUrl, ...rest }, null, 2));
        results[idx] = { slug, file, hash };
        ok += 1;
        const s = rec._signals;
        const warn = [s.spaShellSuspect && 'SPA-SHELL?', s.trackingOnlyMedia && 'TRACKING-PIXEL-ONLY', s.filteredInterstitials && `filtered:${s.filteredInterstitials}`].filter(Boolean).join(' ');
        console.error(`[crawl] OK   ${slug}  waitMs=${_provenance.waitMs} imgs=${rec.media.images.length} bgs=${rec.media.cssBackgrounds.length} ${warn}`);
      } catch (err) {
        log.crawl.failures.push({ url, slug, errorClass: err.errorClass || 'Error', message: String(err.message || err), at: new Date().toISOString() });
        console.error(`[crawl] FAIL ${slug}  ${err.errorClass || 'Error'}: ${err.message}`);
      }
    }
    await ctx.close();
  }
  await Promise.all(Array.from({ length: Math.min(args.concurrency, urls.length) }, worker));
  await browser.close();

  const canonicalByHash = new Map();
  for (const r of results) {
    if (!r) continue;
    if (!canonicalByHash.has(r.hash)) { canonicalByHash.set(r.hash, r.slug); continue; }
    const canonical = canonicalByHash.get(r.hash);
    const rec = JSON.parse(await readFile(r.file, 'utf8'));
    rec._signals = rec._signals || {};
    rec._signals.duplicateOf = canonical;
    await writeFile(r.file, JSON.stringify(rec, null, 2));
    console.error(`[crawl] DUP  ${r.slug}  DUP-OF:${canonical}`);
  }

  log.crawl.finishedAt = new Date().toISOString();
  log.crawl.successes = ok;
  log.fonts = Object.fromEntries([...fontFiles.entries()].filter(([, v]) => v));
  const logPath = path.join(args.out, '_crawl-log.json');
  const prev = existsSync(logPath) ? JSON.parse(await readFile(logPath, 'utf8')) : {};
  await writeFile(logPath, JSON.stringify({ ...prev, ...log }, null, 2));
  console.error(`[crawl] done. ${ok}/${urls.length} captured, ${log.crawl.failures.length} failed. log: ${logPath}`);
}

main().catch((e) => { console.error(`[crawl] fatal: ${e.message}`); process.exit(2); });
