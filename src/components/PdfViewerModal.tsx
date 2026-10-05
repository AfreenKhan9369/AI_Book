import React from "react";
import {
  X,
  Download,
  ExternalLink,
  BookOpen,
  FileText,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Material } from "../types";

interface PdfViewerModalProps {
  material: Material | null;
  onClose: () => void;
  onDownload: (material: Material) => void;
  onTriggerQuiz?: (material: Material) => void;
}

export function PdfViewerModal({ material, onClose, onDownload }: PdfViewerModalProps) {
  if (!material) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full h-[95vh] max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/20">
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate max-w-md">
                  {material.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{material.subject_name} ({material.subject_code})</span>
                <span>•</span>
                <span>Sem {material.semester}</span>
                <span>•</span>
                <span>{material.file_size}</span>
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Open in Tab to View PDF Online without downloading */}
            <a
              href={material.file_path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              title="Open and view PDF document in browser without downloading"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tab</span>
            </a>

            {/* Close */}
            <button
              id="btn-pdf-modal-close"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors ml-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Structured Notes View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          {/* Sub Header */}
          <div className="px-6 py-2.5 bg-slate-200/80 border-b border-slate-300/80 flex items-center justify-between gap-2 text-xs text-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-300 text-indigo-700 font-bold shadow-2xs text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                Structured Notes
              </span>
              <span className="hidden md:inline font-mono text-[11px] text-slate-500">
                {material.file_name}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Interactive syllabus reading view
            </span>
          </div>

          {/* Structured Notes Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Executive Overview & Lecture Abstract Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Executive Overview & Lecture Abstract</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 font-bold text-indigo-700 text-xs border border-indigo-100">
                      {material.module_unit}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 font-semibold text-emerald-800 text-xs border border-emerald-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {material.description}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>Curated for {material.subject_name} • Semester {material.semester} • {material.academic_year}</span>
                </div>
              </div>

              {/* Action Buttons: Open in Tab (View PDF) & Download */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={material.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2 transition-all text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Tab (View PDF Online)</span>
                </a>

                <button
                  onClick={() => onDownload(material)}
                  className="py-3 px-5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition-all"
                  title="Download copy to your device"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Download ({material.file_size})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
