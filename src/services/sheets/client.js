// Core, framework-agnostic Google Sheets reader.
//
// Reads a tab as CSV via the public "gviz" endpoint. This is KEYLESS: it works
// on any sheet shared "Anyone with the link -> Viewer" and requires no API key
// and no backend. The endpoint reflects CORS headers, so the browser can fetch
// it directly from the deployed site.
//
// Exposes low-level pieces (fetchTabRows, parseCsv, cache read/write,
// resolveImageUrl); React state/stale-while-revalidate lives in the hooks.

import { SHEET_ID, CACHE_TTL_MS } from '../../config/sheets';

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
const buildCsvUrl = (tab) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
  `?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;

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
 * Fetch a tab and return its rows as a 2D string array (row 0 = headers).
 * Throws on network error, non-2xx, or a non-CSV (HTML error) response.
 * @param {string} tab
 * @returns {Promise<string[][]>}
 */
export async function fetchTabRows(tab) {
  const res = await fetch(buildCsvUrl(tab), { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Sheet tab "${tab}" returned HTTP ${res.status}`);
  }
  const text = await res.text();
  // gviz returns an HTML page when the sheet isn't accessible or the tab name
  // is wrong. Guard against silently parsing that as data.
  if (text.trimStart().startsWith('<')) {
    throw new Error(`Sheet tab "${tab}" is not accessible (check name/sharing)`);
  }
  return parseCsv(text);
}

/** Raised when a tab's columns don't match what a transform expects. */
export class SheetShapeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SheetShapeError';
  }
}

/**
 * Throw a SheetShapeError unless the header row (rows[0]) contains every name
 * in `required`. This is the load-bearing guard for "fall back when a tab
 * doesn't exist yet": Google's gviz endpoint returns HTTP 200 with the FIRST
 * sheet's data when you request a tab name that doesn't exist, so a not-yet-
 * created tab would otherwise parse to an empty list and wrongly suppress the
 * hardcoded fallback. Validating the columns distinguishes "real but empty tab"
 * from "wrong/absent tab".
 * @param {string} tab
 * @param {string[][]} rows
 * @param {string[]} [required]
 */
export function assertHeaders(tab, rows, required) {
  if (!required || required.length === 0) return;
  const header = (rows && rows[0]) || [];
  const present = new Set(header.map((h) => String(h ?? '').trim()));
  const missing = required.filter((h) => !present.has(h));
  if (missing.length) {
    throw new SheetShapeError(
      `Sheet tab "${tab}" is missing column(s) [${missing.join(', ')}] — it likely ` +
        `hasn't been created yet (Google serves another sheet for unknown tab names). Using fallback.`
    );
  }
}

// ---- localStorage cache (raw rows, so transforms can evolve safely) --------

const cacheKeyFor = (tab) => `birdlab:sheet:${SHEET_ID}:${tab}`;

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

// Pull a Drive file id out of the common share-link shapes.
function extractDriveId(url) {
  if (!/drive\.google\.com|docs\.google\.com/.test(url)) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // .../file/d/<id>/view
    /[?&]id=([a-zA-Z0-9_-]+)/, //     ...open?id=<id>  /  uc?id=<id>
    /\/d\/([a-zA-Z0-9_-]+)/, //       generic /d/<id>
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * Turn whatever the professor pasted in an image cell into a usable <img src>.
 * - empty            -> the provided fallback (or a neutral placeholder)
 * - Google Drive link -> direct thumbnail URL
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
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;

  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('//')) return `https:${v}`;
  if (v.startsWith('/')) return v; // already an absolute site path
  return `/assets/${v}`; // bare filename -> bundled asset
}
