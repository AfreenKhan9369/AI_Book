import React, { useState } from "react";
import {
  X,
  Download,
  ExternalLink,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Send,
  Loader2,
} from "lucide-react";
import { Material } from "../types";
import { api } from "../services/api";

interface PdfViewerModalProps {
  material: Material | null;
  onClose: () => void;
  onDownload: (material: Material) => void;
  onTriggerQuiz?: (material: Material) => void;
}

export function PdfViewerModal({ material, onClose, onDownload, onTriggerQuiz }: PdfViewerModalProps) {
  if (!material) return null;

  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "ask">("summary");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // AI Summary state
  const [summary, setSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // AI Doubt state
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [askingAi, setAskingAi] = useState(false);

  // Generate note summary
  const handleGenerateSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await api.post<{ summary: string }>("/ai/summarize", {
        materialId: material.id,
        title: material.title,
        subject: material.subject_name,
        description: material.description,
      });
      setSummary(res.summary);
      setSummaryLoaded(true);
    } catch (err: any) {
      alert(err.message || "Failed to generate AI summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Ask AI about this note
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userText = question.trim();
    setQuestion("");
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setAskingAi(true);

    try {
      const res = await api.post<{ answer: string }>("/ai/ask", {
        question: `Context Note: "${material.title}" in Subject "${material.subject_name}". Student question: ${userText}`,
        subject: material.subject_name,
        topic: material.title,
      });

      setChatMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: `Error: ${err.message || "Could not get an answer at this time."}` },
      ]);
    } finally {
      setAskingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full h-[95vh] max-w-7xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/20">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate max-w-md">
                  {material.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase">
                  {material.type === "pyq" ? "PYQ Paper" : "Lecture Note"}
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
          <div className="flex items-center gap-2">
            {/* AI Copilot toggle */}
            <button
              id="btn-pdf-toggle-ai"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                aiPanelOpen
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{aiPanelOpen ? "Hide AI Copilot" : "AI Copilot"}</span>
            </button>

            {/* Download button */}
            <button
              id="btn-pdf-modal-download"
              onClick={() => onDownload(material)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Direct Open in new tab */}
            <a
              href={material.file_path}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Open raw file in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close */}
            <button
              id="btn-pdf-modal-close"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Viewer + AI Drawer */}
        <div className="flex-1 flex overflow-hidden bg-slate-100">
          {/* PDF Viewer Frame */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Viewer Zoom & Scale Controls */}
            <div className="px-4 py-2 bg-slate-200/70 border-b border-slate-300/80 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-600">Viewing PDF Document</span>
                <span className="px-2 py-0.5 rounded bg-white font-mono text-[11px] text-slate-600 border border-slate-300">
                  {material.file_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <span className="font-mono text-xs w-12 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                  className="p-1 rounded bg-white hover:bg-slate-50 border border-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-[11px]"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* PDF Embedded Container */}
            <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-800/90">
              <div
                className="w-full h-full bg-white shadow-xl rounded-lg overflow-hidden transition-all flex flex-col"
                style={{
                  maxWidth: `${zoomLevel}%`,
                  minHeight: "100%",
                }}
              >
                <iframe
                  src={`${material.file_path}#toolbar=1&navpanes=0`}
                  title={material.title}
                  className="w-full h-full border-0 flex-1 min-h-[500px]"
                />
              </div>
            </div>
          </div>

          {/* Collapsible AI Copilot Panel */}
          {aiPanelOpen && (
            <div className="w-96 border-l border-slate-200 bg-white flex flex-col h-full shadow-lg z-10 animate-in slide-in-from-right duration-200">
              {/* Panel Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-sky-50 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-indigo-950">AI Note Assistant</span>
                </div>
                {onTriggerQuiz && (
                  <button
                    onClick={() => onTriggerQuiz(material)}
                    className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors"
                  >
                    Take Quiz
                  </button>
                )}
              </div>

              {/* Sub Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "summary"
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Instant Summary
                </button>
                <button
                  onClick={() => setActiveTab("ask")}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === "ask"
                      ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Ask Doubt
                </button>
              </div>

              {/* Tab 1: AI Summary */}
              {activeTab === "summary" && (
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {!summaryLoaded && !loadingSummary && (
                    <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        High-Yield Exam Summary
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">
                        Let Gemini extract essential definitions, core algorithms, and exam traps from this note.
                      </p>
                      <button
                        onClick={handleGenerateSummary}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate AI Revision Guide
                      </button>
                    </div>
                  )}

                  {loadingSummary && (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-600">
                        Analyzing note syllabus and generating exam guide...
                      </p>
                    </div>
                  )}

                  {summaryLoaded && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700">Exam Revision Card</span>
                        <button
                          onClick={handleGenerateSummary}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Regenerate
                        </button>
                      </div>
                      <div className="prose prose-xs text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        {summary}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Ask Doubt on Note */}
              {activeTab === "ask" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-6 px-2 text-xs text-slate-500">
                        <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                        <p className="font-semibold text-slate-700">Have a doubt about this note?</p>
                        <p className="text-[11px] mt-1 text-slate-400">
                          Ask questions like &ldquo;Explain the difference between mutex and semaphore&rdquo; or &ldquo;Step-by-step example of this algorithm&rdquo;.
                        </p>
                      </div>
                    )}

                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${
                          msg.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                            msg.role === "user"
                              ? "bg-indigo-600 text-white font-medium"
                              : "bg-slate-100 text-slate-800 border border-slate-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {askingAi && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>AI Tutor is writing explanation...</span>
                      </div>
                    )}
                  </div>

                  {/* Ask Input Form */}
                  <form onSubmit={handleAskQuestion} className="p-3 border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type doubt on this note..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!question.trim() || askingAi}
                        className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
