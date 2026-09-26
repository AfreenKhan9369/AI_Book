import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  SlidersHorizontal,
  Calendar,
  Award,
  Sparkles,
  Layers,
} from "lucide-react";
import { Material, Subject } from "../types";
import { MaterialCard } from "../components/MaterialCard";
import { api } from "../services/api";

interface PyqCatalogProps {
  onViewPdf: (material: Material) => void;
  onDownloadPdf: (material: Material) => void;
  onOpenAi: (initialTab?: "ask" | "summarize" | "quiz", material?: Material) => void;
}

export function PyqCatalog({ onViewPdf, onDownloadPdf, onOpenAi }: PyqCatalogProps) {
  const [pyqs, setPyqs] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [semester, setSemester] = useState<number | "all">("all");
  const [academicYear, setAcademicYear] = useState<string>("All");
  const [subjectId, setSubjectId] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [matRes, subRes] = await Promise.all([
          api.get<Material[]>("/materials", { type: "pyq" }),
          api.get<Subject[]>("/subjects"),
        ]);
        setPyqs(matRes);
        setSubjects(subRes);
      } catch (err) {
        console.error("Failed to fetch PYQs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = pyqs.filter((m) => {
    if (semester !== "all" && m.semester !== semester) return false;
    if (academicYear !== "All" && m.academic_year !== academicYear) return false;
    if (subjectId !== "all" && String(m.subject_id) !== subjectId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const inTitle = m.title.toLowerCase().includes(q);
      const inSub = m.subject_name.toLowerCase().includes(q);
      const inUnit = m.module_unit.toLowerCase().includes(q);
      if (!inTitle && !inSub && !inUnit) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <FileText className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
              University Exam Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Previous Year Question Papers (PYQs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice real past semester mid-terms and university finals with verified faculty solutions. Spot recurring question patterns and master high-weightage topics.
          </p>
        </div>

        <button
          onClick={() => onOpenAi("quiz")}
          className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Generate Mock Exam Test</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Semester selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 mr-1">
            Semester:
          </span>
          <button
            onClick={() => setSemester("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
              semester === "all"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Semesters
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              onClick={() => setSemester(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                semester === s
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>

        {/* Search, Academic Year, and Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search PYQ topic, year, or exam type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600"
            >
              <option value="All">All Academic Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>

          <div>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600"
            >
              <option value="all">All Subjects</option>
              {subjects
                .filter((sub) => semester === "all" || sub.semester === semester)
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of PYQs */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No PYQ papers found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your academic year, semester, or search term.
          </p>
          <button
            onClick={() => {
              setSemester("all");
              setAcademicYear("All");
              setSubjectId("all");
              setSearch("");
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onView={onViewPdf}
              onDownload={onDownloadPdf}
              onAiSummarize={(m) => onOpenAi("summarize", m)}
              onAiQuiz={(m) => onOpenAi("quiz", m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
