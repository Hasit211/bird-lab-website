import { useEffect, useRef, useState } from 'react';
import './LoadingScreen.css';

// Imported (not referenced by string path) because these files live under
// src/assets — Vite needs to process/resolve them, it won't serve a raw
// "/assets/..." string unless the files are in the public/ folder instead.
import pic1 from '../../assets/loading_screen/loading_pic_1.jpg';
import pic2 from '../../assets/loading_screen/loading_pic_2.png';
import pic3 from '../../assets/loading_screen/loading_pic_3.jpg';
import pic4 from '../../assets/loading_screen/loading_pic_4.jpg';
import pic5 from '../../assets/loading_screen/loading_pic_5.jpg';

const images = [pic1, pic2, pic3, pic4, pic5];

const LoadingScreen = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const finishedRef = useRef(false);

  // Preload so switching never shows a blank/black frame
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Loop through images every 2 seconds, forever, until the user clicks through
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const finish = () => {
    if (finishedRef.current) return; // guard against double clicks
    finishedRef.current = true;
    onFinish?.();
  };

  return (
    <div className="loading-screen">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Loading slide ${i + 1}`}
          className={`loading-image ${i === currentIndex ? 'active' : ''}`}
        />
      ))}
      <button className="enter-button visible" onClick={finish}>
        <span>Enter Bird Labs Website</span>
        <svg className="enter-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default LoadingScreen;