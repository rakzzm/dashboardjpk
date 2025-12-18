import { supabase } from './supabase';
import { departments as localDepartments } from '../data/departments';
import { employees as localEmployees, generateEmployeeAttendance } from '../data/employees';

export async function migrateDepartmentsToDatabase() {
  console.log('Migrating departments to database...');

  const { data: existingDepts, error: fetchError } = await supabase
    .from('departments')
    .select('dept_code');

  if (fetchError) {
    console.error('Error checking existing departments:', fetchError);
    return { success: false, error: fetchError };
  }

  const existingCodes = new Set(existingDepts?.map(d => d.dept_code) || []);
  const deptsToInsert = localDepartments
    .filter(dept => !existingCodes.has(dept.dept_code))
    .map(dept => ({
      dept_code: dept.dept_code,
      dept_name: dept.dept_name,
      parent_dept_id: null
    }));

  if (deptsToInsert.length === 0) {
    console.log('All departments already exist in database');
    return { success: true, inserted: 0 };
  }

  const { data, error } = await supabase
    .from('departments')
    .insert(deptsToInsert)
    .select();

  if (error) {
    console.error('Error inserting departments:', error);
    return { success: false, error };
  }

  console.log(`Successfully inserted ${data?.length || 0} departments`);
  return { success: true, inserted: data?.length || 0 };
}

export async function migrateEmployeesToDatabase() {
  console.log('Migrating employees to database...');

  const { data: existingEmps, error: fetchError } = await supabase
    .from('employees')
    .select('employee_id');

  if (fetchError) {
    console.error('Error checking existing employees:', fetchError);
    return { success: false, error: fetchError };
  }

  const existingIds = new Set(existingEmps?.map(e => e.employee_id) || []);
  const empsToInsert = localEmployees
    .filter(emp => !existingIds.has(emp.employeeId))
    .map(emp => ({
      employee_id: emp.employeeId,
      name: emp.name,
      department_code: emp.department,
      position: emp.position,
      grade: emp.grade,
      email: emp.email,
      phone: emp.phone,
      join_date: emp.joinDate,
      nationality: emp.nationality,
      religion: emp.religion,
      gender: emp.gender,
      native_status: emp.nativeStatus,
      education_level: emp.educationLevel,
      salary: emp.salary,
      status: emp.status,
      supervisor: emp.supervisor,
      work_location: emp.workLocation,
      emergency_contact_name: emp.emergencyContact.name,
      emergency_contact_relationship: emp.emergencyContact.relationship,
      emergency_contact_phone: emp.emergencyContact.phone
    }));

  if (empsToInsert.length === 0) {
    console.log('All employees already exist in database');
    return { success: true, inserted: 0 };
  }

  const { data, error } = await supabase
    .from('employees')
    .insert(empsToInsert)
    .select();

  if (error) {
    console.error('Error inserting employees:', error);
    return { success: false, error };
  }

  console.log(`Successfully inserted ${data?.length || 0} employees`);
  return { success: true, inserted: data?.length || 0, data };
}

export async function migrateAttendanceToDatabase() {
  console.log('Migrating attendance records to database...');

  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, employee_id');

  if (empError) {
    console.error('Error fetching employees:', empError);
    return { success: false, error: empError };
  }

  if (!employees || employees.length === 0) {
    console.log('No employees found in database');
    return { success: false, error: 'No employees in database' };
  }

  const allAttendanceRecords = [];

  for (const employee of employees.slice(0, 20)) {
    const attendanceRecords = generateEmployeeAttendance(employee.employee_id, 30);

    for (const record of attendanceRecords) {
      allAttendanceRecords.push({
        employee_id: employee.id,
        date: record.date,
        clock_in: record.clockIn || null,
        clock_out: record.clockOut || null,
        status: record.status,
        hours_worked: record.hoursWorked,
        overtime_hours: record.overtimeHours,
        location: record.location,
        notes: record.notes || null
      });
    }
  }

  if (allAttendanceRecords.length === 0) {
    console.log('No attendance records to insert');
    return { success: true, inserted: 0 };
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(allAttendanceRecords, {
      onConflict: 'employee_id,date',
      ignoreDuplicates: true
    })
    .select();

  if (error) {
    console.error('Error inserting attendance records:', error);
    return { success: false, error };
  }

  console.log(`Successfully inserted ${data?.length || 0} attendance records`);
  return { success: true, inserted: data?.length || 0 };
}

export async function migrateAllData() {
  console.log('Starting full data migration...');

  const deptResult = await migrateDepartmentsToDatabase();
  if (!deptResult.success) {
    console.error('Department migration failed');
    return { success: false, step: 'departments', error: deptResult.error };
  }

  const empResult = await migrateEmployeesToDatabase();
  if (!empResult.success) {
    console.error('Employee migration failed');
    return { success: false, step: 'employees', error: empResult.error };
  }

  const attResult = await migrateAttendanceToDatabase();
  if (!attResult.success) {
    console.error('Attendance migration failed');
    return { success: false, step: 'attendance', error: attResult.error };
  }

  console.log('Data migration completed successfully!');
  return {
    success: true,
    departments: deptResult.inserted,
    employees: empResult.inserted,
    attendance: attResult.inserted
  };
}
