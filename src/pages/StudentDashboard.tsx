import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Download,
  Bookmark,
  GraduationCap,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Material, Subject, OverviewStats } from "../types";
import { MaterialCard } from "../components/MaterialCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

interface StudentDashboardProps {
  onOpenAi: (initialTab?: "ask" | "summarize" | "quiz", material?: Material) => void;
  onViewPdf: (material: Material) => void;
  onDownloadPdf: (material: Material) => void;
}

export function StudentDashboard({
  onOpenAi,
  onViewPdf,
  onDownloadPdf,
}: StudentDashboardProps) {
  const { user, bookmarkedIds } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [matRes, subRes, statsRes] = await Promise.all([
          api.get<Material[]>("/materials"),
          api.get<Subject[]>("/subjects"),
          api.get<OverviewStats>("/materials/stats/overview"),
        ]);
        setMaterials(matRes);
        setSubjects(subRes);
        setStats(statsRes);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      }
    }

    loadData();
  }, []);

  const savedNotesList = materials.filter(
    (m) => m.type === "note" && bookmarkedIds.includes(m.id)
  );
  const pyqsList = materials.filter((m) => m.type === "pyq");

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Background accent decorations */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user ? `${user.branch} • Semester ${user.semester}` : "Engineering Hub"}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {user ? `Welcome, ${user.name}!` : "AI-Powered College Notes Hub"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Access semester-wise verified lecture notes, solved previous year university exam papers, and use our AI Copilot to summarize complex modules or test your knowledge before exams.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900">
              {stats?.totalNotes || materials.filter((m) => m.type === "note").length}
            </p>
            <p className="text-[11px] font-medium text-slate-500">Lecture Notes</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900">
              {stats?.totalPyqs || materials.filter((m) => m.type === "pyq").length}
            </p>
            <p className="text-[11px] font-medium text-slate-500">Previous Year Papers</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900">
              {stats?.totalSubjects || subjects.length}
            </p>
            <p className="text-[11px] font-medium text-slate-500">Core Subjects</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900">
              {bookmarkedIds.length}
            </p>
            <p className="text-[11px] font-medium text-slate-500">Saved for Revision</p>
          </div>
        </div>
      </div>

      {/* Saved Revision Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Saved Revision Notes
            </h2>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full">
              {savedNotesList.length} saved
            </span>
          </div>

          <Link
            to="/notes"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Browse Notes Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {savedNotesList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Bookmark className="w-10 h-10 text-rose-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              No notes saved for revision yet
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Save any lecture note from the Notes Catalog by clicking the bookmark icon to quickly access it here for exam preparation.
            </p>
            <Link
              to="/notes"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <span>Explore Notes Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedNotesList.map((material) => (
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

      {/* SECTION 2: PREVIOUS YEAR QUESTION PAPERS (PYQs) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Previous Year University Papers (PYQs)
            </h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {pyqsList.length}
            </span>
          </div>

          <Link
            to="/pyqs"
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            <span>Explore all PYQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pyqsList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">
              No PYQs are available
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified university question papers and solutions will appear here once published by faculty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pyqsList.slice(0, 6).map((material) => (
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
    </div>
  );
}
