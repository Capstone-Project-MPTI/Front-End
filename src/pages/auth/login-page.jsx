import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/login-form";
import api from "../../service/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      login(response.data.token);
      navigate("/");
    } catch (err) {
      console.error("Login error details:", err.response);
      setError(err.response?.data?.message || "Login gagal. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-section">
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
      </section>
    </main>
  );
};

export default LoginPage;