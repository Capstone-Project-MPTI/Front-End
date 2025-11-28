import {
  FaRecycle,
  FaMapMarkerAlt,
  FaNewspaper,
  FaArrowRight,
} from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Papa from "papaparse";
import "../styles/Beranda.css";
import image from "../assets/image/daur-ulang.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register komponen Chart.js yang dibutuhkan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Daftar lengkap provinsi untuk dropdown
const daftarProvinsi = [
  "Aceh",
  "Bali",
  "Banten",
  "Bengkulu",
  "DKI Jakarta",
  "Daerah Istimewa Yogyakarta",
  "Gorontalo",
  "Jambi",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Barat",
  "Kalimantan Selatan",
  "Kalimantan Tengah",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "Lampung",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
  "Papua Barat",
  "Riau",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tengah",
  "Sulawesi Tenggara",
  "Sulawesi Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Sumatera Utara",
];

const BerandaPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const [provinsi, setProvinsi] = useState("Aceh");
  const [allChartData, setAllChartData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return; // Hanya ambil data jika user sudah login

    const parseCsv = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Gagal memuat CSV: ${url} - Status: ${response.status}`
        );
      }
      const csvText = await response.text();
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      });
    };

    const fetchData = async () => {
      setIsChartLoading(true);
      try {
        const [historicalData, newPredictionData] = await Promise.all([
          parseCsv("/data_provinsi.csv"),
          parseCsv("/predictions_2025.csv"),
        ]);

        setAllChartData(historicalData);
        setPredictionData(newPredictionData);
      } catch (error) {
        console.error("Gagal mengambil atau mengurai data CSV:", error);
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]); // Tambahkan isAuthenticated sebagai dependency

  useEffect(() => {
    if (
      !isAuthenticated ||
      allChartData.length === 0 ||
      predictionData.length === 0
    )
      return;

    const historicalYears = [2022, 2023, 2024];

    const provinceHistoricalData = allChartData.filter(
      (row) =>
        row.nama_provinsi === provinsi && historicalYears.includes(row.tahun)
    );
    const provincePredictionData = predictionData.filter(
      (row) => row.nama_provinsi === provinsi && row.tahun === 2025
    );

    const historicalLabels = provinceHistoricalData.map((d) => d.jenis_sampah);
    const predictionLabels = provincePredictionData.map((d) => d.jenis_sampah);
    const labels = [
      ...new Set([...historicalLabels, ...predictionLabels]),
    ].sort();

    const lineColors = {
      2022: "rgba(255, 99, 132, 1)",
      2023: "rgba(54, 162, 235, 1)",
      2024: "rgba(75, 192, 192, 1)",
      2025: "rgba(153, 102, 255, 1)",
    };

    const historicalDatasets = historicalYears.map((year) => {
      const dataForYear = labels.map((label) => {
        const dataPoint = provinceHistoricalData.find(
          (d) => d.tahun === year && d.jenis_sampah === label
        );
        return dataPoint ? dataPoint.persentase : null;
      });
      return {
        label: `Tahun ${year}`,
        data: dataForYear,
        borderColor: lineColors[year],
        backgroundColor: lineColors[year].replace("1)", "0.2)"),
        fill: false,
        tension: 0.1,
      };
    });

    const predictionDataset = {
      label: "Prediksi 2025",
      data: labels.map((label) => {
        const dataPoint = provincePredictionData.find(
          (d) => d.jenis_sampah === label
        );
        return dataPoint ? dataPoint.persentase : null;
      }),
      borderColor: lineColors[2025],
      backgroundColor: lineColors[2025].replace("1)", "0.2)"),
      fill: false,
      tension: 0.1,
      borderDash: [5, 5],
    };

    setChartData({
      labels,
      datasets: [...historicalDatasets, predictionDataset],
    });
  }, [provinsi, allChartData, predictionData, isAuthenticated]);

  const handleProvinsiChange = (event) => {
    setProvinsi(event.target.value);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memeriksa status login...</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: `Komposisi Sampah di ${provinsi} (2022-2024) & Prediksi 2025`,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Persentase (%)" },
      },
      x: {
        title: { display: true, text: "Jenis Sampah" },
      },
    },
  };

  return (
    <div className="beranda-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Kelola Sampah dengan <span>Sortify</span>
          </h1>
          <p>
            Solusi pintar untuk pemilahan sampah dan menemukan Tempat Pengolahan
            Sampah Reduce, Reuse, Recyle (TPS3R) terdekat
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/pindai" className="primary-button">
                Mulai Memindai <FaArrowRight />
              </Link>
            ) : (
              <Link to="/register" className="primary-button">
                Daftar Sekarang
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image">
          <img src={image} alt="Sortify" loading="lazy" />
        </div>
      </section>

      {/* Layout Section for Chart and Form - Hanya untuk yang sudah login */}
      {isAuthenticated && (
        <section className="chart-and-form-section">
          <div className="chart-container">
            <h2>Grafik Komposisi Sampah</h2>
            {isChartLoading ? (
              <p>Memuat data chart...</p>
            ) : chartData.datasets.length > 0 &&
              chartData.datasets.some((ds) =>
                ds.data.some((d) => d !== null)
              ) ? (
              <div style={{ position: "relative", height: "400px" }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <p>Data untuk {provinsi} tidak ditemukan.</p>
            )}
          </div>

          <div className="form-container">
            <h2>Pilih Lokasi</h2>
            <div className="form-group">
              <label htmlFor="provinsi">Provinsi</label>
              <div className="select-wrapper">
                <select
                  id="provinsi"
                  value={provinsi}
                  onChange={handleProvinsiChange}
                >
                  {daftarProvinsi.map((namaProv) => (
                    <option key={namaProv} value={namaProv}>
                      {namaProv}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fitur Section */}
      <section className="features-section">
        <h2 className="judul">Fitur Unggulan</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaRecycle />
            </div>
            <h3>Pemilahan Sampah</h3>
            <p>Ketahui jenis sampah Anda melalui pemindaian cerdas</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaMapMarkerAlt />
            </div>
            <h3>Lokasi TPS3R</h3>
            <p>Temukan tempat pembuangan sampah terdekat di sekitar Anda</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaNewspaper />
            </div>
            <h3>Informasi Terkini</h3>
            <p>Update terbaru seputar pengelolaan sampah</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>Cara Kerja Sortify</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Pindai Sampah</h3>
              <p>Gunakan kamera untuk memindai jenis sampah Anda</p>
              {isAuthenticated && (
                <Link to="/pindai" className="step-button">
                  Coba Sekarang
                </Link>
              )}
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Dapatkan Informasi</h3>
              <p>Sistem akan mengenali jenis sampah dan cara pembuangannya</p>
              {isAuthenticated && (
                <Link to="/informasi" className="step-button">
                  Coba Sekarang
                </Link>
              )}
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Temukan TPS3R</h3>
              <p>Lihat lokasi pembuangan terdekat berdasarkan jenis sampah</p>
              {isAuthenticated && (
                <Link to="/temukan-tps3r" className="step-button">
                  Coba Sekarang
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {isAuthenticated ? (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Temukan Lebih Banyak Fitur</h2>
            <p>
              Temukan beragam fitur unggulan Sortify untuk pengelolaan sampah
              yang lebih cerdas, cepat, dan berkelanjutan. Dengan mengelola
              limbah secara efisien
            </p>
          </div>
        </section>
      ) : (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Siap Mengelola Sampah dengan Lebih Baik?</h2>
            <p>
              Bergabunglah dengan Sortify sekarang dan mulai berkontribusi
              untuk lingkungan yang lebih bersih
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="secondary-button">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BerandaPage;
