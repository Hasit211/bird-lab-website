import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from './components/Header/Header';
import TitleSection from './components/TitleSection/TitleSection';
import Welcome from './components/Welcome/Welcome';
import Research from './components/Research/Research';
import People from './components/People/People';
import Publications from './components/Publications/Publications';
import Lectures from './components/Lectures/Lectures';
import Gallery from './components/Gallery/Gallery';
import Positions from './components/Positions/Positions';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import Facilities from './components/Facilities/Facilities';
import Events from './components/Events/Events';
import { ContentProvider } from './context/ContentProvider';
import { SheetDataProvider } from './context/SheetDataProvider';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';

import './App.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  return (
    <>
      <TitleSection />
      <Welcome />
    </>
  );
}

// All app logic lives here, INSIDE <Router>, so useNavigate() has context.
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize GSAP animations
    gsap.set('body', { opacity: 1 });

    // Refresh ScrollTrigger on route change
    ScrollTrigger.refresh();
  }, []);

  const finishLoading = () => {
    setIsLoading(false);
  };

  return (
    <SheetDataProvider>
    <ContentProvider>
      <div className="App">
        {isLoading ? (
          <LoadingScreen onFinish={finishLoading} />
        ) : (
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/people" element={<People />} />
                <Route path="/research" element={<Research />} />
                <Route path="/publications" element={<Publications />} />
                <Route path="/lectures" element={<Lectures />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/facilities" element={<Facilities />} />
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
          </>
        )}
      </div>
    </ContentProvider>
    </SheetDataProvider>
  );
}

// The Router wrapper stays outside — it just provides context, no logic.
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;