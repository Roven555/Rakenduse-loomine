import { useContext, useState, useEffect } from "react";
import { MovieContext } from "../contexts/movieContext";
import {
  fetchMovieCast,
  fetchMovieTrailer,
  fetchMovieRuntime,
} from "../utils/movieApi";
import styles from "./MovieDetail.module.css";

const MovieDetail = ({ movie, onBack, onActorSelect }) => {
  const {
    isLiked,
    isDisliked,
    isInWatchlist,
    toggleLike,
    toggleDislike,
    toggleWatchlist,
  } = useContext(MovieContext);
  const [cast, setCast] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  const [runtime, setRuntime] = useState(null);

  // Fetch cast, trailer and runtime data when movie changes
  useEffect(() => {
    if (movie && movie.id) {
      fetchMovieCast(movie.id)
        .then((castData) => {
          setCast(castData);
        })
        .catch((error) => {
          console.error("Failed to load cast:", error);
        });

      fetchMovieTrailer(movie.id)
        .then((key) => {
          setTrailerKey(key);
        })
        .catch((error) => {
          console.error("Failed to load trailer:", error);
        });

      if (movie.runtime) {
        setRuntime(movie.runtime);
      } else {
        fetchMovieRuntime(movie.id).then((rt) => setRuntime(rt));
      }
    }
  }, [movie]);

  const formatRuntime = (minutes) => {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const getEndTime = (minutes) => {
    if (!minutes) return null;
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toLocaleTimeString("et-EE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!movie) {
    return (
      <div className={styles.notFound}>
        <p>Filmi ei leitud</p>
        <button className={styles.backBtn} onClick={onBack}>
          ← Tagasi
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
          ← Tagasi
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
              <span className={styles.category}>
                {movie.categories
                  ? movie.categories.join(", ")
                  : movie.category}
              </span>
              <span className={styles.divider}>•</span>
              <span className={styles.rating}>★ {movie.rating}/10</span>
            </div>

            {/* Runtime & End Time */}
            {runtime && (
              <div className={styles.runtimeInfo}>
                <span className={styles.runtimeBadge}>
                  🕐 {formatRuntime(runtime)}
                </span>
                <span className={styles.endTime}>
                  Kui alustad praegu, saab läbi kell {getEndTime(runtime)}
                </span>
              </div>
            )}

            {/* Trailer */}
            {trailerKey && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Treiler</h2>
                <div className={styles.trailerWrapper}>
                  <iframe
                    className={styles.trailerIframe}
                    src={`https://www.youtube.com/embed/${trailerKey}`}
                    title="Treiler"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Synopsis */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Süžee</h2>
              <p className={styles.synopsis}>{movie.synopsis}</p>
            </div>

            {/* Cast */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Näitlejad</h2>
              <div className={styles.castList}>
                {cast.length > 0 ? (
                  cast.map((actor) => (
                    <div
                      key={actor.id}
                      className={styles.castMember}
                      onClick={() =>
                        onActorSelect && onActorSelect(actor.id, actor.name)
                      }
                      style={{ cursor: onActorSelect ? "pointer" : "default" }}
                    >
                      {actor.photo ? (
                        <img
                          src={actor.photo}
                          alt={actor.name}
                          className={styles.castPhoto}
                        />
                      ) : (
                        <span className={styles.castIcon}>👤</span>
                      )}
                      <div className={styles.castInfo}>
                        <span className={styles.castName}>{actor.name}</span>
                        {actor.character && (
                          <span className={styles.castCharacter}>
                            {actor.character}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noCast}>Näitlejate info laadimine...</p>
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
                {isLiked(movie.id) ? "Meeldib" : "Meeldib"}
              </button>
              <button
                className={`${styles.actionBtn} ${isDisliked(movie.id) ? styles.disliked : ""}`}
                onClick={() => toggleDislike(movie.id)}
              >
                <span className={styles.icon}>✕</span>
                {isDisliked(movie.id) ? "Ei meeldi" : "Ei meeldi"}
              </button>
              <button
                className={`${styles.actionBtn} ${isInWatchlist(movie.id) ? styles.watchlisted : ""}`}
                onClick={() => toggleWatchlist(movie.id)}
              >
                <span className={styles.icon}>🔖</span>
                {isInWatchlist(movie.id) ? "Nimekirjas" : "Vaatan hiljem"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
