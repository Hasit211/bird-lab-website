import { CONTACT_INFO, NAV_ITEMS } from '../../utils/constants';
import { useContent } from '../../hooks/useContent';
import './Footer.css';

const Footer = () => {
  const t = useContent();
  const currentYear = new Date().getFullYear();

  // Shared with the Contact page via the same `Content` keys.
  const building = t('contact.address.building', CONTACT_INFO.address.building);
  const email = t('contact.email', CONTACT_INFO.email);
  const phone = t('contact.phone', CONTACT_INFO.phone);
  const linkedin = t('social.linkedin', '');
  const youtube = t('social.youtube', CONTACT_INFO.social.youtube || '');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-section">
            <div className="footer-logo">
              <h3>{t('footer.logo', 'BIRD Lab')}</h3>
            </div>
            <p className="footer-description">
              {t(
                'footer.description',
                'Advancing bio-inspired robotics through innovative research, nature-inspired design, and collaborative partnerships.'
              )}
            </p>
            <div className="footer-social">
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 6.5a2.5 2.5 0 00-2.5-2.5H3.5A2.5 2.5 0 001 6.5v11A2.5 2.5 0 003.5 20h17a2.5 2.5 0 002.5-2.5v-11zM9 16V8l7 4-7 4z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              {NAV_ITEMS.map((item, index) => (
                <li key={index}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Research Areas */}
          <div className="footer-section">
            <h4>Research Areas</h4>
            <ul className="footer-links">
              <li><a href="/research#bio-mechanisms">{t('footer.research1', 'Bio-inspired Mechanisms')}</a></li>
              <li><a href="/research#wearable">{t('footer.research2', 'Wearable & Collaborative Robotics')}</a></li>
              <li><a href="/research#reconfigurable">{t('footer.research3', 'Reconfigurable and Growing Robotics')}</a></li>
              <li><a href="/research#tele-robotics">{t('footer.research4', 'Tele-Robotics and Haptics')}</a></li>
              <li><a href="/research#applied-ai">{t('footer.research5', 'Applied AI in Robotics')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>
                  {building}<br/>
                </span>
              </div>
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>{email}</span>
              </div>
              <div className="contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>{phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} {t('footer.copyright', 'Bio-Inspired Robotics Design Lab (BIRD Lab). All rights reserved.')}</p>
            </div>
            <div className="footer-bottom-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/accessibility">Accessibility</a>
            </div>
            <button className="back-to-top" onClick={scrollToTop}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
