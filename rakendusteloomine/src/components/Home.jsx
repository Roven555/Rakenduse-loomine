import { useReducer, useEffect, useContext } from "react";
import SearchBar from "./SearchBar";
import FilterPills from "./FilterPills";
import SortSelect from "./SortSelect";
import RandomMoviePicker from "./RandomMoviePicker";
import MovieList from "./MovieList";
import styles from "./Home.module.css";
import { fetchPopularMovies, searchMovies } from "../utils/movieApi";
import { MovieDataContext } from "../contexts/movieDataContext";

// Initial state for useReducer
const initialState = {
  movies: [],
  filteredMovies: [],
  searchQuery: "",
  activeCategory: "Kõik",
  activeSort: "popularity",
  isLoading: true,
  error: null,
  currentPage: 1,
  isLoadingMore: false,
  hasMoreMovies: true,
};

// Reducer function to handle complex state logic
const movieReducer = (state, action) => {
  switch (action.type) {
    case "SET_MOVIES": {
      const filtered = filterMovies(
        action.payload,
        state.searchQuery,
        state.activeCategory,
      );
      return {
        ...state,
        movies: action.payload,
        filteredMovies: sortMovies(filtered, state.activeSort),
        isLoading: false,
        error: null,
      };
    }

    case "SET_SEARCH_QUERY": {
      const query = action.payload.toLowerCase();
      const filtered = filterMovies(state.movies, query, state.activeCategory);
      return {
        ...state,
        searchQuery: action.payload,
        filteredMovies: sortMovies(filtered, state.activeSort),
      };
    }

    case "SET_CATEGORY": {
      const filtered = filterMovies(
        state.movies,
        state.searchQuery,
        action.payload,
      );
      return {
        ...state,
        activeCategory: action.payload,
        filteredMovies: sortMovies(filtered, state.activeSort),
      };
    }

    case "SET_SORT": {
      const filtered = filterMovies(
        state.movies,
        state.searchQuery,
        state.activeCategory,
      );
      return {
        ...state,
        activeSort: action.payload,
        filteredMovies: sortMovies(filtered, action.payload),
      };
    }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_LOADING_MORE":
      return {
        ...state,
        isLoadingMore: action.payload,
      };

    case "ADD_MOVIES": {
      const newMovies = [...state.movies, ...action.payload];
      const filtered = filterMovies(
        newMovies,
        state.searchQuery,
        state.activeCategory,
      );
      return {
        ...state,
        movies: newMovies,
        filteredMovies: sortMovies(filtered, state.activeSort),
        currentPage:
          action.payload.length > 0 ? state.currentPage + 1 : state.currentPage,
        isLoadingMore: false,
        hasMoreMovies: action.payload.length > 0,
      };
    }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isLoadingMore: false,
      };

    default:
      return state;
  }
};

// Helper function to sort movies
const sortMovies = (movies, sortBy) => {
  const sorted = [...movies];
  switch (sortBy) {
    case "rating-desc":
      return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    case "rating-asc":
      return sorted.sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
    case "year-desc":
      return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    case "year-asc":
      return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "et"));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title, "et"));
    case "popularity":
    default:
      return sorted;
  }
};

// Helper function to filter movies
const filterMovies = (movies, searchQuery, category) => {
  return movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery);
    const matchesCategory =
      category === "Kõik" ||
      (movie.categories && movie.categories.includes(category)) ||
      movie.category === category;
    return matchesSearch && matchesCategory;
  });
};

// Get unique categories from movies
const getCategories = (movies) => {
  const categories = ["Kõik"];
  const unique = new Set();
  movies.forEach((m) => {
    if (m.categories) {
      m.categories.forEach((c) => unique.add(c));
    } else if (m.category) {
      unique.add(m.category);
    }
  });
  return [...categories, ...Array.from(unique).sort()];
};

const Home = ({ onMovieSelect }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);
  const { cacheMovies } = useContext(MovieDataContext);

  // useEffect to fetch movies on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        // Fetch 10 pages (200 movies) on initial load for better selection
        const pages = await Promise.all(
          Array.from({ length: 10 }, (_, i) => fetchPopularMovies(i + 1)),
        );
        // Deduplicate movies by ID
        const seen = new Set();
        const allMovies = pages.flat().filter((movie) => {
          if (seen.has(movie.id)) return false;
          seen.add(movie.id);
          return true;
        });
        cacheMovies(allMovies);
        dispatch({ type: "SET_MOVIES", payload: allMovies });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err.message || "Failed to load movies",
        });
      }
    };

    fetchMovies();
  }, [cacheMovies]);

  const handleSearchChange = async (query) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });

    // If query is empty, reload popular movies
    if (!query || query.trim().length === 0) {
      try {
        const movies = await fetchPopularMovies(1);
        cacheMovies(movies);
        dispatch({ type: "SET_MOVIES", payload: movies });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err.message || "Failed to load movies",
        });
      }
    } else {
      // Search for movies matching the query
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const results = await searchMovies(query, 1);
        cacheMovies(results);
        dispatch({ type: "SET_MOVIES", payload: results });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: err.message || "Search failed",
        });
      }
    }
  };

  const handleCategoryChange = (category) => {
    dispatch({ type: "SET_CATEGORY", payload: category });
  };

  const handleSortChange = (sortBy) => {
    dispatch({ type: "SET_SORT", payload: sortBy });
  };

  const handleMovieClick = (movieId) => {
    onMovieSelect(movieId);
  };

  const handleLoadMore = async () => {
    try {
      dispatch({ type: "SET_LOADING_MORE", payload: true });
      const nextPage = state.currentPage + 1;
      const newMovies = await fetchPopularMovies(nextPage);
      cacheMovies(newMovies);
      dispatch({ type: "ADD_MOVIES", payload: newMovies });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err.message || "Failed to load more movies",
      });
    }
  };

  if (state.isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Filmide laadimine...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.errorContainer}>
        <p>Viga: {state.error}</p>
      </div>
    );
  }

  const categories = getCategories(state.movies);

  return (
    <div className={styles.home}>
      <SearchBar
        searchQuery={state.searchQuery}
        onSearchChange={handleSearchChange}
      />
      <FilterPills
        categories={categories}
        activeCategory={state.activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <RandomMoviePicker
        movies={state.movies}
        categories={categories}
        onMovieClick={handleMovieClick}
      />
      <div className={styles.toolbar}>
        <div className={styles.resultInfo}>
          {state.filteredMovies.length > 0 && (
            <p>
              Leitud <strong>{state.filteredMovies.length}</strong> film
              {state.filteredMovies.length !== 1 ? "i" : ""}
            </p>
          )}
        </div>
        <SortSelect
          activeSort={state.activeSort}
          onSortChange={handleSortChange}
        />
      </div>
      <MovieList
        movies={state.filteredMovies}
        onMovieClick={handleMovieClick}
      />
      {state.hasMoreMovies && !state.searchQuery && (
        <div className={styles.loadMoreContainer}>
          <button
            className={styles.loadMoreBtn}
            onClick={handleLoadMore}
            disabled={state.isLoadingMore}
          >
            {state.isLoadingMore
              ? "Laadin veel filme..."
              : "Laadi rohkem filme"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
