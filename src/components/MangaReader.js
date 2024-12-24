import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaExpand, FaCompress } from 'react-icons/fa'; // Import full-screen icons

const MangaReader = () => {
  const { anilistId, volume, searchQuery } = useParams();
  const navigate = useNavigate();
  const mangaUrl = `https://vidsrc.icu/embed/manga/${anilistId}/${volume}`;

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState(volume);

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

  const handleNextVolume = () => {
    const nextVolume = parseInt(volume) + 1;
    navigate(`/manga/${anilistId}/${nextVolume}/${searchQuery || ''}`);
  };

  const handlePrevVolume = () => {
    const prevVolume = parseInt(volume) - 1;
    if (prevVolume > 0) {
      navigate(`/manga/${anilistId}/${prevVolume}/${searchQuery || ''}`);
    }
  };

  const handleVolumeChange = (e) => {
    setSelectedVolume(e.target.value);
  };

  const handleGoToVolume = () => {
    navigate(`/manga/${anilistId}/${selectedVolume}/${searchQuery || ''}`);
    setIsModalVisible(false);
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

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <div className="h-screen bg-black text-white relative" onClick={handleScreenTap}>
      {/* Header */}
      {isHeaderVisible && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-80 p-4 flex justify-between items-center">
          <button
            className="text-white font-bold px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            onClick={() => navigate(`/anime/${searchQuery||''}`)}
          >
            Back
          </button>
          <h1 className="text-lg font-semibold">Manga Volume {volume}</h1>
          <button
            onClick={toggleFullScreen}
            className="text-white font-bold p-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            {isFullScreen ? (
              <FaCompress size={20} /> // Compress icon when in full screen
            ) : (
              <FaExpand size={20} /> // Expand icon when not in full screen
            )}
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

      {/* Footer with Volume Navigation */}
      {!isFullScreen && ( // Hide footer when in full screen
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-80 p-4 flex justify-between items-center">
          <button
            onClick={handlePrevVolume}
            className="text-white font-bold px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Previous Volume
          </button>
          <button
            onClick={() => setIsModalVisible(true)} // Open the volume selection modal
            className="text-white font-bold px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
          >
            Go to Volume
          </button>
          <button
            onClick={handleNextVolume}
            className="text-white font-bold px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Next Volume
          </button>
        </div>
      )}

      {/* Volume Selection Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-20">
          <div className="bg-gray-900 text-white p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Go to Volume</h2>
            <input
              type="number"
              value={selectedVolume}
              onChange={handleVolumeChange}
              className="border border-gray-400 text-black p-2 rounded-lg mb-4"
              min="1"
            />
            <div className="flex justify-between">
              <button
                onClick={handleGoToVolume}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go
              </button>
              <button
                onClick={() => setIsModalVisible(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MangaReader;
