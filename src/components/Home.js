import React, { useEffect, useRef, useState } from 'react';
import logo from './Binge-12-10-2024.png';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/16/solid';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const filter = require('leo-profanity');
  const omdbApiKey = process.env.REACT_APP_OMDB_API_KEY;
  const tmdbApiKey = process.env.REACT_APP_TMDB_API_KEY;
  const [discover, setDiscover] = useState([]);

  const handleMovieClick = (movie) => {
    navigate('/details', { state: { details: movie } });
  };
  const handleDiscoverMovieClick = (movie) => {
    movie.media_type = 'movie';
    navigate('/details', { state: { details: movie } });
  };

  // Fetch IMDb ID
  const fetchImdbId = async (tmdbId, media_type) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${media_type}/${tmdbId}?api_key=${tmdbApiKey}`
      );
      const data = await response.json();
      return data.imdb_id || null;
    } catch {
      return null;
    }
  };

  // Fetch OMDB Poster
  const fetchOmdbPoster = async (imdbId) => {
    try {
      if (!imdbId) return null;
      const response = await fetch(
        `https://www.omdbapi.com/?i=${imdbId}&apikey=${omdbApiKey}`
      );
      const data = await response.json();
      return data.Response === 'True' ? data.Poster : null;
    } catch {
      return null;
    }
  };

  // Filter function
  const filterResults = (results) => {
    return results.filter((movie) => {
      const description = (movie.overview || '').toLowerCase();
      const title = (movie.title || movie.name || '').toLowerCase();
      return (
        !filter.check(description) &&
        !filter.check(title) &&
        movie.adult === false &&
        (movie.original_language === 'hi' ||
          movie.original_language === 'te' ||
          movie.original_language === 'en')
      );
    });
  };

  const fetchPageData = async (pgNo) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&include_adult=false&query=${encodeURIComponent(
          searchQuery
        )}&page=${pgNo}`
      );
      const data = await response.json();
      return data.results || [];
    } catch {
      return [];
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter something to search.');
      return;
    }
    setIsSearched(true);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&include_adult=false&query=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();
      let acc_data = [];

      if (data.total_pages > 1) {
        for (let i = 1; i <= Math.min(data.total_pages, 5); i++) {
          const pageResults = await fetchPageData(i);
          acc_data.push(...pageResults);
        }
      }

      const resultsToProcess =
        data.total_pages > 1 ? acc_data : data.results || [];

      const enhancedResults = await Promise.all(
        resultsToProcess.map(async (movie) => {
          if (!movie.poster_path && movie.media_type !== 'person') {
            const imdbId = await fetchImdbId(movie.id, movie.media_type);
            const omdbPoster = await fetchOmdbPoster(imdbId);
            return { ...movie, poster_path: omdbPoster, omdbFetched: true };
          }
          return { ...movie, omdbFetched: false };
        })
      );

      const filteredResults = filterResults(enhancedResults);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDiscover = async () => {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&include_adult=false&language=en-US&page=1&sort_by=popularity.desc`
      );
      const data = await response.json();
      setDiscover(data.results || []);
    };
    fetchDiscover();
  }, [tmdbApiKey]);

  const rowRef = useRef();

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth - 200; // scroll by one "viewport width"
      const newScrollLeft =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      rowRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };


  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isSearched ? 'pt-16' : 'flex flex-col items-center justify-center'}`}>

      {/* Anime Button */}
      <button
        className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 rounded-lg hover:bg-green-700 font-semibold absolute top-4 left-4 z-10 text-sm sm:text-base"
        onClick={() => navigate('/anime')}
      >
        Search Anime & Manga
      </button>

      {/* Logo + Search */}
      <div className={`w-full transition-all duration-300 ${isSearched ? 'flex flex-col sm:flex-row items-center px-4 justify-center gap-4' : 'text-center max-w-md'}`}>
        <img
          src={logo}
          alt="Binge"
          className={`transition-all duration-300 ${isSearched ? 'w-24 sm:w-32 h-auto mb-4 sm:mb-0' : 'mx-auto mb-8 w-72 sm:w-96 h-auto'}`}
        />
        <div className='flex items-center justify-center'>
          <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden max-w-sm w-full md:max-w-xl">
            <input
              type="text"
              placeholder="What do you want to watch?"
              className="flex-grow p-3 sm:p-4 text-white bg-gray-800 outline-none text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 font-semibold text-sm sm:text-base"
            >
              Search
            </button>
          </div>

        </div>
      </div>

      {/* Discover Section */}
      {!isSearched ? (
        <div className="w-full mt-8 px-4 sm:px-6 relative">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">Popular on Binge</h2>

          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full z-20 hover:bg-black/90 transition">
            <ChevronLeftIcon className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>
          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full z-20 hover:bg-black/90 transition">
            <ChevronRightIcon className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>

          <div ref={rowRef} className="flex gap-3 sm:gap-4 overflow-x-auto p-4 sm:p-6 snap-x snap-mandatory scroll-smooth no-scrollbar">
            {discover.map((movie, idx) => (
              <motion.div
                key={movie.id || idx}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative flex-shrink-0 w-36 sm:w-44 md:w-48 h-56 sm:h-64 md:h-72 bg-neutral-800 rounded-2xl overflow-hidden shadow-lg snap-center cursor-pointer"
                onClick={() => handleDiscoverMovieClick(movie)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-opacity duration-300 ease-out group-hover:opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute bottom-0 p-2 sm:p-3 text-white w-full"
                >
                  <h2 className="text-xs sm:text-sm md:text-base font-semibold truncate">{movie.title}</h2>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs mt-1">
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{movie.vote_average?.toFixed(1)}</span>
                  </div>
                  <p className="text-neutral-300 text-xs sm:text-sm mt-1 line-clamp-2">{movie.overview}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 px-4 sm:px-6">
          {isLoading ? (
            <div className="text-center text-gray-300">Loading...</div>
          ) : searchResults.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {searchResults
                .filter((m) => m.media_type !== 'person')
                .sort((a, b) => b.popularity - a.popularity)
                .map((movie) => (
                  <li
                    key={movie.id}
                    className="bg-neutral-800 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <img
                      src={movie.omdbFetched ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-full h-60 sm:h-72 md:h-80 object-cover"
                    />
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm md:text-base font-semibold line-clamp-1">{movie.title || movie.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">⭐ {movie.vote_average?.toFixed(1) || 'N/A'}</p>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
