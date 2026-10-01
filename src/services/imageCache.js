/**
 * Intelligent Image Caching & Preloading Service
 *
 * Automatically intercepts, preloads, and caches all laboratory images
 * (Google Drive CDN links, external URLs, and local assets) in browser
 * CacheStorage and memory. When new images are added to Google Sheets,
 * this service automatically caches them in the background.
 */

const CACHE_NAME = 'bird-lab-images-v2';
const inMemoryCache = new Set();

/**
 * Preload and cache a single image URL.
 * @param {string} url - image URL to cache
 * @returns {Promise<boolean>}
 */
export async function cacheImage(url) {
  if (!url || typeof url !== 'string' || url.startsWith('data:')) return false;

  // If already loaded in memory, return fast
  if (inMemoryCache.has(url)) return true;

  try {
    // 1. In-memory prefetch
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    // 2. Persist in CacheStorage if supported by the browser
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      if (!cachedResponse) {
        // Fetch and store in cache in the background (no-cors for external domains)
        fetch(url, { mode: 'no-cors' })
          .then((res) => {
            if (res) cache.put(url, res);
          })
          .catch(() => {
            // Non-critical background failure
          });
      }
    }

    inMemoryCache.add(url);
    return true;
  } catch (err) {
    console.debug('Image cache error for:', url, err);
    return false;
  }
}

/**
 * Batch preload and cache an array of image URLs extracted from Google Sheets.
 * @param {string[]} urls
 */
export function cacheImagesBatch(urls = []) {
  if (!Array.isArray(urls)) return;
  const uniqueUrls = [...new Set(urls.filter(Boolean))];

  // Preload concurrently in batches of 4 to avoid saturating network connections
  const queue = [...uniqueUrls];
  const BATCH_SIZE = 4;

  const processBatch = async () => {
    while (queue.length > 0) {
      const chunk = queue.splice(0, BATCH_SIZE);
      await Promise.allSettled(chunk.map((url) => cacheImage(url)));
    }
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => processBatch());
  } else {
    setTimeout(processBatch, 100);
  }
}

/**
 * Extract all image URLs from a 2D sheet row dataset.
 * Checks for URLs containing image extensions, Google Drive links, or common photo headers.
 * @param {string[][]} rows
 * @returns {string[]}
 */
export function extractImageUrlsFromRows(rows) {
  if (!rows || !Array.isArray(rows) || rows.length < 2) return [];

  const foundUrls = [];
  const driveRegex = /(?:drive\.google\.com|googleusercontent\.com|lh3\.googleusercontent\.com)/i;
  const imgExtRegex = /\.(?:png|jpg|jpeg|webp|svg|gif)(?:\?.*)?$/i;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;

    for (const cell of row) {
      const str = String(cell || '').trim();
      if (!str) continue;

      if (driveRegex.test(str) || imgExtRegex.test(str) || str.startsWith('http://') || str.startsWith('https://')) {
        foundUrls.push(str);
      }
    }
  }

  return foundUrls;
}
