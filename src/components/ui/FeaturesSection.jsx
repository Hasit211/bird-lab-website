import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import ImageLightbox from './ImageLightbox';
import './FeaturesSection.css';

const RESEARCH_THRUSTS = [
  {
    id: 1,
    title: 'Bio-Inspired Mechanisms & Artificial Muscles',
    category: 'Mechanisms & Actuation',
    description: 'Developing biomimetic actuators, twisted string actuators (TSA), and multi-fingered robotic hands inspired by human neuromuscular anatomy.',
    image: '/assets/Picture1.png',
    fallbackImg: '/assets/pic1.jpg',
    highlights: ['Twisted String Actuators (TSA)', 'Biomimetic Robotic Grippers', 'Parkour Rolling Mechanism']
  },
  {
    id: 2,
    title: 'Wearable & Assistive Robotics',
    category: 'Bio-Signal Control',
    description: 'Engineering intelligent exoskeletons, soft exosuits, and active prosthetics to augment human mobility and aid clinical rehabilitation.',
    image: '/assets/Picture3.png',
    fallbackImg: '/assets/Picture2.png',
    highlights: ['Lower & Upper Body Exoskeletons', 'EMG-Controlled Exosuits', 'Supernumerary Robotic Limbs']
  },
  {
    id: 3,
    title: 'Reconfigurable & Growing Robotics',
    category: 'Adaptive Robotics',
    description: 'Pioneering metamorphic drones, aerial manipulation systems, and continuum soft robotic arms capable of navigation in constrained spaces.',
    image: '/assets/wing.png',
    fallbackImg: '/assets/Picture1.png',
    highlights: ['Foldable Robotic Arms', 'Aerial Manipulation Platforms', 'Bio-inspired Flight Dynamics']
  },
  {
    id: 4,
    title: 'AI Perception & Autonomous Control',
    category: 'Perception & Learning',
    description: 'Integrating vision-language-action models (VLA), visual servoing, and immersive VR simulations for autonomous robotic task execution.',
    image: '/assets/pic1.jpg',
    fallbackImg: '/assets/second1.png',
    highlights: ['Vision-Language-Action Models', 'Immersive VR Teleoperation', 'Real-Time Visual Servoing']
  }
];

const COLLABORATORS = [
  { name: 'IIT Delhi', logo: '/assets/IITD.png', type: 'Academic Partner' },
  { name: 'IIT Gandhinagar', logo: '/assets/IITGN.png', type: 'Academic Partner' },
  { name: 'Jaipur Foot', logo: '/assets/JaipurFoot.png', type: 'Clinical & Industry Partner' },
  { name: 'University of Siena', logo: '/assets/UniversityOfSiena.png', type: 'International Partner' },
];

const FeaturesSection = () => {
  const t = useContent();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const total = RESEARCH_THRUSTS.length;

  return (
    <div className="features-section-redesigned">
      {/* SECTION 1: Research Thrusts Grid */}
      <section className="research-thrusts-section">
        <div className="section-header-compact">
          <span className="section-kicker">Core Capabilities</span>
          <h3 className="section-headline">
            {t('features.title', 'Key Research Focus Areas')}
          </h3>
          <p className="section-lead">
            {t(
              'features.subtitle',
              'Advancing robotics through nature-inspired design, intelligent bio-signal control, and adaptive autonomy.'
            )}
          </p>
        </div>

        <div className="thrusts-grid">
          {RESEARCH_THRUSTS.map((thrust, idx) => (
            <div key={thrust.id} className="thrust-card">
              <div
                className="thrust-image-container"
                onClick={() => setLightboxIndex(idx)}
                title="Click to expand full image"
              >
                <img
                  src={thrust.image}
                  alt={thrust.title}
                  className="thrust-image"
                  onError={(e) => {
                    if (e.target.src !== thrust.fallbackImg) {
                      e.target.src = thrust.fallbackImg;
                    }
                  }}
                  loading="lazy"
                />
                <div className="thrust-image-overlay">
                  <div className="expand-badge">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    <span>Click to Enlarge</span>
                  </div>
                </div>
                <div className="thrust-category-tag">{thrust.category}</div>
              </div>

              <div className="thrust-body">
                <h4 className="thrust-title">{thrust.title}</h4>
                <p className="thrust-desc">{thrust.description}</p>

                <div className="thrust-highlights">
                  {thrust.highlights.map((h, i) => (
                    <span key={i} className="highlight-pill">
                      <span className="pill-dot"></span>
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="thrusts-action-bar">
          <Link to="/research" className="btn-primary-glow">
            Explore All Research Verticals
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Academic & Industry Collaborations Ribbon */}
      <section className="collaborations-ribbon-section">
        <div className="collab-header">
          <h4 className="collab-title">Collaborations & Research Partners</h4>
          <p className="collab-subtitle">Partnering with leading global institutions and medical technology innovators</p>
        </div>

        <div className="collab-logos-grid">
          {COLLABORATORS.map((collab, index) => (
            <div key={index} className="collab-card">
              <div className="collab-logo-wrapper">
                <img
                  src={collab.logo}
                  alt={collab.name}
                  className="collab-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="collab-info">
                <div className="collab-partner-name">{collab.name}</div>
                <div className="collab-partner-type">{collab.type}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Lightbox Modal */}
      {lightboxIndex !== null && (
        <ImageLightbox
          isOpen={lightboxIndex !== null}
          image={RESEARCH_THRUSTS[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + total) % total)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % total)}
          hasPrev={total > 1}
          hasNext={total > 1}
          currentIndex={lightboxIndex}
          totalImages={total}
        />
      )}
    </div>
  );
};

export default FeaturesSection;