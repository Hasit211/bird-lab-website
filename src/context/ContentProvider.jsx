// Provides all site TEXT (headings, subtitles, paragraphs, contact strings)
// from the single `Content` tab, fetched once at app root.
//
// Components read strings with the `t(key, fallback)` function from
// useContent(). The fallback is the current hardcoded text, so the site is
// fully rendered even before/without the sheet.

import { createContext } from 'react';
import { useSheetTab } from '../hooks/useSheetTab';
import { TABS } from '../config/sheets';
import { transformContent } from '../services/sheets/transforms';

// Map of dotted key -> text. Empty object until the Content tab loads.
export const ContentContext = createContext({});

// Stable references for the hook's deps.
const EMPTY = {};

export function ContentProvider({ children }) {
  const { data } = useSheetTab(TABS.content, { transform: transformContent, fallback: EMPTY });
  return <ContentContext.Provider value={data}>{children}</ContentContext.Provider>;
}
