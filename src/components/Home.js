import React, { useState } from 'react';
import logo from './Binge-12-10-2024.png';
import {useNavigate} from 'react-router-dom'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const navigate = useNavigate();

  const handleMovieClick = (movie) => {
    navigate('/details', { state: { details: movie } });
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearched(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=8433e4e03a9efa0d7f9983569b7ef196&query=${encodeURIComponent(searchQuery)}&include_adult=false`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      alert('Please enter something to search.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${isSearched ? 'pt-16' : 'flex items-center justify-center'}`}>
      <button
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-semibold absolute top-2 left-2"
          onClick={() => navigate('/anime')}
        >
          Search Anime & Manga
        </button>
      <div
        className={`w-full transition-all duration-300 ${isSearched ? 'flex items-center px-4' : 'text-center max-w-md'}`}
      >
        <img
          src={logo}
          alt="Binge"
          className={`transition-all duration-300 ${isSearched ? 'w-16 h-auto mr-4' : 'mx-auto mb-8 w-96 h-auto'}`}
        />
        <div
          className={`flex items-center border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${isSearched ? 'w-full max-w-2xl' : ''}`}
        >
          <input
            type="text"
            placeholder="What do you want to watch?"
            className="flex-grow p-4 text-white bg-gray-800 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Search
          </button>
        </div>
      </div>
      {isSearched && (
        <div className="mt-8 px-4">
          {searchResults.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.map((movie) => (
                <li
                    key={movie.id}
                    className="bg-gray-800 text-white p-4 rounded-lg cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                >
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    {movie.poster_path && (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="mt-2 rounded-lg"
                    />
                    )}
                    <p className="mt-2 text-sm">{movie.overview}</p>
                </li>
                ))}
            </ul>
          ) : (
            <p className="text-white text-center">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
