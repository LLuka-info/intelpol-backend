import { useState } from "react";
import { useRouter } from "next/router";
import axiosClient from "../utils/axiosClient";
import { redirectDacaLogat } from "../hooks/useAuthRedirect";
import styles from "./styles/login.module.css";

const Login = () => {
  const router = useRouter();
  redirectDacaLogat();

  const [fullName, setfullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogare = async () => {
    setError("");
    if (!fullName || !password) {
      setError("Completați toate câmpurile.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", { fullName, password });
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
    <div className={styles.loginBox}>
      <h1>INTELPOL</h1>
      {error && <div className={styles.error}>{error}</div>}
      <input
        placeholder="Nume și prenume"
        value={fullName}
        onChange={(e) => setfullName(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Parola"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleLogare} disabled={loading}>
        {loading ? "Se autentifică..." : "LOGIN"}
      </button>
    </div>
  </div>
);
}
export default Login;
