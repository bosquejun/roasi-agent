# Troubleshooting

## Common failures

| Problem | Cause | Fix |
|---------|-------|-----|
| `Chrome not found` | No Chrome/Chromium installed | `npm i -g @unlighthouse/cli puppeteer` |
| `0 pages found` | Site blocks bots or has no sitemap | Add `--disable-robots-txt`; check if site is publicly reachable |
| `SPA shows blank/empty pages` | JS not executed before audit | Add `--enable-javascript` |
| `Scores vary wildly between runs` | Single-sample instability | Add `--samples 3 --throttle` |
| `Very slow scan` | Too many pages or samples | Add `--max-routes 30`, remove `--throttle`, lower samples |
| `Port 3000 in use` | Another process using default port | Set `server: { port: 3001 }` in config file |
| `ECONNREFUSED` on localhost | Dev server not running | Start your dev server before running the scan |
| `results.json not found` | Wrong reporter or output path | Ensure `--reporter json` and `--output-path` match what analyzer receives |
| `Auth pages return 0/redirect` | Pages require login | Add `--cookies` or `--auth` flags |
| `Node version error` | Node < 18 | Upgrade Node: `nvm use 18` or `nvm use --lts` |

## Score accuracy notes

A single Lighthouse run can vary ±5 points naturally. This is expected. Causes:
- Background CPU activity on the machine
- Network variance (even for localhost)
- Third-party scripts loading unpredictably

**When accuracy matters** (before/after comparison, CI budget enforcement):
```bash
--samples 3 --throttle --no-cache
```

**When speed matters** (quick check, first scan):
```bash
# Defaults are fine — single sample, no throttle
```

## Output directory issues

If the analyzer script reports "No Lighthouse result files found":

1. Check the scan actually completed — look for exit code 0
2. Check the output path matches between scan command and analyzer call
3. In CI mode (`--reporter json`), look for `results.json` in the output dir
4. In interactive mode (no `--reporter json`), look for `*.lhr.json` files

Always use an explicit `--output-path` to avoid ambiguity:
```bash
--output-path ./.unlighthouse-output
```
