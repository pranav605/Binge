import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Player() {
  const location = useLocation();
  const navigate = useNavigate();
  const { details, backObj } = location.state || {};
  const isMovie = details.type === 'movie';

  // Domains to cycle through
  const domains = ['www.vidking.net', 'vidsrc.cx'];
  // ,'embed.vidsrc.pk', 'localhost'
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);

  // Generate the URL based on the current domain
  const generateSrcUrl = (index = currentDomainIndex) => {
    const currentDomain = domains[index];
    if (isMovie) {
      return `https://${currentDomain}/embed/movie/${details.tmdb_id}?autoPlay=true`;
    } else {
      return `https://${currentDomain}/embed/tv/${details.tmdb_id}/${details.season}/${details.episode}?autoPlay=true&nextEpisode=true&episodeSelector=true`;
    }
  };

  const [srcUrl, setSrcUrl] = useState(generateSrcUrl);
  const [showButton, setShowButton] = useState(false);
  const hideTimeoutRef = useRef(null); // ✅ Persistent ref for timeout

  // Handle cycling through domains
  const handleCycleSource = () => {
    const nextIndex = (currentDomainIndex + 1) % domains.length;
    setCurrentDomainIndex(nextIndex);
    setSrcUrl(generateSrcUrl(nextIndex));
  };

  useEffect(() => {
    const handleBackButton = () => {
      navigate('/details', { state: { details: backObj } });
    };

    window.addEventListener('popstate', handleBackButton);
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate, backObj]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.keyCode) {
        case 27: // Esc
          navigate('/details', { state: { details: backObj } });
          break;

        case 13: // Enter
        case 179: // Play/Pause
          const spacebarEvent = new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            keyCode: 32,
            which: 32,
            bubbles: true,
            cancelable: true,
          });

          const activeElement = document.activeElement;
          if (activeElement) {
            activeElement.dispatchEvent(spacebarEvent);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, backObj]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowButton(true);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => setShowButton(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-screen">
      {/* Back Button */}
      <button
        className={`absolute top-8 left-8 z-10 px-4 py-2 bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 backdrop-blur-md transition-opacity duration-500 ${
          showButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => navigate('/details', { state: { details: backObj } })}
      >
        Back
      </button>

      {/* Try a Different Source Button */}
      <button
        className={`absolute top-8 right-8 z-10 px-4 py-2 bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 backdrop-blur-md transition-opacity duration-500 ${
          showButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCycleSource}
      >
        Try a Different Source
      </button>

      {/* Video Player */}
      <iframe
        title="player"
        className="h-full w-full"
        allowFullScreen
        src={
          domains[currentDomainIndex] !== 'localhost'
            ? srcUrl
            : `http://localhost:5000/safeplayer?movie_id=${details.tmdb_id}`
        }
        sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
      />
    </div>
  );
}
