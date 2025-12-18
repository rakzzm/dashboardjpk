/*
  # Sabah Government Attendance Management System - Database Schema

  ## Overview
  This migration creates the complete database schema for the Sabah Government Attendance Management System,
  including departments, employees, attendance records, and performance tracking.

  ## New Tables

  ### 1. departments
  Stores government department information with hierarchical structure
  - `id` (uuid, primary key) - Unique department identifier
  - `dept_code` (text, unique) - Official department code (e.g., '11D', '33J')
  - `dept_name` (text) - Full department name
  - `parent_dept_id` (uuid, nullable) - Reference to parent department for hierarchy
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. employees
  Stores comprehensive employee information
  - `id` (uuid, primary key) - Unique employee identifier
  - `employee_id` (text, unique) - Official employee ID (e.g., 'SG000001')
  - `name` (text) - Full name
  - `department_code` (text) - Reference to department
  - `position` (text) - Job position
  - `grade` (text) - Government service grade
  - `email` (text, unique) - Official email
  - `phone` (text) - Contact number
  - `join_date` (date) - Date of joining
  - `nationality` (text) - Nationality status
  - `religion` (text) - Religious affiliation
  - `gender` (text) - Gender
  - `native_status` (text) - Native land status
  - `education_level` (text) - Highest education level
  - `salary` (numeric) - Monthly salary
  - `status` (text) - Employment status (Active/On Leave/Inactive)
  - `supervisor` (text) - Supervisor name
  - `work_location` (text) - Primary work location
  - `emergency_contact_name` (text) - Emergency contact person
  - `emergency_contact_relationship` (text) - Relationship to employee
  - `emergency_contact_phone` (text) - Emergency contact number
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. attendance_records
  Stores daily attendance records for all employees
  - `id` (uuid, primary key) - Unique record identifier
  - `employee_id` (uuid) - Reference to employee
  - `date` (date) - Attendance date
  - `clock_in` (time) - Clock in time
  - `clock_out` (time) - Clock out time
  - `status` (text) - Attendance status (Present/Late/Absent/MC/Leave/Holiday)
  - `hours_worked` (numeric) - Total hours worked
  - `overtime_hours` (numeric) - Overtime hours
  - `location` (text) - Work location for that day
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. employee_performance
  Stores calculated performance metrics for employees
  - `id` (uuid, primary key) - Unique record identifier
  - `employee_id` (uuid) - Reference to employee
  - `period_start` (date) - Performance period start date
  - `period_end` (date) - Performance period end date
  - `attendance_rate` (numeric) - Attendance percentage
  - `punctuality_rate` (numeric) - Punctuality percentage
  - `average_hours_per_day` (numeric) - Average daily working hours
  - `total_overtime_hours` (numeric) - Total overtime in period
  - `total_leave_days` (integer) - Total leave days
  - `total_mc_days` (integer) - Total medical certificate days
  - `performance_score` (numeric) - Overall performance score
  - `last_evaluation` (date) - Last evaluation date
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Policies restrict access to authenticated users only
  - Read access is granted for authenticated users
  - Write access requires authentication

  ## Indexes
  - Created on foreign keys for performance
  - Created on frequently queried fields (employee_id, department_code, date)

  ## Important Notes
  1. All tables use UUID primary keys for scalability
  2. Timestamps use `timestamptz` for timezone awareness
  3. Foreign keys ensure referential integrity
  4. Default values prevent null issues
  5. Unique constraints on important identifiers
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_code text UNIQUE NOT NULL,
  dept_name text NOT NULL,
  parent_dept_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  department_code text NOT NULL REFERENCES departments(dept_code) ON DELETE RESTRICT,
  position text NOT NULL,
  grade text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  join_date date NOT NULL,
  nationality text NOT NULL DEFAULT 'Malaysian',
  religion text NOT NULL,
  gender text NOT NULL,
  native_status text NOT NULL,
  education_level text NOT NULL,
  salary numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active',
  supervisor text NOT NULL,
  work_location text NOT NULL,
  emergency_contact_name text NOT NULL,
  emergency_contact_relationship text NOT NULL,
  emergency_contact_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  clock_in time,
  clock_out time,
  status text NOT NULL,
  hours_worked numeric DEFAULT 0,
  overtime_hours numeric DEFAULT 0,
  location text NOT NULL DEFAULT 'Main Office',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create employee_performance table
CREATE TABLE IF NOT EXISTS employee_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  attendance_rate numeric DEFAULT 0,
  punctuality_rate numeric DEFAULT 0,
  average_hours_per_day numeric DEFAULT 0,
  total_overtime_hours numeric DEFAULT 0,
  total_leave_days integer DEFAULT 0,
  total_mc_days integer DEFAULT 0,
  performance_score numeric DEFAULT 0,
  last_evaluation date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_code);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_performance_employee ON employee_performance(employee_id);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Authenticated users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for employees
CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete employees"
  ON employees FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for attendance_records
CREATE POLICY "Authenticated users can view attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert attendance records"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update attendance records"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attendance records"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for employee_performance
CREATE POLICY "Authenticated users can view performance records"
  ON employee_performance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert performance records"
  ON employee_performance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update performance records"
  ON employee_performance FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete performance records"
  ON employee_performance FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_performance_updated_at BEFORE UPDATE ON employee_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();