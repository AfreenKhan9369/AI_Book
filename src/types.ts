export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  branch?: string;
  semester?: number;
  roll_number?: string;
  avatar?: string;
  supabase_user_id?: string;
  supabase_synced?: number | boolean;
  created_at?: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  branch: string;
  semester: number;
  description?: string;
  notes_count?: number;
  pyqs_count?: number;
  created_at?: string;
}

export interface Material {
  id: number;
  title: string;
  type: "note" | "pyq";
  subject_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  branch: string;
  academic_year: string;
  module_unit: string;
  file_name: string;
  file_path: string;
  file_size: string;
  file_type: string;
  description: string;
  uploader_id: number;
  uploader_name: string;
  downloads_count: number;
  views_count: number;
  is_bookmarked?: number | boolean;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizHistoryItem {
  id: number;
  user_id: number;
  subject_name: string;
  topic: string;
  score: number;
  total_questions: number;
  created_at: string;
}

export interface OverviewStats {
  totalNotes: number;
  totalPyqs: number;
  totalSubjects: number;
  totalStudents: number;
  totalFaculty: number;
  totalDownloads: number;
  popularMaterials: {
    id: number;
    title: string;
    type: "note" | "pyq";
    downloads_count: number;
    views_count: number;
    subject_name: string;
  }[];
}
