# Report Schema

The `report` object returned by `analyzeResults()`. Pass this directly to
`audit-interpret` — do not pass `markdown`.

```typescript
{
  source: string,          // path to the scanned output directory
  totalPages: number,      // total pages successfully scanned

  categoryAverages: {
    performance: {
      label: string,       // "Performance"
      score: number,       // 0–100
      raw: number,         // 0.0–1.0
      rating: 'GOOD' | 'NEEDS_WORK' | 'POOR'
    },
    accessibility: { ... },
    'best-practices': { ... },
    seo: { ... },
  },

  cwvAverages: {
    'largest-contentful-paint': {
      value: number,       // raw ms
      display: string,     // e.g. "2340ms"
      rating: 'GOOD' | 'NEEDS_WORK' | 'POOR',
      good: string,        // threshold string e.g. "≤ 2500ms"
      poor: string,        // threshold string e.g. "> 4000ms"
    },
    'cumulative-layout-shift': { ... },
    'total-blocking-time': { ... },
    'first-contentful-paint': { ... },
    'speed-index': { ... },
    'interactive': { ... },
  },

  worstPages: [            // top 10, sorted worst-first
    {
      url: string,
      score: number,       // 0–100 performance score
      rating: 'GOOD' | 'NEEDS_WORK' | 'POOR'
    }
  ],

  failingAudits: [         // top 20, sorted by affectedPages desc
    {
      id: string,          // e.g. "uses-webp-images"
      title: string,       // human-readable audit name
      description: string, // what the audit measures (truncated to 300 chars)
      affectedPages: number,
      affectedPercent: number,  // 0–100
      worstScore: number,       // 0–100
      urls: string[],      // up to 5 affected URLs
    }
  ],

  perfectPages: string[],  // URLs where all categories scored GOOD (≥ 90)
}
```

## Rating thresholds

| Rating | Score |
|--------|-------|
| `GOOD` | ≥ 90 |
| `NEEDS_WORK` | 50–89 |
| `POOR` | < 50 |

## CWV thresholds

| Metric | Good | Poor |
|--------|------|------|
| LCP (Largest Contentful Paint) | ≤ 2500ms | > 4000ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | > 0.25 |
| TBT (Total Blocking Time) | ≤ 200ms | > 600ms |
| FCP (First Contentful Paint) | ≤ 1800ms | > 3000ms |
| Speed Index | ≤ 3400ms | > 5800ms |
| TTI (Time to Interactive) | ≤ 3800ms | > 7300ms |

## CI mode vs interactive mode

The analyzer handles both automatically:

- **CI mode** (`--reporter json`) — reads `results.json`. Produces
  `categoryAverages` only. `cwvAverages`, `failingAudits`, and `worstPages`
  will be empty or minimal.
- **Interactive mode** (no reporter flag) — reads individual `*.lhr.json`
  files. Produces the full report including CWV and per-audit failure data.

For the richest report, prefer interactive mode or use `--reporter jsonExpanded`.
