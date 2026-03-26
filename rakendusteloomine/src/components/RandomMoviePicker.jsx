import { useState } from "react";
import styles from "./RandomMoviePicker.module.css";

const RandomMoviePicker = ({ movies, categories, onMovieClick }) => {
  const [pickedMovie, setPickedMovie] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("Kõik");
  const [isSpinning, setIsSpinning] = useState(false);

  const pickRandomMovie = () => {
    const pool =
      selectedGenre === "Kõik"
        ? movies
        : movies.filter(
            (m) =>
              (m.categories && m.categories.includes(selectedGenre)) ||
              m.category === selectedGenre,
          );

    if (pool.length === 0) return;

    setIsSpinning(true);
    setPickedMovie(null);

    // Brief animation delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setPickedMovie(pool[randomIndex]);
      setIsSpinning(false);
    }, 800);
  };

  const closePicker = () => {
    setPickedMovie(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.pickerBar}>
        <select
          className={styles.genreSelect}
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          className={styles.randomBtn}
          onClick={pickRandomMovie}
          disabled={isSpinning}
        >
          🎲 {isSpinning ? "Valin..." : "Ma ei tea, mida vaadata"}
        </button>
      </div>

      {(pickedMovie || isSpinning) && (
        <div className={styles.overlay} onClick={closePicker}>
          <div
            className={styles.resultCard}
            onClick={(e) => e.stopPropagation()}
          >
            {isSpinning ? (
              <div className={styles.spinnerContainer}>
                <div className={styles.dice}>🎲</div>
                <p>Valin sulle filmi...</p>
              </div>
            ) : (
              <>
                <button className={styles.closeBtn} onClick={closePicker}>
                  ✕
                </button>
                <div className={styles.movieDisplay}>
                  <img
                    src={pickedMovie.backdrop}
                    alt={pickedMovie.title}
                    className={styles.backdrop}
                  />
                  <div className={styles.backdropOverlay} />
                  <div className={styles.content}>
                    <img
                      src={pickedMovie.poster}
                      alt={pickedMovie.title}
                      className={styles.poster}
                    />
                    <div className={styles.info}>
                      <h2 className={styles.title}>{pickedMovie.title}</h2>
                      <div className={styles.meta}>
                        <span>{pickedMovie.year}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.genre}>
                          {pickedMovie.categories
                            ? pickedMovie.categories.join(", ")
                            : pickedMovie.category}
                        </span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.rating}>
                          ★ {pickedMovie.rating}
                        </span>
                      </div>
                      <p className={styles.synopsis}>
                        {pickedMovie.synopsis &&
                        pickedMovie.synopsis.length > 200
                          ? pickedMovie.synopsis.slice(0, 200) + "..."
                          : pickedMovie.synopsis}
                      </p>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => onMovieClick(pickedMovie.id)}
                        >
                          Vaata lähemalt
                        </button>
                        <button
                          className={styles.retryBtn}
                          onClick={pickRandomMovie}
                        >
                          🎲 Vali uus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomMoviePicker;
