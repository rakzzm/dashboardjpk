/*
  # Allow Nullable Fields for Employee Import

  1. Changes
    - Makes email, phone, and join_date fields nullable
    - Allows importing employees without complete information
    - Existing data with these fields will be preserved

  2. Notes
    - Email addresses can be added later as they become available
    - This enables bulk import of employee data from legacy systems
*/

ALTER TABLE employees 
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN join_date DROP NOT NULL;