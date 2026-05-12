# Lighthouse Audit Reference

Quick lookup for every audit ID that appears in Unlighthouse output.
Each entry covers: what it measures, why it matters, and the top fix.

---

## Contents
1. [Performance Audits](#performance-audits)
2. [Core Web Vitals Thresholds](#core-web-vitals-thresholds)
3. [Accessibility Audits](#accessibility-audits)
4. [SEO Audits](#seo-audits)
5. [Best Practices Audits](#best-practices-audits)

---

## Performance Audits

| Audit ID | Title | Good value | Fix |
|----------|-------|-----------|-----|
| `largest-contentful-paint` | LCP | ≤ 2.5 s | Preload hero image; reduce TTFB; inline critical CSS |
| `cumulative-layout-shift` | CLS | ≤ 0.1 | Set explicit `width`/`height` on images/iframes; avoid inserting content above fold |
| `total-blocking-time` | TBT (proxy for INP) | ≤ 200 ms | Break up long tasks; defer non-critical JS; use web workers |
| `first-contentful-paint` | FCP | ≤ 1.8 s | Eliminate render-blocking resources; reduce server response time |
| `speed-index` | Speed Index | ≤ 3.4 s | Inline critical CSS; reduce main-thread work |
| `interactive` | TTI | ≤ 3.8 s | Reduce JS bundle size; code-split routes; defer third-party scripts |
| `uses-optimized-images` | Efficiently encode images | — | Re-export JPEGs at 85% quality; use progressive encoding |
| `uses-webp-images` | Serve images in next-gen formats | — | Convert to WebP or AVIF |
| `uses-responsive-images` | Properly size images | — | Use `srcset` and `sizes`; serve images at rendered size |
| `offscreen-images` | Defer offscreen images | — | Add `loading="lazy"` to below-the-fold images |
| `render-blocking-resources` | Eliminate render-blocking resources | — | Add `defer`/`async` to `<script>`; inline critical CSS |
| `unused-css-rules` | Reduce unused CSS | — | PurgeCSS; CSS Modules; code-split stylesheets |
| `unused-javascript` | Reduce unused JavaScript | — | Tree-shaking; dynamic `import()`; remove dead dependencies |
| `uses-text-compression` | Enable text compression | — | Enable gzip/brotli on server |
| `uses-long-cache-ttl` | Serve static assets with efficient cache policy | — | Set `Cache-Control: max-age=31536000, immutable` on versioned assets |
| `server-response-time` | Initial server response time | ≤ 600 ms | Add CDN; optimize DB queries; enable server-side caching |
| `redirects` | Avoid multiple page redirects | — | Redirect chains add latency; fix to single redirect |
| `uses-rel-preconnect` | Preconnect to required origins | — | Add `<link rel="preconnect">` for critical third-party origins |
| `critical-request-chains` | Avoid chaining critical requests | — | Inline critical resources; use preload |
| `total-byte-weight` | Avoids enormous network payloads | ≤ 1,600 KB | Compress images; tree-shake JS; lazy-load non-critical content |
| `dom-size` | Avoid excessive DOM size | ≤ 1,400 nodes | Virtualise long lists; remove hidden/unused DOM |
| `bootup-time` | Reduce JavaScript execution time | ≤ 2 s | Code-split; defer; optimise heavy scripts |
| `mainthread-work-breakdown` | Minimize main-thread work | ≤ 2 s | Reduce script parse/eval; debounce event handlers |
| `font-display` | Ensure text remains visible during webfont load | — | Add `font-display: swap` or `optional` to `@font-face` |
| `third-party-summary` | Reduce the impact of third-party code | — | Self-host fonts; audit trackers/analytics; use Partytown |
| `layout-shifts` | Avoid large layout shifts | CLS ≤ 0.1 | Reserve space for ads/embeds/images; avoid `position` changes on load |

---

## Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | 2.5 – 4.0 s | > 4.0 s |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | ≤ 200 ms | 200 – 500 ms | > 500 ms |
| FCP (First Contentful Paint) | ≤ 1.8 s | 1.8 – 3.0 s | > 3.0 s |
| TTFB (Time to First Byte) | ≤ 800 ms | 800 – 1800 ms | > 1800 ms |
| TBT (Total Blocking Time) | ≤ 200 ms | 200 – 600 ms | > 600 ms |

> **Note:** INP replaced FID as a Core Web Vital in March 2024. TBT is Lighthouse's lab proxy for INP.

---

## Accessibility Audits

| Audit ID | Title | Fix |
|----------|-------|-----|
| `color-contrast` | Background and foreground colors do not have sufficient contrast ratio | Achieve 4.5:1 for normal text, 3:1 for large text. Use a contrast checker. |
| `image-alt` | Image elements do not have `[alt]` attributes | Add descriptive `alt="…"` to all `<img>`; use `alt=""` for decorative images |
| `label` | Form elements do not have associated labels | Add `<label for="id">` or `aria-label`/`aria-labelledby` |
| `button-name` | Buttons do not have an accessible name | Add text content or `aria-label` to every `<button>` |
| `link-name` | Links do not have a discernible name | Avoid bare icon links; add `aria-label` or visible text |
| `document-title` | Document does not have a `<title>` element | Add a unique, descriptive `<title>` to every page |
| `html-has-lang` | `<html>` element does not have a `[lang]` attribute | Add `<html lang="en">` (or the appropriate language code) |
| `html-lang-valid` | `<html>` element does not have a valid value for its `[lang]` attribute | Use a valid BCP 47 language tag |
| `meta-viewport` | `[user-scalable="no"]` is used in the `<meta name="viewport">` element | Remove `user-scalable=no`; don't disable zoom |
| `heading-order` | Heading elements are not in a sequentially-descending order | Don't skip heading levels (e.g. h1 → h3); fix hierarchy |
| `list` | Lists do not contain only `<li>` elements | Remove non-`<li>` children from `<ul>`/`<ol>` |
| `listitem` | List items do not belong to an `<ul>` or `<ol>` | Wrap `<li>` elements in a proper list container |
| `frame-title` | `<frame>` or `<iframe>` elements do not have a title | Add `title="…"` to every `<iframe>` |
| `aria-required-attr` | ARIA roles do not have all required attributes | Consult WAI-ARIA spec for mandatory attributes per role |
| `aria-valid-attr` | ARIA attributes are not valid | Remove or correct invalid `aria-*` attributes |
| `tabindex` | Elements have `[tabindex]` values greater than 0 | Remove positive `tabindex`; use DOM order + `tabindex="0"` |
| `focus-traps` | The page has a keyboard trap | Ensure modal focus can be escaped with Esc/Tab |
| `skip-link` | The page does not have a skip to main content link | Add `<a href="#main" class="skip-link">Skip to content</a>` |

---

## SEO Audits

| Audit ID | Title | Fix |
|----------|-------|-----|
| `document-title` | Document does not have a `<title>` element | Add unique `<title>` to every page; keep ≤ 60 chars |
| `meta-description` | Document does not have a meta description | Add `<meta name="description" content="…">`; 120–160 chars |
| `http-status-code` | Page has unsuccessful HTTP status code | Ensure 200 for scanned pages; fix broken redirects |
| `link-text` | Links do not have descriptive text | Avoid "click here"; use descriptive anchor text |
| `crawlable-anchors` | Links are not crawlable | Use real `<a href="">` not JS-only navigation |
| `is-crawlable` | Page is blocked from indexing | Check `robots.txt` and `<meta name="robots">` |
| `robots-txt` | `robots.txt` is not valid | Validate robots.txt syntax; don't accidentally block all bots |
| `image-alt` | Image elements do not have `[alt]` attributes | Descriptive alt text also helps SEO image indexing |
| `hreflang` | `hreflang` values are not valid | Fix locale codes; add reciprocal `hreflang` annotations |
| `canonical` | Document does not have a valid `rel=canonical` | Add `<link rel="canonical" href="…">` to avoid duplicate content |
| `structured-data` | Structured data is valid | Test at schema.org/validator; fix JSON-LD errors |
| `font-size` | Document uses legible font sizes | Keep body text ≥ 12px; avoid tiny text on mobile |
| `tap-targets` | Tap targets are not sized appropriately | Make interactive elements ≥ 48×48 px with adequate spacing |
| `viewport` | Does not have a `<meta name="viewport">` tag | Add `<meta name="viewport" content="width=device-width, initial-scale=1">` |

---

## Best Practices Audits

| Audit ID | Title | Fix |
|----------|-------|-----|
| `is-on-https` | Does not use HTTPS | Enable HTTPS; redirect all HTTP to HTTPS |
| `uses-http2` | Does not use HTTP/2 | Configure server/CDN to serve over HTTP/2 or HTTP/3 |
| `no-vulnerable-libraries` | Includes front-end JavaScript libraries with known security vulnerabilities | Upgrade flagged libraries via `npm audit fix` |
| `js-libraries` | Detected JavaScript libraries | Informational; no action needed unless libraries are outdated |
| `errors-in-console` | Browser errors were logged to the console | Fix JS errors; remove `console.error` calls leaking to production |
| `image-aspect-ratio` | Displays images with incorrect aspect ratio | Set correct `width`/`height` attributes; use `aspect-ratio` CSS |
| `image-size-responsive` | Serves images with low resolution | Provide 2× images for high-DPI screens via `srcset` |
| `deprecations` | Uses deprecated APIs | Migrate away from deprecated browser APIs (shown in audit details) |
| `third-party-cookies` | Uses third-party cookies | Migrate to Storage Access API or first-party alternatives |
| `geolocation-on-start` | Requests the geolocation permission on page load | Request geolocation only in response to user action |
| `notification-on-start` | Requests notification permissions on page load | Request permissions only in response to user action |
| `password-inputs-can-be-pasted-into` | Prevents users from pasting into password fields | Remove `onpaste="return false"` from password inputs |
| `valid-source-maps` | Missing source maps for large first-party JavaScript | Generate and serve source maps for easier debugging |
| `csp-xss` | Ensure CSP is effective against XSS attacks | Add a `Content-Security-Policy` header |
