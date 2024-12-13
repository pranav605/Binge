import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AnimeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animeResults, setAnimeResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [mangaDetails, setMangaDetails] = useState([]);
  const [expandedManga, setExpandedManga] = useState(null);
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
          relations {
            edges {
              node {
                id
                title {
                  romaji
                  english
                }
                type
              }
            }
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
    setAnimeResults(anime ? [anime] : []);
    setSelectedAnime(null);
    setMangaDetails([]);
  };

  const handleAnimeSelect = async (anime) => {
    setSelectedAnime(anime);

    // Fetch manga details
    const manga = anime.relations.edges.filter((edge) => edge.node.type === 'MANGA');
    setMangaDetails(manga.map((edge) => edge.node));
  };

  const toggleMangaExpand = (mangaId) => {
    setExpandedManga(expandedManga === mangaId ? null : mangaId);
  };

  const handleVolumeSelect = (anilistId, volume) => {
    navigate(`/manga/${anilistId}/${volume}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Anime & Manga Search</h1>
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

        {animeResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            {animeResults.map((anime) => (
              <div
                key={anime.id}
                className="cursor-pointer bg-gray-800 p-4 rounded-lg mb-4"
                onClick={() => handleAnimeSelect(anime)}
              >
                <h3 className="text-lg font-bold">{anime.title.english || anime.title.romaji}</h3>
              </div>
            ))}
          </div>
        )}

        {selectedAnime && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">{selectedAnime.title.english || selectedAnime.title.romaji}</h2>
            <img
              src={selectedAnime.coverImage.large}
              alt={selectedAnime.title.english || selectedAnime.title.romaji}
              className="rounded-lg mb-4"
            />
            <p className="mb-6">{selectedAnime.description}</p>

            {mangaDetails.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Related Manga</h2>
                <ul>
                  {mangaDetails.map((manga) => (
                    <li key={manga.id} className="mb-4">
                      <div
                        className="cursor-pointer font-semibold text-lg bg-gray-700 p-3 rounded hover:bg-gray-600"
                        onClick={() => toggleMangaExpand(manga.id)}
                      >
                        {manga.title.english || manga.title.romaji}
                      </div>
                      {expandedManga === manga.id && (
                        <div className="ml-4 mt-2 bg-gray-800 p-4 rounded">
                          {[...Array(10)].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => handleVolumeSelect(manga.id, index + 1)}
                              className="block px-4 py-2 mb-2 bg-green-600 rounded hover:bg-green-700 text-white text-left"
                            >
                              Volume {index + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeSearch;
