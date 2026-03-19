import { useState, useCallback } from "react";
import { MovieDataContext } from "./movieDataContext";

export const MovieDataProvider = ({ children }) => {
  const [movies, setMovies] = useState(new Map());

  const cacheMovies = useCallback((movieArray) => {
    setMovies((prevMap) => {
      const newMap = new Map(prevMap);
      movieArray.forEach((movie) => {
        newMap.set(movie.id, movie);
      });
      return newMap;
    });
  }, []);

  const getMovieById = useCallback(
    (movieId) => {
      return movies.get(movieId);
    },
    [movies],
  );

  const getMoviesByIds = useCallback(
    (movieIds) => {
      return movieIds
        .map((id) => movies.get(id))
        .filter((movie) => movie !== undefined);
    },
    [movies],
  );

  return (
    <MovieDataContext.Provider
      value={{
        cacheMovies,
        getMovieById,
        getMoviesByIds,
        allMovies: movies,
      }}
    >
      {children}
    </MovieDataContext.Provider>
  );
};
