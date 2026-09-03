// Single source of truth for the Google Sheet the whole site reads from.
//
// The professor edits ONE Google Sheet (shared "Anyone with the link -> Viewer").
// Each tab below maps to a section of the site. Changing a value in the sheet
// updates the live site on the next load (subject to the cache TTL). No API key,
// no backend, no redeploy required.
//
// To point the site at a different sheet, change SHEET_ID and re-share the new
// sheet as "Anyone with the link -> Viewer".

// The spreadsheet ID from the sheet URL:
// https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
export const SHEET_ID = '1rfeP7ny6xYqEe-5fVLqKpXLHGI2rGeQ8oZK0us6ADtE';

// Tab (worksheet) names. These MUST match the tab names in the Google Sheet
// exactly, including capitalization. See SHEETS_GUIDE.md for the columns each
// tab expects.
export const TABS = {
  content: 'Content', // Page | Key | Text  (all headings/paragraphs on the site)
  people: 'People',
  events: 'Events',
  collaborations: 'Collaborations',
  positions: 'Positions',
  courses: 'Courses',
  researchAreas: 'ResearchAreas',
  facilities: 'Facilities',
};

// How long a fetched tab is considered "fresh" in localStorage before the site
// revalidates it in the background. Keep this short enough that edits show up
// quickly, long enough to avoid refetching on every page navigation.
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
