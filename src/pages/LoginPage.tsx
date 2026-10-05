import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  LogIn,
  AlertCircle,
  Loader2,
  User,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role query param from landing page button (defaulting to student if not faculty)
  const roleParam = searchParams.get("role");
  const redirectParam = searchParams.get("redirect");

  const [activeRoleTab, setActiveRoleTab] = useState<"student" | "faculty">(
    roleParam === "faculty" ? "faculty" : "student"
  );

  const [email, setEmail] = useState(
    roleParam === "faculty" ? "faculty@college.edu" : "student@college.edu"
  );
  const [password, setPassword] = useState(
    roleParam === "faculty" ? "faculty123" : "student123"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Update credentials when switching role tab
  const handleRoleTabChange = (newRole: "student" | "faculty") => {
    setActiveRoleTab(newRole);
    setError(null);
    if (newRole === "faculty") {
      setEmail("faculty@college.edu");
      setPassword("faculty123");
    } else {
      setEmail("student@college.edu");
      setPassword("student123");
    }
  };

  // Synchronize role tab if query param changes
  useEffect(() => {
    if (roleParam === "faculty" && activeRoleTab !== "faculty") {
      handleRoleTabChange("faculty");
    } else if (roleParam === "student" && activeRoleTab !== "student") {
      handleRoleTabChange("student");
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);

      // Inspect target redirection path
      // If user is faculty -> go to /admin or redirectParam
      // If user is student -> go to /dashboard or redirectParam (unless redirect was /admin)
      const targetUser = JSON.parse(localStorage.getItem("aibook_user") || "{}");
      const isUserFaculty =
        targetUser?.role === "faculty" ||
        targetUser?.role === "admin" ||
        email.includes("faculty");

      if (isUserFaculty) {
        navigate(redirectParam && redirectParam !== "/dashboard" ? redirectParam : "/admin");
      } else {
        navigate(redirectParam && redirectParam !== "/admin" ? redirectParam : "/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your college email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, defaultPath: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      const target = redirectParam || defaultPath;
      navigate(target);
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-indigo-600 selection:text-white">
      {/* Return to Landing Page */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/25 mb-3">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI_Book Campus Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sign in to your authorized student or faculty academic account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          {/* Segmented Role Switcher Tabs */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => handleRoleTabChange("student")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeRoleTab === "student"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange("faculty")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeRoleTab === "faculty"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Faculty Studio</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Verified Demo Access */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Verified 1-Click Institutional Access
            </span>

            {activeRoleTab === "student" ? (
              <button
                type="button"
                onClick={() => handleQuickDemo("student@college.edu", "student123", "/dashboard")}
                className="w-full p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all text-xs font-bold text-slate-800 flex items-center justify-between shadow-2xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="leading-tight">Aarav Patel (Student)</p>
                    <p className="text-[10px] font-normal text-slate-500 leading-tight">
                      Semester 4 • B.Tech Computer Science
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-600">Enter →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleQuickDemo("faculty@college.edu", "faculty123", "/admin")}
                className="w-full p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all text-xs font-bold text-slate-800 flex items-center justify-between shadow-2xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="leading-tight">Prof. Rajesh Sharma (Faculty)</p>
                    <p className="text-[10px] font-normal text-slate-500 leading-tight">
                      Associate Professor • CSE Dept Administration
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Enter →</span>
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-medium">
                Or sign in with custom credentials
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {activeRoleTab === "faculty" ? "Faculty Email Address" : "College Student Email"}
              </label>
              <input
                type="email"
                required
                placeholder={activeRoleTab === "faculty" ? "faculty@college.edu" : "student@college.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                activeRoleTab === "faculty"
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? "Authenticating credentials..."
                  : `Sign in to ${activeRoleTab === "faculty" ? "Faculty Studio" : "Student Portal"}`}
              </span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            {activeRoleTab === "faculty" ? (
              <p>
                Need faculty access?{" "}
                <Link
                  to="/register?role=faculty"
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Register faculty profile
                </Link>
              </p>
            ) : (
              <p>
                Don&apos;t have an account?{" "}
                <Link
                  to="/register?role=student"
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Create student profile
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
