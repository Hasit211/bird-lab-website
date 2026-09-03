// Automatic "Upcoming" vs "Past" status for events.
//
// The professor edits only an event's *date* in the Google Sheet — the site
// works out whether it's upcoming or past on its own, every time the page
// loads. That means a status can never go stale: the day after an event, it
// flips to "Past" with nobody touching anything.
//
// Dates are free text ("March 15-17, 2025", "February 10, 2025", "2025-03-17"),
// so we parse them defensively and, for a date range, always compare against the
// LAST day — an event is only "Past" once its final day is over.

const MONTH_INDEX = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * Parse a free-text event date into the Date of its LAST day (local midnight).
 * Handles ISO dates, single dates, and same- or cross-month ranges. Returns
 * null when the string has no recognizable date (e.g. "TBD").
 *
 * @param {string} dateStr
 * @returns {Date|null}
 */
export function parseEventEndDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim().toLowerCase();
  if (!s) return null;

  // ISO dates (YYYY-MM-DD) parse reliably; take the last one in a range.
  const iso = s.match(/\d{4}-\d{2}-\d{2}/g);
  if (iso) {
    const d = new Date(`${iso[iso.length - 1]}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // Otherwise expect a written month + a 4-digit year somewhere in the string.
  const yearMatch = s.match(/\b(\d{4})\b/);
  if (!yearMatch) return null;
  const year = Number(yearMatch[1]);

  // Use the LAST month name mentioned (the end of a "March 15 - April 2" range).
  const months = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/g);
  if (!months) return null;
  const month = MONTH_INDEX[months[months.length - 1].slice(0, 3)];
  if (month === undefined) return null;

  // Use the LAST day number that isn't the year (the end of "15-17"). If no day
  // is given ("March 2025"), assume the last day of that month so the whole
  // month counts as upcoming.
  const days = (s.replace(yearMatch[0], ' ').match(/\b\d{1,2}\b/g) || [])
    .map(Number)
    .filter((n) => n >= 1 && n <= 31);
  const day = days.length ? days[days.length - 1] : new Date(year, month + 1, 0).getDate();

  return new Date(year, month, day);
}

/**
 * Decide whether an event is 'Upcoming' or 'Past'.
 *
 * An explicit Status typed in the sheet always wins — it's the manual override.
 * When Status is left blank (the normal case) the result is worked out from the
 * date, so it's always fresh and can never go stale on its own.
 *
 * @param {string} dateStr           the event's date cell (free text)
 * @param {string} [explicitStatus]  optional Status override ('Upcoming'/'Past'); wins over the date when set
 * @returns {'Upcoming'|'Past'}
 */
export function deriveEventStatus(dateStr, explicitStatus) {
  // Manual override: an explicit Status in the sheet takes precedence.
  const override = String(explicitStatus ?? '').trim().toLowerCase();
  if (override === 'past') return 'Past';
  if (override === 'upcoming') return 'Upcoming';

  // Otherwise work it out from the date.
  const end = parseEventEndDate(dateStr);
  if (end) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end < today ? 'Past' : 'Upcoming';
  }

  // No readable date and no override — assume it's still upcoming.
  return 'Upcoming';
}
