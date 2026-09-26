import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  HelpCircle,
  BookOpen,
  Award,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Subject, Material, QuizQuestion } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface AiStudyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  materials: Material[];
  initialTab?: "ask" | "summarize" | "quiz";
  initialMaterial?: Material | null;
}

export function AiStudyAssistantModal({
  isOpen,
  onClose,
  subjects,
  materials,
  initialTab = "ask",
  initialMaterial = null,
}: AiStudyAssistantModalProps) {
  if (!isOpen) return null;

  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"ask" | "summarize" | "quiz">(initialTab);

  // Ask Concept State
  const [question, setQuestion] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(
    initialMaterial?.subject_name || subjects[0]?.name || "Operating Systems"
  );
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; text: string; subject?: string }[]
  >([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Summarize Note State
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterial?.id ? String(initialMaterial.id) : materials[0]?.id ? String(materials[0].id) : ""
  );
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Quiz State
  const [quizSubject, setQuizSubject] = useState(
    initialMaterial?.subject_name || subjects[0]?.name || "Operating Systems"
  );
  const [quizTopic, setQuizTopic] = useState(initialMaterial?.title || "Process Synchronization & Semaphores");
  const [quizDifficulty, setQuizDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (initialMaterial) {
      setSelectedSubject(initialMaterial.subject_name);
      setSelectedMaterialId(String(initialMaterial.id));
      setQuizSubject(initialMaterial.subject_name);
      setQuizTopic(initialMaterial.title);
    }
  }, [initialMaterial]);

  // Suggested Prompts
  const suggestedDoubts = [
    "Explain Banker's Algorithm for deadlock avoidance with a clear step-by-step example",
    "What is the difference between B-Trees and B+ Trees in DBMS indexing?",
    "Explain Dijkstra's Algorithm with time complexity using priority queue",
    "How does TCP 3-way handshake work and what happens on SYN flood attack?",
  ];

  // Ask Question Handler
  const handleAskQuestion = async (queryText?: string) => {
    const textToAsk = queryText || question;
    if (!textToAsk.trim()) return;

    setQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", text: textToAsk, subject: selectedSubject }]);
    setLoadingAnswer(true);

    try {
      const res = await api.post<{ answer: string }>("/ai/ask", {
        question: textToAsk,
        subject: selectedSubject,
      });

      setChatHistory((prev) => [...prev, { role: "ai", text: res.answer, subject: selectedSubject }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: `Error: ${err.message || "Could not generate answer."}` },
      ]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Generate Summary Handler
  const handleGenerateSummary = async () => {
    const selMat = materials.find((m) => String(m.id) === selectedMaterialId);
    if (!selMat) return;

    setLoadingSummary(true);
    try {
      const res = await api.post<{ summary: string }>("/ai/summarize", {
        materialId: selMat.id,
        title: selMat.title,
        subject: selMat.subject_name,
        description: selMat.description,
      });
      setSummary(res.summary);
    } catch (err: any) {
      alert(err.message || "Failed to generate AI note summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Generate Quiz Handler
  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    setQuizFinished(false);
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentQuestionIndex(0);

    try {
      const res = await api.post<{ questions: QuizQuestion[] }>("/ai/generate-quiz", {
        subject: quizSubject,
        topic: quizTopic,
        difficulty: quizDifficulty,
        numQuestions: 5,
      });

      setQuizQuestions(res.questions || []);
    } catch (err: any) {
      alert(err.message || "Failed to generate quiz.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Handle Answer Selection in Quiz
  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return; // already answered

    const updated = { ...selectedAnswers, [currentQuestionIndex]: optionIndex };
    setSelectedAnswers(updated);
    setShowExplanation((prev) => ({ ...prev, [currentQuestionIndex]: true }));

    // If last question, calculate score
    if (currentQuestionIndex === quizQuestions.length - 1) {
      let totalCorrect = 0;
      quizQuestions.forEach((q, idx) => {
        if (updated[idx] === q.correctIndex) totalCorrect++;
      });
      setScore(totalCorrect);
      setQuizFinished(true);

      // Trigger Confetti if scored high
      if (totalCorrect >= Math.ceil(quizQuestions.length * 0.75)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Record to server if authenticated
      if (isAuthenticated) {
        api.post("/ai/quiz-results", {
          subject_name: quizSubject,
          topic: quizTopic,
          score: totalCorrect,
          total_questions: quizQuestions.length,
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  AI_Book Study Copilot
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Powered by Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your 24/7 college academic tutor, syllabus summarizer & test generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200 px-6">
          <button
            onClick={() => setTab("ask")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              tab === "ask"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Explain Concepts / Doubt Solver</span>
          </button>

          <button
            onClick={() => setTab("summarize")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              tab === "summarize"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Note Syllabus Summarizer</span>
          </button>

          <button
            onClick={() => setTab("quiz")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              tab === "quiz"
                ? "border-indigo-600 text-indigo-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>AI Quiz Practice</span>
          </button>
        </div>

        {/* TAB 1: ASK DOUBT / EXPLAIN CONCEPT */}
        {tab === "ask" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
            {/* Subject Selector bar */}
            <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Subject Context:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-slate-100 font-semibold text-indigo-900 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name} (Sem {sub.semester})
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Trained on university syllabus & exam patterns
              </span>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="py-6 text-center max-w-xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Ask any doubt from your semester syllabus
                  </h4>
                  <p className="text-xs text-slate-500 mb-6">
                    Get clear step-by-step explanations, mathematical derivations, real-world analogies, and pro exam tips.
                  </p>

                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Try asking questions like:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestedDoubts.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskQuestion(s)}
                          className="p-2.5 rounded-xl text-xs text-left bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 text-slate-700 transition-all font-medium"
                        >
                          &ldquo;{s}&rdquo;
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                      {msg.role === "user" ? "You" : "AI Academic Tutor"}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white font-medium"
                          : "bg-white text-slate-800 border border-slate-200/90 shadow-xs prose prose-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}

              {loadingAnswer && (
                <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 w-fit text-xs font-semibold text-indigo-700 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Tutor is structuring comprehensive explanation...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="p-4 bg-white border-t border-slate-200"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask a question about ${selectedSubject}...`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || loadingAnswer}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SUMMARIZE NOTE */}
        {tab === "summarize" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Select an uploaded College Note to Summarize:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-semibold"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.subject_code}] {m.title} ({m.module_unit})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleGenerateSummary}
                  disabled={loadingSummary || !selectedMaterialId}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {loadingSummary && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loadingSummary ? "Summarizing..." : "Generate 3-Min Exam Summary"}</span>
                </button>
              </div>
            </div>

            {summary ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Smart Revision Guide</span>
                  </h4>
                  <button
                    onClick={handleGenerateSummary}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Refresh Summary
                  </button>
                </div>
                <div className="prose prose-xs text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              </div>
            ) : (
              !loadingSummary && (
                <div className="py-12 text-center text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-semibold text-slate-600">
                    Select any uploaded note above to generate a high-yield exam summary.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 3: AI QUIZ GENERATOR & RUNNER */}
        {tab === "quiz" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
            {/* Quiz Configuration Toolbar */}
            {quizQuestions.length === 0 || quizFinished ? (
              <div className="p-6 max-w-xl mx-auto my-auto w-full bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Generate an Interactive College Quiz
                  </h4>
                  <p className="text-xs text-slate-500">
                    Test your understanding with AI-generated university exam questions and instant feedback.
                  </p>
                </div>

                {quizFinished && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-100 text-center">
                    <span className="text-xs font-bold text-slate-600">Your Final Score</span>
                    <p className="text-3xl font-extrabold text-indigo-900 mt-0.5">
                      {score} / {quizQuestions.length}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {score >= 4
                        ? "Outstanding! You have mastered this concept."
                        : "Good effort! Review the explanations below and try again."}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name} (Sem {sub.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Topic / Chapter
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Critical Section & Semaphore Implementation"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setQuizDifficulty(diff)}
                        className={`py-2 text-xs font-bold rounded-xl capitalize transition-all border ${
                          quizDifficulty === diff
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loadingQuiz && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loadingQuiz ? "Generating 5 Questions..." : "Start AI Practice Quiz"}</span>
                </button>
              </div>
            ) : (
              /* ACTIVE QUIZ RUNNER */
              <div className="flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full overflow-y-auto justify-between">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {quizDifficulty} Difficulty
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Question Statement */}
                  <h4 className="text-base font-bold text-slate-900 leading-snug mb-5">
                    {quizQuestions[currentQuestionIndex].question}
                  </h4>

                  {/* 4 Options */}
                  <div className="space-y-2.5 mb-6">
                    {quizQuestions[currentQuestionIndex].options.map((opt, optIdx) => {
                      const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                      const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                      const isCorrect = quizQuestions[currentQuestionIndex].correctIndex === optIdx;

                      let btnStyle = "bg-white border-slate-200 hover:border-indigo-400 text-slate-800";

                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold";
                        } else {
                          btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          disabled={isAnswered}
                          className={`w-full p-3.5 rounded-xl border text-xs text-left flex items-start gap-3 transition-all ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isAnswered && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Answer Explanation */}
                  {showExplanation[currentQuestionIndex] && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700 animate-in fade-in duration-150">
                      <span className="font-bold text-indigo-900 block mb-1">
                        Professor&apos;s Explanation:
                      </span>
                      <p className="leading-relaxed">
                        {quizQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((c) => c - 1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-30"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={() => setCurrentQuestionIndex((c) => c + 1)}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={() => {
                        let totalCorrect = 0;
                        quizQuestions.forEach((q, idx) => {
                          if (selectedAnswers[idx] === q.correctIndex) totalCorrect++;
                        });
                        setScore(totalCorrect);
                        setQuizFinished(true);
                      }}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-50"
                    >
                      Finish & See Score
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
