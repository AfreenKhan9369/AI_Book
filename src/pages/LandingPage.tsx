import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import heroCampusImg from "../assets/images/hero_student_campus_1790591162347.jpg";

export function LandingPage() {
  const { isAuthenticated, isFaculty, logout } = useAuth();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How do students access semester lecture notes and PYQs?",
      a: "Students sign in via the Student Portal using their college email. Once authenticated, your personal Student Dashboard opens with immediate access to all curriculum handouts, multi-page PDF documents, solved past papers, and interactive AI study features.",
    },
    {
      q: "What credentials can I use for quick demonstration access?",
      a: "On the login screen, we provide 1-click verified demo accounts: click 'Student' to instantly enter as Aarav Patel (Semester 4 Computer Science), or click 'Faculty' to enter as Prof. Rajesh Sharma (Faculty Administration Studio).",
    },
    {
      q: "How does the AI Study Assistant help with university exam preparation?",
      a: "The integrated AI Copilot analyzes official lecture syllabi to generate high-yield revision flashcards, step-by-step doubt explanations, and timed multiple-choice practice quizzes aligned with university marking rubrics.",
    },
    {
      q: "How does faculty manage and publish course materials?",
      a: "Faculty members log in via the Faculty Portal to access the Administration Studio. Professors can upload lecture notes and PYQ papers, assign subject codes, specify unit modules, and monitor institutional download analytics.",
    },
    {
      q: "Are the study materials accessible offline?",
      a: "Yes. Every lecture note and PYQ paper is available for direct offline PDF download in addition to the built-in multi-page digital document reader.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      {/* ========================================================= */}
      {/* 1. TOP BAR NAVIGATION (Strict Top Bar Contract)          */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AI_Book
            </span>
          </Link>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-indigo-600 transition-colors">
              Overview
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Zone 3: Primary role-based actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isFaculty ? "/admin" : "/dashboard"}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                >
                  {isFaculty ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Faculty Studio</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 text-sky-200" />
                      <span>Student Dashboard</span>
                    </>
                  )}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* Dedicated Student Login Button */}
                <Link
                  to="/login?role=student"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-all shadow-2xs whitespace-nowrap"
                  title="Sign in with your student credentials"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Student Login</span>
                </Link>

                {/* Dedicated Faculty Login Button */}
                <Link
                  to="/login?role=faculty"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-2xs whitespace-nowrap"
                  title="Sign in with your faculty or administrative clearance"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Faculty Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION (Dominant Focal Carrier)                 */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Text & Dual Login Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Institutional Context */}
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700">
                <span>College Academic Information System</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-500 font-medium">Session 2024-25</span>
              </div>

              {/* Marquee Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
                Unified Student Management & Academic Resource Platform
              </h1>

              {/* Concrete Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A single digital ecosystem for university engineering departments. Students access verified semester lecture handouts, solved past exam papers, and AI study assistance, while faculty manage curriculum distributions and student access.
              </p>

              {/* Separate Student & Faculty Login Decision Action Block */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to="/login?role=student"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student Portal Login</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  to="/login?role=faculty"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-all"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Faculty / Staff Login</span>
                </Link>
              </div>

              {/* Institutional Security Notice */}
              <div className="flex items-center gap-4 pt-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role-Protected Access Control</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official University Syllabus</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 aspect-16/9 lg:aspect-4/3 flex items-center justify-center">
                <img
                  src={heroCampusImg}
                  alt="Modern university campus library and technology center"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Department of Computer Science & Engineering
                  </p>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    Centralized Academic Repository & Exam Hub
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SYSTEM OVERVIEW / SHORT DESCRIPTION                   */}
      {/* ========================================================= */}
      <section id="overview" className="py-16 sm:py-20 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built Specifically for University Departments, Students, and Faculty
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Traditional campus portals fragment student notes into disorganized chats and broken drives. AI_Book provides a structured, role-governed repository where verified curriculum handouts and exam papers are permanently categorized by semester, subject code, and syllabus unit.
            </p>
          </div>

          {/* Two Role Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Student Pillar */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Student Portal Experience</h3>
                  <p className="text-xs text-slate-500">Autonomous learning & exam mastery</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Students access an organized curriculum feed aligned with their enrolled semester and department. Every lecture note includes instant AI summarization for high-yield revision, interactive doubt answering, and self-assessment mock quizzes.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Read multi-page lecture notes online with integrated PDF viewer</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Download past university question papers with solved answer keys</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Bookmark challenging modules into your personal revision vault</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  to="/login?role=student"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Faculty Pillar */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Faculty Administration Studio</h3>
                  <p className="text-xs text-slate-500">Curriculum governance & content publishing</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Professors and department heads maintain complete authority over course materials. Easily upload new lecture notes, categorize by university unit milestones, monitor material download statistics, and ensure syllabus alignment.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Publish course notes and question papers with custom unit tags</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Audit student engagement metrics, view counts, and downloads</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Maintain syllabus consistency across parallel engineering sections</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  to="/login?role=faculty"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-indigo-600"
                >
                  <span>Access Faculty Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ)                      */}
      {/* ========================================================= */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Assistance & FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers regarding student access, faculty permissions, and academic resources.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CALL TO ACTION DECISION BLOCK                         */}
      {/* ========================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-200 flex items-center justify-center mx-auto backdrop-blur-xs">
              <GraduationCap className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Ready to Access Your Semester Academic Hub?
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                Choose your university role to sign in immediately and access all verified lecture notes, solved examination papers, and AI study tools.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/login?role=student"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-indigo-50 shadow-md transition-all"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Sign in to Student Portal</span>
              </Link>

              <Link
                to="/login?role=faculty"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sign in to Faculty Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. QUIET INSTITUTIONAL FOOTER                            */}
      {/* ========================================================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">AI_Book</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized Student Management System & Academic Lecture Notes Repository for university engineering programs.
              </p>
            </div>

            {/* Student Links */}
            <div>
              <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-3">
                Student Resources
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login?role=student" className="hover:text-white transition-colors">
                    Student Portal Login
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=student" className="hover:text-white transition-colors">
                    Lecture Notes Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=student" className="hover:text-white transition-colors">
                    Solved PYQ Exam Papers
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=student" className="hover:text-white transition-colors">
                    AI Doubt Clearing & Quizzes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Faculty Links */}
            <div>
              <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-3">
                Faculty & Administration
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login?role=faculty" className="hover:text-white transition-colors">
                    Faculty Studio Login
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=faculty" className="hover:text-white transition-colors">
                    Curriculum Content Publisher
                  </Link>
                </li>
                <li>
                  <Link to="/login?role=faculty" className="hover:text-white transition-colors">
                    Syllabus Audit & Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/register?role=faculty" className="hover:text-white transition-colors">
                    New Faculty Enrollment
                  </Link>
                </li>
              </ul>
            </div>

            {/* Institutional Information */}
            <div>
              <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-3">
                University Standards
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Materials published under Academic Fair Use for university students and faculty members.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Campus Services Operational</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} AI_Book Student Management System. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Academic Integrity Policy</span>
              <span>·</span>
              <span>Data Protection</span>
              <span>·</span>
              <span>Campus Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
