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
              <h1 className={styles.title}>Minu Profiil</h1>
              <p className={styles.subtitle}>
                {totalMovies} film{totalMovies !== 1 ? "i" : ""} hinnatud
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
              Lemmikud ({likedMovies.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "dislikes" ? styles.active : ""}`}
              onClick={() => setActiveTab("dislikes")}
            >
              <span className={styles.tabIcon}>✕</span>
              Ei huvita ({dislikedMovies.length})
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
                <h2>Lemmikuid pole veel</h2>
                <p>
                  Hakka filme meeldivaks märkima, et koostada oma lemmikute
                  nimekiri!
                </p>
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
                <h2>Mittemeeldivaid filme pole</h2>
                <p>Märgi filmid "Ei huvita" nupuga, et neid siin näha!</p>
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
