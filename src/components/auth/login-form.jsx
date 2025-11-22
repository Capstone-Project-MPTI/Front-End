import { useState } from "react";

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form id="login-form" className="auth-card" onSubmit={handleSubmit}>
      <h2 className="auth-title">Login</h2>

      {error && (
        <div className="message-box" id="loginError">
          {error}
        </div>
      )}

      <div className="input-group">
        <label htmlFor="email">Alamat Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="contoh@email.com"
          autoComplete="username"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label htmlFor="password">Kata Sandi</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </div>

      <p className="auth-footer">
        Belum punya akun? <a href="/register">Daftar sekarang</a>
      </p>
    </form>
  );
};

export default LoginForm;
