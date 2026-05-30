const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim();
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const genreIdToName = {
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

const genreNameToEstonian = {
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

const addApiKey = (path) => {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key puudub. Lisa VITE_TMDB_API_KEY .env faili.");
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${TMDB_BASE_URL}${path}${separator}api_key=${TMDB_API_KEY}`;
};

const tmdbFetch = async (path) => {
  const response = await fetch(addApiKey(path));
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  return response.json();
};

const getCategories = (tmdbMovie) => {
  if (Array.isArray(tmdbMovie.genres) && tmdbMovie.genres.length > 0) {
    return tmdbMovie.genres.map((genre) => genreNameToEstonian[genre.name] || genre.name);
  }

  if (Array.isArray(tmdbMovie.genre_ids) && tmdbMovie.genre_ids.length > 0) {
    return tmdbMovie.genre_ids.map((id) => genreIdToName[id] || "Muu");
  }

  return ["Tundmatu"];
};

const transformMovie = (tmdbMovie) => {
  const releaseDate = tmdbMovie.release_date || "";
  const categories = getCategories(tmdbMovie);

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title || "Tundmatu pealkiri",
    year: releaseDate ? new Date(releaseDate).getFullYear() : "Unknown",
    category: categories[0],
    categories,
    rating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : "0",
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
};

export const fetchPopularMovies = async (page = 1) => {
  const data = await tmdbFetch(
    `/discover/movie?sort_by=popularity.desc&page=${page}&include_adult=false&language=en-US&region=US`,
  );

  return (data.results || [])
    .filter((movie) => movie.poster_path && movie.backdrop_path)
    .map(transformMovie);
};

export const searchMovies = async (query, page = 1) => {
  if (!query.trim()) return [];

  const data = await tmdbFetch(
    `/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=en-US`,
  );

  return (data.results || [])
    .filter((movie) => movie.poster_path && movie.backdrop_path)
    .map(transformMovie);
};

export const fetchMovieCast = async (movieId) => {
  try {
    const data = await tmdbFetch(`/movie/${movieId}/credits?language=en-US`);

    return (data.cast || []).slice(0, 10).map((member) => ({
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

export const fetchActorDetails = async (actorId) => {
  const data = await tmdbFetch(`/person/${actorId}?language=en-US`);

  return {
    id: data.id,
    name: data.name,
    photo: data.profile_path ? `${TMDB_IMAGE_BASE_URL}/w400${data.profile_path}` : null,
    biography: data.biography || "Biograafia puudub.",
    birthday: data.birthday || null,
    placeOfBirth: data.place_of_birth || null,
  };
};

export const fetchActorMovies = async (actorId) => {
  try {
    const data = await tmdbFetch(`/person/${actorId}/movie_credits?language=en-US`);

    return (data.cast || [])
      .filter((movie) => movie.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 30)
      .map(transformMovie);
  } catch (error) {
    console.error("Error fetching actor movies:", error);
    return [];
  }
};

export const fetchMovieDetails = async (movieId) => {
  const data = await tmdbFetch(`/movie/${movieId}?language=en-US`);
  return transformMovie(data);
};

export const fetchMovieRuntime = async (movieId) => {
  try {
    const data = await tmdbFetch(`/movie/${movieId}?language=en-US`);
    return data.runtime || null;
  } catch {
    return null;
  }
};

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

export const fetchMovieTrailer = async (movieId) => {
  try {
    const data = await tmdbFetch(`/movie/${movieId}/videos?language=en-US`);
    const results = data.results || [];
    const trailer =
      results.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ||
      results.find((video) => video.site === "YouTube" && video.type === "Trailer") ||
      results.find((video) => video.site === "YouTube" && video.type === "Teaser");

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
};

export const testAPIKey = async () => {
  try {
    const response = await fetch(addApiKey("/movie/popular?page=1"));
    return response.ok;
  } catch {
    return false;
  }
};

export const fetchPopularActors = async (page = 1) => {
  try {
    const data = await tmdbFetch(`/person/popular?language=en-US&page=${page}`);

    const actors = (data.results || []).map((person) => ({
      id: person.id,
      name: person.name,
      photo: person.profile_path ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}` : null,
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

export const searchActors = async (query, page = 1) => {
  if (!query.trim()) return { actors: [], totalPages: 1 };

  try {
    const data = await tmdbFetch(
      `/search/person?query=${encodeURIComponent(query)}&page=${page}&language=en-US`,
    );

    const actors = (data.results || [])
      .filter((person) => person.known_for_department === "Acting")
      .map((person) => ({
        id: person.id,
        name: person.name,
        photo: person.profile_path ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}` : null,
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
