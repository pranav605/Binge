import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Details = () => {
  const location = useLocation();
  const { details } = location.state || {}; // Retrieve passed details
  const isMovie = details.media_type === 'movie';
  console.log(details);

  const [seasons, setSeasons] = useState([]);
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [episodes, setEpisodes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (details && details.media_type === 'tv') {
      fetch(`https://api.themoviedb.org/3/tv/${details.id}?api_key=8433e4e03a9efa0d7f9983569b7ef196&append_to_response=seasons`)
        .then((response) => response.json())
        .then((data) => {
          setSeasons(data.seasons || []);
        })
        .catch((error) => console.error('Error fetching seasons:', error));
    }
  }, [details]);

  useEffect(() => {
    const handleBackButton = () => {
        navigate('/');
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [navigate]);

  const toggleSeason = (seasonNumber) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }

    setExpandedSeason(seasonNumber);

    if (!episodes[seasonNumber]) {
      fetch(`https://api.themoviedb.org/3/tv/${details.id}/season/${seasonNumber}?api_key=8433e4e03a9efa0d7f9983569b7ef196`)
        .then((response) => response.json())
        .then((data) => {
          setEpisodes((prev) => ({ ...prev, [seasonNumber]: data.episodes }));
        })
        .catch((error) => console.error('Error fetching episodes:', error));
    }
  };

  const handleEpisodeClicktv = (seasonNumber, episodeNumber) => {
    // alert(`TMDB ID: ${details.id}, Season: ${seasonNumber}, Episode: ${episodeNumber}`);
    navigate('/play', { state: { details: {tmdb_id: details.id, season: seasonNumber, episode: episodeNumber, type: 'tv'}, backObj: details } });

  };

  const handleMovieClick = ()=>{
    navigate('/play', {state: { details: {tmdb_id: details.id, type: 'movie'}, backObj: details}})
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <button
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={() => navigate('/')}
      >
        Back
      </button>
        <p className="text-white text-lg">No details available. Please try again.</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <button
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={() => navigate('/')}
      >
        Back
      </button>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{details.title || details.name}</h1>
        {details.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
            alt={details.title || details.name}
            className="rounded-lg mb-4"
          />
        )}
        <p className="text-lg mb-4">{details.overview}</p>

        <div className="mt-4">
          {isMovie ? (
            <button onClick={handleMovieClick} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold">
              Watch
            </button>
          ) : (
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold">
              Watch S1 E1
            </button>
          )}
        </div>

        {!isMovie && seasons.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
            {seasons.map((season) => (
              <div key={season.season_number} className="mb-4">
                <button
                  onClick={() => toggleSeason(season.season_number)}
                  className="w-full text-left bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  {season.name}
                </button>
                {expandedSeason === season.season_number && episodes[season.season_number] && (
                  <ul className="mt-2 ml-4 border-l border-gray-700 pl-4">
                    {episodes[season.season_number].map((episode) => (
                      <li
                        key={episode.id}
                        className="cursor-pointer text-sm py-1 hover:text-blue-400"
                        onClick={() => handleEpisodeClicktv(season.season_number, episode.episode_number)}
                      >
                       {episode.episode_number}: {episode.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
