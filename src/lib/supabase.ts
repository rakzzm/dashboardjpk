import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Department {
  id: string;
  dept_code: string;
  dept_name: string;
  parent_dept_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  department_code: string;
  position: string;
  grade: string;
  email: string;
  phone: string;
  join_date: string;
  nationality: string;
  religion: string;
  gender: string;
  native_status: string;
  education_level: string;
  salary: number;
  status: string;
  supervisor: string;
  work_location: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
  hours_worked: number;
  overtime_hours: number;
  location: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeePerformance {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  attendance_rate: number;
  punctuality_rate: number;
  average_hours_per_day: number;
  total_overtime_hours: number;
  total_leave_days: number;
  total_mc_days: number;
  performance_score: number;
  last_evaluation: string | null;
  created_at: string;
  updated_at: string;
}
