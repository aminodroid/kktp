import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with size limits for document text
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initializer for Gemini client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in Settings > Secrets of the AI Studio environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Endpoint to generate KKTP analysis using Gemini
app.post("/api/generate-kktp", async (req, res) => {
  try {
    const {
      schoolName,
      teacherName,
      principalName,
      academicYear,
      phase,
      semester,
      className,
      jp,
      cpText,
      atpText,
      modelName = "gemini-3.5-flash",
    } = req.body;

    // Validate we have some basic parameters
    if (!phase || !semester) {
      return res.status(400).json({
        error: "Data Fase dan Semester wajib diisi untuk memulai analisis KKTP.",
      });
    }

    // Compose a rich educational prompt in Indonesian, integrating Kurikulum Nasional guidelines,
    // SOLO Taxonomy, and Deep Learning (Pembelajaran Mendalam: Memahami, Mengaplikasi, Merefleksi)
    const prompt = `
Anda adalah konsultan pendidikan dan ahli pengembangan kurikulum untuk Kurikulum Nasional terbaru di Indonesia.
Tugas Anda adalah memformulasikan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) yang profesional, detail, dan adaptif berdasarkan dokumen Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP) yang disediakan oleh guru.

DATA KONTEKS SEKOLAH & KELAS:
- Nama Sekolah: ${schoolName || "Sekolah Contoh Nasional"}
- Guru Mata Pelajaran: ${teacherName || "Guru Pengampu"}
- Kepala Sekolah: ${principalName || "Kepala Sekolah Pengawas Partners"}
- Tahun Pelajaran: ${academicYear || "2026/2027"}
- Fase: ${phase}
- Kelas: ${className || "(Belum ditentukan)"}
- Semester: ${semester}
- Alokasi JP Per Tahun: ${jp || "72"} Jam Pelajaran

DOKUMEN INPUT GURU:
1. Capaian Pembelajaran (CP) yang diunggah / diinput:
"${cpText || "Gunakan standar Capaian Pembelajaran umum berdasarkan matematika/bahasa/sains secara logis untuk Fase " + phase}"

2. Alur Tujuan Pembelajaran (ATP) yang diunggah / diinput:
"${atpText || "Gunakan standar Alur Tujuan Pembelajaran atau silabus umum yang relevan secara logis"}"

METODOLOGI ANALISIS PEDAGOGIS (WAJIB DIGUNAKAN SECARA TERINTEGRASI):
1. Kurikulum Nasional: Ganti seluruh paradigma "Kurikulum Merdeka" menjadi "Kurikulum Nasional". Sesuai instruksi, hasil harus sepenuhnya netral dan selaras dengan kebijakan terbaru Kurikulum Nasional.
2. SOLO Taksonomi (Structure of Observed Learning Outcomes): Klasifikasikan tingkat pemahaman siswa untuk masing-masing Tujuan Pembelajaran ke dalam level berikut:
   - Pre-structural (Siswa salah menafsirkan, tidak relevan)
   - Uni-structural (Siswa memahami satu aspek sederhana)
   - Multi-structural (Siswa memahami beberapa aspek bebas terisolasi)
   - Relational (Siswa mampu menghubungkan aspek-aspek menjadi satu kesatuan utuh)
   - Extended Abstract (Siswa mampu melakukan generalisasi ke konteks baru yang abstrak)
3. Pembelajaran Mendalam (Deep Learning): Hubungkan TP dengan 3 aspek utama:
   - Memahami (Deep Understanding)
   - Mengaplikasi (Meaningful Application)
   - Merefleksi (Critical Reflection)

SPESIFIKASI OUTPUT YANG DIMINTA:
Buatlah minimal 3-5 Tujuan Pembelajaran (TP) yang logis beserta Kriteria Ketercapaiannya. Untuk setiap Tujuan Pembelajaran, sediakan:
- Pernyataan Alokasi JP yang realistis berdasarkan total beban tahunan: ${jp || "72"} JP.
- Klasifikasi SOLO Taksonomi yang paling sesuai untuk target tersebut (misalnya "Relational").
- Klasifikasi Aspek Pembelajaran Mendalam (misalnya "Mengaplikasi" atau "Merefleksi").
- Minimal 2-3 Indikator Ketercapaian Tujuan Pembelajaran (IKTP).
- Rubrik deskripsi rentang nilai atau kriteria ketercapaian secara mendalam dan berakar pada Kurikulum Nasional.
- Catatan pedagogis guru yang profesional untuk memitigasi bagi siswa yang berada di level pra-ketercapaian.

Format respons harus berupa JSON murni dengan struktur berikut:
{
  "summary": "Analisis Pedagogis komprehensif terkait keselarasan CP dan ATP di bawah Kurikulum Nasional, menguraikan bagaimana Pembelajaran Mendalam (Deep Learning) dan SOLO Taksonomi diimplementasikan secara terintegrasi.",
  "totalTP": 3,
  "suggestedAllocations": "Rencana taktis pembagian jam pelajaran untuk mendalami setiap materi sepanjang semester.",
  "learningObjectives": [
    {
      "tpNumber": 1,
      "objectiveText": "Kalimat Tujuan Pembelajaran yang lengkap, operasional, dan jelas.",
      "soloTaxonomy": "Relational", 
      "deepLearningAspect": "Memahami", 
      "allocatedJP": 16,
      "indicators": [
        {
          "name": "Menjelaskan konsep teoritis secara runtut.",
          "aspect": "Kognitif",
          "rubric": {
            "baruBerkembang": "Belum mampu menstrukturkan gagasan.",
            "layak": "Mampu menjelaskan konsep dasar dengan arahan guru.",
            "cakap": "Mampu menjelaskan aspek-aspek penting secara runtut dan mandiri.",
            "mahir": "Mampu menganalisis detail konseptual secara luas dan menghubungkannya secara orisinal."
          }
        },
        {
          "name": "Menyusun skema keterhubungan antar-komponen.",
          "aspect": "Psikomotorik / Keterampilan",
          "rubric": {
            "baruBerkembang": "Skema yang dibuat belum menunjukkan keterhubungan logis.",
            "layak": "Skema telah mencantumkan komponen utama namun relasinya belum utuh.",
            "cakap": "Skema akurat dan menunjukkan relasi yang jelas di sebagian besar bagian.",
            "mahir": "Skema kreatif, akurat, komprehensif, dan menunjukkan relasi tingkat tinggi secara sistemik."
          }
        }
      ],
      "kktpMethod": "Deskripsi Rubrik / Rentang Ketercapaian",
      "pedagogicalNote": "Catatan intervensi pembelajaran untuk memacu kemampuan kognisi siswa dari Uni-structural ke Relational."
    }
  ]
}

PASTIKAN Anda mengembalikan HANYA valid JSON objek. Jangan gunakan markdown backticks seperti \`\`\`json ... \`\`\`. Kembalikan string JSON murni siap pakai.
`;

    let responseText = "";

    try {
      const client = getGeminiClient();
      console.log(`Calling Gemini with model ${modelName}...`);
      
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      responseText = response.text || "";
    } catch (aiError: any) {
      console.warn("Gemini execution failed or API key not present, shifting to static simulation data:", aiError.message);
      
      // If there's no api key or it failed, we return a high-quality, professional simulated response
      // explaining this gracefully. This ensures the web app is persistent, robust, and works in any environment,
      // as required by usability and standard playground testing.
      const simulatedData = {
        summary: `[KOP INFORMASI: Menampilkan data analisis berbasis simulasi karena Kunci API Gemini belum diatur atau dinonaktifkan di setelan Secrets. Seluruh teks telah diformat secara presisi sesuai dengan Kurikulum Nasional baru]\n\nAnalisis ini didesain menggunakan integrasi mutakhir antara SOLO Taksonomi dan Pembelajaran Mendalam (Deep Learning) untuk mengukur tingkat kompetensi siswa secara komprehensif. Pembagian Tujuan Pembelajaran (TP) telah disesuaikan secara proporsional dengan alokasi total jp tahunan (${jp || 72} JP), menjangkau aspek Memahami, Mengaplikasi, dan Merefleksi, guna memastikan guru mendapatkan peta ketercapaian yang logis, terpadu, serta berdaya guna dalam pelaksanaan penilaian harian.`,
        totalTP: 3,
        suggestedAllocations: `Alokasi ideal didasarkan pada bobot tingkat kesulitan konseptual masing-masing TP. Untuk total ${jp || 72} JP per tahun, disarankan beban dibagi sebagai berikut: TP 1 mendapatkan porsi 18 JP (Fokus Pendalaman), TP 2 mendapatkan 22 JP (Fokus Aplikasi & Proyek Praktis), dan TP 3 mendapat 32 JP termasuk asesmen formatif sumatif dan refleksi komprehensif Kurikulum Nasional.`,
        learningObjectives: [
          {
            tpNumber: 1,
            objectiveText: `Menganalisis prinsip-prinsip sains atau logika dasar dalam Kurikulum Nasional yang mendasari fenomena lingkungan sekitar dengan melatih kepekaan bernalar kritis dan kreatif secara kolaboratif.`,
            soloTaxonomy: "Relational",
            deepLearningAspect: "Memahami",
            allocatedJP: Math.round((jp || 72) * 0.25),
            indicators: [
              {
                name: "Mendeskripsikan komponen utama pembentuk ekosistem fenomena lingkungan secara akurat.",
                aspect: "Pemahaman Konsep (Kognitif)",
                rubric: {
                  baruBerkembang: "Siswa belum mampu mengenali komponen lingkungan dasar tanpa bantuan visual penuh dari guru.",
                  layak: "Siswa mampu menyebutkan komponen utama, namun masih kesulitan menggambarkan hubungan sebab-akibat antar-komponen tersebut.",
                  cakap: "Siswa secara mandiri dan fasih mendeskripsikan seluruh komponen utama beserta jalinan sebab-akibat yang umum.",
                  mahir: "Siswa mampu menguraikan kompleksitas keterkaitan sistem fenomena lingkungan secara luas dengan contoh autentik yang kaya."
                }
              },
              {
                name: "Merancang instrumen investigasi sederhana untuk memantau perubahan kondisi lingkungan sekitar.",
                aspect: "Keahlian Praktis (Psikomotorik)",
                rubric: {
                  baruBerkembang: "Rancangan instrumen tidak terstruktur dan tidak didukung oleh langkah logis pengukuran.",
                  layak: "Rancangan instrumen mencakup aspek penting, namun metode pencatatan data masih rentan bias.",
                  cakap: "Rancangan instrumen teratur, logis, serta dilengkapi dengan panduan interval waktu pengamatan mandiri.",
                  mahir: "Karya rancangan instrumen sangat terperinci, efisien, menerapkan prinsip efektivitas biaya, dan siap diimplementasikan."
                }
              }
            ],
            kktpMethod: "Deskripsi Deskriptor & Rubrik Ketercapaian Terintegrasi Kurikulum Nasional",
            pedagogicalNote: "Latihan peningkatan tingkat penalaran kognitif dapat diberikan melalui teknik pertanyaan pemantik (Socratic questioning) guna mengangkat pemahaman dari yang tadinya terisolasi (Multi-structural) ke tingkat asosiatif-sistemik (Relational)."
          },
          {
            tpNumber: 2,
            objectiveText: `Menerapkan pemecahan masalah (problem solving) berorientasi Kurikulum Nasional terhadap isu sosial atau logika di sekitar kelas dengan memformulasi gagasan solusi berbasis proyek nyata.`,
            soloTaxonomy: "Extended Abstract",
            deepLearningAspect: "Mengaplikasi",
            allocatedJP: Math.round((jp || 72) * 0.35),
            indicators: [
              {
                name: "Mengidentifikasi akar penyebab konflik atau permasalahan yang terjadi dalam simulasi kasus sosial.",
                aspect: "Analisis & Berpikir Kritis",
                rubric: {
                  baruBerkembang: "Menggambarkan masalah hanya secara kasat mata tanpa melihat korelasi struktural sosial.",
                  layak: "Menjelaskan beberapa penyebab masalah, namun belum menemukan akar masalah yang paling krusial.",
                  cakap: "Sukses menegaskan akar masalah utama dan membuat bagan alur pengaruhnya secara rapi.",
                  mahir: "Mengorelasikan masalah sosial lokal dengan teori sosiologis makro yang luas dalam draf esai argumentatif yang matang."
                }
              },
              {
                name: "Merumuskan rekomendasi aksi nyata penyelesaian masalah berdasarkan kesepakatan mufakat.",
                aspect: "Karsa Kemasyarakatan (Karakter Pancasila)",
                rubric: {
                  baruBerkembang: "Usulan rekomendasi bersifat berulang, tidak realistis, atau tidak memperhatikan suara minoritas.",
                  layak: "Rekomendasi bersifat aplikatif namun belum menyentuh dimensi keberlanjutan solusi jangka panjang.",
                  cakap: "Rekomendasi terperinci, ramah sumber daya sekolah, dan mencantumkan pembagian peran yang adil.",
                  mahir: "Rangkuman ide orisinal tinggi, merangkul aspek kelestarian lingkungan serta inklusi sosial budaya sekeliling."
                }
              }
            ],
            kktpMethod: "Kriteria Rentang Deskripsi Ketercapaian Kurikulum Nasional",
            pedagogicalNote: "Targetkan dorongan reflektif harian. Fokus intervensi guru diarahkan pada penguatan kompetensi komunikasi taktis dan manajemen emosi kelompok selama perundingan mufakat."
          },
          {
            tpNumber: 3,
            objectiveText: `Melakukan refleksi mandiri atas proses belajarnya terkait materi kognitif utama untuk menyusun rencana perbaikan diri demi kemajuan akademis yang konstan (growth mindset).`,
            soloTaxonomy: "Extended Abstract",
            deepLearningAspect: "Merefleksi",
            allocatedJP: Math.round((jp || 72) * 0.40),
            indicators: [
              {
                name: "Mengevaluasi kelebihan dan kelemahan strategi belajar pribadi yang telah diterapkan guru.",
                aspect: "Metakognisi",
                rubric: {
                  baruBerkembang: "Belum mampu mengoreksi kesalahan belajar sendiri; menyalahkan faktor eksternal sepenuhnya.",
                  layak: "Mengetahui materi yang dirasa sulit, namun belum tahu langkah taktis untuk memperbaikinya.",
                  cakap: "Mampu menjelaskan titik hambatan belajar beserta metode penyetelan ulang waktu belajarnya.",
                  mahir: "Mengidentifikasi pola kognitif pribadi dengan cermat, merancang strategi belajar baru, serta menerapkan evaluasi berkala."
                }
              }
            ],
            kktpMethod: "Kriteria Evaluasi Diri Pasca-Asesmen",
            pedagogicalNote: "Asisten guru disarankan memfasilitasi lembar log aktivitas mingguan berhadiah bintang atau umpan balik tertulis yang hangat untuk terus menjaga momentum metakognitif siswa tetap positif."
          }
        ],
        isSimulated: true,
      };

      return res.json(simulatedData);
    }

    // Attempt to parse JSON response safely
    try {
      // Clean any accidental markdown code fencing if gemini failed to yield pure json
      let cleanText = responseText.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const parsedJSON = JSON.parse(cleanText);
      return res.json({ ...parsedJSON, isSimulated: false });
    } catch (parseError) {
      console.error("Failed to parse responseText as JSON. Text received:", responseText);
      return res.status(500).json({
        error: "Gagal memproses parsing data JSON dari hasil analisis AI. Silakan ulangi analisis.",
        rawText: responseText,
      });
    }
  } catch (err: any) {
    console.error("API error during generation:", err);
    res.status(500).json({
      error: "Terjadi kegagalan server internal: " + err.message,
    });
  }
});

// Configure Vite or serve built assets depending on the environment
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode. Serving static files from ./dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KKTP Generator server is running on http://localhost:${PORT}`);
  });
}

setupServer();
