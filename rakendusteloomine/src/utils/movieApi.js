// TMDB API Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Validate API key is available
if (!TMDB_API_KEY) {
  console.error(
    'TMDB API Key is not set. Please add VITE_TMDB_API_KEY to your .env file',
  );
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
      throw new Error('Invalid TMDB API response format');
    }

    return data.results
      .filter((movie) => movie.poster_path && movie.backdrop_path)
      .map((movie) => transformTMDBMovie(movie));
  } catch (error) {
    console.error('Error fetching movies from TMDB:', error);
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
      throw new Error('Invalid TMDB API response format');
    }

    return data.results
      .filter((movie) => movie.poster_path && movie.backdrop_path)
      .map((movie) => transformTMDBMovie(movie));
  } catch (error) {
    console.error('Error searching movies:', error);
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
    console.error('Error fetching cast:', error);
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
    return transformTMDBMovie(data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

/**
 * Transform TMDB movie object to CineRate schema
 * @param {Object} tmdbMovie - Raw TMDB movie object
 * @returns {Object} Transformed movie object matching CineRate schema
 */
function transformTMDBMovie(tmdbMovie) {
  const releaseDate = tmdbMovie.release_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';

  // Get primary genre
  let category = 'Unknown';
  if (Array.isArray(tmdbMovie.genres) && tmdbMovie.genres.length > 0) {
    category = tmdbMovie.genres[0].name;
  } else if (tmdbMovie.genre_ids && tmdbMovie.genre_ids.length > 0) {
    // Use genre ID mapping for basic categorization when full genres not available
    category = mapGenreIdToName(tmdbMovie.genre_ids[0]);
  }

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title || 'Unknown Title',
    year: year,
    category: category,
    rating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : 0,
    poster: tmdbMovie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w400${tmdbMovie.poster_path}`
      : 'https://via.placeholder.com/400x600?text=No+Poster',
    backdrop: tmdbMovie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/w1280${tmdbMovie.backdrop_path}`
      : 'https://via.placeholder.com/1280x400?text=No+Backdrop',
    synopsis: tmdbMovie.overview || 'No synopsis available.',
    cast: [], // Will be fetched separately if needed
  };
}

/**
 * Map TMDB genre IDs to genre names (for fallback when genres not available)
 * @param {number} genreId - TMDB genre ID
 * @returns {string} Genre name
 */
function mapGenreIdToName(genreId) {
  const genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
  };

  return genreMap[genreId] || 'Other';
}

/**
 * Test authentication with TMDB API
 * @returns {Promise<boolean>} True if API key is valid
 */
export const testAPIKey = async () => {
  if (!TMDB_API_KEY) {
    console.error('TMDB API Key is not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`,
    );
    return response.ok;
  } catch (error) {
    console.error('API key test failed:', error);
    return false;
  }
};
