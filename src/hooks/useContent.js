// useContent() -> t(key, fallback)
//
// Look up a text string from the `Content` sheet tab by its dotted key. If the
// sheet hasn't loaded, the key is missing, or the cell is blank, the provided
// fallback (the current hardcoded text) is returned. This guarantees the site
// always renders real content.
//
//   const t = useContent();
//   <h2>{t('welcome.title', 'Welcome to BIRD Lab')}</h2>

import { useContext } from 'react';
import { ContentContext } from '../context/ContentProvider';

export function useContent() {
  const map = useContext(ContentContext);
  return (key, fallback = '') => {
    const value = map ? map[key] : undefined;
    return value === undefined || value === null || value === '' ? fallback : value;
  };
}
