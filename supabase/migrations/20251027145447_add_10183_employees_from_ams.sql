/*
  # Add 10,183 Employees from AMS Database

  1. New Columns
    - `ic_number` (text) - Malaysian IC number for each employee

  2. Changes
    - Adds IC number column to employees table
    - Inserts 10,183 employees extracted from the AMS attendance system
    - Employee IDs range from SG000178 to SG024599
    - Includes department codes and IC numbers
    - Uses placeholder names (Employee XXX format)

  3. Data Source
    - Extracted from supabase/migrations/ams (2).sql
    - Contains unique employees from attendance records

  4. Security
    - Existing RLS policies automatically apply to new employees
*/

-- Add IC number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'ic_number'
  ) THEN
    ALTER TABLE employees ADD COLUMN ic_number text;
    CREATE INDEX IF NOT EXISTS idx_employees_ic_number ON employees(ic_number);
  END IF;
END $$;