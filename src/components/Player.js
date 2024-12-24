import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Player() {
  const location = useLocation();
  const navigate = useNavigate();
  const { details, backObj } = location.state || {};
  const isMovie = details.type === 'movie';
  
  // Domains to cycle through
  const domains = ['vidsrc.dev'];
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);

  // Generate the URL based on the current domain
  const generateSrcUrl = (index = currentDomainIndex) => {
    const currentDomain = domains[index];
    if (isMovie) {
      return `https://${currentDomain}/embed/movie/${details.tmdb_id}`;
    } else {
      return `https://${currentDomain}/embed/tv/${details.tmdb_id}/${details.season}/${details.episode}`;
    }
  };

  const [srcUrl, setSrcUrl] = useState(generateSrcUrl);

  // Handle cycling through domains
  const handleCycleSource = () => {
    const nextIndex = (currentDomainIndex + 1) % domains.length;
    setCurrentDomainIndex(nextIndex);
    alert(generateSrcUrl(nextIndex))
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

  return (
    <div className="relative h-screen">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={() => navigate('/details', { state: { details: backObj } })}
      >
        Back
      </button>

      {/* Try a Different Source Button */}
      <button
        className="absolute bottom-8 hidden right-8 z-10 px-4 py-2 bg-gray-800 bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 backdrop-blur-md"
        onClick={handleCycleSource}
      >
        Try a Different Source
      </button>

      {/* Video Player */}
      <iframe
        title="player"
        className="h-full w-full"
        sandbox="allow-same-origin allow-scripts allow-presentation"
        allowFullScreen
        scrolling="no"
        src={srcUrl}
      ></iframe>
    </div>
  );
}
