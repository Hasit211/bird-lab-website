import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSheetTab } from '../../hooks/useSheetTab';
import { useContent } from '../../hooks/useContent';
import { transformCollaborations } from '../../services/sheets/transforms';
import { TABS } from '../../config/sheets';
import './Gallery.css';

gsap.registerPlugin(ScrollTrigger);

const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
});

function Carousel({ items, initialScroll = 0 }) {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
    }
  }, [initialScroll]);

  const handleCardClose = (index) => {
    if (carouselRef.current) {
      const cardWidth = window.innerWidth < 768 ? 230 : 384;
      const gap = window.innerWidth < 768 ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="apple-carousel-container">
        <div
          className="apple-carousel-scroll"
          ref={carouselRef}
        >
          <div className="apple-carousel-track">
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 * index, ease: "easeOut", once: true } }}
                key={"card" + index}
                className="apple-carousel-card-wrapper"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

function BlurImage({ src, alt, className, ...rest }) {
  const [isLoading, setLoading] = useState(true);
  return (
    <img
      className={`apple-blur-img ${isLoading ? "apple-blur" : ""} ${className || ""}`}
      onLoad={() => setLoading(false)}
      src={src}
      alt={alt || "Background of a beautiful view"}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
}

function Card({ card, index }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    function handleClick(event) {
      if (!containerRef.current || containerRef.current.contains(event.target)) {
        return;
      }
      handleClose();
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("touchstart", handleClick);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.removeEventListener("touchstart", handleClick);
      };
    }
  }, [open, handleClose]);

  const handleOpen = () => setOpen(true);

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="apple-modal-overlay">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="apple-modal-bg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              className="apple-modal-content"
            >
              <button
                className="apple-modal-close"
                onClick={handleClose}
              >
                ×
              </button>
              <motion.p className="apple-modal-category">
                {card.category}
              </motion.p>
              <motion.p className="apple-modal-title">
                {card.title}
              </motion.p>
              <div className="apple-modal-body">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={handleOpen}
        className="apple-card"
      >
        <div className="apple-card-gradient" />
        <div className="apple-card-content">
          <motion.p className="apple-card-category">
            {card.category}
          </motion.p>
          <motion.p className="apple-card-title">
            {card.title}
          </motion.p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          className="apple-card-img"
        />
      </motion.button>
    </>
  );
}

// Shown if the Google Sheet "Collaborations" tab is unreachable. Edit
// collaborations in the sheet, not here — this is only the safety net.
const FALLBACK_COLLABORATIONS = [
  { category: "Collaboration", title: "Sogang", src: "/assets/Sogang.png" },
  { category: "Collaboration", title: "Khalifa University", src: "/assets/KhalifaUniversity.png" },
  { category: "Collaboration", title: "IIT Delhi", src: "/assets/IITD.png" },
  { category: "Collaboration", title: "IIT Gandhinagar", src: "/assets/IITGN.png" },
  { category: "Collaboration", title: "University of Siena", src: "/assets/UniversityOfSiena.png" },
  { category: "Collaboration", title: "KAIST", src: "/assets/KAIST.png" },
  { category: "Collaboration", title: "CNU, Korea", src: "/assets/CNU.png" },
  { category: "Industry Collaboration", title: "Jaipur Foot", src: "/assets/JaipurFoot.png" },
];

const Gallery = () => {
  const t = useContent();
  const galleryRef = useRef(null);
  const { data: collaborations } = useSheetTab(TABS.collaborations, {
    transform: transformCollaborations,
    fallback: FALLBACK_COLLABORATIONS,
  });

  const appleCards = collaborations.map((card, index) => (
    <Card key={index} card={card} index={index} />
  ));

  return (
    <section id="gallery" className="gallery-section" ref={galleryRef}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('gallery.title', 'Collaboration')}</h2>
          <p className="section-subtitle">
            {t('gallery.subtitle', 'Explore our laboratory, projects, and research in action')}
          </p>
        </div>
        {/* Apple Cards Carousel Integration */}
        <div style={{ marginBottom: 20 }}> {/* Reduced from 60 */}
          <Carousel items={appleCards} />
        </div>
      </div>
    </section>
  );
};

export default Gallery;
