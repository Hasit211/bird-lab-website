import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useContent } from '../../hooks/useContent';
import heroVideo from '../../assets/Video Project 2.mp4';
import './TitleSection.css';

const DEFAULT_WORD = 'Next GEN BIRD LAB';
const DEFAULT_SUBHEADING = 'BIO INSPIRED ROBOTICS DESIGN LABORATORY';

const TitleSection = () => {
  const t = useContent();
  const word = t(['hero.title', 'hero.word', 'hero.brand', 'hero.title.short'], DEFAULT_WORD);
  const subheading = t(['hero.subtitle', 'hero.subheading'], DEFAULT_SUBHEADING);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  // Ensure video autoplays and continuously loops smoothly
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});
  }, []);

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
    const videoEl = section?.querySelector('.title-hero-video');
    if (!section || !headline || !letters.length) return;

    // Respect users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(letters, { x: 0, y: 0, scale: 1, opacity: 1 });
      if (subheadingEl) gsap.set(subheadingEl, { opacity: 1 });
      if (videoEl) gsap.set(videoEl, { opacity: 1, x: 0, y: 0 });
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

    // ── Video: entrance + repeating left→right patrol with fade ──
    let patrolTl = null;
    const handleResize = () => {
      if (patrolTl) patrolTl.invalidate();
    };

    if (videoEl) {
      // How far the video can travel: section width minus video width minus margins
      const getTravelDistance = () => {
        const secW = section.clientWidth || section.offsetWidth;
        const vidW = videoEl.offsetWidth || 0;
        const margin = window.innerWidth <= 640 ? 24 : 64;
        return Math.max(0, secW - vidW - margin);
      };

      // Initial entrance: fade-in at the left edge
      tl.fromTo(
        videoEl,
        { opacity: 0, x: 0, y: 10 },
        { opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power2.out' },
        '>0.05'
      );

      // After entrance, kick off the repeating patrol timeline
      tl.call(() => {
        // Build a timeline that plays once per cycle, then repeats forever
        patrolTl = gsap.timeline({ repeat: -1, onRepeat: () => {
          // Reset video playback at the start of each new cycle
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        }});

        // 1) Slide from left edge to right edge (4s linear walk)
        patrolTl.fromTo(
          videoEl,
          { x: 0 },
          { x: () => getTravelDistance(), duration: 4, ease: 'none' }
        );

        // 2) Fade out at the right edge (0.4s)
        patrolTl.to(
          videoEl,
          { opacity: 0, duration: 0.4, ease: 'power2.in' }
        );

        // 3) Snap back to left instantly (0 duration)
        patrolTl.set(videoEl, { x: 0 });

        // 4) Fade back in at the left edge (0.4s)
        patrolTl.to(
          videoEl,
          { opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      });

      window.addEventListener('resize', handleResize);
    }

    return () => {
      tl.kill();
      if (patrolTl) patrolTl.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [word, subheading]);



  const displayWord = (word && word.trim()) || DEFAULT_WORD;
  const words = displayWord.trim().split(/\s+/);
  const totalLetters = words.reduce((acc, w) => acc + w.length, 0);
  let charCounter = 0;

  return (
    <section className="title-section" ref={sectionRef}>
      <h1 className="title-headline" aria-label={displayWord}>
        {words.map((singleWord, wordIndex) => (
          <span key={wordIndex} className="title-word">
            {singleWord.split('').map((letter, letterIndex) => {
              const charIndex = charCounter++;
              return (
                <span
                  key={letterIndex}
                  className="letter"
                  style={{ '--pos': `${(charIndex / Math.max(1, totalLetters - 1)) * 100}%` }}
                  aria-hidden="true"
                >
                  {letter}
                </span>
              );
            })}
          </span>
        ))}
      </h1>
      <h2 className="title-subheading">{subheading}</h2>
      <video
        ref={videoRef}
        className="title-hero-video"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />
    </section>
  );
};

export default TitleSection;