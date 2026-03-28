import { useState } from "react";
import { login, register } from "../utils/auth";
import styles from "./Login.module.css";

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        
        if (!username || !password || !confirmPassword) {
          alert("Palun täitke kõik väljad");
          return;
        }

        if (password !== confirmPassword) {
          alert("Paroolid ei kattu");
          return;
        }

        if (password.length < 6) {
          alert("Parool peab olema vähemalt 6 märki pikk");
          return;
        }

        
        const response = await register(username, password);
        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          setIsRegistering(false);
          setUsername("");
          setPassword("");
          setConfirmPassword("");
        } else {
          alert(data.message);
        }
      } else {
        if (!username || !password) {
          alert("Palun sisestage kasutajanimi ja parool");
          return;
        }

        const response = await login(username, password);
        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("isLoggedIn", "true");
          onLogin();
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Võrgu viga. Palun proovige uuesti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <h1>{isRegistering ? "Registreeru" : "Logi sisse"}</h1>
        
        {isRegistering && (
          <button 
            className={styles.backBtn}
            onClick={() => setIsRegistering(false)}
            title="Tagasi sisselogimisele"
          >
            ←
          </button>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Kasutajanimi</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Parool</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {isRegistering && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Kinnita parool</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          
          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? "Laadimine..." : (isRegistering ? "Registreeru" : "Logi sisse")}
          </button>
        </form>
        
        {!isRegistering && (
          <button 
            className={styles.registerBtn}
            onClick={() => setIsRegistering(true)}
          >
            Registreeru
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;