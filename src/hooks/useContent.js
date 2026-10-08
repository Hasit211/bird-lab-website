// useContent() -> t(key, fallback)
//
// Look up a text string from the `Content` sheet tab by its dotted key. If the
// sheet hasn't loaded, the key is missing, or the cell is blank, the provided
// fallback (the current hardcoded text) is returned. This guarantees the site
// always renders real content.
//
//   const t = useContent();
//   <h2>{t('welcome.title', 'Welcome to BIRD Lab')}</h2>

import { useContext, useMemo } from 'react';
import { ContentContext } from '../context/ContentProvider';

export function useContent() {
  const map = useContext(ContentContext);

  // Normalized key lookup for case/punctuation resilience
  const normalizedMap = useMemo(() => {
    if (!map) return {};
    const norm = {};
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined && v !== null && v !== '') {
        norm[k] = v;
        norm[k.toLowerCase()] = v;
        norm[k.toLowerCase().replace(/[-_.\s]+/g, '')] = v;
      }
    }
    return norm;
  }, [map]);

  return (key, fallback = '') => {
    const candidates = Array.isArray(key) ? key : [key];

    for (const cand of candidates) {
      if (!cand) continue;
      // 1. Direct exact match
      if (map && map[cand] !== undefined && map[cand] !== null && map[cand] !== '') {
        return map[cand];
      }
      // 2. Normalized fallback match
      const lower = String(cand).toLowerCase();
      if (normalizedMap[lower] !== undefined) {
        return normalizedMap[lower];
      }
      const stripped = lower.replace(/[-_.\s]+/g, '');
      if (normalizedMap[stripped] !== undefined) {
        return normalizedMap[stripped];
      }
    }

    return fallback;
  };
}
