import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Upload,
  BookOpen,
  FileText,
  Users,
  BookPlus,
  Trash2,
  Edit,
  Download,
  Eye,
  Search,
  ExternalLink,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Material, Subject, OverviewStats, User } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { UploadMaterialModal } from "../components/UploadMaterialModal";
import { AddSubjectModal } from "../components/AddSubjectModal";

interface AdminDashboardProps {
  onViewPdf: (material: Material) => void;
  onDownloadPdf: (material: Material) => void;
}

export function AdminDashboard({ onViewPdf, onDownloadPdf }: AdminDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"materials" | "subjects" | "students">("materials");

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  // Filters
  const [materialSearch, setMaterialSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "note" | "pyq">("all");
  const [studentSearch, setStudentSearch] = useState("");

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, matRes, subRes, studRes] = await Promise.all([
        api.get<OverviewStats>("/materials/stats/overview"),
        api.get<Material[]>("/materials"),
        api.get<Subject[]>("/subjects"),
        api.get<any[]>("/users/students"),
      ]);
      setStats(statsRes);
      setMaterials(matRes);
      setSubjects(subRes);
      setStudents(studRes);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Material Delete handler
  const handleDeleteMaterial = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      loadAllData();
    } catch (e: any) {
      alert(e.message || "Failed to delete material.");
    }
  };

  // Subject Delete handler
  const handleDeleteSubject = async (id: number, name: string) => {
    if (!window.confirm(`Delete subject "${name}"? This will also remove its associated materials.`)) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      loadAllData();
    } catch (e: any) {
      alert(e.message || "Failed to delete subject.");
    }
  };

  // Student Delete handler
  const handleDeleteStudent = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete student account "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e.message || "Failed to delete student.");
    }
  };

  const filteredMaterials = materials.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (materialSearch.trim()) {
      const q = materialSearch.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.subject_name.toLowerCase().includes(q) ||
        m.module_unit.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredStudents = students.filter((s) => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.roll_number && s.roll_number.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Faculty Studio Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Publish lecture handouts, manage past semester question papers, configure syllabus modules, and view student analytics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
          >
            <BookPlus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
              Syllabus
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalNotes ?? 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Published Notes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <FileText className="w-5 h-5" />
            <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              Exams
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalPyqs ?? 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">University PYQs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-sky-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[11px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
              Enrolled
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalStudents ?? 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Active Students</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab("materials")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "materials"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Manage Notes & PYQs ({materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("subjects")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "subjects"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Subjects & Semesters ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "students"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Student Directory ({students.length})</span>
          </button>
        </div>

        {/* TAB 1: MATERIALS TABLE */}
        {activeTab === "materials" && (
          <div className="p-6 space-y-4">
            {/* Search and type filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter uploaded materials by title or subject..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    typeFilter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({materials.length})
                </button>
                <button
                  onClick={() => setTypeFilter("note")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    typeFilter === "note"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Notes ({materials.filter((m) => m.type === "note").length})
                </button>
                <button
                  onClick={() => setTypeFilter("pyq")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    typeFilter === "pyq"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  PYQs ({materials.filter((m) => m.type === "pyq").length})
                </button>
              </div>
            </div>

            {/* Materials Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Title & Unit</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 max-w-xs truncate">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {m.module_unit} • {m.file_size}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{m.subject_name}</span>
                        <span className="text-[11px] text-indigo-600 block font-mono">{m.subject_code}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold">Sem {m.semester}</span>
                        <span className="text-[11px] text-slate-400 block">{m.branch}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewPdf(m)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="View PDF document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDownloadPdf(m)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(m.id, m.title)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SUBJECTS TABLE */}
        {activeTab === "subjects" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configured Curriculum Subjects</h3>
                <p className="text-xs text-slate-500">Subjects linked to semester course syllabi</p>
              </div>
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
              >
                + Add Subject
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 text-indigo-700">
                        {sub.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Semester {sub.semester}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{sub.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">{sub.branch}</p>
                    {sub.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      {sub.notes_count || 0} notes • {sub.pyqs_count || 0} PYQs
                    </span>
                    <button
                      onClick={() => handleDeleteSubject(sub.id, sub.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS DIRECTORY */}
        {activeTab === "students" && (
          <div className="p-6 space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name, roll number, or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Branch & Semester</th>
                    <th className="py-3 px-4">Study Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[11px] text-slate-400">{st.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {st.roll_number || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{st.branch}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Semester {st.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-600 block">
                          {st.saved_notes_count || 0} notes saved
                        </span>
                        <span className="text-[11px] text-indigo-600 font-bold block">
                          {st.quizzes_taken || 0} quizzes practiced
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(st.id, st.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Remove student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        subjects={subjects}
        onSuccess={(newMat) => {
          setMaterials((prev) => [newMat, ...prev]);
          loadAllData();
        }}
      />

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSuccess={(newSub) => {
          setSubjects((prev) => [...prev, newSub]);
          loadAllData();
        }}
      />
    </div>
  );
}
