const express = require('express');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

if (!TMDB_API_KEY) {
  console.error('TMDB_API_KEY is not set in config.env');
}

// Translation cache
const translationCache = new Map();

async function translateToEstonian(text) {
  if (!text) return 'Süžee puudub.';
  if (translationCache.has(text)) return translationCache.get(text);

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=et&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    const translated = data[0].map((segment) => segment[0]).join('');
    translationCache.set(text, translated);
    return translated;
  } catch {
    return text;
  }
}

// Genre mappings
const genreNameToEstonian = {
  Action: 'Põnevus', Adventure: 'Seiklus', Animation: 'Animatsioon',
  Comedy: 'Komöödia', Crime: 'Krimi', Documentary: 'Dokumentaal',
  Drama: 'Draama', Family: 'Pere', Fantasy: 'Fantaasia',
  History: 'Ajalugu', Horror: 'Õudus', Music: 'Muusika',
  Mystery: 'Müsteerium', Romance: 'Romantika', 'Science Fiction': 'Ulme',
  'TV Movie': 'Telefilm', Thriller: 'Põnevik', War: 'Sõda', Western: 'Vestern',
};

const genreIdToName = {
  28: 'Põnevus', 12: 'Seiklus', 16: 'Animatsioon', 35: 'Komöödia',
  80: 'Krimi', 99: 'Dokumentaal', 18: 'Draama', 10751: 'Pere',
  14: 'Fantaasia', 36: 'Ajalugu', 27: 'Õudus', 10402: 'Muusika',
  9648: 'Müsteerium', 10749: 'Romantika', 878: 'Ulme',
  10770: 'Telefilm', 53: 'Põnevik', 10752: 'Sõda', 37: 'Vestern',
};

function transformTMDBMovie(tmdbMovie) {
  const releaseDate = tmdbMovie.release_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'Unknown';

  let categories = [];
  if (Array.isArray(tmdbMovie.genres) && tmdbMovie.genres.length > 0) {
    categories = tmdbMovie.genres.map((g) => genreNameToEstonian[g.name] || g.name);
  } else if (tmdbMovie.genre_ids && tmdbMovie.genre_ids.length > 0) {
    categories = tmdbMovie.genre_ids.map((id) => genreIdToName[id] || 'Muu');
  }

  if (categories.length === 0) categories = ['Tundmatu'];

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title || 'Tundmatu pealkiri',
    year,
    category: categories[0],
    categories,
    rating: tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : 0,
    poster: tmdbMovie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w400${tmdbMovie.poster_path}`
      : 'https://via.placeholder.com/400x600?text=No+Poster',
    backdrop: tmdbMovie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/w1280${tmdbMovie.backdrop_path}`
      : 'https://via.placeholder.com/1280x400?text=No+Backdrop',
    synopsis: tmdbMovie.overview || 'Süžee puudub.',
    runtime: tmdbMovie.runtime || null,
    cast: [],
  };
}

async function tmdbFetch(path) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${TMDB_BASE_URL}${path}${separator}api_key=${TMDB_API_KEY}`);
  if (!response.ok) {
    const err = new Error(`TMDB API error: ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

// GET /api/movies/popular?page=1
router.get('/movies/popular', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdbFetch(`/discover/movie?sort_by=popularity.desc&page=${page}&include_adult=false&language=en-US&region=US`);

    const movies = (data.results || [])
      .filter((m) => m.poster_path && m.backdrop_path)
      .map((m) => transformTMDBMovie(m));

    await Promise.all(movies.map(async (movie) => {
      movie.synopsis = await translateToEstonian(movie.synopsis);
    }));

    res.json(movies);
  } catch (error) {
    console.error('Error fetching popular movies:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/movies/search?query=...&page=1
router.get('/movies/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query || !query.trim()) return res.json([]);

    const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&page=${page}&language=en-US`);

    const movies = (data.results || [])
      .filter((m) => m.poster_path && m.backdrop_path)
      .map((m) => transformTMDBMovie(m));

    await Promise.all(movies.map(async (movie) => {
      movie.synopsis = await translateToEstonian(movie.synopsis);
    }));

    res.json(movies);
  } catch (error) {
    console.error('Error searching movies:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/movies/:id
router.get('/movies/:id', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}?language=en-US`);
    const movie = transformTMDBMovie(data);
    movie.synopsis = await translateToEstonian(movie.synopsis);
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/movies/:id/cast
router.get('/movies/:id/cast', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/credits?language=en-US`);

    const cast = (data.cast || []).slice(0, 10).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character || '',
      photo: member.profile_path
        ? `${TMDB_IMAGE_BASE_URL}/w185${member.profile_path}`
        : null,
    }));

    res.json(cast);
  } catch (error) {
    console.error('Error fetching cast:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/movies/:id/runtime
router.get('/movies/:id/runtime', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}?language=en-US`);
    res.json({ runtime: data.runtime || null });
  } catch {
    res.json({ runtime: null });
  }
});

// GET /api/movies/:id/trailer
router.get('/movies/:id/trailer', async (req, res) => {
  try {
    const data = await tmdbFetch(`/movie/${req.params.id}/videos?language=en-US`);
    const results = data.results || [];

    const trailer =
      results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
      results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
      results.find((v) => v.site === 'YouTube' && v.type === 'Teaser');

    res.json({ key: trailer ? trailer.key : null });
  } catch {
    res.json({ key: null });
  }
});

// GET /api/actors/popular?page=1
router.get('/actors/popular', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdbFetch(`/person/popular?language=en-US&page=${page}`);

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

    res.json({ actors, totalPages: data.total_pages || 1 });
  } catch (error) {
    console.error('Error fetching popular actors:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/actors/search?query=...&page=1
router.get('/actors/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query || !query.trim()) return res.json({ actors: [], totalPages: 1 });

    const data = await tmdbFetch(`/search/person?query=${encodeURIComponent(query)}&page=${page}&language=en-US`);

    const actors = (data.results || [])
      .filter((person) => person.known_for_department === 'Acting')
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

    res.json({ actors, totalPages: data.total_pages || 1 });
  } catch (error) {
    console.error('Error searching actors:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/actors/:id
router.get('/actors/:id', async (req, res) => {
  try {
    const data = await tmdbFetch(`/person/${req.params.id}?language=en-US`);
    const biography = data.biography
      ? await translateToEstonian(data.biography.substring(0, 1000))
      : 'Biograafia puudub.';

    res.json({
      id: data.id,
      name: data.name,
      photo: data.profile_path
        ? `${TMDB_IMAGE_BASE_URL}/w400${data.profile_path}`
        : null,
      biography,
      birthday: data.birthday || null,
      placeOfBirth: data.place_of_birth || null,
    });
  } catch (error) {
    console.error('Error fetching actor details:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

// GET /api/actors/:id/movies
router.get('/actors/:id/movies', async (req, res) => {
  try {
    const data = await tmdbFetch(`/person/${req.params.id}/movie_credits?language=en-US`);

    const movies = (data.cast || [])
      .filter((m) => m.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 30)
      .map((m) => transformTMDBMovie(m));

    await Promise.all(movies.map(async (movie) => {
      movie.synopsis = await translateToEstonian(movie.synopsis);
    }));

    res.json(movies);
  } catch (error) {
    console.error('Error fetching actor movies:', error.message);
    res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
