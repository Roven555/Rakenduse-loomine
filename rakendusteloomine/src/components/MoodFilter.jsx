import styles from "./MoodFilter.module.css";

const MOODS = [
  {
    id: "all",
    label: "Kõik tujud",
    emoji: "🎬",
    genres: [],
  },
  {
    id: "comforting",
    label: "Midagi lohutavat",
    emoji: "🤗",
    genres: ["Komöödia", "Pere", "Romantika", "Animatsioon"],
  },
  {
    id: "heavy",
    label: "Rasket ja mõtlemapanevat",
    emoji: "🧠",
    genres: ["Draama", "Ajalugu", "Sõda"],
  },
  {
    id: "thrilling",
    label: "Adrenaliini!",
    emoji: "🔥",
    genres: ["Põnevus", "Põnevik", "Krimi"],
  },
  {
    id: "scary",
    label: "Tahaks karta",
    emoji: "👻",
    genres: ["Õudus", "Müsteerium"],
  },
  {
    id: "adventure",
    label: "Seiklust ja fantaasiat",
    emoji: "🗺️",
    genres: ["Seiklus", "Fantaasia", "Ulme"],
  },
  {
    id: "laugh",
    label: "Naerda tahaks",
    emoji: "😂",
    genres: ["Komöödia"],
  },
  {
    id: "romantic",
    label: "Romantiline õhtu",
    emoji: "💕",
    genres: ["Romantika", "Draama"],
  },
  {
    id: "documentary",
    label: "Midagi tõelist",
    emoji: "📽️",
    genres: ["Dokumentaal"],
  },
];

const MoodFilter = ({ activeMood, onMoodChange }) => {
  return (
    <div className={styles.moodContainer}>
      <div className={styles.moodInner}>
        <div className={styles.moodLabel}>🎭 Mis tujus oled?</div>
        <div className={styles.moodPills}>
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              className={`${styles.moodPill} ${activeMood === mood.id ? styles.active : ""}`}
              onClick={() => onMoodChange(mood.id)}
            >
              <span className={styles.moodEmoji}>{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export moods for use in filtering logic
export { MOODS };
export default MoodFilter;
