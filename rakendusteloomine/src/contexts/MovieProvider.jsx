import { useState } from "react";
import { MovieContext } from "./movieContext";

export const MovieProvider = ({ children }) => {
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);

  const toggleLike = (movieId) => {
    setLikedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : prev
            .filter((id) => !dislikedMovies.includes(id) || id !== movieId)
            .concat(movieId),
    );
    setDislikedMovies((prev) => prev.filter((id) => id !== movieId));
  };

  const toggleDislike = (movieId) => {
    setDislikedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : prev
            .filter((id) => !likedMovies.includes(id) || id !== movieId)
            .concat(movieId),
    );
    setLikedMovies((prev) => prev.filter((id) => id !== movieId));
  };

  const isLiked = (movieId) => likedMovies.includes(movieId);
  const isDisliked = (movieId) => dislikedMovies.includes(movieId);

  return (
    <MovieContext.Provider
      value={{
        likedMovies,
        dislikedMovies,
        toggleLike,
        toggleDislike,
        isLiked,
        isDisliked,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
