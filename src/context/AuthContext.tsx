import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFaculty: boolean;
  bookmarkedIds: number[];
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: "student" | "faculty";
    branch?: string;
    semester?: number;
    roll_number?: string;
  }) => Promise<void>;
  logout: () => void;
  toggleBookmark: (materialId: number) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("aibook_token"));
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load current user profile on startup
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("aibook_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get<{ user: User; bookmarkedIds: number[] }>("/auth/me");
        setUser(data.user);
        setBookmarkedIds(data.bookmarkedIds || []);
      } catch (err) {
        console.warn("[Auth] Stored session invalid, clearing token.");
        localStorage.removeItem("aibook_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
    localStorage.setItem("aibook_token", data.token);
    setToken(data.token);
    setUser(data.user);

    // Refresh bookmarks
    try {
      const meData = await api.get<{ bookmarkedIds: number[] }>("/auth/me");
      setBookmarkedIds(meData.bookmarkedIds || []);
    } catch (e) {
      // ignore
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: "student" | "faculty";
    branch?: string;
    semester?: number;
    roll_number?: string;
  }): Promise<void> => {
    const data = await api.post<{ token: string; user: User }>("/auth/register", userData);
    localStorage.setItem("aibook_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setBookmarkedIds([]);
  };

  const logout = () => {
    localStorage.removeItem("aibook_token");
    setToken(null);
    setUser(null);
    setBookmarkedIds([]);
  };

  const toggleBookmark = async (materialId: number): Promise<boolean> => {
    if (!user) {
      throw new Error("Please log in to bookmark notes.");
    }
    const res = await api.post<{ bookmarked: boolean; message: string }>(`/materials/${materialId}/bookmark`);
    if (res.bookmarked) {
      setBookmarkedIds((prev) => [...prev, materialId]);
    } else {
      setBookmarkedIds((prev) => prev.filter((id) => id !== materialId));
    }
    return res.bookmarked;
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    const res = await api.put<{ user: User }>("/auth/profile", data);
    setUser(res.user);
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;
    try {
      const data = await api.get<{ user: User; bookmarkedIds: number[] }>("/auth/me");
      setUser(data.user);
      setBookmarkedIds(data.bookmarkedIds || []);
    } catch (err) {
      console.warn("Failed to refresh user:", err);
    }
  };

  const isFaculty = user?.role === "faculty" || user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isFaculty,
        bookmarkedIds,
        login,
        register,
        logout,
        toggleBookmark,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
