// Pre-fetches ALL sheet tabs simultaneously (Promise.all) at app root,
// automatically discovers all image URLs across all tabs, and caches them
// in memory and browser storage.
//
// Also runs background sync every 45 seconds so edits in Google Sheets
// reflect automatically without requiring a full manual redeploy or hard reload.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TABS } from '../config/sheets';
import { fetchTabRows, writeCache, resolveImageUrl } from '../services/sheets/client';
import { cacheImagesBatch, extractImageUrlsFromRows } from '../services/imageCache';

const SheetDataContext = createContext({ ready: false, refreshData: () => {} });

export function useSheetDataReady() {
  return useContext(SheetDataContext).ready;
}

export function useSheetRefresh() {
  return useContext(SheetDataContext).refreshData;
}

export function SheetDataProvider({ children }) {
  const [ready, setReady] = useState(false);

  const syncAllTabs = useCallback(async () => {
    const tabEntries = Object.entries(TABS);
    const allDiscoveredImages = [];

    await Promise.allSettled(
      tabEntries.map(async ([, tab]) => {
        try {
          const rows = await fetchTabRows(tab);
          writeCache(tab, rows);

          // Extract all image links from this tab
          const rawImgs = extractImageUrlsFromRows(rows);
          rawImgs.forEach((raw) => {
            const resolved = resolveImageUrl(raw);
            if (resolved && !resolved.startsWith('data:')) {
              allDiscoveredImages.push(resolved);
            }
          });

          return rows;
        } catch (err) {
          console.debug(`Sync failed for tab ${tab}:`, err);
          return null;
        }
      })
    );

    // Batch preload and cache all discovered images in the background
    if (allDiscoveredImages.length > 0) {
      cacheImagesBatch(allDiscoveredImages);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    // Initial fetch and cache on startup
    syncAllTabs();

    // Background sync every 45 seconds to catch live Google Sheet edits
    const syncInterval = setInterval(() => {
      syncAllTabs();
    }, 45 * 1000);

    return () => clearInterval(syncInterval);
  }, [syncAllTabs]);

  return (
    <SheetDataContext.Provider value={{ ready, refreshData: syncAllTabs }}>
      {children}
    </SheetDataContext.Provider>
  );
}
