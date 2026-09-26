import React, { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Subject, Material } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMaterial: Material) => void;
  subjects: Subject[];
  initialType?: "note" | "pyq";
}

export function UploadMaterialModal({
  isOpen,
  onClose,
  onSuccess,
  subjects,
  initialType = "note",
}: UploadMaterialModalProps) {
  const { isFaculty } = useAuth();
  if (!isOpen) return null;

  if (!isFaculty) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Faculty Access Required</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Only verified faculty members and professors have publishing permissions for course notes and university question papers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"note" | "pyq">(initialType);
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ? String(subjects[0].id) : "");
  const [semester, setSemester] = useState<number>(subjects[0]?.semester || 4);
  const [branch, setBranch] = useState<string>(subjects[0]?.branch || "Computer Science");
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [moduleUnit, setModuleUnit] = useState("Unit 1");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When selected subject changes, auto-sync branch & semester
  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    const sel = subjects.find((s) => String(s.id) === id);
    if (sel) {
      setSemester(sel.semester);
      setBranch(sel.branch);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files (.pdf) are allowed.");
        return;
      }
      setError(null);
      setFile(selected);
      if (!title) {
        // Auto fill title from file name without extension
        setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a title for the material.");
      return;
    }

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("subject_id", subjectId);
      formData.append("semester", String(semester));
      formData.append("branch", branch);
      formData.append("academic_year", academicYear);
      formData.append("module_unit", moduleUnit.trim());
      formData.append("description", description.trim());

      if (file) {
        formData.append("file", file);
      }

      const res = await api.upload<{ message: string; material: Material }>("/materials", formData);
      onSuccess(res.material);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to upload note.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload College Study Material
              </h3>
              <p className="text-xs text-slate-500">
                Share lecture notes or Previous Year Question papers with students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Note vs PYQ) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("note")}
              className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === "note"
                  ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Lecture Note / Handouts</span>
            </button>

            <button
              type="button"
              onClick={() => setType("pyq")}
              className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                type === "pyq"
                  ? "bg-amber-50 border-amber-600 text-amber-800 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>PYQ (Exam Question Paper)</span>
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title / Topic Name *
            </label>
            <input
              type="text"
              required
              placeholder={type === "pyq" ? "e.g., DBMS Mid-Term Exam Paper 2024 (Solved)" : "e.g., Process Synchronization & Semaphores"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none transition-all"
            />
          </div>

          {/* Subject & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject *
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name} (Sem {sub.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Module / Exam Unit & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit / Exam Type
              </label>
              <input
                type="text"
                placeholder={type === "pyq" ? "e.g., End-Term 2024" : "e.g., Unit 2: Concurrency"}
                value={moduleUnit}
                onChange={(e) => setModuleUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                placeholder="2024-25"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Summary / Syllabus Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Covers critical sections, Peterson's solution, counting semaphores with practice questions."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
            />
          </div>

          {/* PDF File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PDF Document (.pdf)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center bg-slate-50/60 hover:bg-indigo-50/20 transition-all cursor-pointer">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
              {file ? (
                <div>
                  <p className="text-xs font-bold text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Click or drag & drop PDF here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    (If left empty, a verified sample PDF will be generated automatically)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{uploading ? "Publishing..." : "Upload & Share"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
