import { useContext, useState } from "react";
import { MovieContext } from "../contexts/movieContext";
import { MovieDataContext } from "../contexts/movieDataContext";
import MovieList from "./MovieList";
import styles from "./Profile.module.css";

const Profile = ({ onMovieSelect }) => {
  const { likedMovies, dislikedMovies } = useContext(MovieContext);
  const { getMoviesByIds } = useContext(MovieDataContext);
  const [activeTab, setActiveTab] = useState("likes");

  // Get the actual movie objects for liked/disliked movies
  const likedMovieObjects = getMoviesByIds(likedMovies);
  const dislikedMovieObjects = getMoviesByIds(dislikedMovies);

  const totalMovies = likedMovies.length + dislikedMovies.length;

  return (
    <div className={styles.profile}>
      {/* Profile Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <span className={styles.avatar}>👤</span>
            <div>
              <h1 className={styles.title}>My Profile</h1>
              <p className={styles.subtitle}>
                {totalMovies} movie{totalMovies !== 1 ? "s" : ""} rated
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.container}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "likes" ? styles.active : ""}`}
              onClick={() => setActiveTab("likes")}
            >
              <span className={styles.tabIcon}>♥</span>
              My Favorites ({likedMovies.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "dislikes" ? styles.active : ""}`}
              onClick={() => setActiveTab("dislikes")}
            >
              <span className={styles.tabIcon}>✕</span>
              Not Interested ({dislikedMovies.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === "likes" && (
          <>
            {likedMovieObjects.length === 0 ? (
              <div className={styles.emptyMessage}>
                <span className={styles.emptyIcon}>♥</span>
                <h2>No Favorites Yet</h2>
                <p>Start liking movies to build your favorites list!</p>
              </div>
            ) : (
              <MovieList
                movies={likedMovieObjects}
                onMovieClick={onMovieSelect}
              />
            )}
          </>
        )}

        {activeTab === "dislikes" && (
          <>
            {dislikedMovieObjects.length === 0 ? (
              <div className={styles.emptyMessage}>
                <span className={styles.emptyIcon}>✕</span>
                <h2>No Disliked Movies</h2>
                <p>Mark movies as "Not Interested" to see them here!</p>
              </div>
            ) : (
              <MovieList
                movies={dislikedMovieObjects}
                onMovieClick={onMovieSelect}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
