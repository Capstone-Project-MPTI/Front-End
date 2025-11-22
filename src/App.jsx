import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import AppRoutes from "./routes/routes";
import ChatbotFab from "./components/chatbot/ChatbotFab";
import { useAuth } from "./context/AuthContext";
import "leaflet/dist/leaflet.css";
import "./App.css";

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Memuat aplikasi...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <ChatbotFab />
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
};

export default App;
