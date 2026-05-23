import React, { useState } from "react";
import Header from "./components/Header";
import InputForm from "./components/InputForm";
import ReportView from "./components/ReportView";
import { InputFormData, AnalysisResult } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, ArrowRight, Library, Sparkles, AlertCircle, 
  HelpCircle, BookOpen, Clock, Users, GraduationCap 
} from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [metaData, setMetaData] = useState<InputFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Submit handler making API calls to server-side Gemini Proxy
  const handleFormulateKKTP = async (data: InputFormData, selectedModel: string) => {
    setLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // Dynamic rotation of loading steps to enhance visual feedback and educational branding
    const steps = [
      "Mengonfigurasi metadata Kurikulum Nasional...",
      "Membaca dokumen Capaian Pembelajaran (CP)...",
      "Mengekstraksi bobot kompetensi dari draf ATP...",
      "Menyelaraskan total jam pelajaran tahunan...",
      "Mengirimkan data ke Gemini Engine untuk penyusunan...",
      "Menganalisis tingkat pemahaman SOLO Taksonomi...",
      "Merumuskan indikator Pembelajaran Mendalam (Deep Learning)...",
      "Membuat tabel rubrikasi kriteria ketercapaian...",
      "Menyusun simpulan pedagogis laporan..."
    ];

    let currentStepIdx = 0;
    setLoadingStep(steps[currentStepIdx]);
    
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        setLoadingStep(steps[currentStepIdx]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/generate-kktp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolName: data.schoolName,
          teacherName: data.teacherName,
          principalName: data.principalName,
          academicYear: data.academicYear,
          phase: data.phase,
          semester: data.semester,
          className: data.className,
          jp: data.jp,
          cpText: data.cpText,
          atpText: data.atpText,
          modelName: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghubungi server untuk memformulasikan KKTP.");
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);
      setMetaData(data);
    } catch (error: any) {
      console.error("Formulation error:", error);
      setErrorMessage(error.message || "Koneksi ke server terputus. Silakan coba kembali.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-blue-500 selection:text-white overflow-hidden">
      {/* 1. Header Global with application title */}
      <Header />

      {/* 2. Unified Workspace with Split Design (High Density Layout) */}
      <main className="flex-1 flex flex-col lg:flex-row p-3 gap-3 overflow-hidden min-h-0">
        
        {/* Left pane: Data Administrasi + Quick Pedagogical Tip */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-3 shrink-0 overflow-y-auto min-h-0">
          <InputForm onSubmit={handleFormulateKKTP} loading={loading} />

          {/* Quick Pedagogical Guideline Panel */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-800 space-y-1.5 shadow-inner">
            <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">
              Metodologi Pedagogis
            </span>
            <h4 className="text-[10px] font-bold">SOLO Taksonomi &amp; Deep Learning</h4>
            <p className="text-[10px] text-slate-300 leading-normal text-left">
              Edisi terbaru Kurikulum Nasional menekankan gradasi tingkat pemahaman siswa dari terpisah hingga abstrak konseptual (<strong>SOLO Taksonomi</strong>), bersanding dengan aspek Kognitif dan Afektif (<strong>Pembelajaran Mendalam</strong>).
            </p>
          </div>
        </div>

        {/* Right pane: Document Preview & Workspaces */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            
            {/* State A: Loading indicator */}
            {loading && (
              <motion.div
                key="loading-stage"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 h-full overflow-y-auto"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full border-4 border-blue-100 animate-ping" />
                  <div className="w-10 h-10 rounded-full border-4 border-t-blue-600 border-r-blue-600 border-blue-100 animate-spin flex items-center justify-center">
                    <Sparkles size={14} className="text-blue-600" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Merumuskan KKTP AI</h3>
                  <p className="text-xs text-blue-600 font-semibold max-w-sm mx-auto min-h-[30px] px-2 leading-relaxed">
                    {loadingStep || "Menghubungkan layanan Kurikulum Nasional..."}
                  </p>
                </div>
                
                <blockquote className="text-[10px] font-serif text-slate-500 italic max-w-xs pt-3 border-t border-slate-100 leading-relaxed">
                  "Menilai ketercapaian siswa secara komprehensif, terintegrasi, dan presifik sesuai bakat mandiri."
                </blockquote>
              </motion.div>
            )}

            {/* State B: Error message screen */}
            {errorMessage && !loading && (
              <motion.div
                key="error-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 h-full"
              >
                <div className="inline-flex p-2 bg-red-100 text-red-700 rounded-full">
                  <AlertCircle size={20} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">Formulasi Salah / Gagal</h3>
                  <p className="text-xs text-red-600 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {/* State C: Generated report screen */}
            {analysisResult && metaData && !loading && (
              <motion.div
                key="report-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden h-full"
              >
                <ReportView result={analysisResult} meta={metaData} />
              </motion.div>
            )}

            {/* State D: Initial empty state onboarding */}
            {!analysisResult && !loading && !errorMessage && (
              <motion.div
                key="empty-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center space-y-6 h-full overflow-y-auto"
              >
                <div className="inline-flex p-3 bg-blue-50 text-blue-650 rounded-xl">
                  <Library size={30} className="stroke-[1.5]" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Kurikulum Nasional Edisi 2026
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                    Format Baru Kriteria Ketercapaian (KKTP)
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Unggah rancangan Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP) guru di panel kiri untuk merumuskan KKTP dengan metodologi SOLO Taksonomi &amp; Pembelajaran Mendalam secara ilmiah.
                  </p>
                </div>

                {/* Compact guides */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2 text-left">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 hover:bg-slate-100/50 transition-colors">
                    <span className="text-[9px] font-bold text-blue-600 uppercase">1. Administrasi</span>
                    <p className="text-[10px] text-slate-500 leading-normal">Lengkapi metadata pengampu &amp; sasaran JP tahunan.</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 hover:bg-slate-100/50 transition-colors">
                    <span className="text-[9px] font-bold text-blue-600 uppercase">2. Input Dokumen</span>
                    <p className="text-[10px] text-slate-500 leading-normal">Tarik / unggah draf dokumen pendukung Guru (.pdf/.docx).</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 hover:bg-slate-100/50 transition-colors">
                    <span className="text-[9px] font-bold text-blue-600 uppercase">3. Cetak KKTP</span>
                    <p className="text-[10px] text-slate-500 leading-normal">Dapatkan rubrikasi komprehensif siap validasi pengawas.</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
