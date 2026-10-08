import { useEffect, useRef } from 'react';
import { staggerAnimation, animateCounter } from '../../utils/gsapAnimations';
import { useContent } from '../../hooks/useContent';
import { useSheetTab } from '../../hooks/useSheetTab';
import { transformCarousel } from '../../services/sheets/transforms';
import { TABS } from '../../config/sheets';
import FeaturesSection from '../ui/FeaturesSection';
import ImageCarousel from '../ImageCarousel/ImageCarousel';
import carouselImages from '../ImageCarousel/carouselData';
import './Welcome.css';

const Welcome = () => {
  const t = useContent();
  const sectionRef = useRef(null);
  const { data: carouselList } = useSheetTab(TABS.carousel, {
    transform: transformCarousel,
    fallback: carouselImages,
  });

  const activeCarouselImages = (carouselList && carouselList.length > 0) ? carouselList : carouselImages;

  useEffect(() => {
    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('.welcome-card');
      staggerAnimation(elements);
      
      // Animate counters
      const counters = sectionRef.current.querySelectorAll('.counter');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        animateCounter(counter, 0, target, 2);
      });
    }
  }, []);

  return (
    <section id="welcome" className="section welcome" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {t(['about.title', 'welcome.title', 'hero.title'], 'Welcome to BIRD Lab for your research')}
          </h2>
          <p className="section-subtitle">
            {t(
              ['about.description', 'welcome.subtitle', 'hero.tagline'],
              'Leading the advancement of bio-inspired robotics through innovative research, nature-inspired design, and cutting-edge technology solutions'
            )}
          </p>
        </div>

        <ImageCarousel images={activeCarouselImages} interval={3200} />

        <div className="welcome-content">
          <div className="welcome-grid">
            <div className="welcome-card mission">
              <div className="card-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3"/>
                  <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="26" cy="26" r="3" fill="currentColor"/>
                  <circle cx="38" cy="38" r="3" fill="currentColor"/>
                </svg>
              </div>
              <h3>{t(['welcome.mission.title', 'mission.title'], 'Our Mission')}</h3>
              <p>
                {t(
                  ['welcome.mission.text', 'mission.text', 'director.message'],
                  'To advance bio-inspired robotics research and develop adaptive systems that learn from nature to solve real-world challenges through innovative design and collaboration.'
                )}
              </p>
            </div>

            <div className="welcome-card vision">
              <div className="card-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 32c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="32" cy="4" r="4" fill="currentColor"/>
                  <path d="M32 28v-8M32 36v8M28 32h-8M36 32h8" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>{t(['welcome.vision.title', 'vision.title'], 'Our Vision')}</h3>
              <p>
                {t(
                  ['welcome.vision.text', 'vision.text', 'hero.tagline'],
                  'To be a globally recognized center of excellence in bio-inspired robotics, fostering innovation in wearable, collaborative, and reconfigurable robotic systems.'
                )}
              </p>
            </div>

            <div className="welcome-card values">
              <div className="card-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="32,8 44,28 60,28 48,40 52,56 32,46 12,56 16,40 4,28 20,28" stroke="currentColor" strokeWidth="3" fill="none"/>
                  <circle cx="32" cy="32" r="6" fill="currentColor"/>
                </svg>
              </div>
              <h3>{t(['welcome.values.title', 'values.title'], 'Our Values')}</h3>
              <p>
                {t(
                  ['welcome.values.text', 'values.text'],
                  "Bio-inspiration, innovation, collaboration, and ethical responsibility guide our research in developing nature-inspired solutions for tomorrow's challenges."
                )}
              </p>
            </div>
          </div>

          {/* Key Lab Metrics Strip */}
          <div className="lab-metrics-strip">
            <div className="metric-item">
              <span className="metric-number">
                {t('stats.projects', '5+')}
              </span>
              <span className="metric-label">{t(['stats.projects.label', 'stats.label.projects'], 'Research Projects')}</span>
            </div>
            <div className="metric-item">
              <span className="metric-number">
                {t(['stats.publications', 'stats.papers'], '25+')}
              </span>
              <span className="metric-label">{t(['stats.publications.label', 'stats.label.publications'], 'Patents & Publications')}</span>
            </div>
            <div className="metric-item">
              <span className="metric-number">
                {t(['stats.funding', 'stats.grants'], '₹5 Cr+')}
              </span>
              <span className="metric-label">{t(['stats.funding.label', 'stats.label.funding'], 'Secured Grants')}</span>
            </div>
            <div className="metric-item">
              <span className="metric-number">
                {t('stats.collaborations', '10+')}
              </span>
              <span className="metric-label">{t(['stats.collaborations.label', 'stats.label.collaborations'], 'Global & National Partners')}</span>
            </div>
          </div>

          <FeaturesSection />

        </div>
      </div>
    </section>
  );
};

export default Welcome;
