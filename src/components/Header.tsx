import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-slate-900 text-white h-14 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded text-white flex items-center justify-center shadow-inner">
          <BookOpen size={16} />
        </div>
        <h1 className="text-sm md:text-base font-bold tracking-tight uppercase truncate">
          Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
            SOLO Taksonomi
          </span>
          <span className="bg-blue-500/20 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-wider">
            Pembelajaran Mendalam
          </span>
        </div>
        <div className="hidden sm:block h-6 w-px bg-slate-700"></div>
        <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap">
          Kurikulum Nasional • v4.1.0
        </span>
      </div>
    </header>
  );
}
