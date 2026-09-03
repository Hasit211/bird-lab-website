// React hook for a list-shaped sheet tab (Events, Collaborations, etc.).
//
// Stale-while-revalidate: render cached rows (or the hardcoded fallback)
// immediately, then fetch fresh rows in the background and swap them in on
// success. On failure we keep whatever we already had, so the page never blanks.
//
// `transform` and `fallback` must be STABLE references (define them at module
// scope in the component file), since they participate in the effect deps.
//
// The header guard (assertHeaders + transform.required) is what makes "the tab
// doesn't exist yet" fall back correctly: Google's gviz endpoint answers an
// unknown tab name with HTTP 200 + some OTHER sheet's data, which would parse to
// an empty list and wrongly wipe out the fallback. We detect that by checking
// the fetched columns, and we never cache a response that fails the check.

import { useEffect, useState } from 'react';
import { fetchTabRows, readCache, writeCache, assertHeaders } from '../services/sheets/client';

function safeTransform(transform, rows, fallback) {
  try {
    return transform(rows);
  } catch {
    return fallback;
  }
}

// Return the cache entry only if its rows still match the tab's expected shape.
// A cache poisoned by a wrong-tab response (or an older code version) is treated
// as absent so we refetch instead of rendering garbage/empty.
function validCache(tab, transform) {
  const cached = readCache(tab);
  if (!cached) return null;
  try {
    assertHeaders(tab, cached.rows, transform.required);
    return cached;
  } catch {
    return null;
  }
}

export function useSheetTab(tab, { transform, fallback }) {
  const [state, setState] = useState(() => {
    const cached = validCache(tab, transform);
    return {
      data: cached ? safeTransform(transform, cached.rows, fallback) : fallback,
      loading: !(cached && cached.fresh),
      error: null,
    };
  });

  useEffect(() => {
    let cancelled = false;

    const cached = validCache(tab, transform);
    if (cached && cached.fresh) return; // fresh AND valid — skip the network

    (async () => {
      try {
        const rows = await fetchTabRows(tab);
        if (cancelled) return;
        // Throws SheetShapeError when the tab is missing/wrong-shaped, which the
        // catch below turns into "keep the fallback" — never cached.
        assertHeaders(tab, rows, transform.required);
        writeCache(tab, rows);
        setState({ data: safeTransform(transform, rows, fallback), loading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        // Keep cached/fallback data already in state; just clear loading.
        setState((prev) => ({ data: prev.data, loading: false, error }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, transform, fallback]);

  return state;
}
