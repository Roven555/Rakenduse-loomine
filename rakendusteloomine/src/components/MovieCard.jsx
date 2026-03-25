import { useContext } from "react";
import { MovieContext } from "../contexts/movieContext";
import styles from "./MovieCard.module.css";

const MovieCard = ({ movie, onCardClick }) => {
  const { isLiked, isDisliked, toggleLike, toggleDislike } =
    useContext(MovieContext);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(movie.id);
  };

  const handleDislikeClick = (e) => {
    e.stopPropagation();
    toggleDislike(movie.id);
  };

  return (
    <div
      className={styles.card}
      onClick={() => onCardClick(movie.id)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && onCardClick(movie.id)}
    >
      <div className={styles.posterContainer}>
        <img
          src={movie.poster}
          alt={movie.title}
          className={styles.poster}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.actionBtn} ${isLiked(movie.id) ? styles.liked : ""}`}
              onClick={handleLikeClick}
              title="Meeldib"
            >
              ♥ Meeldib
            </button>
            <button
              className={`${styles.actionBtn} ${isDisliked(movie.id) ? styles.disliked : ""}`}
              onClick={handleDislikeClick}
              title="Ei meeldi"
            >
              ✕ Ei meeldi
            </button>
          </div>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title} title={movie.title}>
          {movie.title}
        </h3>
        <div className={styles.meta}>
          <span className={styles.year}>{movie.year}</span>
          <span className={styles.category}>
            {movie.categories ? movie.categories.join(", ") : movie.category}
          </span>
        </div>
        <div className={styles.rating}>
          <span className={styles.ratingValue}>★ {movie.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
