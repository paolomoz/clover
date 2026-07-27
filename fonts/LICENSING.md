# ⚠️ Font licensing — REQUIRED before going live

The three brand families are proprietary; the woff2 files here were captured
from clover.com during the stardust migration and are self-hosted for fidelity.
Confirm webfont/embedding licenses before publishing to `*.aem.live`.

| File | Family | Foundry | Status |
|---|---|---|---|
| graphik-400/500.woff2 | Graphik | Commercial Type | ⚠️ unconfirmed |
| altform-400/600/700.woff2 | Altform | (Clover brand custom) | ⚠️ unconfirmed |
| ppformula-condensed-900.woff2 | PP Formula Condensed | Pangram Pangram | ⚠️ unconfirmed |

**Remove path** if licensing cannot be confirmed: delete the woff2 files and
their `@font-face` rules in `styles/fonts.css`; all stacks fall back to the
metric-matched system fallbacks declared in `styles/styles.css`
(graphik-fallback → Arial, altform-fallback → Arial,
ppformula-fallback → Arial Narrow).
