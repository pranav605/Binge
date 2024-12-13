import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MangaReader = () => {
  const { anilistId, volume } = useParams();
  const navigate = useNavigate();
  const mangaUrl = `https://vidsrc.icu/embed/manga/${anilistId}/${volume}`;

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const toggleFullScreen = () => {
    const elem = document.documentElement;
    if (!isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleScreenTap = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      setIsFullScreen(isCurrentlyFullScreen);

      // Ensure the header is visible when exiting full screen
      if (!isCurrentlyFullScreen) {
        setIsHeaderVisible(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <div
      className="h-screen bg-black text-white relative"
      onClick={handleScreenTap}
    >
      {/* Header */}
      {isHeaderVisible && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-80 p-4 flex justify-between items-center">
          <button
            className="text-white font-bold px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <h1 className="text-lg font-semibold">Manga Volume {volume}</h1>
          <button
            className="text-white font-bold px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? "Exit Full Screen" : "Full Screen"}
          </button>
        </div>
      )}

      {/* Manga Content */}
      <iframe
        src={mangaUrl}
        title={`Manga Volume ${volume}`}
        className="w-full h-full border-none"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default MangaReader;
