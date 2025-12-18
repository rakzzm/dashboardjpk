/*
  # Make All Optional Employee Fields Nullable

  1. Changes
    - Makes supervisor, salary, emergency contact fields nullable
    - Enables bulk import of employee data without complete information
    - Fields can be populated as data becomes available

  2. Rationale
    - Legacy AMS system doesn't contain all employee details
    - Gradual data enrichment approach
    - Maintains data integrity while allowing imports
*/

ALTER TABLE employees 
  ALTER COLUMN supervisor DROP NOT NULL,
  ALTER COLUMN salary DROP NOT NULL,
  ALTER COLUMN emergency_contact_name DROP NOT NULL,
  ALTER COLUMN emergency_contact_relationship DROP NOT NULL,
  ALTER COLUMN emergency_contact_phone DROP NOT NULL;