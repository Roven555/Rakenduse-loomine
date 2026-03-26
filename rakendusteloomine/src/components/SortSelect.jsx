import styles from "./SortSelect.module.css";

const sortOptions = [
  { value: "popularity", label: "Populaarsus" },
  { value: "rating-desc", label: "Hinne (kõrgeim enne)" },
  { value: "rating-asc", label: "Hinne (madalaim enne)" },
  { value: "year-desc", label: "Uuemad enne" },
  { value: "year-asc", label: "Vanemad enne" },
  { value: "title-asc", label: "Pealkiri (A-Z)" },
  { value: "title-desc", label: "Pealkiri (Z-A)" },
];

const SortSelect = ({ activeSort, onSortChange }) => {
  return (
    <div className={styles.sortContainer}>
      <label className={styles.sortLabel}>Sorteeri:</label>
      <select
        className={styles.sortSelect}
        value={activeSort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortSelect;
