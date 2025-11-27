import { useCallback, useEffect, useRef, useState } from 'react';
import { FaPlay, FaPowerOff, FaSearch, FaTrash, FaUpload } from 'react-icons/fa';
import { saveScanResult } from '../../service/api';
import '../../styles/pindai.css';

const MODEL_PATHS = {
    adaSampah: '/model_sampah.onnx',
    jenisSampah: '/sortify_model-1.onnx'
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
        throw new Error('Model belum dimuat.');
    }

    const tensor = preprocess(canvasElement);

    // --- TAHAP 1: DETEKSI ADA SAMPAH ATAU TIDAK ---
    const adaSampahFeeds = { [adaSampahSession.inputNames[0]]: tensor };
    const adaSampahResults = await adaSampahSession.run(adaSampahFeeds);

    const adaSampahOutput = adaSampahResults[adaSampahSession.outputNames[0]].data;
    const probSampah = adaSampahOutput[0];  

    if (probSampah < 0.5) {
        return {
            isSampah: false,
            category: "Bukan Sampah",
            type: "-",
            confidence: probSampah
        };
    }

    // --- TAHAP 2: MODEL 2 OUTPUT (kategori + jenis) ---
    const jenisFeeds = { [jenisSampahSession.inputNames[0]]: tensor };
    const jenisResults = await jenisSampahSession.run(jenisFeeds);

    let kategoriPred = null;
    let jenisPred = null;

    // MODEL KAMU PUNYA 2 OUTPUT → pisahkan otomatis
    for (const key of Object.keys(jenisResults)) {
        const arr = Array.from(jenisResults[key].data);

        if (arr.length === 2) kategoriPred = arr;
        else if (arr.length === 17) jenisPred = arr;
    }

    if (!kategoriPred || !jenisPred) {
        throw new Error("Output model tidak lengkap.");
    }

    // Argmax kategori & jenis
    const idxKategori = kategoriPred.indexOf(Math.max(...kategoriPred));
    const idxJenis = jenisPred.indexOf(Math.max(...jenisPred));

    // Mapping ke label JSON
    const kategoriMap = ["Anorganik", "Organik"];
    const jenisMap = [
        "Cangkang Telur","Elektronik","Kaca","Kain","Kardus","Karet","Kayu",
        "Kertas","Kotoran Hewan","Logam","Plastik","Sepatu","Sisa Buah",
        "Sisa Teh Kopi","Sisa makanan","Styrofoam","Tumbuhan"
    ];

    return {
        isSampah: true,
        category: kategoriMap[idxKategori],
        type: jenisMap[idxJenis],
        confidence: jenisPred[idxJenis]
    };
}


export function cleanupModels() {
    adaSampahSession = null;
    jenisSampahSession = null;
    console.log('Sesi model ONNX telah dibersihkan.');
}

// --- Komponen-komponen UI ---

// --- 1. Helper Link Video ---
const getEmbedUrl = (url) => {
  let videoId = '';
  if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
  else if (url.includes('youtube.com/shorts/')) videoId = url.split('shorts/')[1]?.split('?')[0];
  else if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
  else if (url.includes('/embed/')) return url;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

// --- 2. Database KONTEN LENGKAP ---
const wasteData = {
  "Cangkang Telur": {
    category: "Organik",
    theme: "organic",
    decompose: "1 - 3 Tahun",
    funFact: "Cangkang telur mengandung 95% kalsium karbonat, bahan yang sama dengan penyusun batu kapur, kerang laut, dan terumbu karang!",
    description: "Cangkang telur adalah sumber kalsium alami terbaik. Jangan dibuang ke tong sampah biasa, karena bisa menjadi 'emas' bagi tanaman Anda.",
    handling: ["Cuci bersih lendir putihnya", "Jemur hingga kering", "Tumbuk halus sebelum ditabur ke tanah"],
    manfaat: ["Pupuk alami penguat batang", "Pengusir hama siput (tekstur tajam)", "Campuran pakan ternak"],
    videos: [
      'https://youtube.com/shorts/zpycidD8FiE?si=4jP8c1f85YVYSiln',
      'https://youtube.com/shorts/UNsmCGLNbqU?si=r-VJZCxAyEAb04aN',
      'https://youtu.be/pMeLBot49I0?si=3FE4naUXy8eZCcEv',
      'https://youtu.be/2TJtg3mdSz4?si=Zmm0YjdVl8-gsCMz',
      'https://youtu.be/4RGQzvvMFpc?si=NbJwpv3V4r0Ae8DO',
      'https://youtu.be/9Sc_7MCVPNM?si=ST0CFa5xd_v62T3M',
      'https://youtu.be/c9eyEXEz3gQ?si=lgArmbqdjE8kFX8I',
    ]
  },
  "Elektronik": {
    category: "Anorganik (B3 - Berbahaya)",
    theme: "danger",
    decompose: "Tidak Terurai (Jutaan Tahun)",
    funFact: "Satu ton sampah sirkuit elektronik bisa mengandung emas 40-800 kali lebih banyak daripada satu ton bijih emas dari tambang!",
    description: "E-Waste mengandung logam berharga (emas, perak) tapi juga racun berbahaya (merkuri, timbal). SANGAT BERBAHAYA jika dibuang sembarangan.",
    handling: ["JANGAN dibongkar sendiri (risiko ledakan/racun)", "Pisahkan dari sampah rumah tangga", "Serahkan ke dropbox E-Waste khusus"],
    manfaat: ["Recovery logam mulia", "Sparepart kanibalan", "Mengurangi penambangan baru"],
    videos: [
      'https://youtu.be/XH7UrHnqZHA?si=gYoIef51izoqvzzA',
      'https://youtu.be/pC2EH-1bpsM?si=TBMNcuRdklo6ReAS',
      'https://youtu.be/t14GIjmHgsk?si=lBvU2wfTnVG2kqTE',
      'https://youtube.com/shorts/VwEApm_jJ1s?si=oFtwDWUedZes-reH',
      'https://youtu.be/IMMJpiAlqkc?si=msEHH0S45IV9H9zg',
      'https://youtu.be/w0ikFMTuS9c?si=fF7dwtSwvltfq07x',
      'https://youtu.be/AGR_NQbaaPI?si=ah5gO5oAUY7WYQo1',
    ]
  },
  "Kaca": {
    category: "Anorganik (Daur Ulang)",
    theme: "recycle",
    decompose: "1 Juta Tahun (Nyaris Abadi)",
    funFact: "Kaca adalah satu-satunya material yang bisa didaur ulang 100% berulang kali tanpa penurunan kualitas sedikitpun.",
    description: "Kaca dibuat dari pasir silika. Karena sifatnya yang tajam dan abadi, sampah kaca harus diperlakukan dengan sangat hati-hati.",
    handling: ["Cuci bersih botol/toples", "Jika pecah, BUNGKUS dengan kardus/koran tebal", "Beri tulisan 'KACA PECAH' agar petugas tidak terluka"],
    manfaat: ["Dilebur jadi botol baru", "Bahan aspal glasphalt", "Seni mozaik"],
    videos: [
      'https://youtube.com/shorts/eEJwB7h-L0M?si=knhZeltJHBUA-7Xf',
      'https://youtube.com/shorts/VfKdBzkUw4s?si=uar-ZQLKZRrc4bi8',
      'https://youtu.be/jTcqzBzsq7Y?si=m_ggwV9nk1hcKT-p',
      'https://youtu.be/_M-lGs_yqXM?si=zQWsApJn-aGt7q3e',
      'https://youtu.be/D8Gr4FCC350?si=vG7vRtIV2-rOLLQU',
      'https://youtu.be/Ua3DuBXCU_A?si=VcAiedVDvONObCHa',
      'https://youtu.be/gWxUkhwS4sU?si=OwfKW3XcU3f8gozT',
    ]
  },
  "Kain": {
    category: "Anorganik (Residu/Guna Ulang)",
    theme: "general",
    decompose: "20 - 200 Tahun",
    funFact: "Industri fashion adalah penyumbang limbah terbesar kedua di dunia setelah minyak. Baju poliester melepaskan mikroplastik saat dicuci.",
    description: "Limbah tekstil menumpuk cepat karena tren 'Fast Fashion'. Kain sintetis sulit terurai, sementara kain katun butuh banyak air untuk diproduksi.",
    handling: ["Donasikan jika layak pakai", "Jadikan lap majun jika sobek", "Upcycle jadi tas/bantal"],
    manfaat: ["Bahan peredam suara", "Isian jok/boneka", "Kerajinan tangan (Perca)"],
    videos: [
      'https://youtu.be/ov-184Z5riA?si=vntMeV-yqSqNkwcn',
      'https://youtu.be/e29VKsc3LMU',
      'https://www.youtube.com/watch?v=jTPwOF8rYqM&start=4',
      'https://youtu.be/axw4FNnrldA',
      'https://youtu.be/bBeHHhfxXJI',
      'https://youtu.be/4W2ytnaBRy8',
      'https://youtu.be/YvXXFyd1qGU',
    ]
  },
  "Kardus": {
    category: "Anorganik (Bernilai Tinggi)",
    theme: "recycle",
    decompose: "2 - 5 Bulan",
    funFact: "Mendaur ulang 1 ton kardus dapat menyelamatkan 17 pohon dan menghemat 4.000 KW energi listrik.",
    description: "Kardus (Corrugated Box) adalah favorit bank sampah dan pemulung karena mudah didaur ulang dan harganya stabil.",
    handling: ["Lepaskan selotip/lakban plastik", "Pastikan kering (tidak kena minyak)", "Lipat hingga pipih untuk hemat tempat"],
    manfaat: ["Bahan kertas daur ulang", "Mulsa tanaman (penutup tanah)", "Kerajinan mainan anak"],
    videos: [
      'https://youtu.be/h5SQfe4sDmo',
      'https://youtu.be/pKdM4ssJ7vY',
      'https://youtu.be/lVLCHvedEMU',
      'https://youtu.be/inU5gsI9FJw',
      'https://youtu.be/GHLM6_8GIog',
      'https://youtu.be/sZGBfWHKcbQ',
      'https://youtu.be/DdZWisG6t-Q',
    ]
  },
  "Karet": {
    category: "Anorganik (Sulit Terurai)",
    theme: "danger",
    decompose: "50 - 80 Tahun",
    funFact: "Membakar karet (seperti ban) melepaskan gas karsinogenik yang sangat beracun dan bisa menyebabkan kanker.",
    description: "Karet alam maupun sintetis sangat alot dan tahan cuaca. Seringkali berakhir menjadi sarang nyamuk jika dibiarkan menumpuk.",
    handling: ["Jangan dibakar!", "Gunakan ulang untuk pot/kursi", "Serahkan ke pengrajin daur ulang karet"],
    manfaat: ["Pot tanaman awet", "Sandal daur ulang", "Campuran aspal jalanan"],
    videos: [
      'https://youtu.be/ud1rVHMaPf4?si=6xKqP9kzVNW-Itb6',
      'https://youtu.be/NlS9UdPgwRs?si=XBKD1Z1APfypqczd',
      'https://youtu.be/xyqxLbHJjL4?si=0ewuBgxic-PuJK-L',
      'https://youtu.be/7UBlWTvPFhM?si=kOp3Pd0MT0W8yH0c',
      'https://youtu.be/JqRXu8auZ4A?si=5hKMUn-1UjJy1kFO',
      'https://youtu.be/PHwPmzYnKRA?si=ynQspaCdvgQTLTev',
      'https://youtube.com/shorts/vlU7HREFCog?si=F_DPMCgpLseDAXn0',
    ]
  },
  "Kayu": {
    category: "Organik (Keras)",
    theme: "organic",
    decompose: "10 - 15 Tahun",
    funFact: "Kayu sisa furnitur seringkali sudah dilapisi vernis/cat kimia, sehingga tidak boleh dijadikan kompos biasa.",
    description: "Sampah kayu bisa berasal dari ranting pohon atau sisa bangunan. Kayu murni bisa dikomposkan, kayu olahan sebaiknya di-upcycle.",
    handling: ["Pisahkan paku yang menempel", "Kayu ranting -> Cacah kecil untuk kompos", "Kayu olahan -> Buat rak/hiasan"],
    manfaat: ["Arang/Briket bioarang", "Media tanam jamur (serbuk gergaji)", "Dekorasi rustic"],
    videos: [
      'https://youtu.be/y7imIITs21o?si=tNWRr5wzULDX7PgX',
      'https://youtu.be/zv3FNU1XlFk?si=agweU1iXw1dMdLHw',
      'https://youtu.be/Mwi6VWbApfE?si=kjNsCa9YE78ddBy_',
      'https://youtube.com/shorts/ncf_ZLPPGfw?si=i5_J08PxXALs2nd7',
      'https://youtu.be/fENTRtOjzgc?si=ilbC_zm8fvxVk8RS',
      'https://youtube.com/shorts/GeBIEjTzlXo?si=FKwEP7fw_3Ax8srU',
      'https://youtu.be/WXPoixefGIc?si=uayBDynV2P0WMQud',
    ]
  },
  "Kertas": {
    category: "Anorganik (Daur Ulang)",
    theme: "recycle",
    decompose: "2 - 6 Minggu",
    funFact: "Kertas bisa didaur ulang 5-7 kali sebelum seratnya menjadi terlalu pendek dan hancur.",
    description: "Kertas adalah sampah yang paling mudah didaur ulang, TAPI musuh utamanya adalah air dan minyak. Kertas basah/berminyak = Sampah residu.",
    handling: ["Pastikan kering & bersih", "Jangan remas (biarkan lembaran) agar mudah ditumpuk", "Pisahkan dari staples/klip"],
    manfaat: ["Kertas daur ulang seni", "Bubur kertas (Pulp)", "Dijual ke bank sampah"],
    videos: [
      'https://youtu.be/7h7Xh-c4KJ0?si=Ztzq-lkFYWaB0jWj',
      'https://youtu.be/kFhryYyZ7YE?si=-CABWeEojTSdxw46',
      'https://youtu.be/jLCNWWwIGro?si=ceVUCttAGFiU-6vP',
      'https://youtu.be/noOO3UOgI9c?si=54m70PS6gSsiAlh6',
      'https://youtu.be/1UoskWBm1h0?si=pfCvLYIuZbOEzOx0',
      'https://youtu.be/QZhrxwNLFvU?si=hztGVuuU5_NOunVO',
      'https://youtube.com/shorts/IyAMz02R_TM?si=CRH0ykMfcGZ8KfO3',
    ]
  },
  "Kotoran Hewan": {
    category: "Organik (Pupuk)",
    theme: "organic",
    decompose: "1 - 3 Bulan (Jika diolah)",
    funFact: "Kotoran hewan mengandung gas metana yang 25x lebih berbahaya bagi lapisan ozon dibanding CO2, tapi bisa jadi energi masak!",
    description: "Limbah ternak (kohe) adalah 'emas hitam' bagi petani. Mengandung unsur hara makro (NPK) yang tinggi.",
    handling: ["Fermentasi dulu sebelum dipakai (jangan langsung kena tanaman)", "Jauhkan dari sumber air minum", "Gunakan EM4 untuk hilangkan bau"],
    manfaat: ["Pupuk kandang premium", "Biogas rumah tangga", "Media cacing (Vermicompost)"],
    videos: [
      'https://youtu.be/R7RbDU25Atc?si=CAnLmbAoTnQsmPKf',
      'https://youtu.be/sCDR02T-FoE?si=DhxP2z5WkhVdSSk0',
      'https://youtu.be/4LHToVN9m_o?si=R630gp8BghhwJYCZ',
      'https://youtu.be/KkLLC-FIroQ?si=YgP3_DHBw8T7CWSg',
      'https://youtu.be/RFD3yarpgHA?si=Pf_MhGE7o9MxrF03',
      'https://youtu.be/dpUIscAXIlc?si=2tpV0gfMvOzDZj92',
      'https://youtu.be/TyGYuf7kYx4?si=0EuGdZ19Jb5Tzu13',
    ]
  },
  "Logam": {
    category: "Anorganik (Bernilai Tinggi)",
    theme: "recycle",
    decompose: "50 - 500 Tahun",
    funFact: "Kaleng aluminium bekas minuman bisa didaur ulang menjadi kaleng baru dan kembali ke rak toko hanya dalam waktu 60 hari.",
    description: "Logam (besi, aluminium, tembaga) adalah primadona bank sampah. Harganya mahal dan sangat dicari pengepul.",
    handling: ["Cuci bersih sisa makanan/minuman", "Penyetkan/gepengkan untuk hemat tempat", "Pisahkan aluminium (ringan) dan besi (berat)"],
    manfaat: ["Uang tunai (jual kiloan)", "Kerajinan tangan", "Bahan baku industri baja"],
    videos: [
      'https://youtube.com/shorts/jp7got45a1I?si=QyG5KZvuJN_QEkWl',
      'https://youtube.com/shorts/zojJBhGGU8U?si=fARan-osDEog3kV0',
      'https://youtube.com/shorts/YVBOkHZFj1I?si=qfoV8yCNG_oyOWDO',
      'https://youtube.com/shorts/QcfN86ISXtg?si=0dwffJgrIJbLtZYq',
      'https://youtube.com/shorts/sGmmQa2H_sY?si=txG8d1hFhwAGfd8Q',
      'https://youtube.com/shorts/L1aOhO3Z9_w?si=Mqkn1UeIP2xPWH71',
      'https://youtube.com/shorts/k3lIT29KQK4?si=EP-TCFM05AmWzIm6',
    ]
  },
  "Plastik": {
    category: "Anorganik (Masalah Utama)",
    theme: "danger",
    decompose: "100 - 1.000 Tahun",
    funFact: "Setiap potongan plastik yang pernah dibuat sejak tahun 1950-an, sebagian besar masih ada di bumi ini hingga sekarang.",
    description: "Plastik tidak pernah benar-benar terurai, hanya hancur menjadi mikroplastik yang masuk ke makanan kita. Bijaklah menggunakannya.",
    handling: ["Cuci bersih (wajib!)", "Lepaskan label kertas", "Pisahkan botol (PET) dan tutupnya (HDPE)", "Masukkan ke dalam Ecobrick jika residu"],
    manfaat: ["Ecobrick (bata ramah lingkungan)", "Biji plastik daur ulang", "Paving block plastik", "Kerajinan"],
    videos: [
      'https://youtu.be/9XJm0bu9CAM?si=YaI8LABT3srP64Vq',
      'https://youtu.be/mxvHwJ5EO8o?si=QuOsEOt05EEhfvZX',
      'https://youtu.be/nQBJfW2Um0c?si=SyQxyf1uihp4J4rv',
      'https://youtu.be/kGJjcnoBnos?si=1RbcuTdhVQ_A8SkA',
      'https://youtu.be/KDuX9siPT6U?si=s5Bh6qOkzYvrKO6H',
      'https://youtu.be/MJd3bo_XRaU?si=g6EhwJVT-TLDeBV7',
      'https://youtu.be/_G2IitNrgIw?si=0mMLLhcNYWXkFVuc',
    ]
  },
  "Sepatu": {
    category: "Anorganik (Residu)",
    theme: "general",
    decompose: "40 - 50 Tahun",
    funFact: "Sepatu lari modern bisa mengandung lebih dari 30 jenis material berbeda yang disatukan dengan lem kuat, membuatnya sangat sulit didaur ulang.",
    description: "Sepatu bekas seringkali berakhir di TPA. Sol karetnya awet, tapi bagian kainnya lapuk. Penanganan terbaik adalah memperpanjang usianya.",
    handling: ["Cuci dan sumbangkan jika layak", "Perbaiki ke tukang sol sepatu", "Jadikan pot tanaman jika sudah rusak parah"],
    manfaat: ["Donasi kemanusiaan", "Pot tanaman unik", "Media lukis"],
    videos: [
      'https://youtu.be/G9W8oMNstJM?si=vRbQG9PC7nEkS8pJ',
      'https://youtu.be/C032oem5eaY?si=8iHjQA_2c7eWzq2l',
      'https://youtu.be/ICvOn8CULMI?si=wxNSmTTVMPsyQ6WJ',
      'https://youtu.be/BbLlJPwMBKQ?si=lRsQN4x9eQciw7Pn',
      'https://youtu.be/mxacBEu3VV8?si=oAv_3icIjZJqbWgy',
      'https://youtu.be/eULM1f-ALJg?si=246UWOw4K7pPDHt7',
      'https://youtu.be/1fsiGm3NMu0?si=nwykoyW7wmJTMBFy',
    ]
  },
  "Sisa Buah": {
    category: "Organik (Basah)",
    theme: "organic",
    decompose: "2 Minggu - 1 Bulan",
    funFact: "Kulit jeruk dan sisa buah asam lainnya bisa difermentasi menjadi Eco-Enzyme, cairan ajaib pembersih lantai dan pestisida alami.",
    description: "Sisa buah kaya akan gula alami dan air. Mikroorganisme sangat menyukainya sehingga proses pembusukannya sangat cepat.",
    handling: ["Potong kecil-kecil agar cepat terurai", "Campur dengan sampah coklat (daun kering/kardus)", "Tutup rapat dalam komposter"],
    manfaat: ["Eco-Enzyme (Pembersih)", "Kompos cair (POC)", "Pengharum ruangan alami"],
    videos: [
      'https://youtube.com/shorts/g9l6JrnZ-QA?si=mbfD38mrQ1SQU93E',
      'https://youtu.be/v8QnB5q9aGo?si=mWuuryK_gZpkJ9z0',
      'https://youtu.be/alljc5elqqw?si=Qs85YtzSkxuFVlNj',
      'https://youtube.com/shorts/ia53ZoD_Iu8?si=befAWdVOpidWkXoA',
      'https://youtu.be/s15_SBuMUB0?si=OTtdJmIm0k7J80Ns',
      'https://youtube.com/shorts/mRMvz9BgOh4?si=i7_wwPgxpmf2ENGr',
      'https://youtu.be/meBd1GHC2yg?si=35Mpb152AwTDp1Bo',
    ]
  },
  "Sisa Makanan": {
    category: "Organik (Basah)",
    theme: "organic",
    decompose: "1 - 3 Minggu",
    funFact: "Sampah makanan yang membusuk di TPA menghasilkan gas metana yang mudah meledak dan memicu perubahan iklim.",
    description: "Sisa nasi, lauk, dan sayur masak. Jangan dibuang ke saluran air! Ini sumber nutrisi tinggi bagi maggot BSF.",
    handling: ["Tiriskan airnya (jangan becek)", "Bilas sedikit jika terlalu berminyak/santan", "Berikan ke maggot atau masuk lubang biopori"],
    manfaat: ["Pakan Maggot BSF (Protein tinggi)", "Pupuk Kompos Ember Tumpuk", "Pakan ayam/ikan"],
    videos: [
      'https://youtu.be/0qfGNQ499JA?si=AaP5kwYM333LcXAs',
      'https://youtu.be/k1u0II1KrPs?si=sV3FqjaA01UNhTw_',
      'https://youtube.com/shorts/3JBe7DxBK08?si=wOXjYBqu-I49ZjsB',
      'https://youtu.be/tFx28W5LVmU?si=sbQ1nishv3p8Cvsw',
      'https://youtube.com/shorts/pWHg00xfOzA?si=ke3YC_2ZJYGS-_JP',
      'https://youtu.be/_hAv9wrPAvc?si=IPer7V29CrwtXONI',
      'https://youtu.be/PkYgN3xfJ2I?si=LCSDe_iBMl8hycwI-',
    ]
  },
  "Sisa makanan": { // Fallback lowercase
    category: "Organik (Basah)",
    theme: "organic",
    decompose: "1 - 3 Minggu",
    funFact: "Sampah makanan yang membusuk di TPA menghasilkan gas metana yang mudah meledak dan memicu perubahan iklim.",
    description: "Sisa nasi, lauk, dan sayur masak. Jangan dibuang ke saluran air! Ini sumber nutrisi tinggi bagi maggot BSF.",
    handling: ["Tiriskan airnya (jangan becek)", "Bilas sedikit jika terlalu berminyak/santan", "Berikan ke maggot atau masuk lubang biopori"],
    manfaat: ["Pakan Maggot BSF (Protein tinggi)", "Pupuk Kompos Ember Tumpuk", "Pakan ayam/ikan"],
    videos: [
      'https://youtu.be/0qfGNQ499JA?si=AaP5kwYM333LcXAs',
      'https://youtu.be/k1u0II1KrPs?si=sV3FqjaA01UNhTw_',
      'https://youtube.com/shorts/3JBe7DxBK08?si=wOXjYBqu-I49ZjsB',
      'https://youtu.be/tFx28W5LVmU?si=sbQ1nishv3p8Cvsw',
      'https://youtube.com/shorts/pWHg00xfOzA?si=ke3YC_2ZJYGS-_JP',
      'https://youtu.be/_hAv9wrPAvc?si=IPer7V29CrwtXONI',
      'https://youtu.be/PkYgN3xfJ2I?si=LCSDe_iBMl8hycwI-',
    ]
  },
  "Sisa Teh Kopi": {
    category: "Organik (Penyubur)",
    theme: "organic",
    decompose: "1 - 2 Minggu",
    funFact: "Ampas kopi bersifat sedikit asam, sangat disukai oleh tanaman seperti mawar, tomat, dan cabai.",
    description: "Jangan buang ampas kopi/teh ke wastafel (bikin mampet!). Keringkan dan jadikan mereka sahabat tanaman Anda.",
    handling: ["Peras airnya hingga kering", "Taburkan tipis di permukaan tanah", "Jangan ditumpuk terlalu tebal (bisa berjamur)"],
    manfaat: ["Penghilang bau kulkas/sepatu", "Lulur/Scrub kulit alami", "Pewarna kain alami (Coklat/Sepia)"],
    videos: [
      'https://youtu.be/yMUBlrf7y-I?si=4IXeh94OoY4qdpD4',
      'https://youtu.be/CUlxAOTffqI?si=DH50waTHAtQEZYko',
      'https://youtu.be/1raJ4IGmwxc?si=BOhYplHGhMV2Y5Ks',
      'https://youtu.be/3Ws-IkitIrQ?si=9Q3duwMktHFXKaWO',
      'https://youtube.com/shorts/zBrK5Z2xzHk?si=0m2YN3kEEXKA9QdE',
      'https://youtu.be/Y_O9BSnZEW0?si=FnV1hCtonoNFFhFF',
      'https://youtu.be/qhiaoxgQeo0?si=6TE5n9Ihp0jMeTeE',
    ]
  },
  "Styrofoam": {
    category: "Anorganik (Residu Abadi)",
    theme: "danger",
    decompose: "TIDAK TERURAI",
    funFact: "Styrofoam 95% isinya adalah udara, tapi 5% sisanya adalah plastik polistirena yang mencemari lingkungan selamanya.",
    description: "Styrofoam adalah salah satu sampah paling bermasalah. Tidak diterima di banyak bank sampah karena nilai jualnya rendah dan volume besar.",
    handling: ["Hindari pemakaian (bawa wadah sendiri)", "Bersihkan dari sisa makanan", "Larutkan dengan bensin (hanya untuk lem darurat, hati-hati api)"],
    manfaat: ["Lem perekat (campur bensin)", "Isian Bean Bag", "Campuran batako ringan", "Dekorasi"],
    videos: [
      'https://youtube.com/shorts/1vbKEKq5jQ8?si=aFq5j3gZ7KXKNxMN',
      'https://youtube.com/shorts/YmvgMh3uX1U?si=4pMFHTe0cWEQQHKs',
      'https://youtube.com/shorts/6EPl6NF281o?si=V8Q5xpTQfkfNL62N',
      'https://youtube.com/shorts/G_TKs_KNDqg?si=BguIumvIyXHFJXcY',
      'https://youtube.com/shorts/CZPgRMQwNYw?si=4fmcXDHF9qzxAVH3',
      'https://youtube.com/shorts/Ecy2McVob4U?si=QvVQOvaWcnGU8oK4',
      'https://youtube.com/shorts/xrqJg1O1pb8?si=dHNKC2Z-2WYgJ-8g',
    ]
  },
  "Tumbuhan": {
    category: "Organik (Sampah Coklat)",
    theme: "organic",
    decompose: "2 - 6 Bulan",
    funFact: "Daun kering adalah sumber karbon (C) yang sangat penting agar kompos Anda tidak bau busuk.",
    description: "Daun kering, ranting, dan rumput. Di alam, mereka menjadi humus. Di rumah, mereka adalah bahan penyeimbang kompos.",
    handling: ["Kumpulkan di karung (jangan dibakar!)", "Cacah/potong kecil agar cepat hancur", "Simpan kering untuk stok campuran kompos basah"],
    manfaat: ["Mulsa (selimut tanah)", "Kompos daun", "Bahan bakar briket", "Biopori"],
    videos: [
      'https://youtu.be/YRHcpHWtf6A?si=vyvNdTGPmeXoL4kQ',
      'https://youtube.com/shorts/zBrK5Z2xzHk?si=CSyLNUpfHP-qmaCq',
      'https://youtube.com/shorts/RNBwBD9-P2I?si=jEtpNbKX-HEZ94F1',
      'https://youtu.be/rlnDrGsAqvc?si=eK1_ARdnUrP78kiS',
      'https://youtu.be/OY7uDI8jpHc?si=tHUMGq06enChuBjI',
      'https://youtube.com/shorts/LXVD7PwtNSI?si=qUffyWgFwrJiy1iN',
      'https://youtube.com/shorts/78ci30Z7dsU?si=F0IIahYQ-lA3ddVi',
    ]
  }
};

// --- 3. Style Configurations (Tema Warna) ---
const themeStyles = {
  organic: { bg: '#F1F8E9', border: '#81C784', text: '#2E7D32', icon: '🌿' }, // Hijau
  recycle: { bg: '#E3F2FD', border: '#64B5F6', text: '#1565C0', icon: '♻️' }, // Biru
  danger: { bg: '#FFEBEE', border: '#E57373', text: '#C62828', icon: '⚠️' },  // Merah
  general: { bg: '#F5F5F5', border: '#BDBDBD', text: '#616161', icon: '🗑️' }  // Abu
};

// --- 4. Main Component ---
const Recommendation = ({ type }) => {
  // 1. Validasi Data
  if (!type) return null;
  const data = wasteData[type] || wasteData[type.toLowerCase()];
  
  // Jika tidak ditemukan
  if (!data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#eee', borderRadius: '10px' }}>
        <p>Data untuk <strong>{type}</strong> belum tersedia.</p>
      </div>
    );
  }

  // 2. Ambil style berdasarkan tema
  const theme = themeStyles[data.theme] || themeStyles.general;

  // 3. Style Object (Inline CSS)
  const styles = {
    container: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      //fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      marginBottom: '30px',
      border: `1px solid ${theme.border}`
    },
    header: {
      backgroundColor: theme.bg,
      padding: '20px',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    iconBox: {
      fontSize: '32px',
      backgroundColor: '#fff',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: theme.text,
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      marginTop: '4px',
      display: 'block',
      fontWeight: '500'
    },
    body: {
      padding: '20px'
    },
    description: {
      lineHeight: '1.6',
      color: '#444',
      fontSize: '16px',
      marginBottom: '20px'
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginBottom: '20px'
    },
    infoCard: {
      backgroundColor: '#fafafa',
      padding: '15px',
      borderRadius: '12px',
      border: '1px solid #eee'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    list: {
      paddingLeft: '20px',
      margin: 0,
      lineHeight: '1.6',
      color: '#555',
      textAlign: 'left'
    },
    funFactBox: {
      backgroundColor: '#FFF8E1',
      borderLeft: '4px solid #FFC107',
      padding: '15px',
      borderRadius: '4px',
      marginBottom: '25px',
      fontSize: '14px',
      color: '#795548',
      display: 'flex',
      gap: '10px'
    },
    videoSection: {
      marginTop: '30px'
    },
    carousel: {
      display: 'flex',
      overflowX: 'auto',
      gap: '15px',
      paddingBottom: '15px',
      marginTop: '15px',
      scrollBehavior: 'smooth'
    },
    videoCard: {
      flex: '0 0 280px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#000'
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.iconBox}>{theme.icon}</div>
        <div>
          <h2 style={styles.title}>{type}</h2>
          <span style={styles.subtitle}>{data.category}</span>
        </div>
      </div>

      <div style={styles.body}>
        {/* DESKRIPSI & FAKTA UNIK */}
        <p style={styles.description}>{data.description}</p>
        
        <div style={styles.funFactBox}>
          <span style={{fontSize: '20px'}}>💡</span>
          <div>
            <strong>Tahukah Kamu?</strong>
            <br/>
            {data.funFact}
          </div>
        </div>

        {/* INFO GRID (Waktu Urai & Penanganan) */}
        <div style={{...styles.gridTwo, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
          <div style={{...styles.infoCard, backgroundColor: '#fdfdfe', borderColor: '#e0e0e0'}}>
             <div style={styles.sectionTitle}>⏳ Estimasi Urai</div>
             <p style={{fontSize: '20px', fontWeight: 'bold', color: '#555', margin: 0}}>
               {data.decompose}
             </p>
          </div>
          
          <div style={styles.infoCard}>
             <div style={styles.sectionTitle}>✅ Do's & Don'ts</div>
             <ul style={styles.list}>
               {data.handling.map((item, idx) => (
                 <li key={idx} style={{marginBottom: '5px'}}>{item}</li>
               ))}
             </ul>
          </div>
        </div>

        {/* MANFAAT */}
        <div style={{...styles.infoCard, backgroundColor: theme.bg, borderColor: theme.border}}>
          <div style={styles.sectionTitle}>🛠️ Ide Pemanfaatan</div>
          <ul style={styles.list}>
             {data.manfaat.map((item, idx) => (
               <li key={idx} style={{marginBottom: '5px', fontWeight: '500'}}>{item}</li>
             ))}
          </ul>
        </div>

        {/* VIDEO CAROUSEL */}
        <div style={styles.videoSection}>
          <h4 style={{...styles.sectionTitle, fontSize: '16px'}}>📺 Tutorial Pengolahan</h4>
          <div style={styles.carousel}>
            {data.videos.map((link, index) => (
              <div key={index} style={styles.videoCard}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={getEmbedUrl(link)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    title={`Video ${index}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            ))}
          </div>
          <p style={{textAlign:'right', fontSize: '12px', color: '#999', margin: '5px 0 0'}}>
            Geser untuk video lainnya ➡️
          </p>
        </div>

      </div>
    </div>
  );
};
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

// --- Komponen Utama PindaiPage ---
const PindaiPage = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [detectedType, setDetectedType] = useState('');
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

      setAnalysisResult(result.category); 
      setDetectedType(result.type);
      setConfidence(result.confidence);

      if (result.isSampah) {
        try {
          await saveScanResult({
            imageUrl,
            result: result.category,
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
      // Cek dulu apakah ref-nya masih ada
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      } // Reset file input
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

      setAnalysisResult(result.category); 
      setDetectedType(result.type);       // <--- BARU
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
                {/* PERBAIKAN 3: Style manual karena variabel recommendationContainerStyle tidak ada di scope ini */}
                <div style={{
                    backgroundColor: '#ffebee',
                    border: '1px solid #ef9a9a',
                    padding: '20px',
                    borderRadius: '12px',
                    marginTop: '20px',
                    color: '#c62828',
                    textAlign: 'left'
                }}>
                  <h3>⚠️ Tidak Terdeteksi Sampah</h3>
                  <p>Silakan coba lagi dengan mengarahkan kamera lebih dekat ke sampah yang ingin dipindai atau unggah gambar lain.</p>
                </div>
              </div>
                ) : analysisResult ? (
                  <>
                <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                  
                  {/* KATEGORI UTAMA */}
                  Hasil Deteksi: Sampah <span style={{ textTransform: 'uppercase' }}>{analysisResult}</span>
                  
                  {/* TAMBAHKAN DETAIL JENIS DI SINI */}
                  <div style={{ fontSize: '16px', color: '#333', marginTop: '8px', fontWeight: 'normal' }}>
                    Jenis Spesifik: <strong>{detectedType}</strong>
                  </div>

                  <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
                    Tingkat Keyakinan: {(confidence * 100).toFixed(1)}%
                  </div>
                </div>
                
                <Recommendation type={detectedType} />
                
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