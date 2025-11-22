import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = ({ onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) setLocalErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = "Nama lengkap harus diisi";
    if (!formData.email) {
      errors.email = "Email harus diisi";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Email tidak valid";
    }
    if (!formData.password) {
      errors.password = "Password harus diisi";
    } else if (formData.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}

      <div className={`form-group ${localErrors.name ? "error" : ""}`}>
        <label>Nama Lengkap</label>
        <div className="input-with-icon">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>
        {localErrors.name && (
          <span className="error-text">{localErrors.name}</span>
        )}
      </div>

      <div className={`form-group ${localErrors.email ? "error" : ""}`}>
        <label>Email</label>
        <div className="input-with-icon">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
          />
        </div>
        {localErrors.email && (
          <span className="error-text">{localErrors.email}</span>
        )}
      </div>

      <div className={`form-group ${localErrors.password ? "error" : ""}`}>
        <label>Password</label>
        <div className="input-with-icon">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {localErrors.password && (
          <span className="error-text">{localErrors.password}</span>
        )}
      </div>

      <div
        className={`form-group ${localErrors.confirmPassword ? "error" : ""}`}
      >
        <label>Konfirmasi Password</label>
        <div className="input-with-icon">
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {localErrors.confirmPassword && (
          <span className="error-text">{localErrors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
      </button>
    </form>
  );
};

export default RegisterForm;
