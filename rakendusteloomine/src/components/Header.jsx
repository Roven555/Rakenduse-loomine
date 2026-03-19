import { useState } from "react";
import styles from "./Header.module.css";

const Header = ({ currentView, onViewChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo} onClick={() => onViewChange("home")}>
          <span className={styles.logoIcon}>🎬</span>
          CineRate
        </div>

        <nav
          className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}
        >
          <button
            className={`${styles.navLink} ${currentView === "home" ? styles.active : ""}`}
            onClick={() => {
              onViewChange("home");
              setMobileMenuOpen(false);
            }}
          >
            Home
          </button>
          <button
            className={`${styles.navLink} ${currentView === "profile" ? styles.active : ""}`}
            onClick={() => {
              onViewChange("profile");
              setMobileMenuOpen(false);
            }}
          >
            Profile
          </button>
        </nav>

        <button
          className={styles.hamburger}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
