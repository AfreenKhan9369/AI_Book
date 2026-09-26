import React, { useState } from "react";
import { X, BookPlus, Loader2, AlertCircle } from "lucide-react";
import { Subject } from "../types";
import { api } from "../services/api";

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubject: Subject) => void;
}

export function AddSubjectModal({ isOpen, onClose, onSuccess }: AddSubjectModalProps) {
  if (!isOpen) return null;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Computer Science");
  const [semester, setSemester] = useState(4);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError("Subject Code and Subject Name are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ message: string; subject: Subject }>("/subjects", {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        branch,
        semester,
        description: description.trim(),
      });
      onSuccess(res.subject);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create subject.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Subject</h3>
              <p className="text-xs text-slate-500">Configure new curriculum subject and semester</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., CS405"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester *
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Cloud Computing & DevOps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Curriculum Description
            </label>
            <textarea
              rows={2}
              placeholder="Key topics and learning outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
            />
          </div>

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
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? "Adding..." : "Save Subject"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
