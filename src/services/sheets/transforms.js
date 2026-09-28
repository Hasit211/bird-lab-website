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

const COLLAB_IMAGE_MAP = {
  'iit delhi': '/assets/IITD.png',
  'iit gandhinagar': '/assets/IITGN.png',
  'university of siena': '/assets/UniversityOfSiena.png',
  'siena': '/assets/UniversityOfSiena.png',
  'khalifa': '/assets/KhalifaUniversity.png',
  'kaist': '/assets/KAIST.png',
  'cnu': '/assets/CNU.png',
  'jaipur foot': '/assets/JaipurFoot.png',
  'sogang': '/assets/Sogang.png',
};

export function resolveCollaborationLogo(title, rawImage) {
  const resolved = resolveImageUrl(rawImage, { fallback: '' });
  if (resolved && resolved !== PLACEHOLDER_IMG) return resolved;

  const key = String(title || '').toLowerCase().trim();
  for (const [name, path] of Object.entries(COLLAB_IMAGE_MAP)) {
    if (key.includes(name)) return path;
  }
  return PLACEHOLDER_IMG;
}

/** Collaborations tab: Name, Category, Image, (optional) URL OR freeform National/International. */
export function transformCollaborations(rows) {
  if (!rows || rows.length === 0) return [];
  const at = headerIndex(rows[0]);
  const nameIdx = at('Name') !== -1 ? at('Name') : at('Title');

  if (nameIdx !== -1 && at('Category') !== -1) {
    return rows.slice(1).map((row) => {
      const title = cell(row, nameIdx);
      if (!title) return null;
      return {
        title,
        category: cell(row, at('Category')) || 'Collaboration',
        src: resolveCollaborationLogo(title, cell(row, at('Image'))),
        url: cell(row, at('URL')),
      };
    }).filter(Boolean);
  }

  // Freeform National / International layout (as in user sheet)
  const result = [];
  let currentRegion = 'National';
  let currentType = 'Academia';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col0 = cell(row, 0);
    const col1 = cell(row, 1);
    const col2 = cell(row, 2);

    if (col0.toLowerCase().includes('national')) currentRegion = 'National';
    if (col0.toLowerCase().includes('international')) currentRegion = 'International';
    if (col1.toLowerCase().includes('academia')) currentType = 'Academia';

    if (col1 && !col1.toLowerCase().includes('academia') && !col1.toLowerCase().includes('partner')) {
      result.push({
        title: col1,
        category: `${currentRegion} ${currentType}`,
        src: resolveCollaborationLogo(col1, ''),
        url: '',
      });
    }

    if (col2 && !col2.toLowerCase().includes('industry')) {
      result.push({
        title: col2,
        category: `${currentRegion} Industry`,
        src: resolveCollaborationLogo(col2, ''),
        url: '',
      });
    }
  }
  return result;
}

/** Positions tab: Title, Type, Department, Summary, Details, Email, Contact, Status OR freeform. */
export function transformPositions(rows) {
  if (!rows || rows.length === 0) return [];
  const at = headerIndex(rows[0]);
  const titleIdx = at('Title');

  if (titleIdx !== -1) {
    return mapRows(rows, (row, at, i) => {
      const title = cell(row, titleIdx);
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

  // Paragraph/freeform style as in Open Positions tab
  const textLines = [];
  rows.forEach((row) => {
    row.forEach((c) => {
      const trimmed = String(c ?? '').trim();
      if (trimmed && trimmed.toLowerCase() !== 'open positions') {
        textLines.push(trimmed);
      }
    });
  });

  if (textLines.length > 0) {
    return [{
      id: 1,
      title: 'Open Positions',
      type: 'Available',
      department: 'Robotics & Intelligent Systems',
      summary: textLines[0],
      details: textLines.slice(1).join(' '),
      email: 'bhivraj@iitj.ac.in',
      contact: 'Dr. Bhivraj Suthar',
      status: 'Open',
    }];
  }

  return [];
}

/** Courses tab: Code, Title, Credits, Department, Level, Description OR Lectures format. */
export function transformCourses(rows) {
  if (!rows || rows.length < 2) return [];
  const at = headerIndex(rows[0]);
  const titleIdx = at('Title') !== -1 ? at('Title') : at('Course Name');
  const codeIdx = at('Code') !== -1 ? at('Code') : at('Course code');
  const deptIdx = at('Department') !== -1 ? at('Department') : at('Course offered by');
  const levelIdx = at('Level') !== -1 ? at('Level') : at('Course offered year and semester');
  const descIdx = at('Description') !== -1 ? at('Description') : at('Course topics');
  const creditsIdx = at('Credits');

  return rows.slice(1).map((row, i) => {
    const title = cell(row, titleIdx);
    if (!title || title.includes('Only put highligted text')) return null;
    return {
      id: i + 1,
      code: cell(row, codeIdx),
      title,
      credits: cell(row, creditsIdx),
      department: cell(row, deptIdx),
      type: (cell(row, levelIdx) || 'postgraduate').toLowerCase(),
      description: cell(row, descIdx),
    };
  }).filter(Boolean);
}

const VERTICAL_ICONS = ['🧬', '🦾', '🛸', '🕹️', '🧠', '🔬', '🤖'];

/** ResearchAreas tab: Icon, Title, Description OR Research tab format. */
export function transformResearchAreas(rows) {
  if (!rows || rows.length === 0) return [];
  const at = headerIndex(rows[0]);
  const titleIdx = at('Title');

  // Standard table format with "Title" column in row 0
  if (titleIdx !== -1 && at('Description') !== -1) {
    return mapRows(rows, (row, at, i) => {
      const title = cell(row, titleIdx);
      if (!title) return null;
      return {
        id: i + 1,
        icon: cell(row, at('Icon')) || VERTICAL_ICONS[i % VERTICAL_ICONS.length],
        title,
        description: cell(row, at('Description')),
        projects: splitList(cell(row, at('Projects'))),
      };
    });
  }

  // Parse custom Research tab (Vertical 1..5 layout)
  const verticals = [];
  let current = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col0 = cell(row, 0);
    const col1 = cell(row, 1);
    const col2 = cell(row, 2);
    const col3 = cell(row, 3);

    const isNewVertical = /^vertical\s*\d+/i.test(col0) || (col1 && (!current || col1 !== current.title));

    if (isNewVertical && (col1 || col0)) {
      if (current) verticals.push(current);
      current = {
        id: verticals.length + 1,
        icon: VERTICAL_ICONS[verticals.length % VERTICAL_ICONS.length],
        vertical: col0 || `Vertical ${verticals.length + 1}`,
        title: col1 || col0,
        description: col2 || '',
        projects: [],
      };
      if (col3) current.projects.push(col3);
    } else if (current) {
      if (col2 && !current.description) {
        current.description = col2;
      }
      if (col3) {
        current.projects.push(col3);
      }
    }
  }

  if (current) {
    verticals.push(current);
  }

  return verticals.length > 0 ? verticals : [];
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

// Required header columns per tab.
transformContent.required = [];
transformEvents.required = ['Title', 'Date'];
transformCollaborations.required = [];
transformPositions.required = [];
transformCourses.required = [['Title', 'Course Name']];
transformResearchAreas.required = [];
transformFacilities.required = ['Name', 'Category'];
