// Employee data with realistic Sabah government employee information
export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  grade: string;
  email: string;
  phone: string;
  joinDate: string;
  nationality: 'Malaysian' | 'Non-Malaysian';
  religion: 'Islam' | 'Christian' | 'Buddhist' | 'Hindu' | 'Others';
  gender: 'Male' | 'Female';
  nativeStatus: 'Islamic Land' | 'Non-Islamic Land';
  educationLevel: 'Degree' | 'Diploma' | 'SPM' | 'STPM' | 'Others';
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  supervisor: string;
  workLocation: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface AttendanceRecord {
  date: string;
  clockIn: string;
  clockOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'MC' | 'Leave' | 'Holiday';
  hoursWorked: number;
  overtimeHours: number;
  location: string;
  notes?: string;
}

interface EmployeePerformance {
  attendanceRate: number;
  punctualityRate: number;
  averageHoursPerDay: number;
  totalOvertimeHours: number;
  totalLeaveDays: number;
  totalMCDays: number;
  performanceScore: number;
  lastEvaluation: string;
  goals: string[];
  achievements: string[];
}

// Generate realistic employee data
const generateEmployees = (count: number = 50): Employee[] => {
  const malaysianNames = [
    'Ahmad Bin Abdullah', 'Siti Nurhaliza Binti Mohamed', 'Lim Wei Ming', 'Tan Mei Ling',
    'Rajesh Kumar', 'Priya Devi', 'Wong Kar Wai', 'Lee Siew Lan', 'Muhammad Farid',
    'Nurul Ain Binti Hassan', 'Chen Wei Jie', 'Kavitha Devi', 'Mohd Rizal Bin Omar',
    'Sarah Lim', 'Raj Kumar Singh', 'Amy Tan', 'Azman Bin Ismail', 'Linda Wong',
    'Suresh Kumar', 'Mei Lin Tan', 'Hafiz Bin Rahman', 'Jessica Lim', 'Kumar Raj',
    'Lily Chen', 'Ismail Bin Ahmad', 'Grace Wong', 'Ravi Kumar', 'Stephanie Tan',
    'Zulkifli Bin Hassan', 'Michelle Lim', 'Deepak Kumar', 'Cindy Wong', 'Faizal Bin Omar',
    'Jennifer Tan', 'Sanjay Kumar', 'Vivian Lim', 'Rashid Bin Ali', 'Karen Wong',
    'Vikram Singh', 'Jasmine Tan', 'Nazri Bin Yusof', 'Samantha Lim', 'Arjun Kumar',
    'Crystal Wong', 'Hakim Bin Razak', 'Melissa Tan', 'Kiran Singh', 'Wendy Lim',
    'Azhar Bin Mahmud', 'Stephanie Wong', 'Raj Singh', 'Chloe Tan'
  ];

  const positions = [
    'Pegawai Tadbir', 'Penolong Pegawai Tadbir', 'Pembantu Tadbir', 'Jurutera',
    'Penolong Jurutera', 'Pembantu Jurutera', 'Akauntan', 'Penolong Akauntan',
    'Pembantu Akauntan', 'Pegawai IT', 'Pembantu IT', 'Setiausaha', 'Pemandu',
    'Kerani', 'Pengawal Keselamatan', 'Pembantu Am', 'Pegawai Penyelidik',
    'Pegawai Perhubungan Awam', 'Pegawai Sumber Manusia', 'Pegawai Kewangan'
  ];

  const grades = ['JUSA C', 'Gred 54', 'Gred 52', 'Gred 48', 'Gred 44', 'Gred 41', 'Gred 38', 'Gred 32', 'Gred 29', 'Gred 27', 'Gred 22', 'Gred 19', 'Gred 17', 'Gred 11'];

  const workLocations = [
    'Kompleks Pentadbiran Kerajaan Negeri', 'Wisma Innoprise', 'Menara Tun Mustapha',
    'Kompleks Karamunsing', 'Pejabat Daerah', 'Balai Raya', 'Pusat Khidmat Rakyat'
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = malaysianNames[i % malaysianNames.length];
    const isMalaysian = Math.random() > 0.1; // 90% Malaysian
    const isMale = Math.random() > 0.45; // 55% male, 45% female
    const isBumi = Math.random() > 0.35; // 65% Bumi
    const hasdegree = Math.random() > 0.6; // 40% degree holders
    
    const salary = Math.floor(2500 + Math.random() * 8000); // RM2,500 - RM10,500
    
    return {
      id: `emp_${i + 1}`,
      employeeId: `SG${String(i + 1).padStart(6, '0')}`,
      name,
      department: ['11D', '33J', '25B', '280', '490', '190'][Math.floor(Math.random() * 6)],
      position: positions[Math.floor(Math.random() * positions.length)],
      grade: grades[Math.floor(Math.random() * grades.length)],
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@sabah.gov.my`,
      phone: `+6${Math.floor(Math.random() * 2) ? '01' : '08'}${Math.floor(Math.random() * 90000000 + 10000000)}`,
      joinDate: new Date(2010 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      nationality: isMalaysian ? 'Malaysian' : 'Non-Malaysian',
      religion: isBumi ? (Math.random() > 0.2 ? 'Islam' : 'Christian') : ['Christian', 'Buddhist', 'Hindu'][Math.floor(Math.random() * 3)] as any,
      gender: isMale ? 'Male' : 'Female',
      nativeStatus: isBumi ? 'Islamic Land' : 'Non-Islamic Land',
      educationLevel: hasdegree ? 'Degree' : ['Diploma', 'SPM', 'STPM'][Math.floor(Math.random() * 3)] as any,
      salary,
      status: Math.random() > 0.05 ? 'Active' : (Math.random() > 0.5 ? 'On Leave' : 'Inactive') as any,
      supervisor: malaysianNames[Math.floor(Math.random() * malaysianNames.length)],
      workLocation: workLocations[Math.floor(Math.random() * workLocations.length)],
      emergencyContact: {
        name: malaysianNames[Math.floor(Math.random() * malaysianNames.length)],
        relationship: ['Spouse', 'Parent', 'Sibling', 'Child'][Math.floor(Math.random() * 4)],
        phone: `+6${Math.floor(Math.random() * 2) ? '01' : '08'}${Math.floor(Math.random() * 90000000 + 10000000)}`
      }
    };
  });
};

// Generate attendance records for an employee
export const generateEmployeeAttendance = (employeeId: string, days: number = 30): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends for most records
    if (date.getDay() === 0 || date.getDay() === 6) {
      if (Math.random() > 0.1) continue; // 10% chance of weekend work
    }
    
    const statusRand = Math.random();
    let status: AttendanceRecord['status'];
    let clockIn = '';
    let clockOut = '';
    let hoursWorked = 0;
    let overtimeHours = 0;
    
    if (statusRand > 0.95) {
      status = 'Absent';
    } else if (statusRand > 0.92) {
      status = 'MC';
    } else if (statusRand > 0.88) {
      status = 'Leave';
    } else {
      // Present or Late
      const isLate = Math.random() > 0.85; // 15% late rate
      status = isLate ? 'Late' : 'Present';
      
      const clockInHour = isLate ? 8 + Math.floor(Math.random() * 2) : 8; // 8 AM or later if late
      const clockInMinute = Math.floor(Math.random() * 60);
      clockIn = `${String(clockInHour).padStart(2, '0')}:${String(clockInMinute).padStart(2, '0')}`;
      
      const clockOutHour = 17 + Math.floor(Math.random() * 3); // 5 PM to 7 PM
      const clockOutMinute = Math.floor(Math.random() * 60);
      clockOut = `${String(clockOutHour).padStart(2, '0')}:${String(clockOutMinute).padStart(2, '0')}`;
      
      hoursWorked = clockOutHour - clockInHour + (clockOutMinute - clockInMinute) / 60;
      hoursWorked = Math.max(0, Math.round(hoursWorked * 10) / 10);
      
      if (hoursWorked > 8) {
        overtimeHours = Math.round((hoursWorked - 8) * 10) / 10;
      }
    }
    
    records.push({
      date: date.toISOString().split('T')[0],
      clockIn,
      clockOut,
      status,
      hoursWorked,
      overtimeHours,
      location: 'Main Office',
      notes: status === 'MC' ? 'Medical Certificate submitted' : status === 'Leave' ? 'Annual Leave' : undefined
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Generate employee performance data
export const generateEmployeePerformance = (attendanceRecords: AttendanceRecord[]): EmployeePerformance => {
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'Late').length;
  const leaveDays = attendanceRecords.filter(r => r.status === 'Leave').length;
  const mcDays = attendanceRecords.filter(r => r.status === 'MC').length;
  
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const punctualityRate = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 0;
  
  const totalHours = attendanceRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  const averageHoursPerDay = presentDays > 0 ? Math.round((totalHours / presentDays) * 10) / 10 : 0;
  
  const totalOvertimeHours = attendanceRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
  
  const performanceScore = Math.round(
    (attendanceRate * 0.4) + 
    (punctualityRate * 0.3) + 
    (Math.min(averageHoursPerDay / 8, 1) * 100 * 0.2) +
    (Math.min(totalOvertimeHours / 10, 1) * 100 * 0.1)
  );
  
  return {
    attendanceRate,
    punctualityRate,
    averageHoursPerDay,
    totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
    totalLeaveDays: leaveDays,
    totalMCDays: mcDays,
    performanceScore,
    lastEvaluation: '2024-01-15',
    goals: [
      'Improve punctuality',
      'Complete professional development course',
      'Mentor junior staff members'
    ],
    achievements: [
      'Perfect attendance for Q3 2023',
      'Completed digital transformation training',
      'Led successful department project'
    ]
  };
};

export const employees = generateEmployees(50);