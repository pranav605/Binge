import React, { useState } from 'react';
import logo from './Binge-12-10-2024.png';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const navigate = useNavigate();
  const filter = require('leo-profanity');
  const omdbApiKey = 'b0f3c56f'; // Replace with your OMDB API key
  const tmdbApiKey = '8433e4e03a9efa0d7f9983569b7ef196'; // TMDB API key

  
  const handleMovieClick = (movie) => {
    navigate('/details', { state: { details: movie } });
  };

  // Fetch IMDb ID from TMDB API
  const fetchImdbId = async (tmdbId, media_type) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${media_type}/${tmdbId}?api_key=${tmdbApiKey}`
      );
      const data = await response.json();
      return data.imdb_id || null;
    } catch (error) {
      console.error('Error fetching IMDb ID:', error);
      return null;
    }
  };

  // Fetch Poster from OMDB API
  const fetchOmdbPoster = async (imdbId) => {
    try {
      if (!imdbId) return null;
      const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${omdbApiKey}`);
      const data = await response.json();
      return data.Response === 'True' ? data.Poster : null;
    } catch (error) {
      console.error('Error fetching OMDB poster:', error);
      return null;
    }
  };

  // Filter function to exclude banned words
  const filterResults = (results) => {
    return results.filter((movie) => {
      const description = (movie.overview || '').toLowerCase();
      const title = (movie.title || movie.name || '').toLowerCase(); // Check title or name
      return !filter.check(description) && !filter.check(title) && movie.adult === false && ( movie.original_language && ( movie.original_language == 'hi' || movie.original_language == 'te' || movie.original_language == 'en'))
    });
  };
  
  const fetchPageData = async (pgNo) => {
    try{
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&include_adult=false&query=${encodeURIComponent(
          searchQuery
        )}&page=${pgNo}`
      );
      const data = await response.json();
      if(data.results){
        return data.results;
      }
    }catch(err){
      return []
    }
  }
  // Handle Search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearched(true);
      setIsLoading(true); // Start loader
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${tmdbApiKey}&include_adult=false&query=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await response.json();
        var acc_data = [];
        console.log(data.total_pages);

        if(data.total_pages > 1){
          
          for(let i=1; i<=data.total_pages; i++){
            const pg_response = await fetchPageData(i);
            pg_response.forEach(d => {
              acc_data.push(d)
            })
          }
        }
        
        const enhancedResults = await Promise.all(
          (data.total_pages>1?acc_data:data.results || []).map(async (movie) => {
            if (!movie.poster_path && movie.media_type !== 'person') {
              const imdbId = await fetchImdbId(movie.id, movie.media_type);
              const omdbPoster = await fetchOmdbPoster(imdbId);
              return { ...movie, poster_path: omdbPoster, omdbFetched: true };
            }
            return { ...movie, omdbFetched: false };
          })
        );
        console.log(enhancedResults);
        
        const filteredResults = filterResults(enhancedResults); // Apply filter
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false); // Stop loader
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
          className={`flex items-center border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${
            isSearched ? 'w-full max-w-2xl' : ''
          }`}
        >
          <input
            type="text"
            placeholder="What do you want to watch?"
            className="flex-grow p-4 text-white bg-gray-800 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch} className="p-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Search
          </button>
        </div>
      </div>
      {isSearched && (
        <div className="mt-8 px-4">
          {isLoading ? ( // Show loader
            <div className="text-white text-center">Loading...</div>
          ) : searchResults.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults
                .filter((movie) => movie.media_type !== 'person')
                .sort((a, b) => (a.popularity < b.popularity ? 1 : -1))
                .map((movie) => (
                  <li
                    key={movie.id}
                    className="bg-gray-800 text-white p-4 rounded-lg cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <h3 className="font-bold text-lg">{movie.title || movie.name}</h3>
                    {movie.poster_path ? (
                      <img
                        src={
                          movie.omdbFetched
                            ? movie.poster_path
                            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        }
                        alt={movie.title || movie.name}
                        className="mt-2 rounded-lg"
                      />
                    ) : (
                      <p className="mt-2 text-sm">No image available</p>
                    )}
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
