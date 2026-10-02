import React, { useState, useEffect, useRef } from 'react';
import './PageLoader.css';

// Requested languages: Hindi, English, Punjabi, Gujarati, Telugu, Tamil, Malayalam, Marathi, Spanish, Kannada, Bengali, Japanese (No Urdu)
const AYUSH_LANGUAGES = [
  { lang: 'Hindi', text: 'आयुष' },
  { lang: 'Punjabi', text: 'ਆਯੁਸ਼' },
  { lang: 'Gujarati', text: 'આયુષ' },
  { lang: 'Telugu', text: 'ఆయుష్' },
  { lang: 'Tamil', text: 'ஆயுஷ்' },
  { lang: 'Malayalam', text: 'ആയുഷ്' },
  { lang: 'Kannada', text: 'ಆಯುಷ್' },
  { lang: 'Marathi', text: 'आयुष' },
  { lang: 'Spanish', text: 'Ayush' },
  { lang: 'Bengali', text: 'আয়ুষ' },
  { lang: 'Japanese', text: 'アユシュ' },
  { lang: 'English', text: 'Ayush' }
];

const SINGH_LANGUAGES = [
  { lang: 'Punjabi', text: 'ਸਿੰਘ' },
  { lang: 'Hindi', text: 'सिंह' },
  { lang: 'Telugu', text: 'సింగ్' },
  { lang: 'Tamil', text: 'சிங்' },
  { lang: 'Gujarati', text: 'સિંહ' },
  { lang: 'Malayalam', text: 'സിംഗ്' },
  { lang: 'Kannada', text: 'ಸಿಂಗ್' },
  { lang: 'Marathi', text: 'सिंग' },
  { lang: 'Spanish', text: 'Singh' },
  { lang: 'Bengali', text: 'সিংহ' },
  { lang: 'Japanese', text: 'シン' },
  { lang: 'English', text: 'Singh' }
];

const PageLoader = ({ theme = 'light', profilePic, onComplete, debugPauseAt = null }) => {
  const initialScale = typeof window !== 'undefined' && window.innerWidth <= 768 ? 1.75 : 2.4;
  const [ayushIndex, setAyushIndex] = useState(0);
  const [singhIndex, setSinghIndex] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [flightStyles, setFlightStyles] = useState({
    transform: `scale(${initialScale})`
  });
  const [isFinished, setIsFinished] = useState(false);

  const brandRef = useRef(null);

  useEffect(() => {
    // Prevent background scrolling while loader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 1. Asynchronous multi-language cycling
    // Ayush changes with ~75ms cadence
    const ayushInterval = setInterval(() => {
      setAyushIndex((prev) => (prev + 1) % (AYUSH_LANGUAGES.length - 1));
    }, 75);

    // Singh changes with ~115ms cadence
    const singhInterval = setInterval(() => {
      setSinghIndex((prev) => (prev + 1) % (SINGH_LANGUAGES.length - 1));
    }, 115);

    if (debugPauseAt === 'cycling') {
      return () => {
        clearInterval(ayushInterval);
        clearInterval(singhInterval);
        document.body.style.overflow = originalOverflow;
      };
    }

    // Stop exactly at 2000ms and lock into "Ayush Singh" in English
    const stopTimer = setTimeout(() => {
      clearInterval(ayushInterval);
      clearInterval(singhInterval);
      setIsStopped(true);

      // 2. Profile photo slides from left and "at IITGN" from right at 2150ms
      const extrasTimer = setTimeout(() => {
        setShowExtras(true);

        if (debugPauseAt === 'assembled') {
          return;
        }

        // 3. Initiate smooth flight to top navbar at 3000ms
        const flightTimer = setTimeout(() => {
          const targetBrand = document.querySelector('.header-brand');
          const currentBrand = brandRef.current;

          if (targetBrand && currentBrand) {
            const tRect = targetBrand.getBoundingClientRect();
            const cRect = currentBrand.getBoundingClientRect();

            const cCenterX = cRect.left + cRect.width / 2;
            const cCenterY = cRect.top + cRect.height / 2;

            const tCenterX = tRect.left + tRect.width / 2;
            const tCenterY = tRect.top + tRect.height / 2;

            const deltaX = tCenterX - cCenterX;
            const deltaY = tCenterY - cCenterY;

            // Animate translation to navbar and scale down to exactly 1.0 (matching the navbar dimensions)
            setFlightStyles({
              transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1)`,
              transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
            });
          } else {
            setFlightStyles({
              transform: 'translate3d(0, -180px, 0) scale(1)',
              opacity: 0,
              transition: 'all 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
            });
          }

          setIsFlying(true);

          // 4. Complete handoff to page and top navbar
          const finishTimer = setTimeout(() => {
            document.body.style.overflow = originalOverflow;
            setIsFinished(true);
            if (onComplete) onComplete();
          }, 850);

          return () => clearTimeout(finishTimer);
        }, 850);

        return () => clearTimeout(flightTimer);
      }, 150);

      return () => clearTimeout(extrasTimer);
    }, 2000);

    return () => {
      clearInterval(ayushInterval);
      clearInterval(singhInterval);
      clearTimeout(stopTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [onComplete, debugPauseAt]);

  if (isFinished) return null;

  const currentAyush = isStopped ? 'Ayush' : AYUSH_LANGUAGES[ayushIndex].text;
  const currentSingh = isStopped ? 'Singh' : SINGH_LANGUAGES[singhIndex].text;

  return (
    <div
      className={`page-loader-overlay ${theme === 'dark' ? 'theme-dark' : 'theme-light'} ${
        isFlying ? 'is-fading' : ''
      }`}
      aria-hidden="true"
    >
      {/* Background that smoothly fades to transparent on flight */}
      <div className={`loader-backdrop ${isFlying ? 'backdrop-faded' : ''}`} />

      {/* Center stage */}
      <div className="loader-center-stage">
        <div
          ref={brandRef}
          className={`loader-brand-cluster ${showExtras ? 'extras-active' : ''} ${
            isFlying ? 'flying-active' : ''
          }`}
          style={flightStyles}
        >
          {/* Slides in from left: Profile Photo */}
          <div
            className={`loader-avatar-box ${
              showExtras ? 'avatar-in' : 'avatar-out'
            }`}
          >
            <img
              src={profilePic}
              alt="Ayush Singh"
              className="loader-avatar-img"
            />
          </div>

          {/* Name & Tag in Plus Jakarta Sans */}
          <div className="loader-title-box">
            <span className="loader-name-text">
              <span className="loader-word loader-word-ayush">{currentAyush}</span>
              <span className="loader-spacer">&nbsp;</span>
              <span className="loader-word loader-word-singh">{currentSingh}</span>
            </span>

            {/* Slides in from right: 'at IITGN' */}
            <span
              className={`loader-tag-box ${
                showExtras ? 'tag-in' : 'tag-out'
              }`}
            >
              &nbsp;<span className="loader-tag-text">at IITGN</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
