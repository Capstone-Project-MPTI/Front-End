import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BerandaPage from "../pages/beranda-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import TentangKamiPage from "../pages/about-page";
import PindaiPage from "../pages/app/PindaiPage"; 
import ProfilePage from "../pages/app/profile-page";
import TemukanTps3rPage from "../pages/app/tps3r-page";
import InformasiPage from "../pages/app/informasi-page";
import EditProfilePage from "../pages/app/edit-profile-page";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<BerandaPage />} />
      <Route path="/beranda" element={<BerandaPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/beranda" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/beranda" replace /> : <RegisterPage />
        }
      />
      <Route
        path="/pindai"
        element={
          isAuthenticated ? <PindaiPage /> : <Navigate to="/login" replace />
        }
      />
      {/* Tambahkan route lainnya dengan komponen yang sudah diimport */}
      <Route path="/tentang-kami" element={<TentangKamiPage />} />
      <Route
        path="/temukan-tps3r"
        element={
          isAuthenticated ? (
            <TemukanTps3rPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/informasi"
        element={
          isAuthenticated ? <InformasiPage /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/profile/edit"
        element={
          isAuthenticated ? <EditProfilePage /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;