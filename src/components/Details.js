import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Details = () => {
  const location = useLocation();
  const { details } = location.state || {}; // Retrieve passed details
  console.log(JSON.stringify(details));
  
  const isMovie = details?.media_type === "movie";
  const navigate = useNavigate();

  const [seasons, setSeasons] = useState([]);
  const [expandedSeason, setExpandedSeason] = useState(null);
  const [episodes, setEpisodes] = useState({});

  useEffect(() => {
    if (details && details.media_type === "tv") {
      fetch(
        `https://api.themoviedb.org/3/tv/${details.id}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&append_to_response=seasons`
      )
        .then((response) => response.json())
        .then((data) => {
          setSeasons(data.seasons || []);
        })
        .catch((error) => console.error("Error fetching seasons:", error));
    }
  }, [details]);

  useEffect(() => {
    const handleBackButton = () => {
      navigate("/");
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [navigate]);

  const toggleSeason = (seasonNumber) => {
    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null);
      return;
    }

    setExpandedSeason(seasonNumber);

    if (!episodes[seasonNumber]) {
      fetch(
        `https://api.themoviedb.org/3/tv/${details.id}/season/${seasonNumber}?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          setEpisodes((prev) => ({ ...prev, [seasonNumber]: data.episodes }));
        })
        .catch((error) => console.error("Error fetching episodes:", error));
    }
  };

  const handleEpisodeClicktv = (seasonNumber, episodeNumber) => {
    navigate("/play", {
      state: {
        details: {
          tmdb_id: details.id,
          season: seasonNumber,
          episode: episodeNumber,
          type: "tv",
        },
        backObj: details,
      },
    });
  };

  const handleMovieClick = () => {
    navigate("/play", {
      state: { details: { tmdb_id: details.id, type: "movie" }, backObj: details },
    });
  };

  if (!details) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <button
          className="absolute top-4 left-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          onClick={() => navigate("/")}
        >
          Back
        </button>
        <p className="text-lg">No details available. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        onClick={() => navigate("/")}
      >
        Back
      </button>

      {/* Backdrop Image */}
      <div className="relative w-full h-[60vh] overflow-hidden">
        <img
          src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
          alt={details.title || details.name}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto -mt-80 md:-mt-40 p-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          {details.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
              alt={details.title || details.name}
              className="w-48 md:w-60 rounded-xl shadow-lg"
            />
          )}

          {/* Text Info */}
          <div className="flex flex-col justify-end">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              {details.title || details.name}
            </h1>
            <p className="text-neutral-300 text-sm md:text-base max-w-2xl mb-4">
              {details.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mb-6">
              {details.release_date && <span>📅 {details.release_date}</span>}
              {details.vote_average && (
                <span>⭐ {details.vote_average.toFixed(1)} / 10</span>
              )}
              {details.original_language && (
                <span>🌐 {details.original_language.toUpperCase()}</span>
              )}
            </div>

            <div>
              {isMovie ? (
                <button
                  onClick={handleMovieClick}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition"
                >
                  ▶ Watch Movie
                </button>
              ) : (
                <button
                  onClick={() => handleEpisodeClicktv(1, 1)}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white transition"
                >
                  ▶ Watch S1 E1
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TV Seasons */}
        {!isMovie && seasons.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
            {seasons.map((season) => (
              <div key={season.season_number} className="mb-4">
                <button
                  onClick={() => toggleSeason(season.season_number)}
                  className="w-full text-left bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg font-semibold"
                >
                  {season.name}
                </button>

                {expandedSeason === season.season_number &&
                  episodes[season.season_number] && (
                    <ul className="mt-2 ml-4 border-l border-neutral-700 pl-4">
                      {episodes[season.season_number].map((episode) => (
                        <li
                          key={episode.id}
                          className="cursor-pointer text-sm py-1 hover:text-red-400"
                          onClick={() =>
                            handleEpisodeClicktv(
                              season.season_number,
                              episode.episode_number
                            )
                          }
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
