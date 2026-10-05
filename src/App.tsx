import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { NotesCatalog } from "./pages/NotesCatalog";
import { PyqCatalog } from "./pages/PyqCatalog";
import { AiAssistantPage } from "./pages/AiAssistantPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PdfViewerModal } from "./components/PdfViewerModal";
import { UploadMaterialModal } from "./components/UploadMaterialModal";
import { AiStudyAssistantModal } from "./components/AiStudyAssistantModal";
import { Material, Subject } from "./types";
import { api } from "./services/api";

/**
 * Shell for authenticated internal application routes
 * (Student Dashboard, Notes, PYQs, AI Hub, Faculty Studio, Profile)
 */
function DashboardLayout({
  children,
  onOpenUpload,
}: {
  children: React.ReactNode;
  onOpenUpload?: () => void;
}) {
  const { isFaculty } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Side Panel for Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenUpload={isFaculty ? onOpenUpload : undefined}
      />

      {/* Main Layout Area: Top Header + Routed Page Views */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenUpload={isFaculty ? onOpenUpload : undefined}
        />

        {/* Main Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { isFaculty, isAuthenticated } = useAuth();

  // Global modals state
  const [activePdf, setActivePdf] = useState<Material | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalTab, setAiModalTab] = useState<"ask" | "summarize" | "quiz">("ask");
  const [aiModalMaterial, setAiModalMaterial] = useState<Material | null>(null);

  // App-level data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const loadData = async () => {
    try {
      const [subRes, matRes] = await Promise.all([
        api.get<Subject[]>("/subjects"),
        api.get<Material[]>("/materials"),
      ]);
      setSubjects(subRes);
      setMaterials(matRes);
    } catch (e) {
      console.error("Failed to load initial data:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // PDF Viewer handler
  const handleViewPdf = (material: Material) => {
    setActivePdf(material);
  };

  // PDF Download handler
  const handleDownloadPdf = (material: Material) => {
    const downloadUrl = `/api/materials/${material.id}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = material.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open AI modal
  const handleOpenAi = (tab: "ask" | "summarize" | "quiz" = "ask", material?: Material) => {
    setAiModalTab(tab);
    setAiModalMaterial(material || null);
    setIsAiModalOpen(true);
  };

  return (
    <>
      <Routes>
        {/* Public First Page: Professional Modern Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Student Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardLayout onOpenUpload={() => setIsUploadOpen(true)}>
                <StudentDashboard
                  onOpenAi={handleOpenAi}
                  onViewPdf={handleViewPdf}
                  onDownloadPdf={handleDownloadPdf}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Notes Catalog Route */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <DashboardLayout onOpenUpload={() => setIsUploadOpen(true)}>
                <NotesCatalog
                  onViewPdf={handleViewPdf}
                  onDownloadPdf={handleDownloadPdf}
                  onOpenAi={handleOpenAi}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected PYQs Catalog Route */}
        <Route
          path="/pyqs"
          element={
            <ProtectedRoute>
              <DashboardLayout onOpenUpload={() => setIsUploadOpen(true)}>
                <PyqCatalog
                  onViewPdf={handleViewPdf}
                  onDownloadPdf={handleDownloadPdf}
                  onOpenAi={handleOpenAi}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected AI Study Hub Route */}
        <Route
          path="/ai-hub"
          element={
            <ProtectedRoute>
              <DashboardLayout onOpenUpload={() => setIsUploadOpen(true)}>
                <AiAssistantPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Faculty Administration Studio Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="faculty">
              <DashboardLayout onOpenUpload={() => setIsUploadOpen(true)}>
                <AdminDashboard
                  onViewPdf={handleViewPdf}
                  onDownloadPdf={handleDownloadPdf}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected User Academic Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout onOpenUpload={() => setIsUploadOpen(true)}>
                <ProfilePage
                  onViewPdf={handleViewPdf}
                  onDownloadPdf={handleDownloadPdf}
                  onOpenAi={handleOpenAi}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global PDF Viewer Modal */}
      {activePdf && (
        <PdfViewerModal
          material={activePdf}
          onClose={() => setActivePdf(null)}
          onDownload={handleDownloadPdf}
          onTriggerQuiz={(mat) => {
            setActivePdf(null);
            handleOpenAi("quiz", mat);
          }}
        />
      )}

      {/* Global Upload Material Modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        subjects={subjects}
        onSuccess={(newMat) => {
          setMaterials((prev) => [newMat, ...prev]);
          loadData();
        }}
      />

      {/* Global AI Assistant Modal */}
      <AiStudyAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        subjects={subjects}
        materials={materials}
        initialTab={aiModalTab}
        initialMaterial={aiModalMaterial}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
