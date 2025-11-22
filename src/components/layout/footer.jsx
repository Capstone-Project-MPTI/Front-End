import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Bagian Atas Footer */}
        <div className="footer-top">
          {/* Kolom 1: Tentang Sortify */}
          <div className="footer-column about-column">
            <h3 className="footer-title">
              <span className="logo-icon">♻️</span> Sortify
            </h3>
            <p className="footer-about">
              Sortify adalah platform inovatif yang membantu masyarakat dalam
              pengelolaan sampah dengan teknologi terkini untuk menciptakan
              lingkungan yang lebih bersih dan berkelanjutan.
            </p>
            {/* <div className="social-media">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook className="social-icon" />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter className="social-icon" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="social-icon" />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin className="social-icon" />
              </a>
            </div> */}
          </div>

          {/* Kolom 2: Link Cepat */}
          <div className="footer-column">
            <h3 className="footer-title">Link Cepat</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Beranda</Link>
              </li>
              <li>
                <Link to="/pindai">Pindai Sampah</Link>
              </li>
              <li>
                <Link to="/temukan-tps3r">Lokasi TPS3R</Link>
              </li>
              <li>
                <Link to="/informasi">Informasi Sampah</Link>
              </li>
              <li>
                <Link to="/tentang-kami">Tentang Kami</Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div className="footer-column">
            <h3 className="footer-title">Hubungi Kami</h3>
            <ul className="contact-info">
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Jl. Lingkungan Hijau No. 123, Kota Bersih</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <span>(021) 1234-5678</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <span>info@Sortify.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Garis Pemisah */}
        <div className="footer-divider"></div>

        {/* Bagian Bawah Footer */}
        <div className="footer-bottom">
          <div className="copyright">
            &copy; {new Date().getFullYear()} Sortify. Seluruh hak cipta
            dilindungi.
          </div>
          <div className="footer-legal">
            <Link to="/kebijakan-privasi">Kebijakan Privasi</Link>
            <Link to="/syarat-ketentuan">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
