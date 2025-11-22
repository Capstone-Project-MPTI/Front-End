import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/register-form";
import api from "../../service/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (formData) => {
    setIsLoading(true);
    setError ("");

    try {
      const response = await api.post("/auth/register", formData);
      login(response.data.token);
      navigate("/");
    } catch (err) {
      console.error("Register error details:", err.response);
      setError(err.response?.data?.message || "Registrasi gagal. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-section">
        <div className="auth-card">
          <h2 className="auth-title">Daftar Akun</h2>
          <RegisterForm
            onSubmit={handleRegister}
            isLoading={isLoading}
            error={error}
          />
          <p className="auth-footer">
            Sudah punya akun? <a href="/login">Masuk di sini</a>
          </p>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
