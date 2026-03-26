import { useState, useEffect, useCallback } from "react";
import { fetchPopularActors, searchActors } from "../utils/movieApi";
import styles from "./ActorsList.module.css";

const ActorsList = ({ onActorSelect }) => {
  const [actors, setActors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadActors = useCallback(async (query, pageNum, append = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);

    const result = query.trim()
      ? await searchActors(query, pageNum)
      : await fetchPopularActors(pageNum);

    setActors((prev) => (append ? [...prev, ...result.actors] : result.actors));
    setTotalPages(result.totalPages);

    if (!append) setIsLoading(false);
    else setIsLoadingMore(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadActors("", 1);
  }, [loadActors]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadActors(searchQuery, 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, loadActors]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadActors(searchQuery, nextPage, true);
  };

  return (
    <div className={styles.actorsPage}>
      <h1 className={styles.pageTitle}>
        <span className={styles.titleAccent}>Näitlejad</span>
      </h1>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Otsi näitlejat nime järgi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Laadin näitlejaid...</p>
        </div>
      ) : actors.length === 0 ? (
        <p className={styles.empty}>
          {searchQuery
            ? `"${searchQuery}" – tulemusi ei leitud`
            : "Näitlejaid ei leitud"}
        </p>
      ) : (
        <>
          {/* Actor Grid */}
          <div className={styles.actorGrid}>
            {actors.map((actor) => (
              <div
                key={actor.id}
                className={styles.actorCard}
                onClick={() => onActorSelect(actor.id, actor.name)}
              >
                {actor.photo ? (
                  <img
                    src={actor.photo}
                    alt={actor.name}
                    className={styles.actorPhoto}
                  />
                ) : (
                  <div className={styles.actorPhotoPlaceholder}>👤</div>
                )}
                <div className={styles.actorCardInfo}>
                  <p className={styles.actorName}>{actor.name}</p>
                  {actor.knownFor.length > 0 && (
                    <p className={styles.actorKnownFor}>
                      {actor.knownFor.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {page < totalPages && (
            <div className={styles.loadMore}>
              <button
                className={styles.loadMoreBtn}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Laadin..." : "Lae rohkem"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActorsList;
