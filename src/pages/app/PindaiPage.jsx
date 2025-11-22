import { useState, useRef, useEffect, useCallback } from 'react';
import { FaCamera, FaTrash, FaSearch, FaPowerOff, FaPlay, FaUpload } from 'react-icons/fa';
import { saveScanResult } from '../../service/api';
import '../../styles/pindai.css';

const MODEL_PATHS = {
    adaSampah: '/model1.onnx',
    jenisSampah: '/model2.onnx'
};

let adaSampahSession = null;
let jenisSampahSession = null;

export async function loadModels() {
    try {
        // PERBAIKAN: Mengatur path wasm menggunakan `ort` yang diimpor.
        // Ini memberi tahu onnxruntime di mana harus menemukan file pendukungnya.
        window.ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
        
        // Memuat kedua sesi inferensi model secara paralel.
        [adaSampahSession, jenisSampahSession] = await Promise.all([
            window.ort.InferenceSession.create(MODEL_PATHS.adaSampah),
            window.ort.InferenceSession.create(MODEL_PATHS.jenisSampah)
        ]);
        console.log("Kedua model berhasil dimuat via NPM module.");
        return true;
    } catch (error) {
        console.error('Gagal memuat model ONNX:', error);
        return false;
    }
}

function preprocess(imageSource) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const targetSize = 224;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.drawImage(imageSource, 0, 0, targetSize, targetSize);
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
    const { data } = imageData;
    const float32Data = new Float32Array(targetSize * targetSize * 3);
    
    for (let i = 0; i < data.length; i += 4) {
        const j = i / 4;
        float32Data[j * 3 + 0] = data[i + 0] / 255.0; // R
        float32Data[j * 3 + 1] = data[i + 1] / 255.0; // G
        float32Data[j * 3 + 2] = data[i + 2] / 255.0; // B
    }

    // PERBAIKAN: Membuat tensor menggunakan `ort` yang diimpor.
    return new window.ort.Tensor('float32', float32Data, [1, targetSize, targetSize, 3]);
}

export async function analyzeImage(canvasElement) {
    if (!adaSampahSession || !jenisSampahSession) {
        throw new Error('Model belum dimuat. Panggil loadModels() terlebih dahulu.');
    }

    const tensor = preprocess(canvasElement);

    const adaSampahFeeds = { [adaSampahSession.inputNames[0]]: tensor };
    const adaSampahResults = await adaSampahSession.run(adaSampahFeeds);
    const adaSampahPred = adaSampahResults[adaSampahSession.outputNames[0]].data;
    
    const probabilitasAdaSampah = adaSampahPred[0];

    if (probabilitasAdaSampah < 0.6) {
        return {
            result: 'Bukan Sampah',
            confidence: adaSampahPred[1],
            isSampah: false
        };
    }

    const jenisSampahFeeds = { [jenisSampahSession.inputNames[0]]: tensor };
    const jenisSampahResults = await jenisSampahSession.run(jenisSampahFeeds);
    const jenisSampahPred = jenisSampahResults[jenisSampahSession.outputNames[0]].data;

    const probAnorganik = jenisSampahPred[0];
    const probOrganik = jenisSampahPred[1];

    let jenisSampah, confidence;
    if (probAnorganik > probOrganik) {
        jenisSampah = 'Anorganik';
        confidence = probAnorganik;
    } else {
        jenisSampah = 'Organik';
        confidence = probOrganik;
    }

    return {
        result: jenisSampah,
        confidence: confidence,
        isSampah: true
    };
}

export function cleanupModels() {
    adaSampahSession = null;
    jenisSampahSession = null;
    console.log('Sesi model ONNX telah dibersihkan.');
}

// --- Komponen-komponen UI ---
const videoLinks = {
  Organik: [
    'https://www.youtube.com/embed/PkYgN3xfJ2I?si=__dA4WeqeBP-38wJ',
    'https://www.youtube.com/embed/3NdAGDtrrjc?si=udmMZjtmKNk6YoWw',
    'https://www.youtube.com/embed/DZj4OlW_ogk?si=fUlsjI5LJR2iLUIW',
    'https://www.youtube.com/embed/8q08XUa3P_Q?si=I0nv4WY76El8XaLu',
    'https://www.youtube.com/embed/1raJ4IGmwxc?si=e7k_mCD34QaKoL8l',
    'https://www.youtube.com/embed/RFD3yarpgHA?si=f7RzMrcPxPvtchYZ',
    'https://www.youtube.com/embed/I13_hwqm2Zo?si=wBgMpmd4F4vsqNp4',
  ],
  Anorganik: [
    'https://www.youtube.com/embed/MJd3bo_XRaU?si=D0yBZVveUbBn-tCH',
    'https://www.youtube.com/embed/VYzDrFSYQ-g?si=tY8fH8evpLVEWtWD',
    'https://www.youtube.com/embed/Bgi6UJAQ1UY?si=K84ZVyhMEO69lSHq',
    'https://www.youtube.com/embed/kNflGgtJyLA?si=FZYimWmkrYRJJ1z2',
    'https://www.youtube.com/embed/ycya1NvbBns?si=ZeFXEEvndjQSsG3M',
    'https://www.youtube.com/embed/a3yjtSHNnpo?si=wOaGzZJNjbd6UpKl',
    'https://www.youtube.com/embed/18x-npX3yxA?si=vVSMnJF0eWrdt7xW',
    'https://www.youtube.com/embed/fgkMBz6WvZs?si=O0nNm5g73jeUoJ5A',
    'https://www.youtube.com/embed/q-_sT1AdzPQ?si=kIR8dev_451N2Njg',
    'https://www.youtube.com/embed/ar5RYAAt62k?si=b36LnR8DsqU-Dnje',
  ],
};

const recommendationContainerStyle = {
  backgroundColor: '#f0f8ff',
  border: '1px solid #add8e6',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '30px',
  color: '#333',
  lineHeight: '1.8',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'left',
};

const Recommendation = ({ type }) => {
  if (type === 'Organik') {
    return (
      <div style={recommendationContainerStyle}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          ♻️ Sampah Organik: Jangan Dibuang, Bisa Jadi Emas!
        </h3>
        <p>
          Sampah organik berasal dari bahan alami seperti sisa makanan, sayur dan buah busuk, kulit telur, daun kering, dan
          rumput. Sampah ini mudah membusuk dan terurai oleh mikroorganisme dalam waktu singkat.
        </p>
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>Ciri-ciri sampah organik:</p>
        <ul style={{ paddingLeft: '20px', listStyleType: "'• '", margin: 0 }}>
          <li>Terbuat dari bahan alami</li>
          <li>Mudah membusuk dan berbau jika tidak segera diolah</li>
          <li>Bisa terurai secara alami dalam tanah</li>
        </ul>
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>Manfaat pengolahan sampah organik:</p>
        <ul style={{ paddingLeft: '20px', listStyleType: 'none', margin: 0 }}>
          <li>🌱 Kompos untuk menyuburkan tanaman</li>
          <li>💧 Pupuk cair untuk pertanian</li>
          <li>🔥 Biogas sebagai sumber energi pengganti gas elpiji</li>
          <li>🐛 Pakan maggot untuk ikan dan unggas</li>
          <li>🔋 Pelet biomassa untuk energi ramah lingkungan</li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          Dengan memilah dan mengolah sampah organik, kita membantu menjaga lingkungan dan membuka peluang ekonomi hijau. Yuk,
          mulai dari rumah agar sampah organik jadi "emas hijau" yang bernilai!
        </p>
      </div>
    );
  } else if (type === 'Anorganik') {
    return (
      <div style={recommendationContainerStyle}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          🧴 Sampah Anorganik: Jangan Dibuang, Bisa Disulap!
        </h3>
        <p>
          Sampah anorganik berasal dari bahan yang sulit terurai seperti plastik, logam, kaca, karet, dan kain sintetis.
          Karena susah membusuk, sampah ini harus kita kelola dengan bijak.
        </p>
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>Ciri-ciri sampah anorganik:</p>
        <ul style={{ paddingLeft: '20px', listStyleType: "'• '", margin: 0 }}>
          <li>Terbuat dari bahan non-alami</li>
          <li>Tidak mudah terurai di tanah</li>
          <li>Bisa bertahan puluhan bahkan ratusan tahun</li>
        </ul>
        <p style={{ fontWeight: 'bold', marginTop: '16px' }}>Contoh pemanfaatan ulang sampah anorganik:</p>
        <ul style={{ paddingLeft: '20px', listStyleType: 'none', margin: 0 }}>
          <li>♻️ Botol plastik jadi tas daur ulang, pot tanaman, atau bahan bangunan</li>
          <li>🛠️ Kaleng bekas jadi kerajinan tangan dan dekorasi rumah</li>
          <li>🎨 Kaca pecah bisa dilebur jadi botol baru atau mozaik seni</li>
          <li>👜 Limbah tekstil dijadikan bantal, tas belanja, atau benang rajut</li>
        </ul>
        <p style={{ marginTop: '16px' }}>
          Dengan memilah dan memanfaatkan ulang sampah anorganik, kita mengurangi tumpukan sampah sekaligus mendukung ekonomi
          kreatif dan menjaga bumi tetap lestari. Yuk, mulai sekarang lebih bijak dalam mengelola sampah anorganik!
        </p>
      </div>
    );
  }
  return null;
};

const VideoCarousel = ({ type }) => {
  const containerRef = useRef(null);
  if (!type || !videoLinks[type]) return null;
  const scroll = (offset) => containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  return (
    <div style={{ position: 'relative', marginBottom: '30px' }}>
      <button
        onClick={() => scroll(-320)}
        style={{
          position: 'absolute',
          left: '5px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '50%',
          border: '1px solid #ccc',
        }}
      >
        ◀
      </button>
      <div
        ref={containerRef}
        style={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', gap: '10px', padding: '10px 40px' }}
      >
        {videoLinks[type].map((url, i) => (
          <iframe
            key={i}
            width="300"
            height="170"
            src={url}
            title={`Video ${type} ${i + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '8px', flex: '0 0 auto' }}
          />
        ))}
      </div>
      <button
        onClick={() => scroll(320)}
        style={{
          position: 'absolute',
          right: '5px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '50%',
          border: '1px solid #ccc',
        }}
      >
        ▶
      </button>
    </div>
  );
};

// --- Komponen Utama PindaiPage ---
const PindaiPage = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // useEffect untuk memuat ONNX Runtime dan model
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // Allow up to 5 seconds (50 * 100ms)

    // Fungsi untuk memuat script ONNX Runtime secara dinamis
    const loadOnnxScript = () => {
      return new Promise((resolve, reject) => {
        if (typeof window.ort !== 'undefined') {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Gagal memuat ONNX Runtime script'));
        document.head.appendChild(script);
      });
    };

    const checkOrtAndLoadModels = async () => {
      if (retryCount >= maxRetries) {
        console.error('Maksimum percobaan tercapai. ONNX Runtime tidak tersedia.');
        setErrorMessage('Gagal memuat ONNX Runtime. Pastikan koneksi internet stabil dan coba refresh halaman.');
        return;
      }

      if (typeof window.ort === 'undefined') {
        console.warn('ONNX Runtime (ort) belum tersedia. Mencoba lagi dalam 100ms...');
        retryCount++;
        setTimeout(checkOrtAndLoadModels, 100);
        return;
      }

      try {
        console.log('ONNX Runtime (ort) siap. Mencoba memuat model...');
        window.ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
        const loaded = await loadModels();
        setModelsLoaded(loaded);
        if (!loaded) {
          setErrorMessage('Gagal memuat model analisis. Silakan refresh halaman.');
        }
      } catch (error) {
        console.error('Error memuat model ML:', error);
        setErrorMessage('Error memuat model. Pastikan koneksi internet stabil.');
      }
    };

    // Muat script ONNX Runtime, lalu coba muat model
    loadOnnxScript()
      .then(() => checkOrtAndLoadModels())
      .catch((error) => {
        console.error('Gagal memuat script ONNX Runtime:', error);
        setErrorMessage('Gagal memuat ONNX Runtime. Pastikan koneksi internet stabil.');
      });

    // Cleanup function
    return () => {
      cleanupModels();
      console.log('Model dan sesi telah dibersihkan.');
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Error kamera:', err);
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin telah diberikan.');
      stopCamera();
    }
  }, [stopCamera]);

  useEffect(() => {
    if (activeTab === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [activeTab, startCamera, stopCamera]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setErrorMessage('Tidak ada file yang dipilih.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('File harus berupa gambar (JPEG, PNG, dll).');
      return;
    }

    if (!modelsLoaded) {
      setErrorMessage('Model analisis belum siap. Tunggu sebentar...');
      return;
    }

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Gagal memuat gambar yang diunggah.'));
      });

      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
      setIsAnalyzing(true);
      setActiveTab('analysis');
      setErrorMessage('');

      const result = await analyzeImage(canvas);

      setAnalysisResult(result.result);
      setConfidence(result.confidence);

      if (result.isSampah) {
        try {
          await saveScanResult({
            imageUrl,
            result: result.result,
            confidence: result.confidence,
          });
        } catch (err) {
          console.error('Gagal menyimpan hasil scan:', err);
        }
      }

      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error('Error selama analisis gambar yang diunggah:', error);
      setAnalysisResult('Error');
      setErrorMessage('Gagal menganalisis gambar. Coba lagi.');
    } finally {
      setIsAnalyzing(false);
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current?.srcObject || !canvasRef.current) {
      setErrorMessage('Kamera tidak siap');
      return;
    }

    if (!modelsLoaded) {
      setErrorMessage('Model analisis belum siap. Tunggu sebentar...');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    try {
      if (video.readyState < 2) {
        await new Promise((resolve) => {
          video.onloadeddata = resolve;
        });
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
      setIsAnalyzing(true);
      setActiveTab('analysis');
      setErrorMessage('');

      const result = await analyzeImage(canvas);

      setAnalysisResult(result.result);
      setConfidence(result.confidence);

      if (result.isSampah) {
        try {
          await saveScanResult({
            imageUrl,
            result: result.result,
            confidence: result.confidence,
          });
        } catch (err) {
          console.error('Gagal menyimpan hasil scan:', err);
        }
      }
    } catch (error) {
      console.error('Error selama analisis:', error);
      setAnalysisResult('Error');
      setErrorMessage('Gagal menganalisis gambar. Coba lagi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setAnalysisResult('');
    setIsAnalyzing(false);
    setActiveTab('camera');
    setConfidence(0);
    setErrorMessage('');
    startCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pindai-container" style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Pindai Sampah</h1>

      <div className="tab-navigation" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`} disabled>
          1. Kamera
        </button>
        <button className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`} disabled>
          2. Analisis
        </button>
      </div>

      {errorMessage && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{errorMessage}</div>
      )}

      {!modelsLoaded && !errorMessage && (
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>Memuat model analisis...</div>
      )}

      <div className="tab-content">
        {activeTab === 'camera' && (
          <div className="camera-tab" style={{ textAlign: 'center' }}>
            <div className="video-container" style={{ position: 'relative', backgroundColor: '#000', borderRadius: '8px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {cameraError && <p style={{ color: 'red', padding: '10px' }}>{cameraError}</p>}
            </div>
            <div
              className="camera-controls"
              style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}
            >
              <button
                onClick={captureAndAnalyze}
                className="btn btn-capture"
                disabled={!!cameraError || !cameraActive || !modelsLoaded}
                style={{ padding: '12px 20px', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaSearch /> Pindai & Analisis Sampah
              </button>
              <button
                onClick={startCamera}
                disabled={cameraActive}
                style={{ padding: '12px 20px', fontSize: '16px', cursor: cameraActive ? 'not-allowed' : 'pointer' }}
              >
                <FaPlay /> Hidupkan Kamera
              </button>
              <button
                onClick={stopCamera}
                disabled={!cameraActive}
                style={{ padding: '12px 20px', fontSize: '16px', cursor: !cameraActive ? 'not-allowed' : 'pointer' }}
              >
                <FaPowerOff /> Matikan Kamera
              </button>
              <label
                className="btn btn-upload"
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <FaUpload /> Unggah Foto
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-tab" style={{ textAlign: 'center' }}>
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Analysed"
                style={{
                  maxWidth: '100%',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  transform: 'scaleX(-1)',
                }}
              />
            )}

            {isAnalyzing ? (
              <div style={{ padding: '20px' }}>
                <h3>Menganalisa...</h3>
                <p>Sistem sedang mengidentifikasi jenis sampah Anda.</p>
                <div style={{ marginTop: '20px' }}>
                  <div
                    className="loading-spinner"
                    style={{
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #3498db',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto',
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                {analysisResult === 'Bukan Sampah' ? (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d32f2f' }}>Tidak Terdeteksi Sampah</div>
                    <div style={{ marginTop: '10px', color: '#555' }}>
                      Tingkat keyakinan: {(confidence * 100).toFixed(1)}%
                    </div>
                    <div style={recommendationContainerStyle}>
                      <h3>⚠️ Tidak Terdeteksi Sampah</h3>
                      <p>Silakan coba lagi dengan mengarahkan kamera lebih dekat ke sampah yang ingin dipindai atau unggah gambar lain.</p>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <>
                    <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                      Hasil Deteksi: Sampah <span style={{ textTransform: 'uppercase' }}>{analysisResult}</span>
                      <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
                       
                      </div>
                    </div>
                    <Recommendation type={analysisResult} />
                    <VideoCarousel type={analysisResult} />
                  </>
                ) : errorMessage ? (
                  <div style={{ color: 'red', marginBottom: '20px' }}>{errorMessage}</div>
                ) : null}
              </>
            )}

            <button
              onClick={resetScan}
              disabled={isAnalyzing}
              className="btn btn-reset"
              style={{
                padding: '12px 20px',
                cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                marginTop: '20px',
              }}
            >
              <FaTrash /> Scan Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PindaiPage;