// People data from the Google Sheet "People" tab.
//
// Keyless: reads the sheet via the public CSV endpoint (services/sheets/client),
// so no API key ships in the bundle. Photos come from the sheet's `Photo`
// column (plain image URL or Google Drive share link); if that's blank we fall
// back to a bundled /assets/<name>.png, and finally to a neutral placeholder.
import { FALLBACK_TEAM_DATA } from '../utils/fallbackData';
import { fetchTabRows, resolveImageUrl, PLACEHOLDER_IMG } from './sheets/client';
import { TABS } from '../config/sheets';

const emptyTeam = () => ({
  professor: [],
  postdoc: [],
  phd: [],
  juniorResearcher: [],
  masters: [],
  webmaster: [],
  alumni: [],
  graduateStudent: [],
  others: [],
});

// Bundled-asset path derived from a person's name (back-compat fallback for
// people who don't yet have a Photo value in the sheet).
const nameToAssetPath = (name) => {
  if (!name) return PLACEHOLDER_IMG;
  const filename = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, '-')
    .trim();
  return filename ? `/assets/${filename}.png` : PLACEHOLDER_IMG;
};

/**
 * Fetch the raw People rows (2D string array, row 0 = headers).
 * @returns {Promise<string[][]>}
 */
export const fetchSheetData = async () => fetchTabRows(TABS.people);

/**
 * Transform raw sheet rows into structured team data.
 * @param {string[][]} rawData - rows from the People tab (row 0 = headers)
 * @returns {Object} Structured team data
 */
export const transformSheetData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    return emptyTeam();
  }

  // First row is headers
  const headers = rawData[0];
  const rows = rawData.slice(1);

  // Map headers to indices for easier access. Education columns repeat the
  // "Institutaion"/"Year" headers, so those are resolved positionally (the
  // column immediately after the degree column, and two after).
  const headerMap = {
    title: headers.indexOf('Title'),
    name: headers.indexOf('Name'),
    photo: headers.indexOf('Photo'),
    research: headers.indexOf('Research Interests/Project'),
    email: headers.indexOf('Email'),
    postAffiliation: headers.indexOf('Post & Current Affiliation'),
    linkedin: headers.indexOf('Linkedin'),

    // Education columns - PhD
    phdDegree: headers.indexOf('Education (PhD)'),
    phdInstitution: headers.findIndex((h) => h && h.includes('Education (PhD)')) + 1,
    phdYear: headers.findIndex((h) => h && h.includes('Education (PhD)')) + 2,

    // Education columns - Masters
    mastersDegree: headers.indexOf('Education (MTech/MS)'),
    mastersInstitution: headers.findIndex((h) => h && h.includes('Education (MTech/MS)')) + 1,
    mastersYear: headers.findIndex((h) => h && h.includes('Education (MTech/MS)')) + 2,

    // Education columns - Bachelors
    bachelorsDegree: headers.indexOf('Education (BTech/BE)'),
    bachelorsInstitution: headers.findIndex((h) => h && h.includes('Education (BTech/BE)')) + 1,
    bachelorsYear: headers.findIndex((h) => h && h.includes('Education (BTech/BE)')) + 2,
  };

  // Helper function to safely get cell value
  const getCellValue = (row, index) => {
    return index >= 0 && index < row.length ? row[index] || '' : '';
  };

  // Helper function to parse research interests
  const parseResearch = (researchString) => {
    if (!researchString) return [];
    return researchString
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter((item) => item);
  };

  // Resolve a person's photo: the Photo column (URL / Drive link / filename)
  // drives it; blank falls back to the name-based bundled asset.
  const processImageUrl = (imageUrl, personName) =>
    resolveImageUrl(imageUrl, { fallback: nameToAssetPath(personName) });

  // Helper function to build education info
  const buildEducation = (row, degreeIndex, instIndex, yearIndex) => {
    const degree = getCellValue(row, degreeIndex);
    const institution = getCellValue(row, instIndex);
    const year = getCellValue(row, yearIndex);

    if (degree || institution || year) {
      return { degree, institution, year };
    }
    return null;
  };

  // Helper function to create bio from available data
  const createBio = (person) => {
    const parts = [];

    if (person.postAffiliation) {
      parts.push(`Currently at ${person.postAffiliation}.`);
    }

    if (person.research && person.research.length > 0) {
      parts.push(`Specializes in ${person.research.join(', ')}.`);
    }

    if (person.education?.phd?.institution) {
      parts.push(`Completed PhD from ${person.education.phd.institution}.`);
    }

    return parts.length > 0
      ? parts.join(' ')
      : `${person.title} with expertise in various research areas.`;
  };

  const transformedData = emptyTeam();

  rows.forEach((row) => {
    if (!row || row.length === 0) return;

    const title = getCellValue(row, headerMap.title).toLowerCase().trim();
    const name = getCellValue(row, headerMap.name);

    if (!name) return; // Skip rows without names

    const image = processImageUrl(getCellValue(row, headerMap.photo), name);
    const person = {
      name,
      title: getCellValue(row, headerMap.title),
      image,
      Photo: image,
      research: parseResearch(getCellValue(row, headerMap.research)),
      email: getCellValue(row, headerMap.email),
      postAffiliation: getCellValue(row, headerMap.postAffiliation),
      linkedin: getCellValue(row, headerMap.linkedin),
      education: {
        phd: buildEducation(row, headerMap.phdDegree, headerMap.phdInstitution, headerMap.phdYear),
        masters: buildEducation(
          row,
          headerMap.mastersDegree,
          headerMap.mastersInstitution,
          headerMap.mastersYear
        ),
        bachelors: buildEducation(
          row,
          headerMap.bachelorsDegree,
          headerMap.bachelorsInstitution,
          headerMap.bachelorsYear
        ),
      },
    };

    // Add bio
    person.bio = createBio(person);

    // Categorize based on title
    if (title === 'professor') {
      transformedData.professor.push(person);
    } else if (title === 'post-doctoral researcher') {
      transformedData.postdoc.push(person);
    } else if (title === 'ph.d') {
      transformedData.phd.push(person);
    } else if (title === 'junior research fellow') {
      transformedData.juniorResearcher.push(person);
    } else if (title === 'master student') {
      transformedData.masters.push(person);
    } else if (title === 'web master') {
      transformedData.webmaster.push(person);
    } else if (title === 'alumni') {
      transformedData.alumni.push(person);
    } else if (title === 'graduate student') {
      transformedData.graduateStudent.push(person);
    } else {
      transformedData.others.push(person);
    }
  });

  return transformedData;
};

/**
 * Get team data from Google Sheets (keyless). Falls back to bundled data if the
 * sheet is unreachable or returns nothing usable.
 * @returns {Promise<Object>} Structured team data
 */
export const getTeamData = async () => {
  try {
    const rawData = await fetchSheetData();
    const transformedData = transformSheetData(rawData);

    // If no people were parsed, use fallback so the page never renders empty.
    const total = Object.values(transformedData).reduce((sum, list) => sum + list.length, 0);
    if (total === 0) {
      console.warn('No data retrieved from Google Sheets, using fallback data');
      return FALLBACK_TEAM_DATA;
    }

    return transformedData;
  } catch (error) {
    console.error('Error getting team data, using fallback:', error);
    return FALLBACK_TEAM_DATA;
  }
};
