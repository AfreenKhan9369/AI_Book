import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  SlidersHorizontal,
  FileCheck,
} from "lucide-react";
import { Material, Subject } from "../types";
import { MaterialCard } from "../components/MaterialCard";
import { api } from "../services/api";

interface NotesCatalogProps {
  onViewPdf: (material: Material) => void;
  onDownloadPdf: (material: Material) => void;
  onOpenAi: (initialTab?: "ask" | "summarize" | "quiz", material?: Material) => void;
}

export function NotesCatalog({ onViewPdf, onDownloadPdf, onOpenAi }: NotesCatalogProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [semester, setSemester] = useState<number | "all">("all");
  const [branch, setBranch] = useState<string>("All");
  const [subjectId, setSubjectId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "downloads" | "views">("latest");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [matRes, subRes] = await Promise.all([
          api.get<Material[]>("/materials", { type: "note" }),
          api.get<Subject[]>("/subjects"),
        ]);
        setMaterials(matRes);
        setSubjects(subRes);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter & Sort
  const filtered = materials
    .filter((m) => {
      if (semester !== "all" && m.semester !== semester) return false;
      if (branch !== "All" && m.branch !== branch) return false;
      if (subjectId !== "all" && String(m.subject_id) !== subjectId) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inSub = m.subject_name.toLowerCase().includes(q);
        const inUnit = m.module_unit.toLowerCase().includes(q);
        if (!inTitle && !inSub && !inUnit) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "downloads") return b.downloads_count - a.downloads_count;
      if (sortBy === "views") return b.views_count - a.views_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              College Lecture Notes Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Browse semester, branch, and unit-wise verified handouts curated by university faculty.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 font-semibold border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="latest">Most Recent</option>
            <option value="downloads">Most Downloaded</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
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
                ? "bg-indigo-600 text-white shadow-xs"
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
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>

        {/* Search, Branch, and Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, unit or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
            >
              <option value="All">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
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

      {/* Grid of Notes */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No notes match your filters</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your semester, branch, or search keyword.
          </p>
          <button
            onClick={() => {
              setSemester("all");
              setBranch("All");
              setSubjectId("all");
              setSearch("");
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Reset All Filters
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
