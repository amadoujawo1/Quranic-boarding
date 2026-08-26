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

export interface StudentPayment {
  id: number;
  student_id: number;
  student_id_number: string;
  student_name: string;
  class_level: string;
  academic_year: string;
  payment_month: string;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
  remarks?: string;
  recorded_by?: string;
  last_edited_by?: string;
  last_edited_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinanceAuditLog {
  id: number;
  user_id?: number;
  user_name: string;
  action: string;
  ip_address?: string;
  details: string;
  created_at: string;
}

export interface MonthlyCollectionReport {
  month: string;
  total_due: number;
  total_collected: number;
  outstanding: number;
  paid_count: number;
  partial_count: number;
  unpaid_count: number;
  total_records: number;
  collection_rate: number;
}

export interface StudentPaymentStatsData {
  total_due: number;
  total_collected: number;
  outstanding_balance: number;
  paid_count: number;
  partial_count: number;
  unpaid_count: number;
  total_records: number;
  monthly_reports: MonthlyCollectionReport[];
}

export interface StudentMonthlyOverviewData {
  student_id: number;
  student_id_number: string;
  student_name: string;
  parent_name?: string;
  total_due: number;
  total_paid: number;
  total_balance: number;
  records: StudentPayment[];
}

