import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../service/api";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSignOutAlt,
  
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/profile.css";

const ProfilePage = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah anda yakin ingin keluar?");
    if (confirmLogout) {
      logout();
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile?.name?.charAt(0).toUpperCase() || <FaUser />}
          </div>
          <div className="profile-info">
            <h2>{profile?.name || "Pengguna"}</h2>
            <p className="profile-email">{profile?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <h3 className="details-title">Informasi Profil</h3>

          <div className="detail-item">
            <div className="detail-icon-container">
              <FaUser className="detail-icon" />
            </div>
            <div className="detail-content">
              <p className="detail-label">Nama Lengkap</p>
              <p className="detail-value">{profile?.name || "-"}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-container">
              <FaEnvelope className="detail-icon" />
            </div>
            <div className="detail-content">
              <p className="detail-label">Email</p>
              <p className="detail-value">{profile?.email || "-"}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-container">
              <FaPhone className="detail-icon" />
            </div>
            <div className="detail-content">
              <p className="detail-label">Telepon</p>
              <p className="detail-value">{profile?.phone || "-"}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-container">
              <FaMapMarkerAlt className="detail-icon" />
            </div>
            <div className="detail-content">
              <p className="detail-label">Alamat</p>
              <p className="detail-value">{profile?.address || "-"}</p>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="btn-edit"
            onClick={() => navigate("/profile/edit")}
          >
            <FaEdit /> Edit Profil
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
