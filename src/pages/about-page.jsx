import React from "react";
import "../styles/about.css";
import image from "../assets/image/Hand-coding-amico.svg";
import imageKolaborasi from "../assets/kolaborasi/kolaborasi.png";

import { FaLinkedin, FaGithub } from "react-icons/fa";

// Ganti path gambar sesuai file di assets/developt
import dev1 from "../assets/developt/dip.jpg";
import dev2 from "../assets/developt/sakifa.jpg";
import dev3 from "../assets/developt/ALE.jpg";
import dev4 from "../assets/developt/amel.jpg";
import dev5 from "../assets/developt/wawa.jpeg";
import dev6 from "../assets/developt/ayumi.jpg";
import dev7 from "../assets/developt/aulia.jpg";
import dev8 from "../assets/developt/logodkh.png"; // Path untuk anggota baru (ganti jika berbeda)

const teamMembers = [
  { name: "Dinas Lingkungan Hidup Kota Medan", role: "Mitra Capstone Project", university: "", image: dev8 }, // Anggota baru
  { name: "Diva Anggreini Harahap", role: "Machine Learning Engineer", university: "Universitas Sumatera Utara", image: dev1 },
  { name: "Sakifa Indira Putri", role: "Machine Learning Engineer", university: "Universitas Sumatera Utara", image: dev2 },
  { name: "Aliya Afifa Ginting", role: "Machine Learning Engineer", university: "Universitas Sumatera Utara", image: dev3 },
  { name: "Amelia Luthfiyah", role: "Backend Engineer", university: "Universitas Sumatera Utara", image: dev4 },
  { name: "Najwa Amanda", role: "Backend Engineer", university: "Universitas Sumatera Utara", image: dev5 },
  { name: "Ayumi Syahirah Harahap", role: "Frontend Engineer", university: "Universitas Sumatera Utara", image: dev6 },
  { name: "Rizqi Siti Aulia", role: "Frontend Engineer", university: "Universitas Sumatera Utara", image: dev7 },
];

const AboutPage = () => {
  return (
    <section className="about-section">
      {/* Bagian 1: Tentang Kami */}
      <div className="about-wrapper container">
        <div className="about-text">
          <h1 className="about-title">Tentang Kami</h1>
          <p className="about-description">
            Kami hadir dengan solusi berbasis AI untuk mengatasi masalah sampah
            yang terus meningkat. Melalui teknologi machine learning, pengguna
            dapat mengenali jenis sampah hanya dengan memindai gambar sampah di sekeliling anda.
          </p>
        </div>
        <div className="about-image">
          <img src={image} alt="Ilustrasi Tentang Kami" className="img-fluid" />
        </div>
      </div>

      {/* Bagian 2: Kolaborasi Bersama Komunitas */}
      <div className="collaboration-section container">
        <div className="collab-wrapper">
          <div className="logo-grid">
            <div className="collab-logo">
              <img src={imageKolaborasi} alt="Logo" />
            </div>
          </div>
          <div className="collab-text">
            <h2 className="section-title">Kolaborasi Bersama Komunitas</h2>
            <p className="collab-description">
              Sortify bekerja sama dengan <strong> Dinas Lingkungan Hidup Kota Medan </strong> serta komunitas dan organisasi lingkungan
              seperti AZWI, Greenpeace, Zero Waste Indonesia, Pilah Sampah,
              Waste4Change, dan WWF untuk mendorong pengelolaan sampah yang
              berkelanjutan.
            </p>
          </div>
        </div>
      </div>

      {/* Bagian 3: Tim Developer Sortify (Layout custom) */}
      <div className="custom-team-section">
        <div className="team-header container">
          <h2 className="team-main-title">Tim Developer Sortify</h2>
        </div>

        <div className="team-description container center-text">
          <p className="collab-description">
          Tim developer Sortify menggunakan keahlian AI dan machine learning untuk menjawab tantangan pengelolaan sampah. Melalui kemitraan strategis dengan <strong> Dinas Lingkungan Hidup Kota Medan </strong>, kami menggabungkan inovasi teknologi canggih dengan pemahaman dan data lapangan. Kolaborasi ini bertujuan membangun sistem pengelolaan sampah yang lebih cerdas dan efisien demi mewujudkan masa depan Kota Medan yang lebih hijau dan berkelanjutan.
          </p>
        </div>

        <div className="team-grid container">
          {/* 4 anggota pertama */}
          {teamMembers.slice(0, 4).map((member, idx) => (
            <div key={idx} className="team-card white-card">
              {member.image && <img src={member.image} alt={member.name} className="team-photo" />}
              <div className="team-info">
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                {member.university && <div className="team-university">{member.university}</div>}
              </div>
            </div>
          ))}

          {/* 4 anggota sisanya */}
          {teamMembers.slice(4).map((member, idx) => (
            <div key={idx + 4} className="team-card white-card">
              {member.image && <img src={member.image} alt={member.name} className="team-photo" />}
              <div className="team-info">
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
                {member.university && <div className="team-university">{member.university}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutPage;