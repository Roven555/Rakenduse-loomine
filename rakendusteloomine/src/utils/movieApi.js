// API calls go through our backend — no TMDB key needed in the frontend
const API_BASE = "http://localhost:5001/api";

/**
 * Fetch popular movies
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of movie objects
 */
export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE}/movies/popular?page=${page}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

/**
 * Search movies by title
 * @param {string} query - Search query
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of movie objects
 */
export const searchMovies = async (query, page = 1) => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${API_BASE}/movies/search?query=${encodeURIComponent(query)}&page=${page}`,
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};

/**
 * Fetch cast for a specific movie
 * @param {number} movieId - Movie ID
 * @returns {Promise<Array>} Array of cast member objects
 */
export const fetchMovieCast = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE}/movies/${movieId}/cast`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching cast:", error);
    return [];
  }
};

/**
 * Fetch actor details
 * @param {number} actorId - Actor ID
 * @returns {Promise<Object>} Actor details
 */
export const fetchActorDetails = async (actorId) => {
  try {
    const response = await fetch(`${API_BASE}/actors/${actorId}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching actor details:", error);
    throw error;
  }
};

/**
 * Fetch all movies an actor has appeared in
 * @param {number} actorId - Actor ID
 * @returns {Promise<Array>} Array of movie objects
 */
export const fetchActorMovies = async (actorId) => {
  try {
    const response = await fetch(`${API_BASE}/actors/${actorId}/movies`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching actor movies:", error);
    return [];
  }
};

/**
 * Fetch detailed movie information
 * @param {number} movieId - Movie ID
 * @returns {Promise<Object>} Movie object
 */
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE}/movies/${movieId}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

/**
 * Fetch movie runtime
 * @param {number} movieId - Movie ID
 * @returns {Promise<number|null>} Runtime in minutes or null
 */
export const fetchMovieRuntime = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE}/movies/${movieId}/runtime`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.runtime;
  } catch {
    return null;
  }
};

/**
 * Fetch runtimes for multiple movies in batches
 * @param {Array<number>} movieIds - Array of movie IDs
 * @param {function} onBatch - Callback called with {id: runtime} map after each batch
 * @param {number} batchSize - How many to fetch at once (default 8)
 */
export const fetchBatchRuntimes = async (movieIds, onBatch, batchSize = 8) => {
  for (let i = 0; i < movieIds.length; i += batchSize) {
    const batch = movieIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (id) => {
        const runtime = await fetchMovieRuntime(id);
        return { id, runtime };
      }),
    );

    const runtimeMap = {};
    results.forEach(({ id, runtime }) => {
      if (runtime) runtimeMap[id] = runtime;
    });

    if (Object.keys(runtimeMap).length > 0) {
      onBatch(runtimeMap);
    }
  }
};

/**
 * Fetch movie trailer
 * @param {number} movieId - Movie ID
 * @returns {Promise<string|null>} YouTube video key or null
 */
export const fetchMovieTrailer = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE}/movies/${movieId}/trailer`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.key;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
};

/**
 * Test API connection
 * @returns {Promise<boolean>} True if backend is reachable
 */
export const testAPIKey = async () => {
  try {
    const response = await fetch(`${API_BASE}/movies/popular?page=1`);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Fetch popular actors
 * @param {number} page - Page number
 * @returns {Promise<{actors: Array, totalPages: number}>}
 */
export const fetchPopularActors = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE}/actors/popular?page=${page}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching popular actors:", error);
    return { actors: [], totalPages: 1 };
  }
};

/**
 * Search actors by name
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<{actors: Array, totalPages: number}>}
 */
export const searchActors = async (query, page = 1) => {
  if (!query.trim()) return { actors: [], totalPages: 1 };

  try {
    const response = await fetch(
      `${API_BASE}/actors/search?query=${encodeURIComponent(query)}&page=${page}`,
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching actors:", error);
    return { actors: [], totalPages: 1 };
  }
};
