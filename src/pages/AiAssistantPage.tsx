import React, { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  BookOpen,
  Award,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Subject, Material, QuizQuestion } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function AiAssistantPage() {
  const { isAuthenticated } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tab, setTab] = useState<"ask" | "summarize" | "quiz">("ask");

  // Ask Concept State
  const [question, setQuestion] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Operating Systems");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; text: string; subject?: string }[]
  >([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Summarize Note State
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Quiz State
  const [quizSubject, setQuizSubject] = useState("Operating Systems");
  const [quizTopic, setQuizTopic] = useState("Process Synchronization & Deadlocks");
  const [quizDifficulty, setQuizDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [subRes, matRes] = await Promise.all([
          api.get<Subject[]>("/subjects"),
          api.get<Material[]>("/materials"),
        ]);
        setSubjects(subRes);
        setMaterials(matRes);
        if (subRes.length > 0) {
          setSelectedSubject(subRes[0].name);
          setQuizSubject(subRes[0].name);
        }
        if (matRes.length > 0) {
          setSelectedMaterialId(String(matRes[0].id));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || question;
    if (!q.trim()) return;

    setQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", text: q, subject: selectedSubject }]);
    setLoadingAnswer(true);

    try {
      const res = await api.post<{ answer: string }>("/ai/ask", {
        question: q,
        subject: selectedSubject,
      });
      setChatHistory((prev) => [...prev, { role: "ai", text: res.answer, subject: selectedSubject }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: `Error: ${err.message || "Failed to generate answer."}` },
      ]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleSummarize = async () => {
    const mat = materials.find((m) => String(m.id) === selectedMaterialId);
    if (!mat) return;

    setLoadingSummary(true);
    try {
      const res = await api.post<{ summary: string }>("/ai/summarize", {
        materialId: mat.id,
        title: mat.title,
        subject: mat.subject_name,
        description: mat.description,
      });
      setSummary(res.summary);
    } catch (err: any) {
      alert(err.message || "Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleStartQuiz = async () => {
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

  const handleSelectOption = (optIdx: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;
    const nextAnswers = { ...selectedAnswers, [currentQuestionIndex]: optIdx };
    setSelectedAnswers(nextAnswers);
    setShowExplanation((prev) => ({ ...prev, [currentQuestionIndex]: true }));

    if (currentQuestionIndex === quizQuestions.length - 1) {
      let correct = 0;
      quizQuestions.forEach((q, i) => {
        if (nextAnswers[i] === q.correctIndex) correct++;
      });
      setScore(correct);
      setQuizFinished(true);

      if (correct >= 4) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }

      if (isAuthenticated) {
        api.post("/ai/quiz-results", {
          subject_name: quizSubject,
          topic: quizTopic,
          score: correct,
          total_questions: quizQuestions.length,
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Gemini 3.8 Flash Powered</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI College Study Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mt-1">
            Explain difficult engineering formulas, get instant note summaries before exams, or test yourself with AI-generated university questions.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/15 gap-1">
          <button
            onClick={() => setTab("ask")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "ask" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
            }`}
          >
            Doubt Solver
          </button>
          <button
            onClick={() => setTab("summarize")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "summarize" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
            }`}
          >
            Summarize Notes
          </button>
          <button
            onClick={() => setTab("quiz")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === "quiz" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
            }`}
          >
            Practice Quiz
          </button>
        </div>
      </div>

      {/* Main Interactive Workstation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden min-h-[600px] flex flex-col">
        {/* TAB 1: ASK DOUBT */}
        {tab === "ask" && (
          <div className="flex-1 flex flex-col h-full">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Curriculum Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white font-semibold text-slate-800 border border-slate-300 rounded-xl focus:outline-none"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] text-slate-400">Contextualized for College Exams</span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatHistory.length === 0 ? (
                <div className="py-12 text-center max-w-xl mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    What concept would you like to clarify?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ask about algorithmic proofs, data structures, hardware architectures, or mathematical formulations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                    {[
                      "Explain ACID Properties in DBMS with an online banking transaction example",
                      "Compare Process vs Thread in Operating Systems with memory layout diagram",
                      "How does Bellman-Ford handle negative weight cycles in graphs?",
                      "Step-by-step example of QuickSort partition algorithm with pivot selection",
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAsk(prompt)}
                        className="p-3 text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-700 transition-all font-medium"
                      >
                        &ldquo;{prompt}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                      {msg.role === "user" ? "You" : "AI Academic Tutor"}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white font-medium"
                          : "bg-slate-50 border border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}

              {loadingAnswer && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl text-xs font-semibold text-indigo-700 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Tutor is formulating detailed response...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="p-4 bg-white border-t border-slate-200"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask anything about ${selectedSubject}...`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-600 rounded-xl focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || loadingAnswer}
                  className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SUMMARIZE */}
        {tab === "summarize" && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose a verified college note to summarize:
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white font-semibold border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.subject_code}] {m.title} ({m.module_unit})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSummarize}
                disabled={loadingSummary || !selectedMaterialId}
                className="self-end sm:self-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loadingSummary && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loadingSummary ? "Generating..." : "Generate 3-Min Revision Guide"}</span>
              </button>
            </div>

            {summary && (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Executive Revision Card</span>
                  </h4>
                  <button
                    onClick={handleSummarize}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Regenerate
                  </button>
                </div>
                <div className="prose prose-xs text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRACTICE QUIZ */}
        {tab === "quiz" && (
          <div className="flex-1 p-6 flex flex-col justify-center">
            {quizQuestions.length === 0 || quizFinished ? (
              <div className="max-w-md mx-auto w-full bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Configure Practice Quiz
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generate instant multiple choice questions with step-by-step explanations.
                  </p>
                </div>

                {quizFinished && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-500">Quiz Completed!</p>
                    <p className="text-2xl font-extrabold text-indigo-900 mt-1">
                      {score} / {quizQuestions.length} Score
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
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setQuizDifficulty(d)}
                        className={`py-1.5 text-xs font-bold rounded-xl capitalize transition-all border ${
                          quizDifficulty === d
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartQuiz}
                  disabled={loadingQuiz}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingQuiz && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loadingQuiz ? "Generating..." : "Start Practice Quiz"}</span>
                </button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto w-full space-y-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {quizDifficulty}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{
                      width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`,
                    }}
                  />
                </div>

                <h4 className="text-base font-bold text-slate-900">
                  {quizQuestions[currentQuestionIndex].question}
                </h4>

                <div className="space-y-2.5">
                  {quizQuestions[currentQuestionIndex].options.map((opt, i) => {
                    const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                    const isSelected = selectedAnswers[currentQuestionIndex] === i;
                    const isCorrect = quizQuestions[currentQuestionIndex].correctIndex === i;

                    let style = "bg-white border-slate-200 text-slate-800 hover:border-indigo-400";
                    if (isAnswered) {
                      if (isCorrect) style = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                      else if (isSelected) style = "bg-rose-50 border-rose-500 text-rose-900 font-bold";
                      else style = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                    }

                    return (
                      <button
                        key={i}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(i)}
                        className={`w-full p-3.5 text-xs text-left border rounded-xl flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>

                {showExplanation[currentQuestionIndex] && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-slate-700">
                    <span className="font-bold text-indigo-900 block mb-1">Explanation:</span>
                    <p>{quizQuestions[currentQuestionIndex].explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={() => {
                        let c = 0;
                        quizQuestions.forEach((q, i) => {
                          if (selectedAnswers[i] === q.correctIndex) c++;
                        });
                        setScore(c);
                        setQuizFinished(true);
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      Finish Quiz
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
