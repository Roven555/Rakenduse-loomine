import styles from "./RuntimeFilter.module.css";

const RUNTIME_OPTIONS = [
  { id: "any", label: "Ükskõik", emoji: "⏳", maxMinutes: null },
  { id: "60", label: "Kuni 1 tund", emoji: "⚡", maxMinutes: 60 },
  { id: "90", label: "Kuni 1.5 tundi", emoji: "🕐", maxMinutes: 90 },
  { id: "120", label: "Kuni 2 tundi", emoji: "🕑", maxMinutes: 120 },
  { id: "150", label: "Kuni 2.5 tundi", emoji: "🕝", maxMinutes: 150 },
  { id: "150+", label: "Pikad filmid (2.5h+)", emoji: "🎞️", maxMinutes: -1 },
];

const RuntimeFilter = ({ activeRuntime, onRuntimeChange }) => {
  return (
    <div className={styles.runtimeContainer}>
      <div className={styles.runtimeInner}>
        <div className={styles.runtimeLabel}>⏱️ Kui palju aega sul on?</div>
        <div className={styles.runtimePills}>
          {RUNTIME_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`${styles.runtimePill} ${activeRuntime === option.id ? styles.active : ""}`}
              onClick={() => onRuntimeChange(option.id)}
            >
              <span className={styles.runtimeEmoji}>{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { RUNTIME_OPTIONS };
export default RuntimeFilter;
