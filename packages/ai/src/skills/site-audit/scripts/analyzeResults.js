#!/usr/bin/env node
/**
 * analyzeResults.js — Parse Unlighthouse output and produce a structured summary.
 *
 * Usage (CLI):
 *   node analyzeResults.js <path-to-unlighthouse-output-dir>
 *   node analyzeResults.js .unlighthouse
 *
 * Usage (as module in AI SDK tool):
 *   import { analyzeResults } from './analyzeResults.js';
 *   const report = await analyzeResults('./.unlighthouse');
 *   // report is a structured object — pass to agent or format as markdown
 *
 * Supports:
 *   - Interactive mode: individual *.lhr.json files written per-page
 *   - CI mode: results.json written by `--reporter json`
 *   - CI expanded mode: results-expanded.json written by `--reporter jsonExpanded`
 */

import fs from 'fs/promises';
import path from 'path';

// ── Thresholds ────────────────────────────────────────────────────────────────

const GOOD  = 0.90;
const NEEDS = 0.50;

const CWV_THRESHOLDS = {
  'largest-contentful-paint': { good: 2500, poor: 4000, unit: 'ms' },
  'cumulative-layout-shift':  { good: 0.1,  poor: 0.25, unit: '' },
  'total-blocking-time':      { good: 200,  poor: 600,  unit: 'ms' },
  'first-contentful-paint':   { good: 1800, poor: 3000, unit: 'ms' },
  'speed-index':              { good: 3400, poor: 5800, unit: 'ms' },
  'interactive':              { good: 3800, poor: 7300, unit: 'ms' },
};

const CATEGORY_KEYS = ['performance', 'accessibility', 'best-practices', 'seo'];

const CATEGORY_LABELS = {
  'performance':    'Performance',
  'accessibility':  'Accessibility',
  'best-practices': 'Best Practices',
  'seo':            'SEO',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const rating = (score) => {
  if (score == null) return 'n/a';
  if (score >= GOOD)  return 'GOOD';
  if (score >= NEEDS) return 'NEEDS_WORK';
  return 'POOR';
};

const fmtScore = (score) =>
  score == null ? null : Math.round(score * 100);

const cwvRating = (auditId, value) => {
  const t = CWV_THRESHOLDS[auditId];
  if (!t || value == null) return null;
  if (value <= t.good) return 'GOOD';
  if (value <= t.poor) return 'NEEDS_WORK';
  return 'POOR';
};

const avg = (arr) =>
  arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;

// ── Loaders ───────────────────────────────────────────────────────────────────

async function findLhrFiles(dir) {
  const results = [];
  const walk = async (current) => {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (
        entry.name.endsWith('.lhr.json') ||
        entry.name.endsWith('.report.json') ||
        entry.name === 'lighthouse.json'
      ) {
        results.push(full);
      }
    }
  };
  await walk(dir);
  return results;
}

async function loadCiJson(dir) {
  for (const name of ['ci-result.json', 'results.json', 'result.json']) {
    try {
      const content = await fs.readFile(path.join(dir, name), 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    } catch { /* not found or invalid */ }
  }
  return null;
}

// ── Core analysis ─────────────────────────────────────────────────────────────

function analyzeLhrFiles(lhrDataList) {
  const pages = [];
  const auditFailures = {};  // auditId -> { title, description, worstScore, urls[] }
  const cwvValues = {};      // auditId -> number[]

  for (const { url, lhr } of lhrDataList) {
    const cats = lhr.categories ?? {};
    const scores = {};
    for (const k of CATEGORY_KEYS) {
      if (cats[k]) scores[k] = cats[k].score;
    }

    const audits = lhr.audits ?? {};
    const cwv = {};
    for (const [aid, thresh] of Object.entries(CWV_THRESHOLDS)) {
      const nv = audits[aid]?.numericValue ?? null;
      cwv[aid] = nv;
      if (nv != null) {
        cwvValues[aid] ??= [];
        cwvValues[aid].push(nv);
      }
    }

    pages.push({ url, scores, cwv });

    // Collect failing audits
    for (const [aid, audit] of Object.entries(audits)) {
      const { score, scoreDisplayMode, title, description } = audit;
      if (['informative', 'notApplicable', 'manual'].includes(scoreDisplayMode)) continue;
      if (score != null && score < 1.0) {
        if (!auditFailures[aid]) {
          auditFailures[aid] = { title: title ?? aid, description: description ?? '', worstScore: score, urls: [] };
        } else if (score < auditFailures[aid].worstScore) {
          auditFailures[aid].worstScore = score;
        }
        auditFailures[aid].urls.push(url);
      }
    }
  }

  return { pages, auditFailures, cwvValues };
}

function analyzeCiJson(data) {
  return data.map((row) => ({
    url: row.path ?? '?',
    scores: Object.fromEntries(
      CATEGORY_KEYS
        .filter(k => row[k] != null)
        .map(k => [k, row[k]])
    ),
    cwv: {},
  }));
}

// ── Build structured report ───────────────────────────────────────────────────

function buildReport(pages, auditFailures, cwvValues, sourceLabel) {
  const total = pages.length;

  // Site-wide average scores
  const categoryAverages = {};
  for (const k of CATEGORY_KEYS) {
    const vals = pages.map(p => p.scores[k]).filter(v => v != null);
    const a = avg(vals);
    if (a != null) {
      categoryAverages[k] = {
        label: CATEGORY_LABELS[k],
        score: fmtScore(a),
        raw: a,
        rating: rating(a),
      };
    }
  }

  // CWV averages
  const cwvAverages = {};
  for (const [aid, thresh] of Object.entries(CWV_THRESHOLDS)) {
    const vals = cwvValues[aid] ?? [];
    const a = avg(vals);
    if (a != null) {
      const display = thresh.unit ? `${Math.round(a)}${thresh.unit}` : a.toFixed(3);
      cwvAverages[aid] = {
        value: a,
        display,
        rating: cwvRating(aid, a),
        good: `≤ ${thresh.good}${thresh.unit}`,
        poor: `> ${thresh.poor}${thresh.unit}`,
      };
    }
  }

  // Worst performing pages (by performance score)
  const worstPages = pages
    .filter(p => p.scores.performance != null)
    .sort((a, b) => a.scores.performance - b.scores.performance)
    .slice(0, 10)
    .map(p => ({
      url: p.url,
      score: fmtScore(p.scores.performance),
      rating: rating(p.scores.performance),
    }));

  // Most common failing audits
  const failingAudits = Object.entries(auditFailures)
    .sort((a, b) => b[1].urls.length - a[1].urls.length)
    .slice(0, 20)
    .map(([id, info]) => ({
      id,
      title: info.title,
      description: info.description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 300),
      affectedPages: info.urls.length,
      affectedPercent: Math.round(100 * info.urls.length / total),
      worstScore: fmtScore(info.worstScore),
      urls: info.urls.length <= 5 ? info.urls : info.urls.slice(0, 5),
    }));

  // Perfect pages
  const perfectPages = pages
    .filter(p => Object.values(p.scores).every(v => v == null || v >= GOOD))
    .map(p => p.url);

  return {
    source: sourceLabel,
    totalPages: total,
    categoryAverages,
    cwvAverages,
    worstPages,
    failingAudits,
    perfectPages,
  };
}

// ── Markdown formatter (for CLI output / passing to agent as text) ─────────────

function formatMarkdown(report) {
  const lines = [];
  lines.push(`# Unlighthouse Analysis Report`);
  lines.push(`**Source:** ${report.source}`);
  lines.push(`**Pages scanned:** ${report.totalPages}\n`);

  lines.push(`## Site-wide Average Scores\n`);
  for (const cat of Object.values(report.categoryAverages)) {
    const icon = cat.rating === 'GOOD' ? '✅' : cat.rating === 'NEEDS_WORK' ? '⚠️ ' : '❌';
    lines.push(`- ${icon} **${cat.label}**: ${cat.score}/100`);
  }

  if (Object.keys(report.cwvAverages).length > 0) {
    lines.push(`\n## Core Web Vitals (Site Averages)\n`);
    const cwvLabels = {
      'largest-contentful-paint': 'LCP (Largest Contentful Paint)',
      'cumulative-layout-shift':  'CLS (Cumulative Layout Shift)',
      'total-blocking-time':      'TBT (Total Blocking Time)',
      'first-contentful-paint':   'FCP (First Contentful Paint)',
      'speed-index':              'SI  (Speed Index)',
      'interactive':              'TTI (Time to Interactive)',
    };
    for (const [aid, data] of Object.entries(report.cwvAverages)) {
      const icon = data.rating === 'GOOD' ? '✅' : data.rating === 'NEEDS_WORK' ? '⚠️ ' : '❌';
      lines.push(`- ${icon} **${cwvLabels[aid] ?? aid}**: ${data.display}  (good ${data.good}, poor ${data.poor})`);
    }
  }

  if (report.worstPages.length > 0) {
    lines.push(`\n## Worst Performing Pages\n`);
    for (const p of report.worstPages) {
      const icon = p.rating === 'GOOD' ? '✅' : p.rating === 'NEEDS_WORK' ? '⚠️ ' : '❌';
      lines.push(`- ${icon} \`${p.url}\`  (${p.score}/100)`);
    }
  }

  if (report.failingAudits.length > 0) {
    lines.push(`\n## Most Common Failing Audits\n`);
    for (const audit of report.failingAudits) {
      lines.push(`### ${audit.title}`);
      lines.push(`- **ID:** \`${audit.id}\``);
      lines.push(`- **Affected pages:** ${audit.affectedPages}/${report.totalPages} (${audit.affectedPercent}%)`);
      lines.push(`- **Worst score:** ${audit.worstScore}/100`);
      if (audit.description) lines.push(`- **What it means:** ${audit.description}`);
      for (const url of audit.urls) lines.push(`  - \`${url}\``);
      lines.push('');
    }
  }

  if (report.perfectPages.length > 0) {
    lines.push(`\n## Pages Passing All Categories (${report.perfectPages.length})\n`);
    for (const url of report.perfectPages.slice(0, 10)) lines.push(`- \`${url}\``);
    if (report.perfectPages.length > 10) lines.push(`  … and ${report.perfectPages.length - 10} more`);
  }

  lines.push(`\n---\n*Re-run after fixes to track improvement.*`);
  return lines.join('\n');
}

// ── Main export (use this in AI SDK tools) ────────────────────────────────────

/**
 * Analyze an Unlighthouse output directory.
 * @param {string} outputDir - Path to the unlighthouse output directory
 * @returns {Promise<{ report: object, markdown: string }>}
 *   - report: structured data for the agent to reason over
 *   - markdown: human-readable summary
 */
export async function analyzeResults(outputDir) {
  const dir = path.resolve(outputDir);

  // Try CI JSON first
  const ciData = await loadCiJson(dir);
  if (ciData) {
    const pages = analyzeCiJson(ciData);
    const report = buildReport(pages, {}, {}, dir);
    return { report, markdown: formatMarkdown(report) };
  }

  // Fall back to individual LHR files
  const lhrPaths = await findLhrFiles(dir);
  if (lhrPaths.length === 0) {
    throw new Error(
      `No Lighthouse result files found in ${dir}.\n` +
      `Make sure the scan has completed. Tip: use --output-path to set a predictable path.`
    );
  }

  const lhrDataList = await Promise.all(
    lhrPaths.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const lhr = JSON.parse(content);
      const url = lhr.finalUrl ?? lhr.requestedUrl ?? filePath;
      return { url, lhr };
    })
  );

  const { pages, auditFailures, cwvValues } = analyzeLhrFiles(lhrDataList);
  const report = buildReport(pages, auditFailures, cwvValues, dir);
  return { report, markdown: formatMarkdown(report) };
}

// ── CLI entrypoint ────────────────────────────────────────────────────────────

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const outputDir = process.argv[2];
  if (!outputDir) {
    console.error('Usage: node analyzeResults.js <unlighthouse-output-dir>');
    process.exit(1);
  }
  analyzeResults(outputDir)
    .then(({ markdown }) => console.log(markdown))
    .catch((err) => { console.error(err.message); process.exit(1); });
}
