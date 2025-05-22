import { useState } from "react";
import { useRouter } from "next/router";
import axiosClient from "../utils/axiosClient";
import { useRedirectIfLoggedIn } from "../hooks/useAuthRedirect";
import styles from "./styles/login.module.css";

const Login = () => {
  const router = useRouter();
  useRedirectIfLoggedIn();

  const [badgeNumber, setBadgeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!badgeNumber || !password) {
      setError("Completați toate câmpurile.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", { badgeNumber, password });
      localStorage.setItem("auth-token", res.data.token);
      router.replace("/");
    } catch (err: any) {
      setError(
        err.response?.data || "Eroare la autentificare. Verificați datele."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <h1>Autentificare Polițist</h1>
      {error && <div className={styles.error}>{error}</div>}
      <input
        placeholder="Număr insignă"
        value={badgeNumber}
        onChange={(e) => setBadgeNumber(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Parolă"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Se autentifică..." : "Autentificare"}
      </button>
    </div>
  );
};

export default Login;
