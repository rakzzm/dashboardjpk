import { supabase } from './supabase';

export async function getAllDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('dept_name');

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  return data || [];
}

export async function getDepartmentsWithEmployees() {
  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      employees:employees(count)
    `)
    .not('employees', 'is', null)
    .order('dept_name');

  if (error) {
    console.error('Error fetching departments with employees:', error);
    return [];
  }

  // Filter to only departments that actually have employees
  const filtered = (data || []).filter(dept => dept.employees && dept.employees[0]?.count > 0);

  return filtered;
}

export async function getDepartmentByCode(deptCode: string) {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('dept_code', deptCode)
    .maybeSingle();

  if (error) {
    console.error('Error fetching department:', error);
    return null;
  }

  return data;
}

export async function searchDepartments(searchTerm: string) {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .or(`dept_code.ilike.%${searchTerm}%,dept_name.ilike.%${searchTerm}%`)
    .order('dept_name')
    .limit(10);

  if (error) {
    console.error('Error searching departments:', error);
    return [];
  }

  return data || [];
}

export async function getAllEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return data || [];
}

export async function getEmployeesByDepartment(deptCode: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('department_code', deptCode)
    .order('name');

  if (error) {
    console.error('Error fetching employees by department:', error);
    return [];
  }

  return data || [];
}

export async function getEmployeeById(employeeId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return data;
}

export async function searchEmployees(searchTerm: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .or(`employee_id.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`)
    .order('name')
    .limit(20);

  if (error) {
    console.error('Error searching employees:', error);
    return [];
  }

  return data || [];
}

export async function getAttendanceRecords(employeeId: string, limit = 30) {
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (empError || !employee) {
    console.error('Error fetching employee for attendance:', empError);
    return [];
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee.id)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }

  return data || [];
}

export async function getEmployeeStatistics(deptCode?: string) {
  let query = supabase.from('employees').select('*');

  if (deptCode && deptCode !== 'all') {
    query = query.eq('department_code', deptCode);
  }

  const { data: employees, error } = await query;

  if (error) {
    console.error('Error fetching employee statistics:', error);
    return null;
  }

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(e => e.status === 'Active').length || 0;
  const onLeave = employees?.filter(e => e.status === 'On Leave').length || 0;
  const inactive = employees?.filter(e => e.status === 'Inactive').length || 0;

  const salaries = employees?.map(e => e.salary) || [];
  const avgSalary = salaries.length > 0
    ? Math.round(salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length)
    : 0;
  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;

  const positions = employees?.reduce((acc: any, emp) => {
    acc[emp.position] = (acc[emp.position] || 0) + 1;
    return acc;
  }, {}) || {};

  const topPositions = Object.entries(positions)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const demographics = {
    nationality: employees?.reduce((acc: any, emp) => {
      acc[emp.nationality] = (acc[emp.nationality] || 0) + 1;
      return acc;
    }, {}) || {},
    religion: employees?.reduce((acc: any, emp) => {
      acc[emp.religion] = (acc[emp.religion] || 0) + 1;
      return acc;
    }, {}) || {},
    gender: employees?.reduce((acc: any, emp) => {
      acc[emp.gender] = (acc[emp.gender] || 0) + 1;
      return acc;
    }, {}) || {},
    education: employees?.reduce((acc: any, emp) => {
      acc[emp.education_level] = (acc[emp.education_level] || 0) + 1;
      return acc;
    }, {}) || {}
  };

  return {
    totalEmployees,
    activeEmployees,
    onLeave,
    inactive,
    avgSalary,
    minSalary,
    maxSalary,
    topPositions,
    demographics
  };
}

export async function getDepartmentStatistics(deptCode: string) {
  const department = await getDepartmentByCode(deptCode);
  if (!department) return null;

  const employees = await getEmployeesByDepartment(deptCode);
  const stats = await getEmployeeStatistics(deptCode);

  const { data: subDepts, error: subDeptsError } = await supabase
    .from('departments')
    .select('*')
    .eq('parent_dept_id', department.id);

  return {
    department,
    employees,
    employeeCount: employees.length,
    subDepartmentCount: subDepts?.length || 0,
    statistics: stats
  };
}

export async function getTodayAttendanceStats(deptCode?: string, employeeId?: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Use Promise.all to fetch attendance and employee count in parallel
    const attendancePromise = (async () => {
      let query = supabase
        .from('attendance_records')
        .select('status, employee_id')
        .eq('date', today);

      // For specific employee, we need to join to filter
      if (employeeId && employeeId !== 'all') {
        const { data: emp } = await supabase
          .from('employees')
          .select('id')
          .eq('employee_id', employeeId)
          .maybeSingle();

        if (emp) {
          query = query.eq('employee_id', emp.id);
        } else {
          return [];
        }
      } else if (deptCode && deptCode !== 'all') {
        // Get employee IDs for the department
        const { data: deptEmps } = await supabase
          .from('employees')
          .select('id')
          .eq('department_code', deptCode);

        if (deptEmps && deptEmps.length > 0) {
          const empIds = deptEmps.map(e => e.id);
          query = query.in('employee_id', empIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    })();

    const employeeCountPromise = (async () => {
      if (employeeId && employeeId !== 'all') {
        return 1;
      }

      let countQuery = supabase
        .from('employees')
        .select('id', { count: 'exact', head: true });

      if (deptCode && deptCode !== 'all') {
        countQuery = countQuery.eq('department_code', deptCode);
      }

      const { count, error } = await countQuery;
      if (error) throw error;
      return count || 0;
    })();

    const [records, totalEmployees] = await Promise.all([attendancePromise, employeeCountPromise]);

    // Count by status
    const present = records.filter(r => r.status === 'Present').length;
    const late = records.filter(r => r.status === 'Late').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const onMedicalLeave = records.filter(r => r.status === 'MC').length;
    const onLeave = records.filter(r => r.status === 'Leave').length;
    const holiday = records.filter(r => r.status === 'Holiday').length;
    const notCheckedIn = Math.max(0, totalEmployees - records.length);

    return {
      total: records.length,
      present,
      late,
      absent,
      onMedicalLeave,
      onLeave,
      holiday,
      notCheckedIn,
      totalEmployees,
      records
    };
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    return {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      onMedicalLeave: 0,
      onLeave: 0,
      holiday: 0,
      notCheckedIn: 0,
      totalEmployees: 0,
      records: []
    };
  }
}

export async function getAttendanceStatsByDateRange(
  startDate: string,
  endDate: string,
  deptCode?: string,
  employeeId?: string
) {
  let query = supabase
    .from('attendance_records')
    .select(`
      *,
      employees!inner(employee_id, name, department_code)
    `)
    .gte('date', startDate)
    .lte('date', endDate);

  if (deptCode && deptCode !== 'all') {
    query = query.eq('employees.department_code', deptCode);
  }

  if (employeeId && employeeId !== 'all') {
    query = query.eq('employees.employee_id', employeeId);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance by date range:', error);
    return [];
  }

  return data || [];
}

export async function getEmployeeAttendanceByEmployeeId(employeeId: string, limit = 30) {
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, employee_id, name, department_code')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (empError || !employee) {
    console.error('Error fetching employee:', empError);
    return null;
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee.id)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching attendance records:', error);
    return null;
  }

  return {
    employee,
    records: data || []
  };
}

export async function getEmployeeLeaveRecords(employeeId: string, limit = 30) {
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, employee_id, name, department_code')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (empError || !employee) {
    console.error('Error fetching employee:', empError);
    return null;
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee.id)
    .in('status', ['On Leave', 'Medical Leave', 'Annual Leave', 'Sick Leave', 'Emergency Leave'])
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leave records:', error);
    return null;
  }

  return {
    employee,
    records: data || []
  };
}

export async function getEmployeeTodayAttendance(employeeId: string) {
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, employee_id, name, department_code, position, status')
    .eq('employee_id', employeeId)
    .maybeSingle();

  if (empError || !employee) {
    console.error('Error fetching employee:', empError);
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today attendance:', error);
    return { employee, record: null };
  }

  return {
    employee,
    record: data
  };
}
