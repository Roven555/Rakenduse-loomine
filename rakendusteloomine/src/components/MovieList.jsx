import MovieCard from "./MovieCard";
import styles from "./MovieList.module.css";

const MovieList = ({ movies, onMovieClick }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🍿</span>
        <h2>No Movies Found</h2>
        <p>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onCardClick={onMovieClick} />
      ))}
    </div>
  );
};

export default MovieList;
