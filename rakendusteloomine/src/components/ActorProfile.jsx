import { useState, useEffect } from "react";
import { fetchActorDetails, fetchActorMovies } from "../utils/movieApi";
import styles from "./ActorProfile.module.css";

const ActorProfile = ({ actorId, actorName, onBack, onMovieSelect }) => {
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    if (!actorId) return;

    setIsLoading(true);
    setError(null);

    Promise.all([fetchActorDetails(actorId), fetchActorMovies(actorId)])
      .then(([actorData, moviesData]) => {
        setActor(actorData);
        setMovies(moviesData);
      })
      .catch(() => {
        setError("Näitleja andmete laadimine ebaõnnestus.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [actorId]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Laadin {actorName || "näitleja"} andmeid...</p>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className={styles.error}>
        <p>{error || "Näitlejat ei leitud"}</p>
        <button className={styles.backBtn} onClick={onBack}>
          ← Tagasi
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("et-EE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.actorProfile}>
      {/* Actor Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Tagasi
        </button>

        <div className={styles.actorInfo}>
          {actor.photo ? (
            <img
              src={actor.photo}
              alt={actor.name}
              className={styles.actorPhoto}
            />
          ) : (
            <div className={styles.actorPhotoPlaceholder}>👤</div>
          )}

          <div className={styles.actorMeta}>
            <h1 className={styles.actorName}>{actor.name}</h1>

            <div className={styles.metaRow}>
              {actor.birthday && (
                <span className={styles.metaItem}>
                  🎂 {formatDate(actor.birthday)}
                </span>
              )}
              {actor.placeOfBirth && (
                <span className={styles.metaItem}>📍 {actor.placeOfBirth}</span>
              )}
              <span className={styles.metaItem}>🎬 {movies.length} filmi</span>
            </div>

            {actor.biography && actor.biography !== "Biograafia puudub." && (
              <>
                <p
                  className={`${styles.biography} ${bioExpanded ? styles.expanded : ""}`}
                >
                  {actor.biography}
                </p>
                <button
                  className={styles.bioToggle}
                  onClick={() => setBioExpanded(!bioExpanded)}
                >
                  {bioExpanded ? "Näita vähem ▲" : "Loe rohkem ▼"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filmography */}
      <div className={styles.filmography}>
        <h2 className={styles.sectionTitle}>
          Filmograafia
          <span className={styles.movieCount}>({movies.length})</span>
        </h2>

        <div className={styles.movieGrid}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              className={styles.movieItem}
              onClick={() => onMovieSelect(movie.id)}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className={styles.moviePoster}
              />
              <div className={styles.movieInfo}>
                <p className={styles.movieTitle}>{movie.title}</p>
                <p className={styles.movieYear}>{movie.year}</p>
                <p className={styles.movieRating}>★ {movie.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActorProfile;
