import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../service/api";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import "../../styles/edit-profile.css";

const EditProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      await api.put("/auth/profile", formData);
      navigate("/profile", {
        state: { success: "Profil berhasil diperbarui" },
      });
    } catch (err) {
      console.error("Update failed:", err);
      setServerError(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h1>Edit Profil</h1>
      </div>

      {serverError && <div className="error-message">{serverError}</div>}

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className={`form-group ${errors.name ? "error" : ""}`}>
          <label htmlFor="name">
            <FaUser className="input-icon" />
            Nama Lengkap
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className={`form-group ${errors.email ? "error" : ""}`}>
          <label htmlFor="email">
            <FaEnvelope className="input-icon" />
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Masukkan email"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            <FaPhone className="input-icon" />
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Masukkan nomor telepon"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">
            <FaMapMarkerAlt className="input-icon" />
            Alamat
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Masukkan alamat lengkap"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            <FaSave />
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button className="btn-cancel" onClick={() => navigate("/profile")}>
            <FaTimes /> Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
