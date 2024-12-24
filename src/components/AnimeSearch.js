import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AnimeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [volume, setVolume] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          description
          coverImage {
            large
          }
        }
      }
    `;
    const variables = { search: searchQuery };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    const anime = data?.data?.Media;
    setSelectedAnime(anime || null);
  };

  const handleVolumeNavigate = () => {
    if (selectedAnime && volume) {
      navigate(`/manga/${selectedAnime.id}/${volume}`);
    } else {
      alert('Please select a valid volume number.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Anime Search</h1>
        <div className="flex mb-6">
          <input
            type="text"
            placeholder="Search Anime"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-4 bg-gray-800 text-white rounded-l-lg outline-none"
          />
          <button
            onClick={handleSearch}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-r-lg text-white font-semibold"
          >
            Search
          </button>
        </div>

        {selectedAnime && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedAnime.title.english || selectedAnime.title.romaji}
            </h2>
            <img
              src={selectedAnime.coverImage.large}
              alt={selectedAnime.title.english || selectedAnime.title.romaji}
              className="rounded-lg mb-4"
            />
            <p className="mb-6">{selectedAnime.description}</p>
            <div className="flex items-center">
              <input
                type="number"
                placeholder="Enter Volume Number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                className="p-3 bg-gray-800 text-white rounded-l-lg outline-none w-1/2"
              />
              <button
                onClick={handleVolumeNavigate}
                className="p-3 bg-green-600 hover:bg-green-700 rounded-r-lg text-white font-semibold"
              >
                Go to Volume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeSearch;
