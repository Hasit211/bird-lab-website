import React, { useEffect } from 'react';
import arrowLeftIcon from '../../assets/arrow-left-5-svgrepo-com.svg';
import arrowRightIcon from '../../assets/right-chevron-svgrepo-com.svg';
import closeCircleIcon from '../../assets/close-circle-svgrepo-com.svg';
import './ImageLightbox.css';

/**
 * ImageLightbox: A unified, professional modal for viewing laboratory images
 * with consistent aspect ratios, high contrast typography, and custom SVG controls.
 */
const ImageLightbox = ({
  isOpen,
  image,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex,
  totalImages
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev?.();
      if (e.key === 'ArrowRight' && hasNext) onNext?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, hasPrev, hasNext, onClose, onPrev, onNext]);

  if (!isOpen || !image) return null;

  const imgSrc = image.src || image.url || image.image || image;
  const imgAlt = image.alt || image.title || image.caption || 'Laboratory Image Preview';
  const imgCaption = image.caption || image.title || 'Research Visual';
  const imgDesc = image.description || image.subtitle || image.desc || '';
  const imgCategory = image.category || 'BIRD Lab Research';

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Bar */}
        <div className="lightbox-header-bar">
          <div className="lightbox-header-meta">
            <span className="lightbox-badge">{imgCategory}</span>
            {totalImages > 1 && currentIndex !== undefined && (
              <span className="lightbox-counter">{currentIndex + 1} / {totalImages}</span>
            )}
          </div>

          <button
            type="button"
            className="lightbox-close-icon-btn"
            onClick={onClose}
            aria-label="Close preview"
            title="Close (Esc)"
          >
            <img src={closeCircleIcon} alt="Close" className="lightbox-icon-img" />
          </button>
        </div>

        {/* Center Stage: Consistent Image Viewport */}
        <div className="lightbox-viewport">
          {hasPrev && (
            <button
              type="button"
              className="lightbox-nav-arrow prev"
              onClick={onPrev}
              aria-label="Previous image"
              title="Previous image"
            >
              <img src={arrowLeftIcon} alt="Previous" className="lightbox-icon-img" />
            </button>
          )}

          <div className="lightbox-img-frame">
            <img src={imgSrc} alt={imgAlt} className="lightbox-main-img" />
          </div>

          {hasNext && (
            <button
              type="button"
              className="lightbox-nav-arrow next"
              onClick={onNext}
              aria-label="Next image"
              title="Next image"
            >
              <img src={arrowRightIcon} alt="Next" className="lightbox-icon-img" />
            </button>
          )}
        </div>

        {/* Bottom Description Footer */}
        <div className="lightbox-footer-bar">
          <h3 className="lightbox-footer-title">{imgCaption}</h3>
          {imgDesc && <p className="lightbox-footer-desc">{imgDesc}</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;
