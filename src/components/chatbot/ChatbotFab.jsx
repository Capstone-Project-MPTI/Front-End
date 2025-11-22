import { useState, useRef, useEffect } from "react";
import { FaComment, FaTimes, FaRedo } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ChatbotFab.css"; // Pastikan path ini benar

// DATA SAMPAH LENGKAP
const wasteData = {
  responses: {
    ORGANIK: {
      "Sisa Makanan": {
        "Cara Membuang yang benar":
          "Pisahkan dari sampah anorganik, hindari mencampurnya dengan plastik atau bahan kimia, kemudian buang ke tempat kompos, lubang biopori, atau fasilitas pengelolaan sampah organik.",
        "Contoh pemanfaatan":
          "Dapat dijadikan pupuk kompos padat atau cair, digunakan untuk pakan ternak setelah proses tertentu, atau diolah menjadi energi melalui teknologi biogas.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Menyebabkan pencemaran lingkungan, mengundang tikus dan lalat, serta menghasilkan emisi gas rumah kaca seperti metana yang memperburuk perubahan iklim.",
        "Statistik dan fakta menarik tentang Sisa Makanan":
          "FAO mencatat sekitar 1,3 miliar ton makanan terbuang setiap tahun secara global, cukup untuk memberi makan 2 miliar orang.",
      },
      "Sisa Buah": {
        "Cara Membuang yang benar":
          "Pisahkan dari sampah non-organik, tiriskan jika masih basah, lalu masukkan ke tempat kompos atau buat eco-enzyme dengan campuran air dan gula.",
        "Contoh pemanfaatan":
          "Kulit dan potongan buah dapat digunakan sebagai bahan baku pupuk organik, bahan pembersih alami (eco-enzyme), atau fermentasi pakan hewan.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Menimbulkan bau menyengat, mempercepat pembusukan, dan berpotensi menyebarkan bakteri jika tercampur dengan sampah rumah tangga lain.",
        "Statistik dan fakta menarik tentang Sisa Buah":
          "Menurut Kementerian Lingkungan Hidup dan Kehutanan, limbah dapur menyumbang sekitar 60% dari total sampah organik rumah tangga di Indonesia.",
      },
      "Sampah Sayuran": {
        "Cara Membuang yang benar":
          "Kumpulkan secara terpisah, potong kecil-kecil untuk mempercepat proses pembusukan, lalu komposkan atau gunakan sebagai bahan biourban farming.",
        "Contoh pemanfaatan":
          "Bisa diolah menjadi kompos, dijadikan mulsa untuk mempertahankan kelembaban tanah, atau bahan campuran biogas.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Menyebabkan timbunan sampah basah, mempercepat pelapukan tempat penampungan sampah, dan menimbulkan penyakit jika menjadi sarang lalat.",
        "Statistik dan fakta menarik tentang Sayuran":
          "Di pasar tradisional, sayuran menjadi salah satu jenis sampah yang paling dominan, sering kali mencapai 50–70% dari total sampah harian.",
      },
      "Sampah Cangkang Telur": {
        "Cara Membuang yang benar":
          "Bersihkan dan keringkan terlebih dahulu, hancurkan menjadi potongan kecil, lalu campurkan ke dalam kompos atau taburkan langsung ke tanah.",
        "Contoh pemanfaatan":
          "Sumber kalsium untuk tanaman, bahan tambahan kompos, bahan penghilang bau kulkas, atau sebagai scrub alami untuk peralatan dapur.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Cangkang yang tidak bersih dapat menjadi sumber bakteri salmonella dan menyebabkan bau busuk jika membusuk dalam tempat tertutup.",
        "Statistik dan fakta menarik tentang Cangkang Telur":
          "Cangkang telur terdiri dari sekitar 95% kalsium karbonat yang sangat dibutuhkan oleh tanaman dalam memperkuat struktur sel.",
      },
      "Sisa Teh dan Kopi": {
        "Cara Membuang yang benar":
          "Pisahkan dari kantong plastik atau sisa kemasan, tiriskan cairannya, dan masukkan ke dalam kompos atau langsung ditaburkan di media tanam.",
        "Contoh pemanfaatan":
          "Ampas teh dan kopi bermanfaat untuk menyuburkan tanah, mengusir hama taman seperti semut dan siput, serta dapat digunakan sebagai masker alami kulit.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Jika bercampur dengan sampah plastik atau anorganik, akan sulit terurai dan kehilangan potensi kegunaannya.",
        "Statistik dan fakta menarik tentang Teh dan Kopi":
          "Indonesia adalah salah satu penghasil kopi terbesar di dunia, menghasilkan limbah ampas kopi rumah tangga dalam jumlah besar setiap hari.",
      },
      "Kotoran Hewan": {
        "Cara Membuang yang benar":
          "Kumpulkan secara teratur, simpan di tempat teduh untuk proses fermentasi atau kompos, dan hindari pembuangan langsung ke sungai atau saluran air.",
        "Contoh pemanfaatan":
          "Dapat difermentasi menjadi pupuk kandang, dijadikan bahan dasar biogas, atau dimanfaatkan sebagai sumber energi alternatif.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Mencemari air tanah, mengeluarkan bau menyengat, menjadi media berkembangnya patogen, dan menurunkan kualitas udara.",
        "Statistik dan fakta menarik tentang Kotoran Hewan":
          "Satu ekor sapi dapat menghasilkan 20–30 kg kotoran per hari, yang jika dikelola dengan benar bisa menghasilkan energi listrik atau gas memasak untuk rumah tangga.",
      },
      "Kayu Bekas Rumah Tangga": {
        "Cara Membuang yang benar":
          "Pisahkan dari bagian logam atau kaca (jika ada), pastikan kering dan bersih dari cat beracun, kemudian sumbangkan untuk daur ulang atau bawa ke bank sampah/pengepul yang menerima limbah kayu.",
        "Contoh pemanfaatan":
          "Kayu bekas dapat diolah menjadi furnitur baru, hiasan dinding, rak sederhana, papan penyangga tanaman, atau digunakan sebagai bahan bakar ramah lingkungan jika tidak terkontaminasi.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Kayu yang dibuang sembarangan bisa menjadi sarang rayap atau hama, menyebabkan pencemaran lingkungan jika mengandung zat kimia berbahaya seperti cat, lem, atau pelapis sintetis.",
        "Statistik dan fakta menarik tentang Kayu":
          "Setiap tahunnya, limbah kayu dari rumah tangga di kota besar diperkirakan mencapai lebih dari 1.000 ton, sebagian besar berasal dari furnitur bekas yang tidak dikelola secara berkelanjutan.",
      },
    },
    ANORGANIK: {
      Plastik: {
        "Cara Membuang yang benar":
          "Pisahkan plastik dari sampah organik, bersihkan, dan tempatkan di tempat sampah daur ulang.",
        "Contoh pemanfaatan":
          "Plastik dapat didaur ulang menjadi tas, pot tanaman, perabot rumah tangga, bahan bangunan (seperti bata plastik), hingga produk tekstil. Plastik keras seperti galon bekas dapat digunakan kembali, sedangkan plastik kresek bisa dijadikan kerajinan tangan.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Plastik membutuhkan ratusan tahun untuk terurai dan dapat mencemari tanah serta laut, membahayakan satwa dan rantai makanan.",
        "Statistik dan fakta menarik tentang sampah":
          "Diperkirakan 8 juta ton sampah plastik masuk ke laut setiap tahun, dan hanya 9% dari plastik dunia yang didaur ulang.",
      },
      Kaca: {
        "Cara Membuang yang benar":
          "Pisahkan kaca dari sampah lainnya, bungkus dengan kertas atau kain bekas jika pecah untuk menghindari cedera, lalu serahkan ke bank sampah, pengepul, atau tempat daur ulang yang menerima kaca.",
        "Contoh pemanfaatan":
          "Kaca utuh bisa digunakan kembali sebagai wadah atau dekorasi. Kaca pecah dapat dilebur dan dijadikan bahan baku pembuatan kaca baru, ubin, atau media kreatif seperti mozaik.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Kaca yang dibuang sembarangan dapat menyebabkan luka serius, mencemari lingkungan karena tidak terurai secara alami, dan jika tercampur dengan bahan organik akan menyulitkan proses daur ulang.",
        "Statistik dan fakta menarik tentang Kaca":
          "Kaca termasuk material yang dapat didaur ulang 100% tanpa mengurangi kualitasnya. Namun, tingkat daur ulang kaca di Indonesia masih sangat rendah karena kurangnya fasilitas pemrosesan lokal.",
      },
      Logam: {
        "Cara Membuang yang benar":
          "Kumpulkan logam bekas seperti kaleng, tutup botol, dan peralatan dapur secara terpisah. Pastikan tidak ada sisa makanan atau cairan yang menempel. Jangan dibakar atau dibuang ke tempat sampah biasa. Bawa ke bank sampah, atau tempat pengumpulan logam yang menerima dan mendaur ulang jenis logam tersebut.",
        "Contoh pemanfaatan":
          "Logam seperti aluminium dan besi dapat dilebur untuk dijadikan bahan baku produk baru seperti kaleng, peralatan rumah tangga, bahkan konstruksi. Kaleng bekas juga bisa dimanfaatkan sebagai pot tanaman atau kerajinan.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Logam berkarat dapat mencemari tanah dan air, membahayakan keselamatan karena ujung tajam, dan jika dibakar akan menghasilkan zat beracun bagi manusia dan lingkungan.",
        "Statistik dan fakta menarik tentang Logam":
          "Aluminium adalah salah satu logam yang paling banyak didaur ulang di dunia. Daur ulang satu kaleng aluminium dapat menghemat energi yang cukup untuk menyalakan televisi selama 3 jam.",
      },
      "Sepatu Bekas": {
        "Cara Membuang yang benar":
          "Pastikan sepatu dalam keadaan kering dan bersih dari lumpur atau kotoran. Jika masih layak pakai, sumbangkan ke lembaga sosial, komunitas daur ulang, atau program donasi sepatu. Untuk sepatu yang sudah rusak parah, serahkan ke bank sampah atau pengrajin daur ulang yang dapat memanfaatkannya sebagai bahan baku baru.",
        "Contoh pemanfaatan":
          "Sepatu bekas yang masih layak bisa digunakan kembali oleh orang lain. Sepatu rusak dapat didaur ulang menjadi isi bantal, bahan kerajinan, lapisan pelindung jalan, atau bahkan komponen bahan baku industri seperti matras olahraga.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Sepatu yang dibuang sembarangan membutuhkan waktu puluhan tahun untuk terurai karena terdiri dari campuran karet, plastik, dan kain sintetis. Ini berpotensi mencemari tanah dan air serta menambah volume sampah di TPA.",
        "Statistik dan fakta menarik tentang Sepatu Bekas":
          "Menurut World Footwear Yearbook, produksi sepatu global mencapai lebih dari 24 miliar pasang per tahun, dengan jutaan pasang terbuang setiap tahunnya — sebagian besar berakhir di tempat pembuangan tanpa didaur ulang.",
      },
      Karet: {
        "Cara Membuang yang benar":
          "Pastikan karet dalam keadaan bersih dan kering. Pilah karet dari jenis sampah lainnya. Karet bekas, seperti ban atau gelang, sebaiknya diserahkan ke bank sampah, pengrajin daur ulang, atau industri yang menggunakan karet sebagai bahan baku.",
        "Contoh pemanfaatan":
          "Ban bekas dapat dimanfaatkan sebagai pot tanaman, bahan baku paving block, pelindung dinding dermaga, atau ayunan anak. Karet gelang bisa digunakan kembali untuk keperluan rumah tangga.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Karet membutuhkan waktu sangat lama untuk terurai. Jika dibakar sembarangan, karet menghasilkan asap beracun yang berbahaya bagi kesehatan dan mencemari udara.",
        "Statistik dan fakta menarik tentang Karet":
          "Menurut data Statista, produksi karet alam global mencapai lebih dari 13 juta ton pada 2021. Sebagian besar limbah karet berasal dari ban kendaraan, dengan 1,5 miliar ban bekas dibuang setiap tahunnya di seluruh dunia.",
      },
      Kertas: {
        "Cara Membuang yang benar":
          "Pisahkan kertas dari sampah basah atau minyak agar tidak rusak. Kumpulkan kertas bekas di tempat kering dan serahkan ke bank sampah atau tempat daur ulang.",
        "Contoh pemanfaatan":
          "Kertas daur ulang bisa dijadikan tisu, kertas cetak ulang, kerajinan tangan, atau bahan kompos bila sudah terlalu rusak.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Kertas yang dibuang sembarangan meningkatkan beban TPA dan mempercepat deforestasi karena permintaan kertas baru meningkat.",
        "Statistik dan fakta menarik tentang Kertas":
          "Menurut WWF, sekitar 40% dari semua kayu industri digunakan untuk membuat kertas. Daur ulang satu ton kertas dapat menghemat 17 pohon dan 26.500 liter air.",
      },
      Elektronik: {
        "Cara Membuang yang benar":
          "Jangan membuang sampah elektronik ke tempat sampah biasa. Kumpulkan dan serahkan ke e-waste center atau program pengumpulan elektronik bekas yang aman.",
        "Contoh pemanfaatan":
          "Komponen logam dan plastik dari perangkat elektronik dapat diambil kembali untuk digunakan dalam pembuatan barang baru, seperti logam untuk industri dan plastik untuk peralatan rumah tangga.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Sampah elektronik mengandung logam berat berbahaya seperti merkuri dan timbal yang bisa mencemari air tanah dan udara jika dibakar atau dibuang sembarangan.",
        "Statistik dan fakta menarik tentang Elektronik":
          "Menurut Global E-waste Monitor 2020, dunia menghasilkan 53,6 juta ton e-waste pada 2019, namun hanya 17,4% yang didaur ulang secara formal.",
      },
      Styrofoam: {
        "Cara Membuang yang benar":
          "Styrofoam sebaiknya dikumpulkan terpisah karena tidak bisa terurai secara alami. Serahkan ke tempat daur ulang khusus styrofoam atau pengrajin kreatif yang dapat mengolahnya.",
        "Contoh pemanfaatan":
          "Styrofoam bisa diubah menjadi kerajinan tangan, campuran beton ringan, atau bahan pelindung kemasan ulang.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Styrofoam tidak bisa terurai secara alami dan mudah terfragmentasi menjadi mikroplastik yang mencemari laut dan membahayakan hewan laut.",
        "Statistik dan fakta menarik tentang Styrofoam":
          "Menurut penelitian Environmental Protection Agency (EPA), styrofoam membutuhkan lebih dari 500 tahun untuk terurai, dan banyak digunakan sebagai kemasan makanan yang hanya sekali pakai.",
      },
      Kain: {
        "Cara Membuang yang benar":
          "Pastikan kain dalam kondisi bersih dan kering. Pisahkan kain yang masih layak pakai untuk didonasikan, dan sisanya dapat diberikan ke bank sampah atau komunitas daur ulang tekstil.",
        "Contoh pemanfaatan":
          "Kain bekas dapat diubah menjadi keset, tas daur ulang, isi bantal, atau produk fashion upcycled.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Kain dari serat sintetis mengandung mikroplastik yang bisa mencemari air dan tanah saat terurai. Pembuangan sembarangan juga menambah beban TPA.",
        "Statistik dan fakta menarik tentang Kain":
          "Industri tekstil menghasilkan sekitar 92 juta ton limbah setiap tahun secara global, menurut Ellen MacArthur Foundation. Hanya 15% yang didaur ulang atau digunakan kembali.",
      },
      Kardus: {
        "Cara Membuang yang benar":
          "Lipatan kardus agar hemat tempat, dan pastikan tidak basah atau berminyak. Serahkan ke bank sampah atau tempat pengepul untuk didaur ulang.",
        "Contoh pemanfaatan":
          "Kardus bekas bisa digunakan kembali sebagai wadah penyimpanan, bahan kerajinan, atau didaur ulang menjadi kardus baru, kertas coklat, dan tisu daur ulang.",
        "Dampak buruk jika tidak dikelola dengan benar":
          "Kardus yang tidak didaur ulang meningkatkan volume sampah kering. Jika basah, tidak bisa didaur ulang dan akhirnya berakhir di TPA.",
        "Statistik dan fakta menarik tentang Kardus":
          "Menurut American Forest & Paper Association, tingkat daur ulang kardus di AS mencapai lebih dari 88% pada 2021, menjadikannya salah satu material daur ulang paling sukses.",
      },
    },
  },
};

const ChatbotFab = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState({
    currentStep: 0,
    answers: [],
    isComplete: false,
    currentFlowKey: null,
  });

  const initialBotMessageId = useRef(Date.now()).current;

  const initialBotMessage = {
    id: initialBotMessageId,
    text: "Hai! Saya SortiBot, asisten virtual Anda. Pilih kategori bantuan di bawah ini:",
    sender: "bot",
    options: [
      "Jelajahi Detail Jenis Sampah",
      "Informasi Umum Sampah & Daur Ulang",
      "Bantuan Teknis & Navigasi Website",
      "Tentang SortiBot & Proyek Ini",
      "Hubungi Dukungan",
    ],
  };

  const [messages, setMessages] = useState([initialBotMessage]);

  const fabRef = useRef(null);
  const chatWindowRef = useRef(null);
  const messagesEndRef = useRef(null);

  const conversationFlow = {
    "Informasi Umum Sampah & Daur Ulang": [
      {
        question: "Topik informasi apa yang Anda minati?",
        options: [
          "Jenis-jenis Sampah (Umum)",
          "Pentingnya Memilah Sampah",
          "Konsep 3R (Reduce, Reuse, Recycle)",
          "Dampak Buruk Sampah Tidak Terkelola",
          "Istilah Umum (Bank Sampah, TPS, TPS3R, TPA)",
        ],
        responseKey: "generalInfoTopic",
      },
      {
        conclusion:
          "Berikut informasi singkat tentang {generalInfoTopic}:\n\n{infoDetail}\n\nUntuk informasi lebih lengkap, silakan kunjungi halaman Artikel atau FAQ di website kami.",
        infoDetails: {
          "Jenis-jenis Sampah (Umum)":
            "Secara umum sampah dibagi menjadi organik (sisa makanan, daun), anorganik (plastik, kertas, logam, kaca), dan B3 (Bahan Berbahaya dan Beracun: baterai, elektronik, oli bekas).",
          "Pentingnya Memilah Sampah":
            "Memilah sampah memudahkan proses daur ulang, mengurangi volume sampah ke TPA, mencegah pencemaran, dan bisa bernilai ekonomis.",
          "Konsep 3R (Reduce, Reuse, Recycle)":
            "Reduce: Kurangi produksi sampah (bawa tas belanja sendiri). Reuse: Gunakan kembali barang (botol minum isi ulang). Recycle: Daur ulang sampah menjadi produk baru.",
          "Dampak Buruk Sampah Tidak Terkelola":
            "Pencemaran tanah, air, udara, penyebaran penyakit, banjir, kerusakan ekosistem, dan mengganggu estetika.",
          "Istilah Umum (Bank Sampah, TPS, TPS3R, TPA)":
            "Bank Sampah: tempat pengumpulan sampah terpilah yang bisa ditabung. TPS: Tempat Penampungan Sementara. TPS3R: TPS Reduce, Reuse, Recycle. TPA: Tempat Pemrosesan Akhir.",
        },
      },
    ],
    "Bantuan Teknis & Navigasi Website": [
      {
        question: "Apa yang bisa kami bantu terkait penggunaan website?",
        options: [
          "Cara Klasifikasi Gambar",
          "Menginterpretasi Hasil Klasifikasi",
          "Navigasi Menu dan Halaman",
        ],
        responseKey: "technicalHelpTopic",
      },
      {
        conclusion:
          "Panduan untuk {technicalHelpTopic}:\n\n{technicalSolution}\n\nJika masalah berlanjut, coba refresh halaman atau hubungi dukungan.",
        technicalSolutions: {
          "Cara Klasifikasi Gambar":
            'Di halaman utama, cari tombol "Pindai Sampah" dan klik Mulai Kamera. Lalu coba foto sampah yang ingin anda ketahui dan Tunggu proses analisis selesai.',
          "Menginterpretasi Hasil Klasifikasi":
            "Hasil akan menampilkan prediksi jenis sampah, persentase keyakinan, dan saran pengelolaan",
          "Navigasi Menu dan Halaman":
            "Gunakan menu utama di bagian atas halaman untuk berpindah antar fitur",
        },
      },
    ],
    "Tentang SortiBot & Proyek Ini": [
      {
        conclusion:
          'SortiBot adalah asisten yang dirancang untuk membantu Anda dalam mengidentifikasi sampah, mendapatkan informasi daur ulang, dan menemukan fasilitas pengelolaan sampah. Proyek ini bertujuan untuk meningkatkan kesadaran dan partisipasi masyarakat dalam pengelolaan sampah yang bertanggung jawab. Kami menggunakan teknologi machine learning untuk klasifikasi sampah (catatan: model masih dalam pengembangan dan terus ditingkatkan). Untuk lebih detail, kunjungi halaman "Tentang Kami" di website.',
      },
    ],
    // === PERUBAHAN DI SINI ===
    "Hubungi Dukungan": [
      {
        conclusion:
          "Jika Anda mengalami masalah teknis yang tidak terjawab di sini, memiliki pertanyaan lebih lanjut, atau ingin memberikan feedback, silakan hubungi kami melalui:\n- Email: support@wastesnap.com\n- [WHATSAPP_LINK]\n\nKami akan berusaha merespons secepatnya.",
      },
    ],
    "Jelajahi Detail Jenis Sampah": [
      {
        question: "Pilih kategori besar sampah yang ingin Anda jelajahi:",
        options: Object.keys(wasteData.responses),
        responseKey: "selectedWasteCategory",
      },
      {
        question:
          "Pilih jenis sampah spesifik dari kategori {selectedWasteCategory}:",
        responseKey: "selectedSpecificWasteType",
      },
      {
        question:
          "Informasi apa tentang {selectedSpecificWasteType} yang ingin Anda ketahui?",
        responseKey: "selectedInfoAspect",
      },
      {
        conclusion:
          "Berikut detail untuk {selectedInfoAspect} dari {selectedSpecificWasteType} ({selectedWasteCategory}):\n\n{detailedWasteInfo}",
      },
    ],
  };

  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 80 : 0,
    y: typeof window !== "undefined" ? window.innerHeight - 80 : 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wasDragged, setWasDragged] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Review jika perlu penyesuaian posisi FAB otomatis saat chat window dibuka
  }, [isOpen]);

  const handleOptionSelect = (option) => {
    const userMessage = {
      id: Date.now(),
      text: option,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);

    let currentPathKey = conversation.currentFlowKey;
    let stepIndex = conversation.currentStep;
    let currentAnswers = [...conversation.answers, option];
    let nextBotOptions = null;

    if (stepIndex === 0) {
      currentPathKey = option;
      if (
        conversationFlow[currentPathKey] &&
        conversationFlow[currentPathKey].length === 1 &&
        conversationFlow[currentPathKey][0].conclusion &&
        !conversationFlow[currentPathKey][0].options
      ) {
        const flowStep = conversationFlow[currentPathKey][0];
        const conclusionText = generateConclusion(
          flowStep,
          currentAnswers,
          currentPathKey
        );
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: conclusionText,
            sender: "bot",
            isConclusion: true,
          },
        ]);
        setConversation({
          currentStep: 1,
          answers: currentAnswers,
          isComplete: true,
          currentFlowKey: currentPathKey,
        });
        return;
      }
      if (
        currentPathKey === "Jelajahi Detail Jenis Sampah" &&
        conversationFlow[currentPathKey] &&
        conversationFlow[currentPathKey][0]
      ) {
        nextBotOptions = conversationFlow[currentPathKey][0].options;
      }
    } else if (currentPathKey === "Jelajahi Detail Jenis Sampah") {
      if (stepIndex === 1) {
        const selectedCategory = option;
        if (wasteData.responses[selectedCategory]) {
          nextBotOptions = Object.keys(wasteData.responses[selectedCategory]);
        }
      } else if (stepIndex === 2) {
        const selectedCategory = conversation.answers[1];
        const specificWasteType = option;
        if (
          wasteData.responses[selectedCategory] &&
          wasteData.responses[selectedCategory][specificWasteType]
        ) {
          nextBotOptions = Object.keys(
            wasteData.responses[selectedCategory][specificWasteType]
          );
        }
      }
    }

    const currentFlow = conversationFlow[currentPathKey];

    if (!currentFlow) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Maaf, pilihan tidak valid. Silakan mulai lagi.",
          sender: "bot",
        },
      ]);
      resetConversation(false);
      return;
    }

    if (stepIndex < currentFlow.length) {
      const flowStep = currentFlow[stepIndex];

      if (!flowStep) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Terjadi kesalahan internal. Silakan mulai lagi.",
            sender: "bot",
          },
        ]);
        resetConversation(false);
        return;
      }

      if (flowStep.conclusion) {
        const conclusionText = generateConclusion(
          flowStep,
          currentAnswers,
          currentPathKey
        );
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: conclusionText,
            sender: "bot",
            isConclusion: true,
          },
        ]);
        setConversation({
          currentStep: stepIndex + 1,
          answers: currentAnswers,
          isComplete: true,
          currentFlowKey: currentPathKey,
        });
      } else if (flowStep.question) {
        const nextQuestion = generateQuestion(
          flowStep,
          currentAnswers,
          currentPathKey
        );
        const definedOptions = flowStep.options || [];
        const finalOptions = nextBotOptions || definedOptions;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: nextQuestion,
            sender: "bot",
            options: finalOptions,
          },
        ]);
        setConversation({
          currentStep: stepIndex + 1,
          answers: currentAnswers,
          isComplete: false,
          currentFlowKey: currentPathKey,
        });
      }
    }
  };

  const generateQuestion = (flowStep, answers, pathKey) => {
    let question = flowStep.question;
    const currentFlowDefinition = conversationFlow[pathKey];
    let relevantAnswersStartIndex = 1;

    if (pathKey === "Jelajahi Detail Jenis Sampah") {
      if (question.includes("{selectedWasteCategory}") && answers[1]) {
        question = question.replace(/{selectedWasteCategory}/g, answers[1]);
      }
      if (question.includes("{selectedSpecificWasteType}") && answers[2]) {
        question = question.replace(/{selectedSpecificWasteType}/g, answers[2]);
      }
      return question;
    }

    if (currentFlowDefinition) {
      for (let i = 0; i < conversation.currentStep; i++) {
        if (currentFlowDefinition[i] && currentFlowDefinition[i].responseKey) {
          const placeholder = `{${currentFlowDefinition[i].responseKey}}`;
          const answerIndex = relevantAnswersStartIndex + i;
          if (question.includes(placeholder) && answers[answerIndex]) {
            question = question.replace(
              new RegExp(
                placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g"
              ),
              answers[answerIndex]
            );
          }
        }
      }
    }
    return question;
  };

  const generateConclusion = (flowStep, answers, pathKey) => {
    let conclusion = flowStep.conclusion;
    const currentFlowDefinition = conversationFlow[pathKey];
    let relevantAnswersStartIndex = 1;

    if (pathKey === "Jelajahi Detail Jenis Sampah") {
      const selectedCat = answers[1];
      const specificType = answers[2];
      const aspect = answers[3];

      conclusion = conclusion.replace(
        /{selectedWasteCategory}/g,
        selectedCat || ""
      );
      conclusion = conclusion.replace(
        /{selectedSpecificWasteType}/g,
        specificType || ""
      );
      conclusion = conclusion.replace(/{selectedInfoAspect}/g, aspect || "");

      if (
        wasteData.responses[selectedCat] &&
        wasteData.responses[selectedCat][specificType] &&
        wasteData.responses[selectedCat][specificType][aspect]
      ) {
        conclusion = conclusion.replace(
          /{detailedWasteInfo}/g,
          wasteData.responses[selectedCat][specificType][aspect]
        );
      } else {
        conclusion = conclusion.replace(
          /{detailedWasteInfo}/g,
          "Maaf, detail informasi untuk kombinasi ini tidak ditemukan."
        );
      }
      return conclusion;
    }

    if (currentFlowDefinition) {
      for (let i = 0; i < currentFlowDefinition.length - 1; i++) {
        const stepDef = currentFlowDefinition[i];
        if (stepDef && stepDef.responseKey) {
          const keyPlaceholder = `{${stepDef.responseKey}}`;
          const answerForThisKey = answers[relevantAnswersStartIndex + i];
          if (answerForThisKey) {
            conclusion = conclusion.replace(
              new RegExp(
                keyPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g"
              ),
              answerForThisKey
            );
          } else {
            conclusion = conclusion.replace(
              new RegExp(
                keyPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g"
              ),
              ""
            );
          }
        }
      }
    }

    const specificAnswersForFlow = answers.slice(relevantAnswersStartIndex);

    if (flowStep.infoDetails) {
      const topicKey =
        specificAnswersForFlow[specificAnswersForFlow.length - 1];
      conclusion = conclusion.replace(
        "{infoDetail}",
        flowStep.infoDetails[topicKey] || "Detail info tidak tersedia."
      );
    } else if (flowStep.technicalSolutions) {
      const topicKey =
        specificAnswersForFlow[specificAnswersForFlow.length - 1];
      const solutionText =
        flowStep.technicalSolutions[topicKey] ||
        "Solusi teknis untuk topik ini tidak tersedia.";
      conclusion = conclusion.replace("{technicalSolution}", solutionText);
    }

    return conclusion;
  };

  const resetConversation = (addInitialMsg = true) => {
    const newBotMessageOnReset = {
      ...initialBotMessage,
      id: Date.now(),
    };
    const newMessages = addInitialMsg ? [newBotMessageOnReset] : [];

    setMessages(newMessages);
    setConversation({
      currentStep: 0,
      answers: [],
      isComplete: false,
      currentFlowKey: null,
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = fabRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    setWasDragged(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setWasDragged(true);

    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    const fabWidth = fabRef.current ? fabRef.current.offsetWidth : 60;
    const fabHeight = fabRef.current ? fabRef.current.offsetHeight : 60;
    const margin = 20;

    newX = Math.max(
      margin,
      Math.min(newX, window.innerWidth - fabWidth - margin)
    );
    newY = Math.max(
      margin,
      Math.min(newY, window.innerHeight - fabHeight - margin)
    );

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp]);

  const toggleOpen = () => {
    if (wasDragged) {
      setWasDragged(false);
      return;
    }
    setIsOpen(!isOpen);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div
        ref={fabRef}
        className={`chatbot-fab ${isOpen ? "active" : ""}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onClick={toggleOpen}
      >
        {isOpen ? <FaTimes /> : <FaComment />}
      </div>

      {isOpen && (
        <div
          ref={chatWindowRef}
          className="chatbot-window"
          style={{
            left: `${Math.max(
              20,
              Math.min(
                position.x - 350 / 2 + (fabRef.current?.offsetWidth || 60) / 2,
                window.innerWidth - 350 - 20
              )
            )}px`,
            top: `${Math.max(
              20,
              position.y - (chatWindowRef.current?.offsetHeight || 400) - 20
            )}px`,
          }}
        >
          <div className="chatbot-header">
            <h3>SortiBot</h3>
            <p>AI Pembantu Sampah Anda</p>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {/* === PERUBAHAN DI SINI === */}
                {msg.text.split("\n").map((line, i) => {
                  if (line.trim() === "- [WHATSAPP_LINK]") {
                    const phoneNumber = "6288262749061";
                    const message = encodeURIComponent(
                      "hai, saya ingin komplain"
                    );
                    const waLink = `https://wa.me/${phoneNumber}?text=${message}`;

                    return (
                      <p key={i}>
                        - WhatsApp:{" "}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Klik di sini untuk komplain
                        </a>
                      </p>
                    );
                  }
                  return <p key={i}>{line}</p>;
                })}

                {msg.options &&
                  msg.options.length > 0 &&
                  (!conversation.isComplete ||
                    (conversation.isComplete &&
                      msg.id === initialBotMessageId &&
                      messages.length === 1)) && (
                    <div className="message-options">
                      {msg.options.map((optionText, index) => (
                        <button
                          key={index}
                          className="option-button"
                          onClick={() => handleOptionSelect(optionText)}
                        >
                          {optionText}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
            {conversation.isComplete && (
              <button
                className="restart-button"
                onClick={() => resetConversation(true)}
              >
                <FaRedo /> Kembali ke Menu Utama
              </button>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotFab;
