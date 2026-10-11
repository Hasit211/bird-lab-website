import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHOLAR_ID = process.argv[2] || '3KZSSEIAAAAJ';
const URL = `https://scholar.google.com/citations?user=${SCHOLAR_ID}&hl=en&cstart=0&pagesize=100`;

console.log(`[Scholar Sync] Fetching Google Scholar profile for: ${SCHOLAR_ID}...`);

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…');
}

function fetchScholar(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchScholar(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP status ${res.statusCode}`));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const html = await fetchScholar(URL);
    
    // Overall stats
    const statMatches = [...html.matchAll(/<td class="gsc_rsb_std">(\d+)<\/td>/g)].map(m => parseInt(m[1]));
    const overallStats = {
      totalCitations: statMatches[0] || 640,
      recentCitations: statMatches[1] || 588,
      hIndex: statMatches[2] || 13,
      recentHIndex: statMatches[3] || 12,
      i10Index: statMatches[4] || 20,
      recentI10Index: statMatches[5] || 18,
      scholarId: SCHOLAR_ID,
      scholarUrl: `https://scholar.google.com/citations?user=${SCHOLAR_ID}&hl=en`
    };

    const rows = html.match(/<tr class="gsc_a_tr">[\s\S]*?<\/tr>/g) || [];
    console.log(`[Scholar Sync] Found ${rows.length} publications on Google Scholar.`);

    if (rows.length === 0) {
      console.warn('[Scholar Sync] No rows matched. Keeping existing data to be safe.');
      return;
    }

    const parsed = rows.map((r, i) => {
      const titleMatch = r.match(/<a [^>]*class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/);
      const linkMatch = r.match(/<a [^>]*href="([^"]*)"[^>]*class="gsc_a_at"/);
      const grayDivs = [...r.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)].map(m => m[1]);
      const authors = grayDivs[0] ? decodeEntities(grayDivs[0].replace(/<[^>]+>/g, '').trim()) : '';
      const venueDiv = grayDivs[1] || '';
      const venue = decodeEntities(venueDiv.replace(/<span[^>]*>[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, '').trim());
      const yearSpan = venueDiv.match(/<span class="gs_oph">,\s*(\d+)<\/span>/);
      const yearCol = r.match(/<span class="gsc_a_h[^"]*">(\d+)<\/span>/);
      const year = yearCol && yearCol[1] ? parseInt(yearCol[1]) : (yearSpan ? parseInt(yearSpan[1]) : null);
      const citeMatch = r.match(/<a [^>]*class="gsc_a_ac[^"]*"[^>]*>(\d+)<\/a>/);
      const citations = citeMatch ? parseInt(citeMatch[1]) : 0;

      const rawTitle = titleMatch ? decodeEntities(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : '';
      
      const lowerVenue = (venue + ' ' + rawTitle).toLowerCase();
      let type = 'Journal';
      if (lowerVenue.includes('conference') || lowerVenue.includes('symposium') || lowerVenue.includes('proceedings') || lowerVenue.includes('workshop') || lowerVenue.includes('acmd') || lowerVenue.includes('imsd') || lowerVenue.includes('iros') || lowerVenue.includes('icra')) {
        type = 'Conference';
      } else if (lowerVenue.includes('patent')) {
        type = 'Patent';
      } else if (lowerVenue.includes('review')) {
        type = 'Review';
      } else if (lowerVenue.includes('book') || lowerVenue.includes('chapter')) {
        type = 'Book Chapter';
      }

      let fullUrl = '';
      if (linkMatch) {
        const rawLink = decodeEntities(linkMatch[1]);
        fullUrl = rawLink.startsWith('http') ? rawLink : 'https://scholar.google.com' + rawLink;
      }

      return {
        id: i + 1,
        title: rawTitle,
        authors,
        journal: venue,
        year,
        citations,
        type,
        url: fullUrl
      };
    });

    const result = {
      stats: overallStats,
      totalCount: parsed.length,
      lastUpdated: new Date().toISOString(),
      publications: parsed
    };

    const outJsonPath = path.resolve(__dirname, '../src/data/scholar_publications.json');
    const outJsPath = path.resolve(__dirname, '../src/data/scholar_publications.js');
    fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
    fs.writeFileSync(outJsonPath, JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(outJsPath, `// Auto-generated by scripts/sync_scholar.js\nconst scholarData = ${JSON.stringify(result, null, 2)};\nexport default scholarData;\n`, 'utf8');

    console.log(`[Scholar Sync] Successfully updated publications dataset with ${parsed.length} publications!`);
  } catch (error) {
    console.error('[Scholar Sync] Failed:', error.message);
  }
}

run();
