import MovieCard from "./MovieCard";
import styles from "./MovieList.module.css";

const MovieList = ({ movies, onMovieClick }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🍿</span>
        <h2>Ei leitud ühtegi filmi</h2>
        <p>Kontrolli kas nimi on õigesti kirjutatud või proovi teisi filtreid</p>
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
