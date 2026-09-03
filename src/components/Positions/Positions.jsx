import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSheetTab } from '../../hooks/useSheetTab';
import { useContent } from '../../hooks/useContent';
import { transformPositions } from '../../services/sheets/transforms';
import { TABS } from '../../config/sheets';
import './Positions.css';

gsap.registerPlugin(ScrollTrigger);

// Shown if the Google Sheet "Positions" tab is unreachable. Edit open positions
// in the sheet, not here — this is only the safety net.
const FALLBACK_POSITIONS = [
  {
    id: 1,
    type: 'Available',
    title: 'Research Opportunities',
    department: 'Multiple Positions Available',
    summary:
      "Undergraduate internship, Master's/Ph.D. courses, post-doc and Research positions",
    contact: 'Dr. Bhivraj Suthar',
    email: 'bhivraj@iitj.ac.in',
    details:
      "We have open positions for students interested in applying for undergraduate internship, Master's/Ph.D. courses, post-doc and Research positions.",
  },
];

const Positions = () => {
  const t = useContent();
  const positionsRef = useRef(null);
  const { data: positions } = useSheetTab(TABS.positions, {
    transform: transformPositions,
    fallback: FALLBACK_POSITIONS,
  });

  useEffect(() => {
    if (!positionsRef.current) return;
    const cards = positionsRef.current.querySelectorAll('.position-card');
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { y: 50, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: positionsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [positions]);

  return (
    <section id="positions" className="positions-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('positions.title', 'Open Positions')}</h2>
          <p className="section-subtitle">
            {t('positions.subtitle', 'Join our research team and contribute to cutting-edge robotics research')}
          </p>
        </div>

        <div ref={positionsRef} className="positions-grid">
          {positions.map((position) => (
            <div key={position.id} className="position-card">
              <div className="position-header">
                <div className="position-meta">
                  <span className="position-type" style={{ backgroundColor: '#00ffff' }}>
                    {position.type}
                  </span>
                </div>
                <h3 className="position-title">{position.title}</h3>
                {position.department && (
                  <div className="position-department">{position.department}</div>
                )}
              </div>

              <div className="position-summary">
                {position.summary && (
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                    </svg>
                    <div>
                      <div className="summary-label">Available Positions</div>
                      <div className="summary-value">{position.summary}</div>
                    </div>
                  </div>
                )}

                {position.contact && (
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <div>
                      <div className="summary-label">Contact Person</div>
                      <div className="summary-value">{position.contact}</div>
                    </div>
                  </div>
                )}

                {position.email && (
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <div>
                      <div className="summary-label">Email</div>
                      <div className="summary-value">{position.email}</div>
                    </div>
                  </div>
                )}
              </div>

              {position.details && (
                <div className="contact-info">
                  <div className="contact-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2z"/>
                    </svg>
                    <span>{position.details}</span>
                  </div>
                </div>
              )}

              {position.email && (
                <button
                  onClick={() => {
                    window.location.href = `mailto:${position.email}`;
                  }}
                  className="apply-btn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {position.contact ? `Send Email to ${position.contact}` : 'Send Email'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Positions;
