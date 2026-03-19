import { useRef, useEffect } from "react";
import styles from "./SearchBar.module.css";

const SearchBar = ({ searchQuery, onSearchChange }) => {
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus the search input when Home component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    onSearchChange(e.target.value);
  };

  const handleClear = () => {
    onSearchChange("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search movies by title..."
          value={searchQuery}
          onChange={handleChange}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button className={styles.clearBtn} onClick={handleClear}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
