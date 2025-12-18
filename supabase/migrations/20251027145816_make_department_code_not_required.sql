/*
  # Make Department Code FK Optional

  1. Changes
    - Drops foreign key constraint on department_code
    - Allows employees with department codes not yet in the system
    - Department codes can be validated and added later

  2. Rationale
    - AMS database contains many department codes
    - Some departments may not be in current system
    - Enables complete employee import from legacy system
*/

ALTER TABLE employees 
  DROP CONSTRAINT IF EXISTS employees_department_code_fkey;