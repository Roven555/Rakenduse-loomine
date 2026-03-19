import { useContext, useState, useEffect } from "react";
import { MovieContext } from "../contexts/movieContext";
import { fetchMovieCast } from "../utils/movieApi";
import styles from "./MovieDetail.module.css";

const MovieDetail = ({ movie, onBack }) => {
  const { isLiked, isDisliked, toggleLike, toggleDislike } =
    useContext(MovieContext);
  const [cast, setCast] = useState([]);

  // Fetch cast data when movie changes
  useEffect(() => {
    if (movie && movie.id) {
      fetchMovieCast(movie.id)
        .then((castData) => {
          setCast(castData);
        })
        .catch((error) => {
          console.error("Failed to load cast:", error);
        });
    }
  }, [movie]);

  if (!movie) {
    return (
      <div className={styles.notFound}>
        <p>Movie not found</p>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      {/* Backdrop */}
      <div className={styles.backdropContainer}>
        <img
          src={movie.backdrop}
          alt={movie.title}
          className={styles.backdrop}
        />
        <div className={styles.backdropOverlay}></div>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Poster */}
          <div className={styles.posterSection}>
            <img
              src={movie.poster}
              alt={movie.title}
              className={styles.poster}
            />
          </div>

          {/* Info */}
          <div className={styles.infoSection}>
            <h1 className={styles.title}>{movie.title}</h1>

            <div className={styles.meta}>
              <span className={styles.year}>{movie.year}</span>
              <span className={styles.divider}>•</span>
              <span className={styles.category}>{movie.category}</span>
              <span className={styles.divider}>•</span>
              <span className={styles.rating}>★ {movie.rating}/10</span>
            </div>

            {/* Synopsis */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Synopsis</h2>
              <p className={styles.synopsis}>{movie.synopsis}</p>
            </div>

            {/* Cast */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Cast</h2>
              <div className={styles.castList}>
                {cast.length > 0 ? (
                  cast.map((actor, index) => (
                    <div key={index} className={styles.castMember}>
                      <span className={styles.castIcon}>👤</span>
                      {actor}
                    </div>
                  ))
                ) : (
                  <p className={styles.noCast}>Cast information loading...</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionSection}>
              <button
                className={`${styles.actionBtn} ${isLiked(movie.id) ? styles.liked : ""}`}
                onClick={() => toggleLike(movie.id)}
              >
                <span className={styles.icon}>♥</span>
                {isLiked(movie.id) ? "Liked" : "Like"}
              </button>
              <button
                className={`${styles.actionBtn} ${isDisliked(movie.id) ? styles.disliked : ""}`}
                onClick={() => toggleDislike(movie.id)}
              >
                <span className={styles.icon}>✕</span>
                {isDisliked(movie.id) ? "Disliked" : "Dislike"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
