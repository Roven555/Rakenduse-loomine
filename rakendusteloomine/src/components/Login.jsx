import { useState } from "react";
import styles from "./Login.module.css";

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      // Registration validation
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
      
      // Simple registration - in real app, send to server
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userExists = users.some(user => user.username === username);
      
      if (userExists) {
        alert("Kasutajanimi on juba kasutusel");
        return;
      }
      
      users.push({ username, password });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Registreerimine õnnestus! Nüüd saate sisse logida.");
      setIsRegistering(false);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } else {
      // Login validation
      if (username && password) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", username);
          onLogin();
        } else {
          alert("Vale kasutajanimi või parool");
        }
      }
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
          
          <button type="submit" className={styles.loginBtn}>
            {isRegistering ? "Registreeru" : "Logi sisse"}
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