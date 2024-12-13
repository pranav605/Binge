import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Player() {
  const location = useLocation();
  const navigate = useNavigate();
  const { details, backObj } = location.state || {};
  const isMovie = details.type === 'movie';
  let srcUrl = '';

  if (isMovie) {
    srcUrl = `https://vidsrc.dev/embed/movie/${details.tmdb_id}`;
  } else {
    srcUrl = `https://vidsrc.dev/embed/tv/${details.tmdb_id}/${details.season}/${details.episode}`;
  }

  useEffect(() => {
    const handleBackButton = () => {
        navigate('/details', { state: { details: backObj } });
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

  return (
    <div className="relative h-screen">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={() => navigate('/details', { state: { details: backObj } })} // Go back to the previous page
      >
        Back
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
