export type RoleName = 
  | 'Super Administrator'
  | 'Principal'
  | 'Vice Principal'
  | 'Academic Coordinator'
  | 'Hifz Coordinator'
  | 'Quran Teacher'
  | 'Academic Teacher'
  | 'Hostel Master'
  | 'Hostel Matron'
  | 'Accountant'
  | 'Librarian'
  | 'Admissions Officer'
  | 'Kitchen Manager'
  | 'Security Officer'
  | 'Parent'
  | 'Student';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_2fa_enabled: boolean;
  avatar_url?: string;
  roles: RoleName[];
  created_at?: string;
  last_login?: string;
}

export interface Student {
  id: number;
  user_id: number;
  student_id_number: string;
  full_name: string;
  email: string;
  phone?: string;
  parent_id?: number;
  parent_name?: string;
  date_of_birth: string;
  gender: 'Male' | 'Female';
  blood_group?: string;
  admission_date?: string;
  status: 'Active' | 'Graduated' | 'Suspended' | 'Alumni';
  qr_code?: string;
  avatar_url?: string;
}

export interface HifzRecord {
  id: number;
  student_id: number;
  student_name: string;
  teacher_name?: string;
  date: string;
  sabaq: {
    surah: string;
    juz: number;
    start_page: number;
    end_page: number;
    grade: string;
  };
  sabqi: {
    juz: number;
    pages: string;
    grade: string;
  };
  manzil: {
    juz: number;
    pages: string;
    grade: string;
  };
  teacher_notes?: string;
}

export interface AdminStats {
  overview: {
    total_students: number;
    active_students: number;
    teachers: number;
    parents: number;
    staff: number;
    hostel_occupancy_percentage: number;
    occupied_beds: number;
    total_beds: number;
  };
  attendance_today: {
    school_present: number;
    fajr_jamaat: number;
  };
  financials: {
    total_revenue: number;
    outstanding_fees: number;
    total_donations: number;
    total_expenses: number;
  };
  hifz_progress_chart: Array<{ month: string; juz_completed: number }>;
}
