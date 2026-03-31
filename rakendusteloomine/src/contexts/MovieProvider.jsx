import { useState, useEffect, useCallback } from "react";
import { MovieContext } from "./movieContext";
import { getProfile, updatePreferences, isAuthenticated } from "../utils/auth";

export const MovieProvider = ({ children }) => {
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const savePreferences = async (likes, dislikes, watch) => {
    try {
      console.log("Saving preferences to backend:", { likes, dislikes, watch });
      const response = await updatePreferences({
        likedMovies: likes,
        dislikedMovies: dislikes,
        watchlist: watch,
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("Preferences save failed:", response.status, errText);
      } else {
        console.log("Preferences saved successfully");
      }
    } catch (error) {
      console.error("Preferences update failed:", error);
    }
  };

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      setProfileLoaded(true);
      return;
    }

    try {
      const response = await getProfile();
      if (!response.ok) {
        setProfileLoaded(true);
        return;
      }

      const data = await response.json();
      const user = data.user || {};
      setLikedMovies(user.likedMovies || []);
      setDislikedMovies(user.dislikedMovies || []);
      setWatchlist(user.watchlist || []);
    } catch (error) {
      console.error("Profile load error:", error);
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadProfile();

    const onAuthChange = () => {
      setProfileLoaded(false);
      loadProfile();
    };

    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, [loadProfile]);

  useEffect(() => {
    if (!profileLoaded || !isAuthenticated()) return;
    savePreferences(likedMovies, dislikedMovies, watchlist);
  }, [likedMovies, dislikedMovies, watchlist, profileLoaded]);

  const toggleLike = (movieId) => {
    setLikedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : prev
            .filter((id) => id !== movieId)
            .concat(movieId),
    );
    setDislikedMovies((prev) => prev.filter((id) => id !== movieId));
  };

  const toggleDislike = (movieId) => {
    setDislikedMovies((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : prev
            .filter((id) => id !== movieId)
            .concat(movieId),
    );
    setLikedMovies((prev) => prev.filter((id) => id !== movieId));
  };

  const toggleWatchlist = (movieId) => {
    setWatchlist((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId],
    );
  };

  const isLiked = (movieId) => likedMovies.includes(movieId);
  const isDisliked = (movieId) => dislikedMovies.includes(movieId);
  const isInWatchlist = (movieId) => watchlist.includes(movieId);

  return (
    <MovieContext.Provider
      value={{
        likedMovies,
        dislikedMovies,
        watchlist,
        toggleLike,
        toggleDislike,
        toggleWatchlist,
        isLiked,
        isDisliked,
        isInWatchlist,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
