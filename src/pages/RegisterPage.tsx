import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, UserPlus, AlertCircle, Loader2, Database, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "faculty">("student");
  const [branch, setBranch] = useState("Computer Science");
  const [semester, setSemester] = useState(4);
  const [rollNumber, setRollNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        branch,
        semester,
        roll_number: rollNumber.trim(),
      });
      setSuccessMsg("Registration details saved to Supabase database!");
      setTimeout(() => {
        navigate(role === "faculty" ? "/admin" : "/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/25 mb-3">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create AI_Book Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Join your college notes sharing network & access AI learning tools
        </p>

        {/* Supabase Storage Status Pill */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Database: <strong>Supabase Connected</strong> (<code className="font-mono text-[10px]">udsvohrfzzeanqnjfazb</code>)</span>
        </div>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  role === "student"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  role === "faculty"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                👨‍🏫 Faculty / Professor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder={role === "faculty" ? "e.g., Prof. Rajesh Verma" : "e.g., Ananya Sharma"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College Email *
              </label>
              <input
                type="email"
                required
                placeholder={role === "faculty" ? "prof.rajesh@college.edu" : "ananya@college.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Stored in Supabase Auth & Registration Directory
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-semibold text-slate-700"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {role === "faculty" ? "Teaching Semester" : "Current Semester"}
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-semibold text-slate-700"
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
                {role === "faculty" ? "Faculty / Employee ID" : "Roll / Student ID Number"}
              </label>
              <input
                type="text"
                placeholder={role === "faculty" ? "FAC-CS-042" : "CS-2024-042"}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl focus:outline-none font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
              <Database className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                Your registration details will be recorded in <strong>Supabase</strong> with encrypted authentication and profile metadata.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>{loading ? "Registering & Syncing to Supabase..." : `Register as ${role === "faculty" ? "Faculty" : "Student"}`}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
