// Per-tab transforms: turn raw CSV rows (string[][]) into the objects each
// component expects. Kept separate from client.js so fetching/caching stays
// framework-agnostic and these can evolve without touching the network layer.
//
// Header handling is by NAME (order-independent), except where the People sheet
// intentionally repeats headers ("Institutaion"/"Year") — that tab is parsed
// positionally in services/googleSheets.js.

import { resolveImageUrl, PLACEHOLDER_IMG } from './client.js';

// Build a header-name -> column-index lookup.
// Supports exact match, case-insensitive match, and token/prefix matching.
function headerIndex(headerRow) {
  const idx = {};
  const rawHeaders = (headerRow || []).map((h) => String(h ?? '').trim());
  rawHeaders.forEach((key, i) => {
    if (key && !(key in idx)) idx[key] = i;
  });

  return (name) => {
    if (name in idx) return idx[name];
    const lowerName = String(name).toLowerCase();
    // Case-insensitive match
    for (let i = 0; i < rawHeaders.length; i++) {
      if (rawHeaders[i].toLowerCase() === lowerName) return i;
    }
    // Substring / slash-delimited token match (e.g. 'Value' matches 'Value / Text / URL')
    for (let i = 0; i < rawHeaders.length; i++) {
      const parts = rawHeaders[i].toLowerCase().split(/[\s/|_-]+/).filter(Boolean);
      if (parts.includes(lowerName)) return i;
    }
    // Prefix match
    for (let i = 0; i < rawHeaders.length; i++) {
      if (rawHeaders[i].toLowerCase().startsWith(lowerName)) return i;
    }
    return -1;
  };
}

// Safe trimmed cell read by column index.
const cell = (row, i) => (i >= 0 && i < row.length ? String(row[i] ?? '').trim() : '');

// Split a delimited cell ("a, b; c") into a clean array.
const splitList = (s) =>
  String(s ?? '')
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

// Parse a multi-line or semicolon delimited "Label: value" cell into [{ label, value }].
const parseSpecs = (s) =>
  String(s ?? '')
    .split(/[\n;]/)
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
 * Content tab: `Page | Key | Text` or `Key | Value | Description` -> { [key]: text }.
 * @param {string[][]} rows
 * @returns {Record<string,string>}
 */
export function transformContent(rows) {
  if (!rows || rows.length < 2) return {};
  const at = headerIndex(rows[0]);
  let ki = at('Key');
  if (ki === -1) ki = rows[0].findIndex(h => String(h || '').trim().toLowerCase() === 'key');
  if (ki === -1) ki = 0;

  let ti = at('Value');
  if (ti === -1) ti = at('Text');
  if (ti === -1) ti = at('Content');
  if (ti === -1) ti = rows[0].findIndex((h, idx) => idx !== ki && (
    String(h || '').toLowerCase().includes('value') ||
    String(h || '').toLowerCase().includes('text') ||
    String(h || '').toLowerCase().includes('content')
  ));
  if (ti === -1) ti = rows[0].length > 3 ? 3 : (ki === 0 ? 1 : 0);

  const map = {};
  for (const row of rows.slice(1)) {
    const key = cell(row, ki);
    if (key) map[key] = cell(row, ti);
  }

  // Ensure home page key aliases stay synchronized so editing either one updates the UI
  if (map['welcome.title'] && !map['about.title']) map['about.title'] = map['welcome.title'];
  if (map['about.title'] && !map['welcome.title']) map['welcome.title'] = map['about.title'];
  if (map['welcome.subtitle'] && !map['about.description']) map['about.description'] = map['welcome.subtitle'];
  if (map['about.description'] && !map['welcome.subtitle']) map['welcome.subtitle'] = map['about.description'];
  if (map['hero.title'] && !map['hero.word']) map['hero.word'] = map['hero.title'];

  return map;
}

/**
 * Contact tab: Key | Field Name | Value | Description
 * Maps both technical keys ('contact.phone', 'contact.address.full', etc.)
 * and human-friendly field names so the professor can edit smoothly.
 * @param {string[][]} rows
 * @returns {Record<string,string>}
 */
export function transformContact(rows) {
  if (!rows || rows.length < 2) return {};
  const at = headerIndex(rows[0]);
  const ki = at('Key');
  const fi = at('Field Name') !== -1 ? at('Field Name') : (at('Field') !== -1 ? at('Field') : at('Contacts'));
  let vi = at('Value');
  if (vi === -1) vi = at('Text');
  if (vi === -1) vi = at('Details');
  if (vi === -1) vi = rows[0].findIndex((h, idx) => idx !== ki && idx !== fi && (
    String(h || '').toLowerCase().includes('value') ||
    String(h || '').toLowerCase().includes('text') ||
    String(h || '').toLowerCase().includes('detail')
  ));
  if (vi === -1) vi = 2;

  const map = {};

  const friendlyAliases = {
    'lab address': 'contact.address.full',
    'address': 'contact.address.full',
    'full address': 'contact.address.full',
    'full lab address': 'contact.address.full',
    'building': 'contact.address.building',
    'building & lab room': 'contact.address.building',
    'street': 'contact.address.street',
    'campus & street': 'contact.address.street',
    'city': 'contact.address.city',
    'city & pin code': 'contact.address.city',
    'state': 'contact.address.state',
    'state & district': 'contact.address.state',
    'country': 'contact.address.country',
    'phone': 'contact.phone',
    'phone number': 'contact.phone',
    'mobile': 'contact.phone',
    'email': 'contact.email',
    'lab email': 'contact.email',
    'secondary email': 'contact.email',
    'pi email': 'contact.banner.contactEmail',
    'professor email': 'contact.banner.contactEmail',
    'director email': 'contact.banner.contactEmail',
    'pi name': 'contact.banner.contactName',
    'professor name': 'contact.banner.contactName',
    'director name': 'contact.banner.contactName',
    'pi designation & role': 'contact.banner.contactTitle',
    'pi designation': 'contact.banner.contactTitle',
    'office hours': 'contact.officeHours',
    'lab office hours': 'contact.officeHours',
    'how to reach': 'contact.mapUrl',
    'google map': 'contact.mapUrl',
    'google maps': 'contact.mapUrl',
    'google maps location link': 'contact.mapUrl',
    'location link': 'contact.mapUrl',
    'map': 'contact.mapUrl',
    'application form': 'contact.join.url',
    'application form url': 'contact.join.url',
    'application form url (google form)': 'contact.join.url',
    'google form': 'contact.join.url',
    'join link': 'contact.join.url',
    'linkedin': 'social.linkedin',
    'linkedin url': 'social.linkedin',
    'linkedin profile url': 'social.linkedin',
    'youtube': 'social.youtube',
    'youtube channel url': 'social.youtube',
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const key = ki !== -1 ? cell(row, ki) : '';
    const fieldName = fi !== -1 ? cell(row, fi) : cell(row, 0);
    let val = cell(row, vi);

    // Fallback if cell was empty in vi but present in col 1 or 2
    if (!val && row.length > 2 && vi !== 2) val = cell(row, 2);
    if (!val && row.length > 1 && vi !== 1) val = cell(row, 1);

    if (key) {
      map[key] = val;
    }

    if (fieldName) {
      const lower = fieldName.toLowerCase().trim();
      const aliasKey = friendlyAliases[lower];
      if (aliasKey && !map[aliasKey]) {
        map[aliasKey] = val;
      }
    }
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

function isUrlString(s) {
  if (!s || typeof s !== 'string') return false;
  const str = s.trim();
  return (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('//') ||
    str.includes('drive.google.com') ||
    /\.(?:png|jpg|jpeg|webp|svg|gif)(?:\?.*)?$/i.test(str)
  );
}

/** Collaborations tab: Category, Institute / Industry, Photo Link, Description, Website Link */
export function transformCollaborations(rows) {
  if (!rows || rows.length === 0) return [];

  const at = headerIndex(rows[0]);
  let titleIdx = at('Institute / Industry') !== -1
    ? at('Institute / Industry')
    : (at('Institute or Industry') !== -1
      ? at('Institute or Industry')
      : (at('Institute') !== -1
        ? at('Institute')
        : (at('Industry') !== -1
          ? at('Industry')
          : (at('Partner') !== -1
            ? at('Partner')
            : (at('Name') !== -1 ? at('Name') : at('Title'))))));

  let catIdx = at('Category') !== -1 ? at('Category') : (at('Type') !== -1 ? at('Type') : at('Region'));
  let photoIdx = at('Photo Link') !== -1 ? at('Photo Link') : (at('Photo') !== -1 ? at('Photo') : (at('Image') !== -1 ? at('Image') : at('Logo')));
  let descIdx = at('Description') !== -1 ? at('Description') : (at('Details') !== -1 ? at('Details') : at('Overview'));
  let urlIdx = at('Website Link') !== -1 ? at('Website Link') : (at('Website') !== -1 ? at('Website') : (at('Link') !== -1 ? at('Link') : at('URL')));

  // Positional fallback if row 0 starts with 'Category'
  if (titleIdx === -1 && rows[0] && cell(rows[0], 0).toLowerCase() === 'category') {
    catIdx = 0;
    titleIdx = 1;
    photoIdx = 2;
    descIdx = 3;
    urlIdx = 4;
  }

  // Standard Header-Based / Positional Tabular Structure (Recommended)
  if (titleIdx !== -1) {
    const list = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const title = cell(row, titleIdx);
      if (!title || isUrlString(title)) continue;
      const lower = title.toLowerCase();
      if (lower === 'institute / industry' || lower === 'institute or industry' || lower === 'institute' || lower === 'industry') continue;

      const category = cell(row, catIdx) || 'National Academia';
      const photoLink = cell(row, photoIdx);
      const description = cell(row, descIdx);
      const url = cell(row, urlIdx);

      list.push({
        title,
        category,
        src: resolveCollaborationLogo(title, photoLink),
        url: isUrlString(url) ? url : '',
        description: description || `Active research collaboration between ${title} and NextGen BIRD Robotics Lab at IIT Jodhpur focusing on bio-inspired mechanisms, wearable robotics, and intelligent autonomous systems.`,
      });
    }
    if (list.length > 0) return list;
  }

  // Fallback: Legacy grouped National / International layout
  const result = [];
  let currentRegion = 'National';
  let currentType = 'Academia';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col0 = cell(row, 0);
    const col1 = cell(row, 1);
    const col2 = cell(row, 2);
    const col3 = cell(row, 3);
    const col4 = cell(row, 4);

    if (col0.toLowerCase().includes('national')) currentRegion = 'National';
    if (col0.toLowerCase().includes('international')) currentRegion = 'International';
    if (col1.toLowerCase().includes('academia')) currentType = 'Academia';

    // Check if col1 is an image URL meant for the last added academia partner
    if (isUrlString(col1)) {
      const lastAcademia = [...result].reverse().find(r => r.category.includes('Academia'));
      if (lastAcademia) {
        lastAcademia.src = resolveCollaborationLogo(lastAcademia.title, col1);
      }
      continue;
    }

    // Check if col2 is an image URL meant for the last added industry partner
    if (isUrlString(col2)) {
      const lastIndustry = [...result].reverse().find(r => r.category.includes('Industry'));
      if (lastIndustry) {
        lastIndustry.src = resolveCollaborationLogo(lastIndustry.title, col2);
      }
      continue;
    }

    let academiaDesc = '';
    let academiaImg = '';
    let industryDesc = '';
    let industryImg = '';

    if (col3) {
      if (isUrlString(col3)) {
        academiaImg = col3;
      } else if (!col3.toLowerCase().includes('detail') && !col3.toLowerCase().includes('description') && !col3.toLowerCase().includes('academia')) {
        academiaDesc = col3;
      }
    }

    if (col4) {
      if (isUrlString(col4)) {
        industryImg = col4;
      } else if (!col4.toLowerCase().includes('detail') && !col4.toLowerCase().includes('description') && !col4.toLowerCase().includes('industry')) {
        industryDesc = col4;
      }
    }

    if (col1 && !col1.toLowerCase().includes('academia') && !col1.toLowerCase().includes('partner')) {
      result.push({
        title: col1,
        category: `${currentRegion} ${currentType}`,
        src: resolveCollaborationLogo(col1, academiaImg),
        url: '',
        description: academiaDesc || `Active research collaboration between ${col1} and NextGen BIRD Robotics Lab at IIT Jodhpur focusing on bio-inspired mechanisms, wearable robotics, and intelligent autonomous systems.`,
      });
    }

    if (col2 && !col2.toLowerCase().includes('industry')) {
      result.push({
        title: col2,
        category: `${currentRegion} Industry`,
        src: resolveCollaborationLogo(col2, industryImg),
        url: '',
        description: industryDesc || `Joint industry collaboration with ${col2} focusing on translational robotics, innovative prosthetics, and applied biomechanical technologies.`,
      });
    }
  }

  return result.filter(item => !isUrlString(item.title));
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

const VERTICAL_ICONS = ['BIO', 'ENG', 'SYS', 'CTRL', 'AI', 'LAB', 'ROB'];

/** ResearchAreas tab: Icon, Title, Description OR Research tab format. */
export function transformResearchAreas(rows) {
  if (!rows || rows.length === 0) return [];

  const parseProjectItem = (projVal, extraVal, extraVal2) => {
    if (!projVal) return null;
    let name = String(projVal).trim();
    if (!name || name.toLowerCase() === 'project' || name.toLowerCase() === 'projects') return null;
    let url = '';
    let image = '';

    // Check if name contains pipe separator: "Project Name | https://..."
    if (name.includes('|')) {
      const parts = name.split('|');
      name = parts[0].trim();
      const maybeUrl = parts.slice(1).join('|').trim();
      if (isUrlString(maybeUrl)) url = maybeUrl;
    }

    const isImageVal = (val) => {
      if (!val || typeof val !== 'string') return false;
      const s = val.trim();
      return (
        /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(s) ||
        s.includes('drive.google.com') ||
        s.includes('googleusercontent.com') ||
        s.startsWith('/assets/') ||
        s.startsWith('/facilities/')
      );
    };

    if (extraVal2) {
      if (isImageVal(extraVal2)) {
        image = resolveImageUrl(extraVal2);
      } else if (isUrlString(extraVal2) && !url) {
        url = extraVal2;
      }
    }

    if (extraVal) {
      if (isImageVal(extraVal) && !image) {
        image = resolveImageUrl(extraVal);
      } else if (isUrlString(extraVal) && !url) {
        url = extraVal;
      }
    }

    return {
      name,
      url,
      image,
      toString() { return this.name; }
    };
  };

  const verticals = [];
  let current = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col0 = cell(row, 0);
    const col1 = cell(row, 1);
    const col2 = cell(row, 2);
    const col3 = cell(row, 3);
    const col4 = cell(row, 4);
    const col5 = cell(row, 5);

    // Skip table header row
    if (col0.toLowerCase() === 'vertical' && col1.toLowerCase() === 'title') {
      continue;
    }

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
      if (col3) {
        const p = parseProjectItem(col3, col4, col5);
        if (p) current.projects.push(p);
      }
    } else if (current) {
      if (col2 && !current.description) {
        current.description = col2;
      }
      if (col3) {
        const p = parseProjectItem(col3, col4, col5);
        if (p) current.projects.push(p);
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

/** Carousel / Slideshow tab: Title, Description, Image / Photo (supports Google Drive share links). */
export function transformCarousel(rows) {
  if (!rows || rows.length < 2) return [];
  const at = headerIndex(rows[0]);
  const titleIdx = at('Title') !== -1 ? at('Title') : at('Heading');
  const descIdx = at('Description') !== -1 ? at('Description') : (at('Caption') !== -1 ? at('Caption') : at('Subtitle'));
  const imgIdx = at('Image') !== -1
    ? at('Image')
    : (at('Photo') !== -1
      ? at('Photo')
      : (at('URL') !== -1
        ? at('URL')
        : (at('Link') !== -1
          ? at('Link')
          : (at('Picture') !== -1
            ? at('Picture')
            : (at('Src') !== -1 ? at('Src') : -1)))));

  // If there's no recognizable image column, do not attempt to parse arbitrary columns
  if (imgIdx === -1) return [];

  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const imageVal = cell(row, imgIdx);
    if (!imageVal) continue;
    const resolvedImg = resolveImageUrl(imageVal, { fallback: '' });
    if (!resolvedImg || resolvedImg === PLACEHOLDER_IMG) continue;
    items.push({
      id: i,
      src: resolvedImg,
      title: cell(row, titleIdx) || '',
      caption: cell(row, titleIdx) || '',
      description: cell(row, descIdx) || '',
      alt: cell(row, titleIdx) || `Slide ${i}`,
    });
  }
  return items;
}

export { headerIndex, cell, splitList, resolveImageUrl, PLACEHOLDER_IMG };

// Required header columns per tab.
transformContent.required = [['Key']];
transformContact.required = [['Key', 'Field Name', 'Field', 'Contacts', 'Contact', 'Value']];
transformEvents.required = ['Title', 'Date'];
transformCollaborations.required = [['Category', 'Institute / Industry', 'Institute or Industry', 'Partner', 'Name']];
transformCourses.required = [['Title', 'Course Name']];
transformResearchAreas.required = [['Vertical', 'Title']];
transformFacilities.required = ['Name', 'Category'];
transformCarousel.required = [['Image', 'Photo', 'URL', 'Link', 'Picture', 'Src']];
