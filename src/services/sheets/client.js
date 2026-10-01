// Core, framework-agnostic Google Sheets reader.
//
// Reads a tab as CSV via the public "gviz" endpoint. This is KEYLESS: it works
// on any sheet shared "Anyone with the link -> Viewer" and requires no API key
// and no backend. The endpoint reflects CORS headers, so the browser can fetch
// it directly from the deployed site.
//
// Exposes low-level pieces (fetchTabRows, parseCsv, cache read/write,
// resolveImageUrl); React state/stale-while-revalidate lives in the hooks.

import { SHEET_ID, CACHE_TTL_MS } from '../../config/sheets.js';

// Neutral inline placeholder so a missing image never triggers a broken-image
// icon or a request to a nonexistent path.
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
      '<rect width="100%" height="100%" fill="#12122b"/>' +
      '<text x="50%" y="50%" fill="#646cff" font-family="sans-serif" font-size="22" ' +
      'text-anchor="middle" dominant-baseline="middle">Image</text></svg>'
  );

// Build the keyless CSV URL for a tab. headers=1 is REQUIRED — without it gviz
// mis-merges the leading rows and the header row comes back mangled.
// _t=timestamp prevents HTTP browser caching so updates in Google Sheets reflect immediately.
const buildCsvUrl = (tab) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}&_t=${Date.now()}`;

/**
 * Parse CSV text into a 2D array of strings.
 * Handles quoted fields, embedded commas/newlines, and "" escapes.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if (c === '\r') {
      i += 1;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }

  // Flush the final field/row (files often don't end in a newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Fetch a single tab name and return its rows. Throws on network/parse errors.
 * @param {string} tabName
 * @returns {Promise<string[][]>}
 */
async function fetchSingleTab(tabName) {
  const res = await fetch(buildCsvUrl(tabName), { redirect: 'follow', cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Sheet tab "${tabName}" returned HTTP ${res.status}`);
  }
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error(`Sheet tab "${tabName}" is not accessible (check name/sharing)`);
  }
  const rows = parseCsv(text);
  // Reject if Google silently served a wrong-tab fallback
  const firstCell = String((rows[0] && rows[0][0]) ?? '').trim().toLowerCase();
  if (firstCell.includes('logo image') || firstCell.includes('*please add')) {
    throw new Error(`Sheet tab "${tabName}" returned Google fallback content`);
  }
  return rows;
}

/**
 * Fetch a tab (or list of candidate tab names) and return its rows as a 2D string array.
 * When multiple candidate names are provided they are fetched IN PARALLEL and the
 * first successful, valid result wins — eliminating the sequential waterfall that
 * caused slow loads when the primary tab name didn't match.
 * @param {string | string[]} tab
 * @returns {Promise<string[][]>}
 */
export async function fetchTabRows(tab) {
  const candidateTabs = Array.isArray(tab) ? tab : [tab];

  // Fire all candidate fetches simultaneously
  const results = await Promise.allSettled(candidateTabs.map(fetchSingleTab));

  for (const result of results) {
    if (result.status === 'fulfilled') {
      return result.value;
    }
  }

  // All candidates failed — surface the last rejection reason
  const lastRejection = results.filter((r) => r.status === 'rejected').at(-1);
  throw lastRejection?.reason ?? new Error(`Failed to fetch sheet data for tab: ${JSON.stringify(tab)}`);
}

/** Raised when a tab's columns don't match what a transform expects. */
export class SheetShapeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SheetShapeError';
  }
}

/**
 * Throw a SheetShapeError unless the header row (rows[0]) contains required columns.
 * `required` can contain strings or arrays of candidate strings (e.g. ['Title', ['Code', 'Course code']]).
 * @param {string | string[]} tab
 * @param {string[][]} rows
 * @param {Array<string | string[]>} [required]
 */
export function assertHeaders(tab, rows, required) {
  if (!required || required.length === 0) return;
  const header = (rows && rows[0]) || [];
  const present = new Set(header.map((h) => String(h ?? '').trim()));
  const missing = [];

  for (const item of required) {
    if (Array.isArray(item)) {
      if (!item.some((cand) => present.has(cand))) {
        missing.push(`(${item.join(' | ')})`);
      }
    } else if (!present.has(item)) {
      missing.push(item);
    }
  }

  if (missing.length) {
    const tabName = Array.isArray(tab) ? tab.join('/') : tab;
    throw new SheetShapeError(
      `Sheet tab "${tabName}" is missing column(s) [${missing.join(', ')}] — using fallback.`
    );
  }
}

// ---- localStorage cache (raw rows, so transforms can evolve safely) --------

const cacheKeyFor = (tab) => `birdlab:v4:sheet:${SHEET_ID}:${Array.isArray(tab) ? tab.join('_') : tab}`;

/**
 * Read cached rows for a tab.
 * @returns {{ rows: string[][], fresh: boolean } | null}
 */
export function readCache(tab) {
  try {
    const raw = localStorage.getItem(cacheKeyFor(tab));
    if (!raw) return null;
    const { ts, rows } = JSON.parse(raw);
    if (!Array.isArray(rows)) return null;
    return { rows, fresh: Date.now() - ts < CACHE_TTL_MS };
  } catch {
    return null;
  }
}

/** Persist rows for a tab with the current timestamp. */
export function writeCache(tab, rows) {
  try {
    localStorage.setItem(cacheKeyFor(tab), JSON.stringify({ ts: Date.now(), rows }));
  } catch {
    // Ignore quota / serialization / private-mode errors — cache is best-effort.
  }
}

// ---- image resolution ------------------------------------------------------

// Pull a Drive file id out of the common share-link shapes or raw ID strings.
function extractDriveId(url) {
  if (!url) return null;
  const str = String(url).trim();
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // .../file/d/<id>/view
    /[?&]id=([a-zA-Z0-9_-]+)/, //     ...open?id=<id>  /  uc?id=<id>
    /\/d\/([a-zA-Z0-9_-]+)/, //       generic /d/<id>
    /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = str.match(re);
    if (m) return m[1];
  }
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(str)) {
    return str;
  }
  return null;
}

/**
 * Turn whatever the professor pasted in an image cell into a usable <img src>.
 * - empty            -> the provided fallback (or a neutral placeholder)
 * - Google Drive link -> high-res thumbnail CDN URL that bypasses CORS/cookie blocks
 * - http(s) URL       -> passed through
 * - protocol-relative -> https:-prefixed
 * - bare filename/path -> served from /assets (back-compat with bundled images)
 * @param {string} raw
 * @param {{ fallback?: string }} [opts]
 * @returns {string}
 */
export function resolveImageUrl(raw, { fallback = PLACEHOLDER_IMG } = {}) {
  const v = String(raw ?? '').trim();
  if (!v) return fallback || PLACEHOLDER_IMG;

  const driveId = extractDriveId(v);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`;
  }

  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('//')) return `https:${v}`;
  if (v.startsWith('/')) return v; // already an absolute site path
  return `/assets/${v}`; // bare filename -> bundled asset
}
