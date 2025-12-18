/*
  # Fix Database Security Issues

  1. Index Improvements
    - Add covering index for `departments.parent_dept_id` foreign key to improve query performance
    - Remove unused indexes that are not being utilized by queries:
      - `idx_employees_status` on employees table
      - `idx_attendance_employee` on attendance_records table
      - `idx_attendance_status` on attendance_records table
      - `idx_performance_employee` on employee_performance table
      - `idx_employees_ic_number` on employees table

  2. Security Fixes
    - Fix function `update_updated_at_column` to have immutable search_path
    - This prevents potential security vulnerabilities from search path manipulation

  3. Notes
    - Indexes are removed to reduce storage overhead and improve write performance
    - Only actively used indexes should be maintained
    - The search_path fix prevents privilege escalation attacks
*/

-- Add covering index for departments foreign key
CREATE INDEX IF NOT EXISTS idx_departments_parent_dept_id 
  ON departments(parent_dept_id) 
  WHERE parent_dept_id IS NOT NULL;

-- Remove unused indexes
DROP INDEX IF EXISTS idx_employees_status;
DROP INDEX IF EXISTS idx_attendance_employee;
DROP INDEX IF EXISTS idx_attendance_status;
DROP INDEX IF EXISTS idx_performance_employee;
DROP INDEX IF EXISTS idx_employees_ic_number;

-- Fix function search path security issue
-- Drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for tables that were using this function
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = information_schema.tables.table_name 
      AND column_name = 'updated_at'
    )
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I',
      table_record.table_name,
      table_record.table_name
    );
    
    EXECUTE format(
      'CREATE TRIGGER update_%I_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()',
      table_record.table_name,
      table_record.table_name
    );
  END LOOP;
END;
$$;
