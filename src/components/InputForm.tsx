import React, { useState, useRef } from "react";
import { 
  Building2, User, UserCheck, Calendar, Settings, 
  HelpCircle, Upload, FileText, Sparkles, Check, AlertCircle, Loader2
} from "lucide-react";
import { InputFormData } from "../types";
import { extractTextFromPDF, extractTextFromWord } from "../utils/fileParser";

interface InputFormProps {
  onSubmit: (data: InputFormData, selectedModel: string) => Promise<void>;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [formData, setFormData] = useState<InputFormData>({
    schoolName: "SDN Kebon Jeruk 01",
    teacherName: "Prof. Dr. Agus Hariyadi, M.Pd.",
    principalName: "Hj. Endang Setyowati, S.Pd., M.A.",
    academicYear: "2026/2027",
    phase: "Fase C",
    semester: "Semester 1",
    className: "Kelas 5-A",
    jp: 144, // Default Jam Pelajaran per Tahun (recommended 72-144 depending on subject)
    cpText: "",
    atpText: ""
  });

  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  
  // States for file statuses
  const [cpFileStatus, setCpFileStatus] = useState<{ name: string; words: number; success: boolean; error?: string } | null>(null);
  const [atpFileStatus, setAtpFileStatus] = useState<{ name: string; words: number; success: boolean; error?: string } | null>(null);
  
  // Loading individual files
  const [parsingCp, setParsingCp] = useState(false);
  const [parsingAtp, setParsingAtp] = useState(false);

  // Drag states
  const [dragCpOver, setDragCpOver] = useState(false);
  const [dragAtpOver, setDragAtpOver] = useState(false);

  // File Inputs references
  const cpInputRef = useRef<HTMLInputElement>(null);
  const atpInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "jp" ? parseInt(value) || 0 : value
    }));
  };

  const processFile = async (file: File, type: "cp" | "atp") => {
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isWord = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx");
    
    if (type === "cp") setParsingCp(true);
    else setParsingAtp(true);

    try {
      let text = "";
      if (isPDF) {
        text = await extractTextFromPDF(file);
      } else if (isWord) {
        text = await extractTextFromWord(file);
      } else {
        throw new Error("Format file tidak didukung. Unggah file .pdf atau .docx");
      }

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      
      setFormData(prev => ({
        ...prev,
        [type === "cp" ? "cpText" : "atpText"]: text
      }));

      const status = { name: file.name, words: wordCount, success: true };
      if (type === "cp") setCpFileStatus(status);
      else setAtpFileStatus(status);
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memproses file";
      const status = { name: file.name, words: 0, success: false, error: errorMsg };
      if (type === "cp") setCpFileStatus(status);
      else setAtpFileStatus(status);
    } finally {
      if (type === "cp") setParsingCp(false);
      else setParsingAtp(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cp" | "atp") => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, type);
    }
  };

  // Drag-and-drop handlers
  const onDragOver = (e: React.DragEvent, type: "cp" | "atp") => {
    e.preventDefault();
    if (type === "cp") setDragCpOver(true);
    else setDragAtpOver(true);
  };

  const onDragLeave = (type: "cp" | "atp") => {
    if (type === "cp") setDragCpOver(false);
    else setDragAtpOver(false);
  };

  const onDrop = (e: React.DragEvent, type: "cp" | "atp") => {
    e.preventDefault();
    if (type === "cp") setDragCpOver(false);
    else setDragAtpOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, type);
    }
  };

  const triggerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedModel);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4 shrink-0">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <div className="p-1 bg-blue-50 rounded text-blue-600">
          <Settings size={14} />
        </div>
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Data Administrasi
        </h2>
      </div>

      <form onSubmit={triggerFormSubmit} className="space-y-4">
        {/* Identitas Form Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Sekolah */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 size={11} className="text-slate-400" />
              Nama Sekolah
            </label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleInputChange}
              required
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              placeholder="Masukkan nama sekolah"
            />
          </div>

          {/* Guru & Kepala Sekolah */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <User size={11} className="text-slate-400" />
                Guru Pengampu
              </label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Nama guru"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <UserCheck size={11} className="text-slate-400" />
                Kepala Sekolah
              </label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Nama Kepsek"
              />
            </div>
          </div>

          {/* Tahun Pelajaran & Kelas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={11} className="text-slate-400" />
                Tahun Pelajaran
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="2026/2027"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Kelas Spesifik
              </label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Misal: Kelas 5-A"
              />
            </div>
          </div>

          {/* Fase, Semester & JP */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Fase
              </label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="Fase A">Fase A</option>
                <option value="Fase B">Fase B</option>
                <option value="Fase C">Fase C</option>
                <option value="Fase D">Fase D</option>
                <option value="Fase E">Fase E</option>
                <option value="Fase F">Fase F</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="Semester 1">Smt 1</option>
                <option value="Semester 2">Smt 2</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                JP Tahunan
              </label>
              <input
                type="number"
                name="jp"
                min="1"
                max="1000"
                value={formData.jp}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="144"
              />
            </div>
          </div>
        </div>

        {/* Upload Dokumen Capaian Pembelajaran (CP) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>1. Dokumen CP (.pdf / .docx)</span>
          </div>

          <div
            onDragOver={(e) => onDragOver(e, "cp")}
            onDragLeave={() => onDragLeave("cp")}
            onDrop={(e) => onDrop(e, "cp")}
            onClick={() => cpInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
              dragCpOver
                ? "border-blue-500 bg-blue-50/50"
                : cpFileStatus?.success
                ? "border-emerald-300 bg-emerald-50/10"
                : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white"
            }`}
          >
            <input
              type="file"
              ref={cpInputRef}
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, "cp")}
              className="hidden"
            />
            {parsingCp ? (
              <div className="flex items-center justify-center gap-1.5 py-0.5">
                <Loader2 size={12} className="text-blue-600 animate-spin" />
                <span className="text-[10px] font-medium text-slate-600">Mengekstrak PDF...</span>
              </div>
            ) : cpFileStatus?.success ? (
              <div className="flex items-center justify-center gap-2 py-0.5">
                <Check size={11} className="text-emerald-600" />
                <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[140px]">{cpFileStatus.name}</span>
                <span className="text-[9px] text-slate-400">({cpFileStatus.words} kata)</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-blue-600 py-0.5">
                <Upload size={12} />
                <span>Unggah CP (PDF/Docx)</span>
              </div>
            )}
          </div>

          {cpFileStatus?.error && (
            <div className="flex items-center gap-1 text-[9px] text-red-650 bg-red-50 p-1 rounded border border-red-100">
              <AlertCircle size={10} />
              <span className="truncate">{cpFileStatus.error}</span>
            </div>
          )}

          <textarea
            name="cpText"
            value={formData.cpText}
            onChange={handleInputChange}
            className="w-full h-12 p-1.5 text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
            placeholder="Atau rekatkan teks Capaian Pembelajaran (CP) di sini..."
          />
        </div>

        {/* Upload Dokumen Alur Tujuan Pembelajaran (ATP) */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>2. Dokumen ATP (.pdf / .docx)</span>
          </div>

          <div
            onDragOver={(e) => onDragOver(e, "atp")}
            onDragLeave={() => onDragLeave("atp")}
            onDrop={(e) => onDrop(e, "atp")}
            onClick={() => atpInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
              dragAtpOver
                ? "border-blue-500 bg-blue-50/50"
                : atpFileStatus?.success
                ? "border-emerald-300 bg-emerald-50/10"
                : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white"
            }`}
          >
            <input
              type="file"
              ref={atpInputRef}
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, "atp")}
              className="hidden"
            />
            {parsingAtp ? (
              <div className="flex items-center justify-center gap-1.5 py-0.5">
                <Loader2 size={12} className="text-blue-600 animate-spin" />
                <span className="text-[10px] font-medium text-slate-600">Mengekstrak PDF...</span>
              </div>
            ) : atpFileStatus?.success ? (
              <div className="flex items-center justify-center gap-2 py-0.5">
                <Check size={11} className="text-emerald-600" />
                <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[140px]">{atpFileStatus.name}</span>
                <span className="text-[9px] text-slate-400">({atpFileStatus.words} kata)</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-blue-600 py-0.5">
                <Upload size={12} />
                <span>Unggah ATP (PDF/Docx)</span>
              </div>
            )}
          </div>

          {atpFileStatus?.error && (
            <div className="flex items-center gap-1 text-[9px] text-red-650 bg-red-50 p-1 rounded border border-red-100">
              <AlertCircle size={10} />
              <span className="truncate">{atpFileStatus.error}</span>
            </div>
          )}

          <textarea
            name="atpText"
            value={formData.atpText}
            onChange={handleInputChange}
            className="w-full h-12 p-1.5 text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
            placeholder="Atau rekatkan teks Alur Tujuan Pembelajaran (ATP) di sini..."
          />
        </div>

        {/* Engine AI Gemini Selector */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-1.5 text-[10px]">
          <span className="font-bold text-slate-500 uppercase tracking-widest flex items-center gap-0.5 text-[9px]">
            <Sparkles size={11} className="text-blue-500" />
            Model AI:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedModel("gemini-3.5-flash")}
              className={`p-1.5 text-[10px] rounded-md border text-left font-medium transition-all ${
                selectedModel === "gemini-3.5-flash"
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="font-bold">Gemini 3.5 Flash</div>
              <div className={`text-[8px] ${selectedModel === "gemini-3.5-flash" ? "text-blue-100" : "text-slate-450 text-slate-400"}`}>Gratis &amp; Cepat</div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("gemini-3.1-pro-preview")}
              className={`p-1.5 text-[10px] rounded-md border text-left font-medium transition-all ${
                selectedModel === "gemini-3.1-pro-preview"
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="font-bold">Gemini 3.1 Pro</div>
              <div className={`text-[8px] ${selectedModel === "gemini-3.1-pro-preview" ? "text-blue-100" : "text-slate-450 text-slate-400"}`}>Akurasi Lebih Tinggi</div>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 px-4 py-2 rounded-lg shadow-sm transition-all uppercase tracking-wider cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Memproses Formulasi...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Formulasikan KKTP AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
