import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  BookOpen,
  FileText,
  Sparkles,
  ShieldCheck,
  Bookmark,
  User,
  LogOut,
  Upload,
  GraduationCap,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload?: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  onOpenUpload,
}: SidebarProps) {
  const { user, isAuthenticated, isFaculty, logout } = useAuth();
  const location = useLocation();

  const mainNavLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Layers,
      description: "Overview & syllabus stream",
    },
    {
      name: "Notes Catalog",
      path: "/notes",
      icon: BookOpen,
      description: "Semester lecture handouts",
    },
    {
      name: "PYQs (Exams)",
      path: "/pyqs",
      icon: FileText,
      description: "Previous year question papers",
    },
    ...(!isFaculty
      ? [
          {
            name: "AI Study Hub",
            path: "/ai-hub",
            icon: Sparkles,
            highlight: true,
            description: "Summaries, Q&A & quiz generator",
          },
        ]
      : []),
  ];

  const facultyNavLinks = isFaculty
    ? [
        {
          name: "Faculty Studio",
          path: "/admin",
          icon: ShieldCheck,
          adminOnly: true,
          description: "Curriculum & notes manager",
        },
      ]
    : [];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Side Panel Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full"
        }`}
      >
        {/* Brand & Close Button Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  AI_Book
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  College
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
                Notes & Exam Portal
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close side panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Academic Badge / Context */}
        {isAuthenticated && (
          <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {isFaculty ? "Faculty Member" : "Enrolled Student"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700">
                Sem {user?.semester || 1}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
              {user?.branch || "Computer Science"}
            </p>
          </div>
        )}

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            <nav className="space-y-1">
              {mainNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.highlight
                            ? "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
                            : "bg-slate-100 text-slate-600 group-hover:bg-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                      </div>
                      <div className="truncate">
                        <span className="block leading-tight">{item.name}</span>
                      </div>
                    </div>

                    {item.highlight ? (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${
                          isActive
                            ? "bg-amber-400 text-indigo-950"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        AI
                      </span>
                    ) : (
                      isActive && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                      )
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Faculty Management Section (if applicable) */}
          {isFaculty && facultyNavLinks.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              <nav className="space-y-1">
                {facultyNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-indigo-50 text-indigo-600 group-hover:bg-white"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Quick Academic Actions */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {isFaculty ? "Faculty Publishing" : "Quick Study Tools"}
            </div>
            <div className="space-y-1.5">
              {isFaculty && onOpenUpload && (
                <button
                  onClick={() => {
                    handleLinkClick();
                    onOpenUpload();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Upload className="w-4 h-4" />
                    <span>Upload Notes / PYQ</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-200">+</span>
                </button>
              )}

              {!isFaculty && (
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === "/profile"
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-rose-500" />
                  <span>Saved Revision Notes</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* User Footer / Sign Out */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 flex-shrink-0">
          {isAuthenticated ? (
            <div className="p-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <Link
                to="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 group mb-2"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/50 transition-all flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate leading-tight">
                    {user?.email}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className="font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="w-full py-2 px-3 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={handleLinkClick}
                className="w-full py-2 px-3 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
