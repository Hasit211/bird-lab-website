// Per-tab transforms: turn raw CSV rows (string[][]) into the objects each
// component expects. Kept separate from client.js so fetching/caching stays
// framework-agnostic and these can evolve without touching the network layer.
//
// Header handling is by NAME (order-independent), except where the People sheet
// intentionally repeats headers ("Institutaion"/"Year") — that tab is parsed
// positionally in services/googleSheets.js.

import { resolveImageUrl, PLACEHOLDER_IMG } from './client';

// Build a header-name -> column-index lookup. First occurrence of a name wins;
// blank headers are ignored.
function headerIndex(headerRow) {
  const idx = {};
  (headerRow || []).forEach((h, i) => {
    const key = String(h ?? '').trim();
    if (key && !(key in idx)) idx[key] = i;
  });
  return (name) => (name in idx ? idx[name] : -1);
}

// Safe trimmed cell read by column index.
const cell = (row, i) => (i >= 0 && i < row.length ? String(row[i] ?? '').trim() : '');

// Split a delimited cell ("a, b; c") into a clean array.
const splitList = (s) =>
  String(s ?? '')
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

// Parse a multi-line "Label: value" cell into [{ label, value }].
const parseSpecs = (s) =>
  String(s ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(':');
      return i === -1
        ? { label: line, value: '' }
        : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    });

// Iterate data rows (skip header), keeping the header lookup, and drop rows the
// caller marks null (e.g. no title).
function mapRows(rows, build) {
  if (!rows || rows.length < 2) return [];
  const at = headerIndex(rows[0]);
  return rows
    .slice(1)
    .map((row, i) => build(row, at, i))
    .filter(Boolean);
}

/**
 * Content tab: `Page | Key | Text` -> { [key]: text }.
 * The `Page` column is purely organizational (helps the professor find rows);
 * code looks up by the dotted value in `Key` (e.g. "welcome.title").
 * @param {string[][]} rows
 * @returns {Record<string,string>}
 */
export function transformContent(rows) {
  if (!rows || rows.length < 2) return {};
  const at = headerIndex(rows[0]);
  const ki = at('Key');
  const ti = at('Text');
  const map = {};
  for (const row of rows.slice(1)) {
    const key = cell(row, ki);
    if (key) map[key] = cell(row, ti);
  }
  return map;
}

/** Events tab: Title, Date, Location, Description, Image, Category, Status. */
export function transformEvents(rows) {
  return mapRows(rows, (row, at, i) => {
    const title = cell(row, at('Title'));
    if (!title) return null;
    return {
      id: i + 1,
      title,
      date: cell(row, at('Date')),
      location: cell(row, at('Location')),
      description: cell(row, at('Description')),
      image: resolveImageUrl(cell(row, at('Image'))),
      category: cell(row, at('Category')) || 'Event',
      // Upcoming/Past is derived from Date at render time (see utils/eventStatus).
      // A non-empty Status here is an optional manual override that wins over the date.
      status: cell(row, at('Status')),
    };
  });
}

/** Collaborations tab: Name, Category, Image, (optional) URL. */
export function transformCollaborations(rows) {
  return mapRows(rows, (row, at) => {
    const title = cell(row, at('Name')) || cell(row, at('Title'));
    if (!title) return null;
    return {
      title,
      category: cell(row, at('Category')) || 'Collaboration',
      src: resolveImageUrl(cell(row, at('Image'))),
      url: cell(row, at('URL')),
    };
  });
}

/** Positions tab: Title, Type, Department, Summary, Details, Email, Contact, Status. */
export function transformPositions(rows) {
  return mapRows(rows, (row, at, i) => {
    const title = cell(row, at('Title'));
    if (!title) return null;
    return {
      id: i + 1,
      title,
      type: cell(row, at('Type')) || 'Available',
      department: cell(row, at('Department')),
      summary: cell(row, at('Summary')),
      details: cell(row, at('Details')),
      email: cell(row, at('Email')),
      contact: cell(row, at('Contact')),
      status: cell(row, at('Status')),
    };
  });
}

/** Courses tab: Code, Title, Credits, Department, Level, Description. */
export function transformCourses(rows) {
  return mapRows(rows, (row, at, i) => {
    const title = cell(row, at('Title'));
    if (!title) return null;
    return {
      id: i + 1,
      code: cell(row, at('Code')),
      title,
      credits: cell(row, at('Credits')),
      department: cell(row, at('Department')),
      // Level ("Undergraduate"/"Postgraduate") -> lowercase type used by filters.
      type: cell(row, at('Level')).toLowerCase() || 'postgraduate',
      description: cell(row, at('Description')),
    };
  });
}

/** ResearchAreas tab: Icon, Title, Description. */
export function transformResearchAreas(rows) {
  return mapRows(rows, (row, at) => {
    const title = cell(row, at('Title'));
    if (!title) return null;
    return {
      icon: cell(row, at('Icon')) || '🔬',
      title,
      description: cell(row, at('Description')),
    };
  });
}

/** Facilities tab: Name, Category, Image, Description, Specs. */
export function transformFacilities(rows) {
  return mapRows(rows, (row, at, i) => {
    const name = cell(row, at('Name'));
    if (!name) return null;
    const image = resolveImageUrl(cell(row, at('Image')));
    return {
      id: i + 1,
      name,
      category: cell(row, at('Category')) || 'General',
      image,
      thumbnail: image,
      description: cell(row, at('Description')),
      specifications: parseSpecs(cell(row, at('Specs'))),
    };
  });
}

export { headerIndex, cell, splitList, resolveImageUrl, PLACEHOLDER_IMG };

// Required header columns per tab. The hook (useSheetTab) checks these against
// the fetched header row and falls back to hardcoded data when they're absent —
// which is how we detect a tab that hasn't been created yet, since Google's
// gviz endpoint answers an unknown tab name with HTTP 200 + the FIRST sheet's
// data instead of a 404. Each set pairs the transform's key column with one
// that's distinctive from the People tab (Title/Name also live there), so a
// stray People response can't masquerade as another list. These names must be
// spelled exactly as documented in SHEETS_GUIDE.md.
transformContent.required = ['Key', 'Text'];
transformEvents.required = ['Title', 'Date'];
transformCollaborations.required = ['Name', 'Category'];
transformPositions.required = ['Title', 'Summary'];
transformCourses.required = ['Title', 'Code'];
transformResearchAreas.required = ['Title', 'Description'];
transformFacilities.required = ['Name', 'Category'];
