import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Download, 
  Settings, 
  Search, 
  Filter,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Briefcase,
  Target,
  Zap,
  Shield,
  Globe,
  Star,
  Award,
  Maximize2,
  FileText,
  Database
} from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { generateEmployeeAttendance, generateEmployeePerformance } from '../data/employees';
import { generateAttendanceData } from '../data/departments';
import { getAllDepartments, getAllEmployees } from '../lib/databaseQueries';
import SettingsPanel from './SettingsPanel';
import AIChat from './AIChat';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  ChartDataLabels
);

const AttendanceDashboard: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [depts, emps] = await Promise.all([
          getAllDepartments(),
          getAllEmployees()
        ]);
        setDepartments(depts);
        setEmployees(emps);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset employee selection when department changes
  useEffect(() => {
    setSelectedEmployee('all');
  }, [selectedDepartment]);

  // Generate attendance data based on current selections
  const attendanceData = generateAttendanceData(selectedDepartment, selectedPeriod);

  // Filter departments to only show those with employees
  const departmentsWithEmployees = departments.filter(dept =>
    employees.some(emp => emp.department_code === dept.dept_code)
  );

  // Filter employees based on department selection
  const filteredEmployees = selectedDepartment === 'all'
    ? employees
    : employees.filter(emp => emp.department_code === selectedDepartment);

  // Get current department info
  const currentDepartment = selectedDepartment === 'all'
    ? null
    : departments.find(dept => dept.dept_code === selectedDepartment);

  // Get current employee info
  const currentEmployee = selectedEmployee === 'all'
    ? null
    : employees.find(emp => emp.id === selectedEmployee);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching data from database...</p>
        </div>
      </div>
    );
  }

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#3b82f6',
        borderWidth: 1
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    }
  };

  // Weekly trends data
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Attendance',
        data: attendanceData.weeklyTrends,
        backgroundColor: [
          'rgba(255, 206, 84, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 206, 84, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Monthly trends data
  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Monthly Attendance',
        data: attendanceData.monthlyTrends,
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Demographics pie chart data
  const demographicsData = {
    labels: ['Malaysian', 'Non-Malaysian'],
    datasets: [
      {
        data: [
          attendanceData.nationalityData.malaysian,
          attendanceData.nationalityData.nonMalaysian
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add JPKN watermark
    doc.setFontSize(60);
    doc.setTextColor(200, 200, 200);
    doc.text('JPKN', 105, 150, { align: 'center', angle: 45 });
    
    // Reset color for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('CONFIDENTIAL - Attendance Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Department: ${currentDepartment ? currentDepartment.dept_name : 'All Departments'}`, 20, 35);
    doc.text(`Period: ${selectedPeriod}`, 20, 45);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 55);
    
    // Add statistics
    const stats = [
      ['Total Employees', attendanceData.totalEmployees.toString()],
      ['Clocked In', attendanceData.totalClockedEmployees.toString()],
      ['On Leave', attendanceData.totalOnLeave.toString()],
      ['Medical Leave', attendanceData.totalMC.toString()],
      ['Absent', attendanceData.totalAbsent.toString()],
      ['Compliance Rate', `${attendanceData.complianceRate}%`],
      ['Performance Score', `${attendanceData.performanceScore}/100`]
    ];

    (doc as any).autoTable({
      head: [['Metric', 'Value']],
      body: stats,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    // Add security notice
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('CONFIDENTIAL: This document contains sensitive government information.', 20, 280);
    doc.text('Unauthorized disclosure is prohibited under the Official Secrets Act.', 20, 290);
    
    doc.save(`attendance-report-${selectedPeriod}-${Date.now()}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['CONFIDENTIAL - Attendance Summary'],
      [''],
      ['Department', currentDepartment ? currentDepartment.dept_name : 'All Departments'],
      ['Period', selectedPeriod],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Metric', 'Value'],
      ['Total Employees', attendanceData.totalEmployees],
      ['Clocked In', attendanceData.totalClockedEmployees],
      ['On Leave', attendanceData.totalOnLeave],
      ['Medical Leave', attendanceData.totalMC],
      ['Absent', attendanceData.totalAbsent],
      ['Compliance Rate', `${attendanceData.complianceRate}%`],
      ['Performance Score', `${attendanceData.performanceScore}/100`],
      [''],
      ['CONFIDENTIAL: Unauthorized disclosure prohibited']
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Demographics sheet
    const demoData = [
      ['Demographics Analysis'],
      [''],
      ['Nationality', 'Count'],
      ['Malaysian', attendanceData.nationalityData.malaysian],
      ['Non-Malaysian', attendanceData.nationalityData.nonMalaysian],
      [''],
      ['Religion', 'Count'],
      ['Islam', attendanceData.religionData.islam],
      ['Christian', attendanceData.religionData.christian],
      ['Buddhist', attendanceData.religionData.buddhist],
      ['Hindu', attendanceData.religionData.hindu],
      ['Others', attendanceData.religionData.others]
    ];
    
    const demoSheet = XLSX.utils.aoa_to_sheet(demoData);
    XLSX.utils.book_append_sheet(workbook, demoSheet, 'Demographics');
    
    XLSX.writeFile(workbook, `attendance-data-${selectedPeriod}-${Date.now()}.xlsx`);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-blue-400" />
                  AI Analysis Data Monitor
                </h1>
                <p className="text-blue-200 text-sm">Comprehensive Attendance Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFullscreen}
                className="flex items-center space-x-2 bg-purple-600/20 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-all border border-purple-500/30"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Fullscreen</span>
              </button>
              
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-2 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600/50 transition-all border border-slate-600/50"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Database className="w-4 h-4 inline mr-1" />
                Department ({departmentsWithEmployees.length} with Employees)
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Departments ({departmentsWithEmployees.length})</option>
                {departmentsWithEmployees.map(dept => (
                  <option key={dept.id} value={dept.dept_code}>
                    {dept.dept_code} - {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Employee ({filteredEmployees.length} Available)
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">All Employees ({filteredEmployees.length})</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 bg-red-600/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-all border border-red-500/30"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 bg-green-600/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-600/30 transition-all border border-green-500/30"
              >
                <FileText className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total</p>
                <p className="text-blue-200 text-sm font-medium">Employees</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalEmployees.toLocaleString()}</p>
              </div>
              <Users className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Total Bumi</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalBumiEmployees.toLocaleString()}</p>
              </div>
              <div className="relative">
                <Star className="w-12 h-12 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Non-Bumi</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalNonBumiEmployees.toLocaleString()}</p>
              </div>
              <Globe className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-sm font-medium">Clocked In</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalClockedEmployees.toLocaleString()}</p>
              </div>
              <UserCheck className="w-12 h-12 text-cyan-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Medical Leave</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalMC}</p>
              </div>
              <Activity className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Absent</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalAbsent}</p>
              </div>
              <UserX className="w-12 h-12 text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">On Leave</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.totalOnLeave.toLocaleString()}</p>
              </div>
              <Briefcase className="w-12 h-12 text-orange-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm font-medium">Late Arrivals</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.lateArrivals.toLocaleString()}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Avg Hours/Day</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.avgHoursPerDay}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Compliance Rate</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.complianceRate}%</p>
              </div>
              <Shield className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Overtime Hours</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.overtimeHours}</p>
              </div>
              <Zap className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Performance Score</p>
                <p className="text-white text-3xl font-bold mt-2">{attendanceData.performanceScore}/100</p>
              </div>
              <Target className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium">Avg Compliance</p>
                <p className="text-white text-3xl font-bold mt-2">85%</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Trends */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Weekly Trends - 3D Enhanced
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live Data</span>
              </div>
            </div>
            <div className="h-80">
              <Bar data={weeklyData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-blue-400">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Days of the Week</span>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Monthly Trends - 3D Enhanced
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live Data</span>
              </div>
            </div>
            <div className="h-80">
              <Bar data={monthlyData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Weekly Periods</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demographics and Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demographics Chart */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-400" />
              Demographics
            </h3>
            <div className="h-64">
              <Doughnut 
                data={demographicsData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        color: '#e2e8f0',
                        font: { size: 12 }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Department Info */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-cyan-400" />
              Department Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Selected Department</p>
                <p className="text-white font-medium">
                  {currentDepartment ? currentDepartment.dept_name : 'All Departments'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Department Code</p>
                <p className="text-white font-medium">
                  {currentDepartment ? currentDepartment.dept_code : 'ALL'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Employees</p>
                <p className="text-white font-medium">{filteredEmployees.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Active Employees</p>
                <p className="text-white font-medium">
                  {filteredEmployees.filter(emp => emp.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Last Update</span>
                <span className="text-white text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Data Sync</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 text-sm">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* AI Chat */}
      <AIChat selectedDepartment={selectedDepartment} selectedEmployee={selectedEmployee} />
    </div>
  );
};

export default AttendanceDashboard;