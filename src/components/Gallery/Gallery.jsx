import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSheetTab } from '../../hooks/useSheetTab';
import { useContent } from '../../hooks/useContent';
import { transformCollaborations } from '../../services/sheets/transforms';
import { TABS } from '../../config/sheets';
import arrowLeftIcon from '../../assets/arrow-left-5-svgrepo-com.svg';
import arrowRightIcon from '../../assets/right-chevron-svgrepo-com.svg';
import closeCircleIcon from '../../assets/close-circle-svgrepo-com.svg';
import './Gallery.css';

function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return itemsPerPage;
}

function CollabCard({ card, onClick }) {
  return (
    <motion.div
      className="collab-slideshow-card"
      onClick={onClick}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="collab-card-image-box">
        <img
          src={card.src}
          alt={card.title}
          className="collab-card-image"
          loading="lazy"
        />
        <span className="collab-card-badge">{card.category}</span>
      </div>
      <div className="collab-card-body">
        <h3 className="collab-card-title">{card.title}</h3>
        <p className="collab-card-preview">
          {card.description
            ? (card.description.length > 85 ? `${card.description.slice(0, 85)}...` : card.description)
            : 'Explore joint research and academic partnership details.'}
        </p>
        <div className="collab-card-action">
          <span>View Details</span>
          <img src={arrowRightIcon} alt="Arrow" className="collab-card-arrow-icon" />
        </div>
      </div>
    </motion.div>
  );
}

function CollabModal({ card, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!containerRef.current || containerRef.current.contains(event.target)) {
        return;
      }
      onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [onClose]);

  return (
    <div className="collab-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="collab-modal-bg"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        ref={containerRef}
        className="collab-modal-window"
      >
        <button
          className="collab-modal-close"
          onClick={onClose}
          aria-label="Close modal"
          title="Close"
        >
          <img src={closeCircleIcon} alt="Close" className="collab-close-svg" />
        </button>

        <div className="collab-modal-layout">
          {/* Left Side: Partner Logo */}
          <div className="collab-modal-left">
            <div className="collab-modal-image-wrap">
              <img
                src={card.src}
                alt={card.title}
                className="collab-modal-image"
              />
            </div>
          </div>

          {/* Right Side: Details from Google Sheets */}
          <div className="collab-modal-right">
            <div className="collab-modal-badge">{card.category}</div>
            <h2 className="collab-modal-title">{card.title}</h2>
            <div className="collab-modal-divider"></div>
            <div className="collab-modal-text-section">
              <h4 className="collab-modal-section-title">Collaboration Overview</h4>
              <p className="collab-modal-description">
                {card.description || 'Active research partnership focusing on bio-inspired mechanisms, wearable robotics, and intelligent autonomous systems with NextGen BIRD Lab at IIT Jodhpur.'}
              </p>
            </div>
            {card.url && (
              <div className="collab-modal-actions">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="collab-modal-link-btn"
                >
                  Visit Website
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Fallback if Google Sheets is unreachable
const FALLBACK_COLLABORATIONS = [
  { category: "National Academia", title: "IIT Delhi", src: "/assets/IITD.png", description: "Joint research initiatives in advanced upper-limb exoskeleton design, bio-signal processing, and robotic rehabilitation." },
  { category: "National Academia", title: "IIT Gandhinagar", src: "/assets/IITGN.png", description: "Collaborative exploration in non-linear robotic control algorithms and autonomous robotics platforms." },
  { category: "National Industry", title: "Jaipur Foot", src: "/assets/JaipurFoot.png", description: "Collaborative development of low-cost, high-durability prosthetic limbs and assistive walking mechanisms." },
  { category: "International Academia", title: "University of Siena, Italy", src: "/assets/UniversityOfSiena.png", description: "Joint international research on wearable haptics, cutaneous tactile feedback, and teleoperation devices." },
  { category: "International Academia", title: "Khalifa University, UAE", src: "/assets/KhalifaUniversity.png", description: "Joint research on twisted string actuators (TSA), supernumerary robotic limbs, and modular robotic fingers." },
  { category: "International Academia", title: "KAIST", src: "/assets/KAIST.png", description: "Advanced research collaboration on soft robotics, twisted string actuation systems, and bio-inspired artificial muscles." },
  { category: "International Academia", title: "CNU, Korea", src: "/assets/CNU.png", description: "Joint research on metamorphic scissor mechanisms and foldable robotic arms for aerial manipulation." },
  { category: "International Academia", title: "Sogang", src: "/assets/Sogang.png", description: "Research collaboration on dynamic robotic actuation and bio-inspired control systems." },
];

const Gallery = () => {
  const t = useContent();
  const { data: collaborations } = useSheetTab(TABS.collaborations, {
    transform: transformCollaborations,
    fallback: FALLBACK_COLLABORATIONS,
  });

  const itemsPerPage = useItemsPerPage();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const totalPages = Math.max(1, Math.ceil(collaborations.length / itemsPerPage));

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  // Slideshow auto-rotation: advances every 4.5 seconds when not hovered/modal open
  useEffect(() => {
    if (isPaused || selectedCard !== null || totalPages <= 1) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, selectedCard, totalPages]);

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const startIndex = currentPage * itemsPerPage;
  const visibleCards = collaborations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('gallery.title', 'Collaboration')}</h2>
          <p className="section-subtitle">
            {t('gallery.subtitle', 'Explore our research collaborations, academic partners, and industry initiatives')}
          </p>
        </div>

        {/* Slideshow Container */}
        <div
          className="collab-slideshow-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Arrow Button */}
          <button
            className="collab-nav-btn prev"
            onClick={handlePrev}
            aria-label="Previous collaborations"
            title="Previous"
          >
            <img src={arrowLeftIcon} alt="Previous" className="collab-nav-icon" />
          </button>

          {/* 4 Cards Grid Slideshow */}
          <div className="collab-slideshow-track-wrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="collab-slideshow-grid"
              >
                {visibleCards.map((card, idx) => (
                  <CollabCard
                    key={startIndex + idx}
                    card={card}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow Button */}
          <button
            className="collab-nav-btn next"
            onClick={handleNext}
            aria-label="Next collaborations"
            title="Next"
          >
            <img src={arrowRightIcon} alt="Next" className="collab-nav-icon" />
          </button>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="collab-pagination-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`collab-dot ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Modal with Live Google Sheets Data */}
      <AnimatePresence>
        {selectedCard && (
          <CollabModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
