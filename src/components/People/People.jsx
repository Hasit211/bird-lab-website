import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { staggerAnimation } from '../../utils/gsapAnimations';
import { getTeamData } from '../../services/googleSheets';
import { useContent } from '../../hooks/useContent';
import ExpandableCard from '../ExpandableCard/ExpandableCard';
import './People.css';

export const ALUMNI_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe0nQh5TmEqAlNzNZYDtVTVa4XeJ9Td--G9pyqXz5QLDxSe5A/viewform?usp=dialog';

const People = () => {
  const t = useContent();
  const alumniFormUrl = t('people.alumni.formUrl', ALUMNI_FORM_URL);
  const alumniBtnText = t('people.alumni.btnText', 'Were you Part of the team?');
  const alumniBadgeText = t('people.alumni.badgeText', 'Alumni');
  const alumniBannerText = t(
    'people.alumni.bannerText',
    'Celebrating our previous researchers, student interns, and lab members who contributed to BIRD Lab.'
  );
  const sectionRef = useRef(null);
  const [teamData, setTeamData] = useState({
    professor: [],
    postdoc: [],
    phd: [],
    juniorResearcher: [],
    masters: [],
    webmaster: [],
    alumni: [],
    graduateStudent: [],
    others: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTeamData();
        setTeamData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch team data:', err);
        setError('Failed to load team data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sectionRef.current && !loading) {
      const cards = sectionRef.current.querySelectorAll('.expandable-card-item');
      staggerAnimation(cards);
    }
  }, [loading, teamData]);

  if (loading) {
    return (
      <section id="people" className="section people" ref={sectionRef}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('people.title', 'Our Team')}</h2>
            <p className="section-subtitle">
              {t('people.subtitle', 'Meet the brilliant minds driving innovation in robotics research')}
            </p>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Loading team information...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="people" className="section people" ref={sectionRef}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('people.title', 'Our Team')}</h2>
            <p className="section-subtitle">
              {t('people.subtitle', 'Meet the brilliant minds driving innovation in robotics research')}
            </p>
          </div>
          <div className="error-message">
            <h3 style={{ margin: '0 0 1rem 0', color: '#ff6b6b' }}>Unable to Load Team Data</h3>
            <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="people" className="section people" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('people.title', 'Our Team')}</h2>
          <p className="section-subtitle">
            {t('people.subtitle', 'Meet the brilliant minds driving innovation in robotics research')}
          </p>
          <div className="people-top-cta">
            <a
              href={alumniFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="top-alumni-btn"
            >
              <span className="top-alumni-badge">{alumniBadgeText}</span>
              <span className="top-alumni-text">{alumniBtnText}</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

        <div className="team-sections-container">
          {/* Professor Section */}
          {teamData.professor && teamData.professor.length > 0 && (
            <div className="team-section professor-section">
              <h3 className="team-category-title">Professor</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.professor} />
              </div>
            </div>
          )}

          {/* Post-doctoral Researchers */}
          {teamData.postdoc && teamData.postdoc.length > 0 && (
            <div className="team-section">
              <h3 className="team-category-title">Post-doctoral Researchers</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.postdoc} />
              </div>
            </div>
          )}

          {/* PhD Students */}
          {teamData.phd && teamData.phd.length > 0 && (
            <div className="team-section">
              <h3 className="team-category-title">PhD Students</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.phd} />
              </div>
            </div>
          )}        {/* Junior Research Fellows */}
          {teamData.juniorResearcher && teamData.juniorResearcher.length > 0 && (
            <div className="team-section">
              <h3 className="team-category-title">Junior Research Fellows</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.juniorResearcher} />
              </div>
            </div>
          )}

          {/* Masters Students */}
          {teamData.masters && teamData.masters.length > 0 && (
            <div className="team-section masters-section">
              <h3 className="team-category-title">Master Students</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.masters} />
              </div>
            </div>
          )}

          {/* Graduate Students */}
          {teamData.graduateStudent && teamData.graduateStudent.length > 0 && (
            <div className="team-section graduateStudent-section">
              <h3 className="team-category-title">Graduate Students</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.graduateStudent} />
              </div>
            </div>
          )}

          {/* Web Masters */}
          {teamData.webmaster && teamData.webmaster.length > 0 && (
            <div className="team-section webmaster-section">
              <h3 className="team-category-title">Web Masters</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.webmaster} />
              </div>
            </div>
          )}

          {/* Other Team Members */}
          {teamData.others && teamData.others.length > 0 && (
            <div className="team-section others-section">
              <h3 className="team-category-title">Other Team Members</h3>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.others} />
              </div>
            </div>
          )}

          {/* Alumni */}
          {teamData.alumni && teamData.alumni.length > 0 && (
            <div className="team-section alumni-section">
              <div className="alumni-header-banner">
                <h3 className="team-category-title">Alumni</h3>
                <p className="alumni-banner-subtitle">
                  {alumniBannerText}
                </p>
                <a
                  href={alumniFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-alumni-action"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7.5" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                  <span>{alumniBtnText}</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
              <div className="team-grid-horizontal">
                <ExpandableCard cards={teamData.alumni} />
              </div>
            </div>
          )}
        </div>

        {/* Join Us Section */}
        <div className="join-us-section">
          <div className="join-us-content">
            <h3>{t('people.join.title', 'Join Our Team')}</h3>
            <p>
              {t(
                'people.join.text',
                "We're always looking for passionate researchers and students to join our team. Explore opportunities to work on cutting-edge robotics projects and contribute to groundbreaking research."
              )}
            </p>
            <div className="join-us-actions">
              <Link to="/contact" className="btn-primary">{t('people.join.btnPrimary', 'View Open Positions')}</Link>
              <Link to="/contact" className="btn-secondary">{t('people.join.btnSecondary', 'Contact Us')}</Link>
              <a
                href={alumniFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-alumni-pill"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{alumniBtnText}</span>
              </a>
            </div>
          </div>
          <div className="join-us-visual">
            <div className="team-illustration">
              <svg viewBox="0 0 400 300" className="illustration-svg">
                <defs>
                  <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)"/>
                    <stop offset="100%" stopColor="var(--secondary)"/>
                  </linearGradient>
                </defs>
                
                {/* Team representation */}
                <circle cx="200" cy="100" r="25" fill="url(#teamGradient)" opacity="0.8"/>
                <circle cx="150" cy="150" r="20" fill="var(--accent)" opacity="0.7"/>
                <circle cx="250" cy="150" r="20" fill="var(--accent)" opacity="0.7"/>
                <circle cx="120" cy="200" r="18" fill="var(--secondary)" opacity="0.6"/>
                <circle cx="180" cy="220" r="18" fill="var(--secondary)" opacity="0.6"/>
                <circle cx="220" cy="220" r="18" fill="var(--secondary)" opacity="0.6"/>
                <circle cx="280" cy="200" r="18" fill="var(--secondary)" opacity="0.6"/>
                
                {/* Connection lines */}
                <line x1="200" y1="125" x2="150" y2="130" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.5"/>
                <line x1="200" y1="125" x2="250" y2="130" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.5"/>
                <line x1="150" y1="170" x2="120" y2="182" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4"/>
                <line x1="150" y1="170" x2="180" y2="202" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4"/>
                <line x1="250" y1="170" x2="220" y2="202" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4"/>
                <line x1="250" y1="170" x2="280" y2="182" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default People;