import { Printer, Bookmark, Layers, AlertCircle } from "lucide-react";
import { AnalysisResult, InputFormData } from "../types";

interface ReportViewProps {
  result: AnalysisResult;
  meta: InputFormData;
}

export default function ReportView({ result, meta }: ReportViewProps) {
  
  // Clean native window print flow (completely safe inside preview iFrame / separate tab)
  const handlePrint = () => {
    window.print();
  };

  const todayDateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="flex flex-col h-full overflow-hidden flex-1">
      {/* 1. High Density Report Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 print:hidden select-none">
        <span className="text-[11px] font-semibold text-slate-550 flex items-center gap-1.5 uppercase tracking-wider">
          <Layers size={11} className="text-slate-400" />
          Pratinjau Laporan Profesional (Rata Kanan-Kiri)
        </span>
        <button
          onClick={handlePrint}
          className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer text-slate-700 shadow-sm transition-all hover:border-slate-400"
        >
          <Printer size={12} className="text-slate-500" />
          CETAK LAPORAN
        </button>
      </div>

      {/* 2. Scrollable Simulation Page Desktop Viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100 font-sans text-slate-800">
        
        {/* Notice/Alert Banner */}
        {result.isSimulated && (
          <div className="max-w-[720px] mx-auto mb-3 bg-amber-50 border border-amber-250 text-amber-800 p-3 rounded-lg flex items-start gap-2 shadow-sm print:hidden">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={13} />
            <div className="text-[10px] space-y-0.5">
              <span className="font-bold uppercase tracking-wider block">Dokumen Simulasi Cerdas Terpasang</span>
              <p className="leading-relaxed text-slate-700">
                Layanan AI server-side mengonfigurasi draf administrasi di bawah ini secara otomatis untuk menguji instrumen Kurikulum Nasional secara langsung.
              </p>
            </div>
          </div>
        )}

        {/* Word Document Paper Area */}
        <div 
          id="kktp-official-report"
          className="max-w-[720px] mx-auto bg-white border border-slate-250 rounded-xl p-6 md:p-8 space-y-5 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* Header 4-Kolom */}
          <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
            <h3 className="font-extrabold text-base tracking-tight text-slate-900 uppercase">KURIKULUM NASIONAL INDONESIA</h3>
            <p className="text-[9px] font-bold text-slate-550 uppercase tracking-widest block">
              KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
            </p>
          </div>

          {/* 4-Column Metadata Table Block */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 p-2.5 font-sans text-[10px] rounded-md">
            <div className="space-y-0.5">
              <p className="text-slate-400 uppercase font-black text-[8px] tracking-widest">Sekolah</p>
              <p className="font-bold text-slate-850 uppercase truncate">{meta.schoolName || "SD NEGERI 01 NUSANTARA"}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-400 uppercase font-black text-[8px] tracking-widest">Guru Pengampu</p>
              <p className="font-bold text-slate-850 uppercase truncate">{meta.teacherName || "BUDI SANTOSO, S.PD."}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-400 uppercase font-black text-[8px] tracking-widest">Fase / Kelas</p>
              <p className="font-bold text-slate-850 uppercase truncate">{meta.phase || "FASE C"} / {meta.className || "6A"}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-400 uppercase font-black text-[8px] tracking-widest">JP / Semester</p>
              <p className="font-bold text-slate-850 uppercase truncate">{meta.jp} JP / {meta.semester === "Semester 1" ? "Ganjil" : "Genap"}</p>
            </div>
          </div>

          {/* 1. Ringkasan Kesimpulan Analisis */}
          <div className="space-y-1.5 pt-1">
            <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-800 flex items-center gap-1.5">
              <Bookmark size={12} className="text-blue-600" />
              1. Kerangka Analisis Pedagogis Kurikulum Nasional
            </h4>
            <p className="text-[11px] leading-relaxed text-justify text-slate-700 italic border-l-2 border-blue-600 pl-3 bg-blue-50/20 py-1.5 rounded-r">
              {result.summary}
            </p>
          </div>

          {/* Alokasi Rencana Beban Belajar strategist */}
          {result.suggestedAllocations && (
            <div className="bg-slate-50/50 border border-slate-150 p-2.5 rounded text-[10px] space-y-1">
              <span className="font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
                ⚙ Rencana Strategis Alokasi Beban Jam Pelajaran (JP):
              </span>
              <p className="text-slate-600 leading-relaxed text-justify">
                {result.suggestedAllocations}
              </p>
            </div>
          )}

          {/* 2. Daftar Kriteria per TP */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Layers size={12} className="text-blue-600" />
              2. Kriteria &amp; Rubrikasi Tujuan Pembelajaran (TP)
            </h4>

            <div className="space-y-5">
              {result.learningObjectives?.map((tp) => (
                <div 
                  key={tp.tpNumber}
                  className="space-y-2 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  {/* Badge Header Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="bg-slate-900 text-white font-sans text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      TP {tp.tpNumber}
                    </span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Aspek: {tp.deepLearningAspect || "MEMAHAMI"}
                    </span>
                    <span className="bg-orange-50 text-orange-700 border border-orange-100 font-sans text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                      SOLO: {tp.soloTaxonomy || "MULTISTRUCTURAL"}
                    </span>
                    <span className="bg-slate-100 text-slate-600 font-sans text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase">
                      {tp.allocatedJP || 18} JP
                    </span>
                  </div>

                  {/* Objective Text */}
                  <p className="text-[11px] text-justify text-slate-850 font-medium leading-relaxed">
                    {tp.objectiveText}
                  </p>

                  {/* Rubric Matrix Content Inside a tidy border card */}
                  <div className="bg-slate-50 p-3 border-l-2 border-blue-600 rounded-r-lg space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Matriks Deskriptor Ketercapaian:</p>
                    
                    <div className="space-y-3">
                      {tp.indicators?.map((indicator, idx) => (
                        <div key={idx} className="space-y-1 pb-1 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                          <p className="text-[10px] font-bold text-slate-800 flex items-start gap-1">
                            <span className="text-blue-500 shrink-0">▶</span>
                            <span>{indicator.name} (Aspek: {indicator.aspect})</span>
                          </p>
                          
                          {/* 4 Rubric Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5 pt-1">
                            <div className="bg-white p-1.5 rounded border border-slate-200 text-[9px] leading-relaxed text-left space-y-0.5">
                              <span className="text-[8px] font-black uppercase text-red-600 block">Baru Berkembang</span>
                              <p className="text-slate-550 leading-normal">{indicator.rubric.baruBerkembang}</p>
                            </div>
                            <div className="bg-white p-1.5 rounded border border-slate-200 text-[9px] leading-relaxed text-left space-y-0.5">
                              <span className="text-[8px] font-black uppercase text-amber-600 block">Layak</span>
                              <p className="text-slate-550 leading-normal">{indicator.rubric.layak}</p>
                            </div>
                            <div className="bg-white p-1.5 rounded border border-slate-200 text-[9px] leading-relaxed text-left space-y-0.5">
                              <span className="text-[8px] font-black uppercase text-blue-600 block">Cakap</span>
                              <p className="text-slate-550 leading-normal">{indicator.rubric.cakap}</p>
                            </div>
                            <div className="bg-white p-1.5 rounded border border-slate-200 text-[9px] leading-relaxed text-left space-y-0.5">
                              <span className="text-[8px] font-black uppercase text-emerald-700 block">Mahir</span>
                              <p className="text-slate-550 leading-normal">{indicator.rubric.mahir}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meta Method & Pedagogical Note */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 mt-1 text-[9px] border-t border-slate-200">
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wide block">Metode Pembuktian:</span>
                        <p className="text-slate-700 font-medium leading-normal">{tp.kktpMethod}</p>
                      </div>
                      <div>
                        <span className="font-bold text-blue-600 uppercase tracking-wide block">Instruksi Stimulus Guru:</span>
                        <p className="text-slate-600 italic font-serif leading-normal text-justify pr-1">{tp.pedagogicalNote}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Area (Exactly 2 clean columns) */}
          <div className="grid grid-cols-2 pt-8 border-t border-slate-300 text-[10px] font-sans">
            <div className="text-center space-y-12">
              <p>Mengetahui,<br/>Kepala Sekolah Penanggungjawab</p>
              <div className="space-y-0.5">
                <p className="font-bold underline uppercase">{meta.principalName || "DRS. AHMAD SUBARI, M.PD."}</p>
                <p className="text-slate-500 font-mono text-[9px]">NIP. 19750312 200003 1 002</p>
              </div>
            </div>
            <div className="text-center space-y-12">
              <p>{todayDateStr}<br/>Guru Kelas Pengampu</p>
              <div className="space-y-0.5">
                <p className="font-bold underline uppercase">{meta.teacherName || "BUDI SANTOSO, S.PD."}</p>
                <p className="text-slate-500 font-mono text-[9px]">NIP. 19880520 201502 1 004</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          header, 
          form, 
          .print\\:hidden,
          button,
          .bg-slate-50, 
          .border-b {
            display: none !important;
          }
          
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .text-justify {
            text-align: justify !important;
          }

          #kktp-official-report {
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .grid {
            display: grid !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
