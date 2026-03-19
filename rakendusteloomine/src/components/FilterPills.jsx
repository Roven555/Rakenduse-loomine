import styles from "./FilterPills.module.css";

const FilterPills = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.pillsWrapper}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.pill} ${activeCategory === category ? styles.active : ""}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPills;
