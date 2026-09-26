import React from "react";
import {
  FileText,
  Download,
  Eye,
  Bookmark,
  Sparkles,
  Award,
  Calendar,
  Layers,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { Material } from "../types";
import { useAuth } from "../context/AuthContext";

interface MaterialCardProps {
  material: Material;
  onView: (material: Material) => void;
  onDownload: (material: Material) => void;
  onAiSummarize?: (material: Material) => void;
  onAiQuiz?: (material: Material) => void;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
}

export function MaterialCard({
  material,
  onView,
  onDownload,
  onAiSummarize,
  onAiQuiz,
  onEdit,
  onDelete,
}: MaterialCardProps) {
  const { isFaculty, bookmarkedIds, toggleBookmark } = useAuth();
  const isBookmarked = bookmarkedIds.includes(material.id);

  const isPyq = material.type === "pyq";

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleBookmark(material.id);
    } catch (err: any) {
      alert(err.message || "Failed to update bookmark.");
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${
        isPyq
          ? "border-amber-200/80 hover:border-amber-400"
          : "border-slate-200 hover:border-indigo-400"
      }`}
    >
      {/* Top Header Bar with Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Semester badge */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Sem {material.semester}
            </span>

            {/* Subject Code badge */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {material.subject_code}
            </span>

            {/* Type badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isPyq
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-sky-100 text-sky-900 border border-sky-200"
              }`}
            >
              {isPyq ? "PYQ (Exam Paper)" : "Lecture Note"}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`p-2 rounded-xl transition-all ${
              isBookmarked
                ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                : "text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100"
            }`}
            title={isBookmarked ? "Remove from saved notes" : "Save note for revision"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-rose-600" : ""}`} />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onView(material)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer transition-colors line-clamp-2 leading-snug mb-1"
        >
          {material.title}
        </h3>

        {/* Subject & Module/Unit info */}
        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-700">{material.subject_name}</span>
          <span>•</span>
          <span className="text-indigo-600 font-medium">{material.module_unit}</span>
          <span>•</span>
          <span className="text-slate-400">{material.academic_year}</span>
        </p>

        {/* Description snippet */}
        {material.description && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {material.description}
          </p>
        )}

        {/* Meta Stats row */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{material.views_count} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{material.downloads_count} downloads</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{material.file_size}</span>
          </div>
        </div>
      </div>

      {/* AI Quick Enhancements Bar */}
      <div className="px-5 py-2.5 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-t border-b border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          AI Study Tools:
        </span>
        <div className="flex items-center gap-1.5">
          {onAiSummarize && (
            <button
              onClick={() => onAiSummarize(material)}
              className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-100/80 rounded-md border border-indigo-200/80 transition-colors shadow-2xs"
            >
              Summary
            </button>
          )}
          {onAiQuiz && (
            <button
              onClick={() => onAiQuiz(material)}
              className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-white hover:bg-amber-100/80 rounded-md border border-amber-200/80 transition-colors shadow-2xs"
            >
              Test Quiz
            </button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white flex items-center justify-between gap-2">
        <button
          onClick={() => onView(material)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View PDF</span>
        </button>

        <button
          onClick={() => onDownload(material)}
          className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          title="Download PDF directly"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Faculty Admin options */}
        {isFaculty && (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
            {onEdit && (
              <button
                onClick={() => onEdit(material)}
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Edit details"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(material)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
