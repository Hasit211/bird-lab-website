import { useState, useEffect, useRef } from 'react';
import ImageLightbox from '../ui/ImageLightbox';
import './ImageCarousel.css';

const ImageCarousel = ({ images = [], interval = 3200 }) => {
  const [carouselCurrentIndex, setCarouselCurrentIndex] = useState(0);
  const [carouselIsTransitioning, setCarouselIsTransitioning] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselTimerRef = useRef(null);

  const total = images.length;

  const carouselNextSlide = () => {
    if (carouselIsTransitioning || total <= 1) return;
    setCarouselIsTransitioning(true);
    setCarouselCurrentIndex((prevIndex) => (prevIndex + 1) % total);
    setTimeout(() => setCarouselIsTransitioning(false), 300);
  };

  const carouselPrevSlide = () => {
    if (carouselIsTransitioning || total <= 1) return;
    setCarouselIsTransitioning(true);
    setCarouselCurrentIndex((prevIndex) => (prevIndex - 1 + total) % total);
    setTimeout(() => setCarouselIsTransitioning(false), 300);
  };

  const carouselGoToSlide = (index) => {
    if (carouselIsTransitioning || index === carouselCurrentIndex) return;
    setCarouselIsTransitioning(true);
    setCarouselCurrentIndex(index);
    setTimeout(() => setCarouselIsTransitioning(false), 300);
  };

  useEffect(() => {
    if (isPaused || total <= 1 || lightboxIndex !== null) return;

    carouselTimerRef.current = setInterval(() => {
      carouselNextSlide();
    }, interval);

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [carouselCurrentIndex, interval, isPaused, total, lightboxIndex]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div
        className="image-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="carousel-container">
          {/* Slides */}
          <div className="carousel-slides">
            {images.map((image, index) => {
              const isActive = index === carouselCurrentIndex;
              return (
                <div
                  key={index}
                  className={`carousel-slide ${isActive ? 'active' : ''}`}
                  onClick={() => setLightboxIndex(index)}
                  title="Click to view full screen"
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Slide ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />

                  {/* Expand Zoom Pill Indicator on Hover */}
                  <div className="carousel-zoom-pill">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    <span>Click to Expand</span>
                  </div>

                  {/* Refined Glassmorphism Caption Badge */}
                  {(image.caption || image.description) && (
                    <div className="carousel-caption-wrapper">
                      <div className="carousel-caption-card">
                        {image.caption && <h3 className="carousel-caption-title">{image.caption}</h3>}
                        {image.description && <p className="carousel-caption-desc">{image.description}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dots / Indicators */}
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === carouselCurrentIndex ? 'active' : ''}`}
                onClick={() => carouselGoToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {lightboxIndex !== null && (
        <ImageLightbox
          isOpen={lightboxIndex !== null}
          image={images[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + total) % total)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % total)}
          hasPrev={total > 1}
          hasNext={total > 1}
          currentIndex={lightboxIndex}
          totalImages={total}
        />
      )}
    </>
  );
};

export default ImageCarousel;
