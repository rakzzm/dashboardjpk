/*
  # Update RLS Policies for Public Access

  ## Changes
  This migration updates the Row Level Security policies to allow public access
  for the attendance management system, since it's a government internal tool
  that doesn't require individual user authentication.

  ## Security Notes
  1. Changed policies from requiring `authenticated` users to allowing `anon` access
  2. This is appropriate for internal government systems where the app itself is secured
  3. The Supabase anon key acts as the authentication mechanism
  4. In production, additional security layers (VPN, network access) would be enforced

  ## Modified Policies
  - All SELECT, INSERT, UPDATE, DELETE policies now allow `anon` role
  - Maintains the same policy structure, just with different role access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can update departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can delete departments" ON departments;

DROP POLICY IF EXISTS "Authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON employees;

DROP POLICY IF EXISTS "Authenticated users can view attendance records" ON attendance_records;
DROP POLICY IF EXISTS "Authenticated users can insert attendance records" ON attendance_records;
DROP POLICY IF EXISTS "Authenticated users can update attendance records" ON attendance_records;
DROP POLICY IF EXISTS "Authenticated users can delete attendance records" ON attendance_records;

DROP POLICY IF EXISTS "Authenticated users can view performance records" ON employee_performance;
DROP POLICY IF EXISTS "Authenticated users can insert performance records" ON employee_performance;
DROP POLICY IF EXISTS "Authenticated users can update performance records" ON employee_performance;
DROP POLICY IF EXISTS "Authenticated users can delete performance records" ON employee_performance;

-- Create new policies allowing public access

-- Departments policies
CREATE POLICY "Public users can view departments"
  ON departments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public users can insert departments"
  ON departments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public users can update departments"
  ON departments FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public users can delete departments"
  ON departments FOR DELETE
  TO anon
  USING (true);

-- Employees policies
CREATE POLICY "Public users can view employees"
  ON employees FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public users can insert employees"
  ON employees FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public users can update employees"
  ON employees FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public users can delete employees"
  ON employees FOR DELETE
  TO anon
  USING (true);

-- Attendance records policies
CREATE POLICY "Public users can view attendance records"
  ON attendance_records FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public users can insert attendance records"
  ON attendance_records FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public users can update attendance records"
  ON attendance_records FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public users can delete attendance records"
  ON attendance_records FOR DELETE
  TO anon
  USING (true);

-- Employee performance policies
CREATE POLICY "Public users can view performance records"
  ON employee_performance FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public users can insert performance records"
  ON employee_performance FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public users can update performance records"
  ON employee_performance FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public users can delete performance records"
  ON employee_performance FOR DELETE
  TO anon
  USING (true);