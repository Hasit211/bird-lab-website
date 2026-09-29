export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.SERPAPI_KEY;
  if (!key) {
    return res.status(500).json({ error: 'SERPAPI_KEY is not configured' });
  }

  const start = parseInt(req.query.start, 10) || 0;

  const url =
    'https://serpapi.com/search.json' +
    '?engine=google_scholar_author' +
    '&author_id=3KZSSEIAAAAJ' +
    `&start=${start}` +
    `&api_key=${key}`;

  try {
    const upstream = await fetch(url);
    const data = await upstream.json();

    // Cache for 1 hour so you don't burn through your SerpAPI quota
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach SerpAPI' });
  }
}