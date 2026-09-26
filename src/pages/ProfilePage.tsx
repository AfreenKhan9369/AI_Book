import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Bookmark,
  Award,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Material, QuizHistoryItem } from "../types";
import { api } from "../services/api";

interface ProfilePageProps {
  onViewPdf: (material: Material) => void;
  onDownloadPdf: (material: Material) => void;
  onOpenAi: (initialTab?: "ask" | "summarize" | "quiz", material?: Material) => void;
}

export function ProfilePage({ onViewPdf, onDownloadPdf, onOpenAi }: ProfilePageProps) {
  const { user, updateProfile, toggleBookmark } = useAuth();

  const [activeTab, setActiveTab] = useState<"bookmarks" | "quizzes" | "edit">("bookmarks");
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<Material[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [name, setName] = useState(user?.name || "");
  const [branch, setBranch] = useState(user?.branch || "Computer Science");
  const [semester, setSemester] = useState(user?.semester || 4);
  const [rollNumber, setRollNumber] = useState(user?.roll_number || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const meRes = await api.get<{
          user: any;
          bookmarkedIds: number[];
          bookmarks: Material[];
          quizHistory: QuizHistoryItem[];
        }>("/auth/me");

        setBookmarkedMaterials(meRes.bookmarks || []);
        setQuizHistory(meRes.quizHistory || []);
      } catch (err) {
        console.error("Profile data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        branch,
        semester,
        roll_number: rollNumber.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBookmark = async (id: number) => {
    try {
      await toggleBookmark(id);
      setBookmarkedMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to remove bookmark.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Card Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
          alt={user?.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
        />

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 capitalize border border-indigo-200">
              {user?.role}
            </span>
          </div>

          <p className="text-xs text-slate-500">{user?.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-600 font-semibold">
            <span className="px-3 py-1 bg-slate-100 rounded-xl">
              {user?.branch || "Engineering"}
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-xl">
              Semester {user?.semester || 1}
            </span>
            {user?.roll_number && (
              <span className="px-3 py-1 bg-slate-100 rounded-xl font-mono">
                Roll: {user.roll_number}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "bookmarks"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark className="w-4 h-4 text-rose-500" />
            <span>Saved Revision Notes ({bookmarkedMaterials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "quizzes"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Quiz Test History ({quizHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "edit"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserIcon className="w-4 h-4 text-slate-500" />
            <span>Academic Profile Settings</span>
          </button>
        </div>

        {/* TAB 1: SAVED BOOKMARKS */}
        {activeTab === "bookmarks" && (
          <div className="p-6">
            {bookmarkedMaterials.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50 text-rose-300" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">No saved notes yet</h4>
                <p className="text-xs text-slate-500">
                  Bookmark lecture notes or PYQs while browsing to quickly revise them here before exams.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {mat.subject_code} • Sem {mat.semester}
                        </span>
                        <button
                          onClick={() => handleRemoveBookmark(mat.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                        {mat.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">
                        {mat.subject_name} • {mat.module_unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => onViewPdf(mat)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Read PDF</span>
                      </button>
                      <button
                        onClick={() => onOpenAi("summarize", mat)}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Summary
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUIZ HISTORY */}
        {activeTab === "quizzes" && (
          <div className="p-6">
            {quizHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Award className="w-12 h-12 mx-auto mb-2 opacity-50 text-amber-300" />
                <h4 className="text-sm font-bold text-slate-700 mb-1">No quizzes taken yet</h4>
                <p className="text-xs text-slate-500">
                  Generate an AI quiz from any note or the AI Study Hub to evaluate your exam readiness.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizHistory.map((q) => {
                  const percentage = Math.round((q.score / q.total_questions) * 100);
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                          {q.subject_name}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{q.topic}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(q.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-indigo-900">
                          {q.score} / {q.total_questions}
                        </span>
                        <span
                          className={`block text-[11px] font-bold ${
                            percentage >= 80
                              ? "text-emerald-600"
                              : percentage >= 50
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {percentage}% Mastery
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EDIT PROFILE */}
        {activeTab === "edit" && (
          <form onSubmit={handleSaveProfile} className="p-6 max-w-lg space-y-4">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Academic profile updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enrolled Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll / Student ID
                </label>
                <input
                  type="text"
                  placeholder="CS-2024-042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Engineering Branch / Department
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-semibold"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
