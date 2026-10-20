import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT_INFO } from '../../utils/constants';
import { useContent } from '../../hooks/useContent';
import './Contact.css';

gsap.registerPlugin(ScrollTrigger);

export const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeQCNLWkViTCIVRWg24MjbWe57Bfe3gP09mpixHttKqII5yUg/viewform';
export const PROF_EMAIL = 'bhivraj@iitj.ac.in';
export const PROF_NAME = 'Prof. Bhivraj Suthar';

const Contact = () => {
  const t = useContent();
  const fullAddress = t('contact.address.full', '');
  const address = {
    building: t('contact.address.building', CONTACT_INFO.address.building),
    street: t('contact.address.street', CONTACT_INFO.address.street),
    city: t('contact.address.city', CONTACT_INFO.address.city),
    country: t('contact.address.country', CONTACT_INFO.address.country),
  };
  const mapUrl = t('contact.mapUrl', '');
  const phone = t('contact.phone', '+91 291 280 1500');
  const email = t('contact.email', CONTACT_INFO.email);
  const officeHours = t('contact.officeHours', 'Monday - Friday: 9:00 AM - 6:00 PM');
  const contactName = t('contact.banner.contactName', t('director.name', PROF_NAME));
  const contactEmail = t('contact.banner.contactEmail', t('director.email', PROF_EMAIL));
  const contactTitle = t('contact.banner.contactTitle', 'Principal Investigator • BIRD Lab, IIT Jodhpur');
  const googleFormUrl = t('contact.join.url', t('contact.banner.formUrl', GOOGLE_FORM_URL));
  const linkedin = t('social.linkedin', 'https://www.linkedin.com/in/bhivraj-suthar-6a56b432/');
  const youtube = t('social.youtube', CONTACT_INFO.social.youtube || 'https://www.youtube.com/@bhivrajsuthar2234');

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');

  const contactRef = useRef(null);
  const actionsRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: contactRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(
      actionsRef.current,
      { x: -40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    ).fromTo(
      infoRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

    gsap.fromTo(
      '.contact-action-card',
      { y: 25, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: actionsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.fromTo(
      '.contact-item',
      { y: 25, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: infoRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }, []);

  // Handle escape key to close email modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isEmailModalOpen) {
        setIsEmailModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEmailModalOpen]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Fallback
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleOpenDefaultMail = () => {
    const subjectParam = encodeURIComponent(mailSubject.trim() || 'Inquiry - BIRD Lab IIT Jodhpur');
    const bodyParam = encodeURIComponent(mailBody.trim());
    window.location.href = `mailto:${contactEmail}?subject=${subjectParam}${bodyParam ? `&body=${bodyParam}` : ''}`;
  };

  const handleOpenGmailWeb = () => {
    const subjectParam = encodeURIComponent(mailSubject.trim() || 'Inquiry - BIRD Lab IIT Jodhpur');
    const bodyParam = encodeURIComponent(mailBody.trim());
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}&su=${subjectParam}${bodyParam ? `&body=${bodyParam}` : ''}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const openMap = () => {
    if (mapUrl && mapUrl.startsWith('http')) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const query = encodeURIComponent(fullAddress || `${address.building}, ${address.street}, ${address.city}`);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('contact.title', 'Contact Us & Join the Lab')}</h2>
          <p className="section-subtitle">
            {t('contact.subtitle', 'Explore open research positions or get in touch with our team for collaborations and inquiries')}
          </p>
        </div>

        {/* Positions Banner */}
        <div className="positions-banner">
          <div className="banner-content">
            <div className="banner-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
            </div>
            <div className="banner-text">
              <h3>{t('contact.banner.title', 'Open Research Positions Available')}</h3>
              <p>
                {t(
                  'contact.banner.text',
                  "We are actively seeking motivated students and researchers for Undergraduate Internships, Master's/Ph.D. Programs, Post-Doctoral Positions, and Project Associates."
                )}
              </p>
              <div className="banner-actions">
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="banner-primary-btn"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  {t('contact.card.join.btn', 'Want to Join →')}
                </a>

                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="banner-secondary-btn"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  {t('contact.card.mail.btn', 'Send a Mail')}
                </button>

                <div className="banner-contact-info">
                  <span>PI: <strong>{contactName}</strong> ({contactEmail})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={contactRef} className="contact-content">
          {/* Main Action Hub replacing the previous form */}
          <div ref={actionsRef} className="contact-actions-container">
            <div className="actions-header">
              <h3>{t('contact.hub.title', 'Connect with BIRD Lab')}</h3>
              <p>
                {t('contact.hub.subtitle', 'Choose how you would like to reach out to us below.')}
              </p>
            </div>

            <div className="contact-actions-cards">
              {/* Card 1: Want to Join */}
              <div className="contact-action-card join-card">
                <div className="action-card-badge">{t('contact.card.join.badge', 'Applications Open')}</div>
                <div className="action-card-icon join-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7.5" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                </div>
                <div className="action-card-body">
                  <h4>{t('contact.card.join.title', 'Want to Join')}</h4>
                  <p>
                    {t(
                      'contact.card.join.text',
                      "Apply for Undergraduate Internships, Master's / Ph.D. research, or Post-Doctoral fellowships. Submit your resume, research interests, and qualifications."
                    )}
                  </p>
                  <a
                    href={googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn join-btn"
                  >
                    <span>{t('contact.card.join.btn', 'Want to Join')}</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Card 2: Send a Mail */}
              <div className="contact-action-card mail-card">
                <div className="action-card-badge mail-badge">{t('contact.card.mail.badge', 'Direct Inquiries')}</div>
                <div className="action-card-icon mail-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="action-card-body">
                  <h4>{t('contact.card.mail.title', 'Send a Mail')}</h4>
                  <p>
                    {t(
                      'contact.card.mail.text',
                      `Have research questions, collaboration proposals, or academic discussions? Contact ${contactName} directly at ${contactEmail}.`
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="action-btn mail-btn"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <span>{t('contact.card.mail.btn', 'Send a Mail')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Contact Information */}
          <div ref={infoRef} className="contact-info-container">
            <div className="info-header">
              <h3>{t('contact.info.title', 'Lab Information')}</h3>
              <p>{t('contact.info.subtitle', 'Find us at IIT Jodhpur campus or connect with us online')}</p>
            </div>

            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Address</h4>
                  {fullAddress ? (
                    <p style={{ whiteSpace: 'pre-line' }}>{fullAddress}</p>
                  ) : (
                    <p>
                      {address.building}<br />
                      {address.street}<br />
                      {address.city}<br />
                      {address.country}
                    </p>
                  )}
                  <button onClick={openMap} className="map-btn">
                    View on Map
                  </button>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Phone</h4>
                  <p>{phone}</p>
                  <p className="office-hours">{officeHours}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Email</h4>
                  <p>
                    <a href={`mailto:${contactEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {contactEmail}
                    </a>
                  </p>
                  {email && email !== contactEmail && (
                    <p style={{ marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
                      Lab: <a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a>
                    </p>
                  )}
                </div>
              </div>

              <div className="contact-item social">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <h4>Follow Us</h4>
                  <div className="social-links">
                    {linkedin && (
                      <a href={linkedin} target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {youtube && (
                      <a href={youtube} target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23 6.5a2.5 2.5 0 00-2.5-2.5H3.5A2.5 2.5 0 001 6.5v11A2.5 2.5 0 003.5 20h17a2.5 2.5 0 002.5-2.5v-11zM9 16V8l7 4-7 4z" />
                        </svg>
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up to Mail Prof. Bhivraj Suthar */}
      {isEmailModalOpen && (
        <div
          className="email-modal-overlay"
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div
            className="email-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-modal-title"
          >
            <button
              type="button"
              className="email-modal-close"
              onClick={() => setIsEmailModalOpen(false)}
              aria-label="Close email modal"
            >
              &times;
            </button>

            <div className="email-modal-header">
              <div className="email-prof-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="email-header-text">
                <h3 id="email-modal-title">{t('contact.modal.title', `Mail ${contactName}`)}</h3>
                <p>{t('contact.modal.subtitle', contactTitle)}</p>
              </div>
            </div>

            <div className="email-address-box">
              <div className="email-address-info">
                <span className="email-address-label">Recipient Email</span>
                <span className="email-address-val">{contactEmail}</span>
              </div>
              <button
                type="button"
                className={`copy-email-btn ${copiedEmail ? 'copied' : ''}`}
                onClick={handleCopyEmail}
                title="Copy email address"
              >
                {copiedEmail ? (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick composer fields */}
            <div className="email-quick-fields">
              <div className="quick-field-group">
                <label htmlFor="quick-mail-subject">Subject (optional)</label>
                <input
                  id="quick-mail-subject"
                  type="text"
                  placeholder="e.g. Research Collaboration / Lab Inquiry"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                />
              </div>

              <div className="quick-field-group">
                <label htmlFor="quick-mail-body">Message Notes (optional)</label>
                <textarea
                  id="quick-mail-body"
                  rows="3"
                  placeholder="Type a brief note to include in the email draft..."
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Action buttons */}
            <div className="email-modal-actions">
              <button
                type="button"
                className="email-action-btn mail-client-btn"
                onClick={handleOpenDefaultMail}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>Open Mail App</span>
              </button>

              <button
                type="button"
                className="email-action-btn gmail-btn"
                onClick={handleOpenGmailWeb}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                </svg>
                <span>Open in Gmail</span>
              </button>
            </div>

            <p className="email-modal-hint">
              Clicking either button will open a prefilled draft to <strong>{contactEmail}</strong> in your chosen mail client.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Contact;
