// TMDB API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Validate API key is available
if (!TMDB_API_KEY) {
  console.error(
    "TMDB API Key is not set. Please add VITE_TMDB_API_KEY to your .env file",
  );
}

// Translation cache to avoid repeated translations
const translationCache = new Map();

async function translateToEstonian(text) {
  if (!text) return "Süžee puudub.";
  if (translationCache.has(text)) return translationCache.get(text);

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=et&dt=t&q=${encodeURIComponent(text)}`,
    );
    const data = await response.json();
    const translated = data[0].map((segment) => segment[0]).join("");
    translationCache.set(text, translated);
    return translated;
  } catch {
    return text;
  }
}

/**
 * Fetch popular movies from TMDB
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of transformed movie objects
 */
export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}&include_adult=false&language=en-US&region=US`,
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid TMDB API response format");
    }

    const movies = data.results
      .filter((movie) => movie.poster_path && movie.backdrop_path)
      .map((movie) => transformTMDBMovie(movie));

    // Translate all synopses in parallel
    await Promise.all(
      movies.map(async (movie) => {
        movie.synopsis = await translateToEstonian(movie.synopsis);
      }),
    );

    return movies;
  } catch (error) {
    console.error("Error fetching movies from TMDB:", error);
    throw error;
  }
};

/**
 * Search movies by title
 * @param {string} query - Search query
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of transformed movie objects
 */
export const searchMovies = async (query, page = 1) => {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid TMDB API response format");
    }

    const movies = data.results
      .filter((movie) => movie.poster_path && movie.backdrop_path)
      .map((movie) => transformTMDBMovie(movie));

    await Promise.all(
      movies.map(async (movie) => {
        movie.synopsis = await translateToEstonian(movie.synopsis);
      }),
    );

    return movies;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};

/**
 * Fetch cast for a specific movie
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Array>} Array of cast member names
 */
export const fetchMovieCast = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.cast || !Array.isArray(data.cast)) {
      return [];
    }

    // Return top 10 cast members
    return data.cast.slice(0, 10).map((member) => member.name);
  } catch (error) {
    console.error("Error fetching cast:", error);
    return [];
  }
};

/**
 * Fetch detailed movie information
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Object>} Detailed movie object with genres
 */
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const movie = transformTMDBMovie(data);
    movie.synopsis = await translateToEstonian(movie.synopsis);
    return movie;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

/**
 * Transform TMDB movie object to CineRate schema
 * @param {Object} tmdbMovie - Raw TMDB movie object
 * @returns {Object} Transformed movie object matching CineRate schema
 */
function transformTMDBMovie(tmdbMovie) {
  const releaseDate = tmdbMovie.release_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown";

  // Get all genres for this movie
  let categories = [];
  if (Array.isArray(tmdbMovie.genres) && tmdbMovie.genres.length > 0) {
    categories = tmdbMovie.genres.map((g) => mapGenreNameToEstonian(g.name));
  } else if (tmdbMovie.genre_ids && tmdbMovie.genre_ids.length > 0) {
    categories = tmdbMovie.genre_ids.map((id) => mapGenreIdToName(id));
  }

  if (categories.length === 0) {
    categories = ["Tundmatu"];
  }

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title || "Tundmatu pealkiri",
    year: year,
    category: categories[0],
    categories: categories,
    rating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : 0,
    poster: tmdbMovie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w400${tmdbMovie.poster_path}`
      : "https://via.placeholder.com/400x600?text=No+Poster",
    backdrop: tmdbMovie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/w1280${tmdbMovie.backdrop_path}`
      : "https://via.placeholder.com/1280x400?text=No+Backdrop",
    synopsis: tmdbMovie.overview || "Süžee puudub.",
    cast: [],
  };
}

/**
 * Map English genre name to Estonian (for when TMDB returns full genre objects)
 */
function mapGenreNameToEstonian(name) {
  const nameMap = {
    Action: "Põnevus",
    Adventure: "Seiklus",
    Animation: "Animatsioon",
    Comedy: "Komöödia",
    Crime: "Krimi",
    Documentary: "Dokumentaal",
    Drama: "Draama",
    Family: "Pere",
    Fantasy: "Fantaasia",
    History: "Ajalugu",
    Horror: "Õudus",
    Music: "Muusika",
    Mystery: "Müsteerium",
    Romance: "Romantika",
    "Science Fiction": "Ulme",
    "TV Movie": "Telefilm",
    Thriller: "Põnevik",
    War: "Sõda",
    Western: "Vestern",
  };
  return nameMap[name] || name;
}

/**
 * Map TMDB genre IDs to genre names (for fallback when genres not available)
 * @param {number} genreId - TMDB genre ID
 * @returns {string} Genre name
 */
function mapGenreIdToName(genreId) {
  const genreMap = {
    28: "Põnevus",
    12: "Seiklus",
    16: "Animatsioon",
    35: "Komöödia",
    80: "Krimi",
    99: "Dokumentaal",
    18: "Draama",
    10751: "Pere",
    14: "Fantaasia",
    36: "Ajalugu",
    27: "Õudus",
    10402: "Muusika",
    9648: "Müsteerium",
    10749: "Romantika",
    878: "Ulme",
    10770: "Telefilm",
    53: "Põnevik",
    10752: "Sõda",
    37: "Vestern",
  };

  return genreMap[genreId] || "Muu";
}

/**
 * Test authentication with TMDB API
 * @returns {Promise<boolean>} True if API key is valid
 */
export const testAPIKey = async () => {
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key is not configured");
    return false;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`,
    );
    return response.ok;
  } catch (error) {
    console.error("API key test failed:", error);
    return false;
  }
};
