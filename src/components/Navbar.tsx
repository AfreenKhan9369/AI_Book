import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  User,
  LogOut,
  Upload,
  Search,
  Menu,
  ChevronDown,
  GraduationCap,
  Bell,
  Bookmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenUpload?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Navbar({
  onToggleSidebar,
  onOpenUpload,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const { user, isAuthenticated, isFaculty, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Get current section label for top navigation bar
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Student Dashboard";
      case "/notes":
        return "Notes Catalog";
      case "/pyqs":
        return "Past Year Question Papers";
      case "/ai-hub":
        return "AI Study Hub & Copilot";
      case "/admin":
        return "Faculty Administration Studio";
      case "/profile":
        return "Academic Profile & Saved Notes";
      default:
        return "College Notes Hub";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile sidebar toggle button & active page title / brand */}
          <div className="flex items-center gap-3.5">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Open side panel menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Logo on mobile / Page Title indicator on desktop */}
            <div className="flex items-center gap-2">
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-700 to-sky-600 bg-clip-text text-transparent">
                  AI_Book
                </span>
              </div>

              {/* Desktop Section Breadcrumb Indicator */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {getPageTitle()}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-400">
                  {user?.branch || "Engineering"} (Semester {user?.semester || 4})
                </span>
              </div>
            </div>
          </div>

          {/* Right: Search, Quick Actions & User Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            {onSearchChange && (
              <div className="relative hidden md:block w-52 lg:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subjects, units..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Faculty Only Upload button */}
            {isFaculty && onOpenUpload && (
              <button
                id="btn-nav-upload"
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
                title="Faculty Content Publisher"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Notes / PYQ</span>
                <span className="sm:hidden">Upload</span>
              </button>
            )}

            {/* User Profile / Quick Switcher */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize leading-tight">
                      {user?.role} • Sem {user?.semester}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-indigo-600 font-medium truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                          {user?.role}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {user?.branch}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      {!isFaculty && (
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Bookmark className="w-4 h-4 text-rose-500" />
                          Saved Revision Notes
                        </Link>
                      )}

                      {isFaculty && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Faculty Management Portal
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
