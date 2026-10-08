import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useContent } from '../../hooks/useContent';
import './TitleSection.css';

const DEFAULT_WORD = 'BIRDLabs';
const DEFAULT_SUBHEADING = 'BIO INSPIRED ROBOTICS DESIGN LABORATORY';

const TitleSection = () => {
  const t = useContent();
  const word = t(['hero.title', 'hero.word', 'hero.brand', 'hero.title.short'], DEFAULT_WORD);
  const subheading = t(['hero.subtitle', 'hero.subheading'], DEFAULT_SUBHEADING);
  const sectionRef = useRef(null);

  // Vanta Birds animated background for the title section. Depends on the
  // global window.VANTA.BIRDS (loaded via script tags in index.html).
  // Creates its own canvas as a child of the section behind the title, and
  // destroys it on unmount / StrictMode re-run.
  useEffect(() => {
    const section = sectionRef.current;
    const createBirds = window.VANTA && window.VANTA.BIRDS;
    if (!section || typeof createBirds !== 'function') return;

    const effect = createBirds({
      el: section,
      // Solid #1FA2D4 color with no gradient variation.
      color1: 0x1fa2d4,
      color2: 0x1fa2d4,
      backgroundColor: 0xffffff,
      backgroundAlpha: 0, // transparent canvas so the section's fade shows
      birdSize: 2.2, // bigger birds
      quantity: 5, // (2^5)^2 = 1024 birds
    });

    return () => {
      if (effect && typeof effect.destroy === 'function') effect.destroy();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = section?.querySelector('.title-headline');
    const subheadingEl = section?.querySelector('.title-subheading');
    const letters = headline ? headline.querySelectorAll('.letter') : [];
    if (!section || !headline || !letters.length) return;

    // Respect users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(letters, { x: 0, y: 0, scale: 1, opacity: 1 });
      if (subheadingEl) gsap.set(subheadingEl, { opacity: 1 });
      return;
    }

    const DURATION = 0.8;
    const STAGGER = 0.08;
    const EASING = 'power3.out';

    // Center point of the whole word (which is centered on the screen).
    const headlineRect = headline.getBoundingClientRect();
    const centerX = headlineRect.left + headlineRect.width / 2;
    const centerY = headlineRect.top + headlineRect.height / 2;

    // Hide letters, then shift each one onto the word's center point.
    gsap.set(letters, { scale: 0, opacity: 0 });
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const letterX = rect.left + rect.width / 2;
      const letterY = rect.top + rect.height / 2;
      gsap.set(letter, { x: letterX - centerX, y: letterY - centerY });
    });

    if (subheadingEl) gsap.set(subheadingEl, { opacity: 0 });

    const tl = gsap.timeline();
    tl.to(letters, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: DURATION,
      stagger: STAGGER,
      ease: EASING,
    });

    if (subheadingEl) {
      tl.to(
        subheadingEl,
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        '>0.05'
      );
    }

    return () => {
      tl.kill();
    };
  }, [word, subheading]);



  return (
    <section className="title-section" ref={sectionRef}>
      <h1 className="title-headline" aria-label={word}>
        {word.split('').map((letter, index) => (
          <span
            key={index}
            className="letter"
            style={{ '--pos': `${(index / Math.max(1, word.length - 1)) * 100}%` }}
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </h1>
      <h2 className="title-subheading">{subheading}</h2>
    </section>
  );
};

export default TitleSection;