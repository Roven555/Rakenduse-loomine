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
 * @returns {Promise<Array>} Array of cast member objects { id, name, character, photo }
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

    // Return top 10 cast members with full info
    return data.cast.slice(0, 10).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character || "",
      photo: member.profile_path
        ? `${TMDB_IMAGE_BASE_URL}/w185${member.profile_path}`
        : null,
    }));
  } catch (error) {
    console.error("Error fetching cast:", error);
    return [];
  }
};

/**
 * Fetch actor details from TMDB
 * @param {number} actorId - TMDB person ID
 * @returns {Promise<Object>} Actor details { id, name, photo, biography, birthday, placeOfBirth }
 */
export const fetchActorDetails = async (actorId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${actorId}?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const biography = data.biography
      ? await translateToEstonian(data.biography.substring(0, 1000))
      : "Biograafia puudub.";

    return {
      id: data.id,
      name: data.name,
      photo: data.profile_path
        ? `${TMDB_IMAGE_BASE_URL}/w400${data.profile_path}`
        : null,
      biography,
      birthday: data.birthday || null,
      placeOfBirth: data.place_of_birth || null,
    };
  } catch (error) {
    console.error("Error fetching actor details:", error);
    throw error;
  }
};

/**
 * Fetch all movies an actor has appeared in
 * @param {number} actorId - TMDB person ID
 * @returns {Promise<Array>} Array of transformed movie objects
 */
export const fetchActorMovies = async (actorId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/${actorId}/movie_credits?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.cast || !Array.isArray(data.cast)) {
      return [];
    }

    // Filter movies with posters and sort by popularity
    const movies = data.cast
      .filter((movie) => movie.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 30)
      .map((movie) => transformTMDBMovie(movie));

    await Promise.all(
      movies.map(async (movie) => {
        movie.synopsis = await translateToEstonian(movie.synopsis);
      }),
    );

    return movies;
  } catch (error) {
    console.error("Error fetching actor movies:", error);
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
 * Fetch movie runtime from TMDB
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<number|null>} Runtime in minutes or null
 */
export const fetchMovieRuntime = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.runtime || null;
  } catch {
    return null;
  }
};

/**
 * Fetch runtimes for multiple movies in batches
 * @param {Array<number>} movieIds - Array of TMDB movie IDs
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
 * Fetch movie trailer from TMDB
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<string|null>} YouTube video key or null
 */
export const fetchMovieTrailer = async (movieId) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return null;
    }

    // Find official trailer first, then any trailer, then any teaser
    const trailer =
      data.results.find(
        (v) => v.site === "YouTube" && v.type === "Trailer" && v.official,
      ) ||
      data.results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
      data.results.find((v) => v.site === "YouTube" && v.type === "Teaser");

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
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
    runtime: tmdbMovie.runtime || null,
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

/**
 * Fetch popular actors from TMDB
 * @param {number} page - Page number for pagination
 * @returns {Promise<{actors: Array, totalPages: number}>}
 */
export const fetchPopularActors = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    const actors = (data.results || []).map((person) => ({
      id: person.id,
      name: person.name,
      photo: person.profile_path
        ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
        : null,
      knownFor: (person.known_for || [])
        .filter((item) => item.title)
        .map((item) => item.title)
        .slice(0, 3),
    }));

    return { actors, totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error("Error fetching popular actors:", error);
    return { actors: [], totalPages: 1 };
  }
};

/**
 * Search actors by name from TMDB
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<{actors: Array, totalPages: number}>}
 */
export const searchActors = async (query, page = 1) => {
  if (!query.trim()) return { actors: [], totalPages: 1 };

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`,
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    const actors = (data.results || [])
      .filter((person) => person.known_for_department === "Acting")
      .map((person) => ({
        id: person.id,
        name: person.name,
        photo: person.profile_path
          ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
          : null,
        knownFor: (person.known_for || [])
          .filter((item) => item.title)
          .map((item) => item.title)
          .slice(0, 3),
      }));

    return { actors, totalPages: data.total_pages || 1 };
  } catch (error) {
    console.error("Error searching actors:", error);
    return { actors: [], totalPages: 1 };
  }
};
