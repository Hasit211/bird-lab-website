import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './TitleSection.css';

const WORD = 'BIRDLabs';
const SUBHEADING = 'BIO INSPIRED ROBOTICS DESIGN LABORATORY';

const TitleSection = () => {
  const sectionRef = useRef(null);
  const inited = useRef(false);

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
    if (inited.current) return;
    inited.current = true;

    const section = sectionRef.current;
    const headline = section?.querySelector('.title-headline');
    const subheading = section?.querySelector('.title-subheading');
    const letters = headline ? headline.querySelectorAll('.letter') : [];
    if (!section || !headline || !letters.length) return;

    // Respect users who prefer reduced motion: skip the animation sequence and
    // show the title + subheading at their final positions immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(letters, { x: 0, y: 0, scale: 1, opacity: 1 });
      if (subheading) gsap.set(subheading, { opacity: 1 });
      return;
    }

    /* ------------------------------------------------------------------ */
    /* ANIMATION TUNING                                                    */
    /*                                                                     */
    /* DURATION : seconds each individual letter takes to fly from the     */
    /*            center outward to its final slot (try 0.6 - 1.4).        */
    /* STAGGER  : delay between the start of one letter and the next       */
    /*            (try 0.08 - 0.25 for a faster/slower cascade).           */
    /* EASING   : GSAP solve type - "power3.out" feels fluid,              */
    /*            "back.out(1.6)" adds a subtle overshoot pop.             */
    /*                                                                     */
    /* The title keeps its layout position (top-aligned, no vertical move) */
    /* and only plays the letter fly-in animation below.                   */
    /* ------------------------------------------------------------------ */
    const DURATION = 1.0;
    const STAGGER = 0.16;
    const EASING = 'power3.out';

    // Wait for Inter to load so letter positions are measured with the
    // final font (prevents a mis-seeded intro on first paint).
    document.fonts.ready.then(() => {
      if (!sectionRef.current) return;

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

      // Hide the subheading until the title animation finishes.
      if (subheading) gsap.set(subheading, { opacity: 0 });

      /* Single timeline chains the whole hero so each stage waits for the
         previous one to finish instead of all playing at once. */
      const tl = gsap.timeline();

      // STEP 1 - EXISTING TITLE ANIMATION (kept exactly as it was).
      tl.to(letters, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: DURATION,
        stagger: STAGGER,
        ease: EASING,
      });

      // STEP 2 - SUBHEADING APPEARS only after the title animation completes.
      if (subheading) {
        tl.to(
          subheading,
          { opacity: 1, duration: 0.5, ease: 'power2.out' },
          '>0.1'
        );
      }
    });
  }, []);

  return (
    <section className="title-section" ref={sectionRef}>
      <h1 className="title-headline" aria-label={WORD}>
        {WORD.split('').map((letter, index) => (
          <span
            key={index}
            className="letter"
            style={{ '--pos': `${(index / (WORD.length - 1)) * 100}%` }}
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </h1>
      <h2 className="title-subheading">{SUBHEADING}</h2>
    </section>
  );
};

export default TitleSection;