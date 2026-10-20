import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import googleScholarService from '../../services/scholarPublications';
import { useContent } from '../../hooks/useContent';
import './Publications.css';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SCHOLAR_PROFILE_URL = 'https://scholar.google.com/citations?user=3KZSSEIAAAAJ&hl=en';

const Publications = () => {
  const t = useContent();
  const scholarUrl = t('publications.scholarUrl', DEFAULT_SCHOLAR_PROFILE_URL);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [publications, setPublications] = useState([]);
  const [filteredPubs, setFilteredPubs] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCitations: 640,
    hIndex: 13,
    i10Index: 20,
    journalCount: 0,
    conferenceCount: 0,
    totalCount: 78
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [copiedId, setCopiedId] = useState(null);
  const pubsRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pubs, pubStats] = await Promise.all([
          googleScholarService.getPublications('3KZSSEIAAAAJ'),
          googleScholarService.getStats()
        ]);
        setPublications(pubs);
        setStats(pubStats);
        setFilteredPubs(pubs);
        setCacheInfo(googleScholarService.getCacheInfo());
        setLastUpdated(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      } catch {
        setPublications([]);
        setFilteredPubs([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const pubs = await googleScholarService.refreshData('3KZSSEIAAAAJ');
      const pubStats = await googleScholarService.getStats();
      setPublications(pubs);
      setStats(pubStats);
      setFilteredPubs(pubs);
      setCacheInfo(googleScholarService.getCacheInfo());
      setLastUpdated(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = publications;
    if (selectedYear !== 'all') {
      filtered = filtered.filter(pub => pub.year && pub.year.toString() === selectedYear);
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(pub => pub.type && pub.type.toLowerCase() === selectedType);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pub =>
        (pub.title && pub.title.toLowerCase().includes(term)) ||
        (typeof pub.authors === 'string'
          ? pub.authors.toLowerCase().includes(term)
          : Array.isArray(pub.authors)
            ? pub.authors.some(author => author.toLowerCase().includes(term))
            : false) ||
        (pub.journal && pub.journal.toLowerCase().includes(term))
      );
    }
    setFilteredPubs(filtered);
  }, [publications, selectedYear, selectedType, searchTerm]);

  useEffect(() => {
    if (cardsRef.current.length > 0 && pubsRef.current) {
      gsap.fromTo(cardsRef.current.filter(Boolean),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.03,
          ease: "power2.out"
        }
      );
    }
  }, [filteredPubs, visibleCount]);

  const getUniqueYears = () => {
    const years = publications.map(pub => pub.year).filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const getUniqueTypes = () => {
    const types = publications.map(pub => (pub.type || "Other").toLowerCase());
    return [...new Set(types)];
  };

  const copyCitation = (publication) => {
    const authorsStr = typeof publication.authors === 'string'
      ? publication.authors
      : (publication.authors || []).join(', ');
    const yearStr = publication.year ? `, ${publication.year}` : '';
    const venueStr = publication.journal || publication.venue ? ` ${publication.journal || publication.venue}` : '';
    const citation = `${authorsStr}. "${publication.title}."${venueStr}${yearStr}.`;

    navigator.clipboard.writeText(citation);
    setCopiedId(publication.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedPubs = filteredPubs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPubs.length;

  return (
    <section id="publications" className="publications-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge-wrapper">
            <span className="section-badge">{t('publications.badge', 'Academic Output')}</span>
          </div>
          <h2 className="section-title">{t('publications.title', 'Publications & Research Papers')}</h2>
          <p className="section-subtitle">
            {t(
              'publications.subtitle',
              "All peer-reviewed journal articles, conference proceedings, and patents directly synchronized with Dr. Bhivraj Suthar's Google Scholar profile."
            )}
          </p>
        </div>

        {/* Scholar Metrics & Profile Header */}
        <div className="scholar-overview-bar">
          <div className="publications-metrics-grid">
            <div className="pub-metric-card">
              <span className="pub-metric-number">
                {stats.totalCitations || 640}
              </span>
              <span className="pub-metric-label">Total Citations</span>
            </div>
            <div className="pub-metric-card">
              <span className="pub-metric-number">{stats.hIndex || 13}</span>
              <span className="pub-metric-label">H-index</span>
            </div>
            <div className="pub-metric-card">
              <span className="pub-metric-number">{stats.i10Index || 20}</span>
              <span className="pub-metric-label">i10-index</span>
            </div>
            <div className="pub-metric-card">
              <span className="pub-metric-number">{publications.length || 78}</span>
              <span className="pub-metric-label">Total Papers</span>
            </div>
          </div>

          <div className="scholar-actions-row">
            <a
              href={scholarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="scholar-profile-btn"
              title="View full profile on Google Scholar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/>
              </svg>
              <span>Google Scholar Profile</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>

            <button
              className="pub-refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Synchronize publications"
            >
              <svg className={`refresh-icon ${loading ? 'spinning' : ''}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19" />
              </svg>
              <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>

        {/* Filters, Search, and Results Count */}
        <div className="publications-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by title, author, or journal..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(20);
              }}
              className="search-input"
            />
            <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>

          <div className="filter-controls">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setVisibleCount(20);
              }}
              className="filter-select"
            >
              <option value="all">All Years ({getUniqueYears().length})</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setVisibleCount(20);
              }}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count summary bar */}
        <div className="publications-counter-row">
          <span className="counter-text">
            Showing <strong>{displayedPubs.length}</strong> of <strong>{filteredPubs.length}</strong> publications
            {selectedYear !== 'all' && ` from ${selectedYear}`}
            {selectedType !== 'all' && ` (${selectedType})`}
          </span>
          {lastUpdated && (
            <span className="counter-sync-date">
              Synced with Google Scholar: {lastUpdated}
            </span>
          )}
        </div>

        {/* Publications Grid */}
        <div ref={pubsRef} className="publications-grid">
          {displayedPubs.map((publication, index) => {
            const citeCount = publication.citations !== undefined ? publication.citations : (publication.citation || 0);
            const targetUrl = publication.doiUrl || publication.url || (publication.title ? `https://scholar.google.com/scholar?q=${encodeURIComponent(publication.title)}` : null);

            return (
              <div
                key={`${publication.title}-${publication.id || index}`}
                ref={el => cardsRef.current[index] = el}
                className="publication-card"
              >
                <div className="publication-header">
                  <div className="publication-badges">
                    <span className={`publication-type ${(publication.type || 'journal').toLowerCase().replace(/\s+/g, '-')}`}>
                      {publication.type || 'Journal'}
                    </span>
                    {publication.year && (
                      <span className="publication-year">{publication.year}</span>
                    )}
                  </div>

                  {citeCount > 0 && (
                    <span className="publication-citations" title="Citations on Google Scholar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                      </svg>
                      Cited by {citeCount}
                    </span>
                  )}
                </div>

                <h3 className="publication-title">
                  {publication.title}
                </h3>
                
                <div className="publication-authors">
                  {typeof publication.authors === 'string'
                    ? publication.authors
                    : (publication.authors || []).join(', ')}
                </div>

                {publication.journal && (
                  <div className="publication-venue">{publication.journal}</div>
                )}

                {publication.abstract && (
                  <div className="publication-abstract">
                    <p>{publication.abstract}</p>
                  </div>
                )}

                <div className="publication-actions">
                  {targetUrl && targetUrl !== '#' && (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn download-btn"
                      title="Open publication or Scholar citation page"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span>{publication.doiUrl ? 'View Paper' : 'View on Scholar'}</span>
                    </a>
                  )}
                  
                  <button
                    onClick={() => copyCitation(publication)}
                    className="action-btn cite-btn"
                    title="Copy APA-style citation"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    <span>{copiedId === publication.id ? 'Copied!' : 'Cite'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More & Show All Controls */}
        <div className="pagination-bar">
          {hasMore && (
            <div className="load-more-controls">
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount(v => Math.min(v + 20, filteredPubs.length))}
              >
                Load More (+20)
              </button>
              <button
                className="show-all-btn"
                onClick={() => setVisibleCount(filteredPubs.length)}
              >
                Show All ({filteredPubs.length})
              </button>
            </div>
          )}

          {!hasMore && filteredPubs.length > 20 && (
            <div className="all-loaded-indicator">
              <span>All {filteredPubs.length} publications displayed</span>
              <button
                className="collapse-btn"
                onClick={() => {
                  setVisibleCount(20);
                  if (pubsRef.current) pubsRef.current.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Show First 20
              </button>
            </div>
          )}
        </div>

        {filteredPubs.length === 0 && !loading && (
          <div className="no-results">
            <p>No publications found matching your search or filters.</p>
            <button
              className="pub-refresh-btn"
              onClick={() => {
                setSelectedYear('all');
                setSelectedType('all');
                setSearchTerm('');
                setVisibleCount(20);
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>Loading publications from Google Scholar...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default Publications;
