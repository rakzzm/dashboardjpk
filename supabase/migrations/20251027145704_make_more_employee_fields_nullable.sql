/*
  # Make Additional Employee Fields Nullable

  1. Changes
    - Makes religion, native_status, education_level fields nullable
    - Allows importing employees from legacy systems with incomplete data
    - Data can be updated later as information becomes available

  2. Notes
    - Facilitates bulk import from AMS database
    - Missing information can be filled in gradually
*/

ALTER TABLE employees 
  ALTER COLUMN religion DROP NOT NULL,
  ALTER COLUMN native_status DROP NOT NULL,
  ALTER COLUMN education_level DROP NOT NULL;