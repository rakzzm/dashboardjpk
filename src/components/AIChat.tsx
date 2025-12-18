import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  X,
  Loader2,
  Sparkles,
  Database,
  Globe,
  Users,
  Building,
  Search,
  Brain,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { nanoid } from 'nanoid';
import { generateText } from 'ai';
import {
  getAllDepartments,
  getDepartmentsWithEmployees,
  getDepartmentByCode,
  searchDepartments,
  getAllEmployees,
  getEmployeesByDepartment,
  getEmployeeById,
  searchEmployees,
  getEmployeeStatistics,
  getDepartmentStatistics,
  getAttendanceRecords,
  getTodayAttendanceStats,
  getAttendanceStatsByDateRange,
  getEmployeeAttendanceByEmployeeId,
  getEmployeeLeaveRecords,
  getEmployeeTodayAttendance
} from '../lib/databaseQueries';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AIChatProps {
  selectedDepartment?: string;
  selectedEmployee?: string;
}

const AIChat: React.FC<AIChatProps> = ({ selectedDepartment, selectedEmployee }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [llmConfig, setLlmConfig] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load LLM configuration from settings
  useEffect(() => {
    const loadLLMConfig = () => {
      const savedLlms = localStorage.getItem('attendance_llms');
      if (savedLlms) {
        const llms = JSON.parse(savedLlms);
        const defaultLlm = llms.find((llm: any) => llm.isDefault && llm.apiKey);
        if (defaultLlm) {
          setLlmConfig(defaultLlm);
        }
      }
    };

    loadLLMConfig();
    
    // Listen for storage changes to update LLM config
    const handleStorageChange = () => {
      loadLLMConfig();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Create context about the current app state from database
  const createSystemContext = async () => {
    const [allDepartments, departmentsWithEmp, allEmployees] = await Promise.all([
      getAllDepartments(),
      getDepartmentsWithEmployees(),
      getAllEmployees()
    ]);

    let currentDept = null;
    let deptEmployees = allEmployees;

    if (selectedDepartment && selectedDepartment !== 'all') {
      currentDept = await getDepartmentByCode(selectedDepartment);
      deptEmployees = await getEmployeesByDepartment(selectedDepartment);
    }

    let currentEmp = null;
    if (selectedEmployee && selectedEmployee !== 'all') {
      currentEmp = await getEmployeeById(selectedEmployee);
    }

    const stats = await getEmployeeStatistics(selectedDepartment);

    return {
      currentDepartment: currentDept,
      currentEmployee: currentEmp,
      departmentEmployees: deptEmployees,
      totalDepartments: allDepartments.length,
      departmentsWithEmployees: departmentsWithEmp.length,
      totalEmployees: allEmployees.length,
      departments: departmentsWithEmp.slice(0, 20),
      employees: allEmployees.slice(0, 50),
      statistics: stats
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = await createSystemContext();
      
      // Create a comprehensive response using the app data
      const systemPrompt = `You are an AI assistant for the Sabah Government Attendance Management System. You have access to the following data:

CURRENT CONTEXT:
- Selected Department: ${context.currentDepartment ? `${context.currentDepartment.dept_code} - ${context.currentDepartment.dept_name}` : 'All Departments'}
- Selected Employee: ${context.currentEmployee ? `${context.currentEmployee.employeeId} - ${context.currentEmployee.name}` : 'All Employees'}
- Total Departments in System: ${context.totalDepartments}
- Departments with Employees: ${context.departmentsWithEmployees}
- Total Employees: ${context.totalEmployees}

DEPARTMENT DATA:
${JSON.stringify(context.departments, null, 2)}

EMPLOYEE DATA (Sample):
${JSON.stringify(context.employees, null, 2)}

CURRENT DEPARTMENT EMPLOYEES:
${JSON.stringify(context.departmentEmployees.slice(0, 10), null, 2)}

INSTRUCTIONS:
1. PRIORITY: Always check the app database first for department and employee information
2. Provide detailed, accurate information about departments, employees, and attendance data
3. Use the current context (selected department/employee) to provide relevant responses
4. For general questions not in the database, use your knowledge
5. Format responses with markdown for better readability
6. Include relevant statistics and insights when possible
7. Be helpful, professional, and concise
8. If asked about specific employees or departments, search the provided data first`;

      // Try to use DeepSeek API, fallback to local processing if it fails
      let responseContent = '';
      
      try {
        // Use configured LLM from settings
        if (llmConfig && llmConfig.apiKey) {
          const { createOpenAI } = await import('@ai-sdk/openai');
          
          let client;
          if (llmConfig.provider === 'deepseek') {
            client = createOpenAI({
              apiKey: llmConfig.apiKey,
              baseURL: llmConfig.baseUrl || 'https://api.deepseek.com',
            });
          } else if (llmConfig.provider === 'openai') {
            client = createOpenAI({
              apiKey: llmConfig.apiKey,
              baseURL: llmConfig.baseUrl || 'https://api.openai.com/v1',
            });
          } else {
            // For other providers, use custom base URL
            client = createOpenAI({
              apiKey: llmConfig.apiKey,
              baseURL: llmConfig.baseUrl || 'https://api.openai.com/v1',
            });
          }

          const result = await generateText({
            model: client(llmConfig.model),
            system: systemPrompt,
            prompt: input.trim(),
            temperature: llmConfig.temperature,
            maxTokens: llmConfig.maxTokens,
          });

          responseContent = result.text;
        } else {
          throw new Error('No LLM configured');
        }
      } catch (apiError) {
        console.warn('LLM API unavailable, using local processing:', apiError);
        
        // Fallback to local data processing
        responseContent = await processLocalQuery(input.trim(), context);
      }

      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: `❌ **Connection Issue**: ${!llmConfig ? 'No LLM configured in settings' : 'Having trouble connecting to the LLM'}, but I can still help you with information from our database.

**Available Information:**
- **${context.departmentsWithEmployees}** departments with employees (${context.totalDepartments} total departments)
- **${context.totalEmployees}** employees and their data
- Current selection: ${context.currentDepartment ? context.currentDepartment.dept_name : 'All Departments'}

${!llmConfig ? 'Configure an LLM in Settings → LLMs to enable AI responses.' : 'Please ask me about specific departments, employees, or try again in a moment.'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Database query processing function
  const processLocalQuery = async (query: string, context: any): Promise<string> => {
    const lowerQuery = query.toLowerCase();

    // Check if query contains a department code pattern
    const hasDeptCode = /\b[0-9]+[a-z]+-?[0-9]*\b/i.test(lowerQuery);

    // Department queries
    if (lowerQuery.includes('department') || lowerQuery.includes('dept') || hasDeptCode) {
      if (lowerQuery.includes('list') || lowerQuery.includes('all')) {
        const deptsWithEmployees = await getDepartmentsWithEmployees();
        const deptList = deptsWithEmployees.slice(0, 10).map(d => `- **${d.dept_code}**: ${d.dept_name}`).join('\n');
        return `📋 **Department List** (showing first 10 of ${deptsWithEmployees.length} departments with employees):\n\n${deptList}\n\n*Note: Only showing departments that have employees assigned. Use the department filter to select a specific department for more details.*`;
      }

      // Search for specific department by code or name
      // Extract department code pattern (e.g., 11D-1, 33J, etc.)
      let searchTerm = lowerQuery.match(/\b[0-9]+[a-z]+-?[0-9]*\b/i)?.[0];

      // If no code pattern found, try extracting after common words
      if (!searchTerm) {
        searchTerm = lowerQuery
          .replace(/^(show|tell|about|give|get|find|search)\s+(me|us)?\s*/i, '')
          .replace(/\b(department|dept|details?|information?|info)\b/gi, '')
          .trim();
      }

      if (searchTerm && searchTerm.length > 0) {
        // First try exact match by code
        let foundDept = await getDepartmentByCode(searchTerm.toUpperCase());

        // If no exact match, try fuzzy search
        if (!foundDept) {
          const searchResults = await searchDepartments(searchTerm);
          foundDept = searchResults[0];
        }

        if (foundDept) {
          const deptStats = await getDepartmentStatistics(foundDept.dept_code);

          return `🏢 **${foundDept.dept_name}**\n\n` +
            `- **Code**: ${foundDept.dept_code}\n` +
            `- **Employees**: ${deptStats?.employeeCount || 0}\n` +
            `- **Type**: ${foundDept.parent_dept_id ? 'Sub-department' : 'Main department'}\n` +
            `${deptStats?.subDepartmentCount ? `- **Sub-departments**: ${deptStats.subDepartmentCount}\n` : ''}` +
            `\n**Employee Breakdown:**\n` +
            `- Active: ${deptStats?.statistics?.activeEmployees || 0}\n` +
            `- On Leave: ${deptStats?.statistics?.onLeave || 0}\n` +
            `- Inactive: ${deptStats?.statistics?.inactive || 0}\n` +
            `\n**Top Positions:**\n` +
            `${deptStats?.statistics?.topPositions.slice(0, 5).map(([pos, count]) =>
              `- ${pos}: ${count} employees`
            ).join('\n') || 'No data'}\n` +
            `\n*Select this department in the filter for detailed attendance data.*`;
        }
      }

      if (context.currentDepartment) {
        const stats = context.statistics;

        return `🏢 **${context.currentDepartment.dept_name}**\n\n` +
          `- **Code**: ${context.currentDepartment.dept_code}\n` +
          `- **Total Employees**: ${stats?.totalEmployees || 0}\n` +
          `- **Active Employees**: ${stats?.activeEmployees || 0}\n` +
          `- **Average Salary**: RM${stats?.avgSalary?.toLocaleString() || 0}\n` +
          `- **Type**: ${context.currentDepartment.parent_dept_id ? 'Sub-department' : 'Main department'}\n\n` +
          `**Demographics:**\n` +
          `- Malaysian: ${stats?.demographics?.nationality?.Malaysian || 0}\n` +
          `- Male: ${stats?.demographics?.gender?.Male || 0}\n` +
          `- Female: ${stats?.demographics?.gender?.Female || 0}\n` +
          `- Degree Holders: ${stats?.demographics?.education?.Degree || 0}`;
      }
    }
    
    // Employee queries
    if (lowerQuery.includes('employee') || lowerQuery.includes('staff')) {
      // Search for specific employee by ID, name, or email
      const searchTerm = lowerQuery.replace(/employee|staff|show|tell|about|me|information|info|details/g, '').trim();
      if (searchTerm && searchTerm.length > 2) {
        const searchResults = await searchEmployees(searchTerm);
        const foundEmp = searchResults[0];

        if (foundEmp) {
          const dept = await getDepartmentByCode(foundEmp.department_code);
          const yearsOfService = new Date().getFullYear() - new Date(foundEmp.join_date).getFullYear();

          return `👤 **${foundEmp.name}**\n\n` +
            `**Basic Information:**\n` +
            `- **Employee ID**: ${foundEmp.employee_id}\n` +
            `- **Department**: ${dept ? dept.dept_name : foundEmp.department_code}\n` +
            `- **Position**: ${foundEmp.position}\n` +
            `- **Grade**: ${foundEmp.grade}\n` +
            `- **Status**: ${foundEmp.status}\n` +
            `- **Years of Service**: ${yearsOfService} years\n\n` +
            `**Personal Details:**\n` +
            `- **Gender**: ${foundEmp.gender}\n` +
            `- **Nationality**: ${foundEmp.nationality}\n` +
            `- **Religion**: ${foundEmp.religion}\n` +
            `- **Education**: ${foundEmp.education_level}\n` +
            `- **Native Status**: ${foundEmp.native_status}\n\n` +
            `**Work Information:**\n` +
            `- **Salary**: RM${foundEmp.salary.toLocaleString()}\n` +
            `- **Work Location**: ${foundEmp.work_location}\n` +
            `- **Supervisor**: ${foundEmp.supervisor}\n` +
            `- **Join Date**: ${new Date(foundEmp.join_date).toLocaleDateString()}\n\n` +
            `**Contact Information:**\n` +
            `- **Email**: ${foundEmp.email}\n` +
            `- **Phone**: ${foundEmp.phone}\n` +
            `- **Emergency Contact**: ${foundEmp.emergency_contact_name} (${foundEmp.emergency_contact_relationship}) - ${foundEmp.emergency_contact_phone}\n\n` +
            `*Select this employee in the filter for detailed attendance records.*`;
        } else if (searchResults.length > 0) {
          return `🔍 **Found ${searchResults.length} employees matching your search:**\n\n` +
            searchResults.slice(0, 5).map(e => `- **${e.name}** (${e.employee_id}) - ${e.position} in ${e.department_code}`).join('\n') +
            `\n\n*Try searching with employee ID, full name, or position for better results.*`;
        }
      }
      
      if (context.currentEmployee) {
        const emp = context.currentEmployee;
        const dept = await getDepartmentByCode(emp.department_code);
        const yearsOfService = new Date().getFullYear() - new Date(emp.join_date).getFullYear();

        return `👤 **${emp.name}** - Complete Profile\n\n` +
          `**Professional Information:**\n` +
          `- **Employee ID**: ${emp.employee_id}\n` +
          `- **Department**: ${dept ? dept.dept_name : emp.department_code}\n` +
          `- **Position**: ${emp.position}\n` +
          `- **Grade**: ${emp.grade}\n` +
          `- **Salary**: RM${emp.salary.toLocaleString()}\n` +
          `- **Status**: ${emp.status}\n` +
          `- **Years of Service**: ${yearsOfService} years\n\n` +
          `**Personal Information:**\n` +
          `- **Gender**: ${emp.gender}\n` +
          `- **Nationality**: ${emp.nationality}\n` +
          `- **Religion**: ${emp.religion}\n` +
          `- **Education Level**: ${emp.education_level}\n` +
          `- **Native Status**: ${emp.native_status}\n\n` +
          `**Contact & Work Details:**\n` +
          `- **Email**: ${emp.email}\n` +
          `- **Phone**: ${emp.phone}\n` +
          `- **Work Location**: ${emp.work_location}\n` +
          `- **Supervisor**: ${emp.supervisor}\n` +
          `- **Join Date**: ${new Date(emp.join_date).toLocaleDateString()}`;
      } else {
        const stats = context.statistics;

        return `👥 **Employee Overview**\n\n` +
          `**Current Selection:**\n` +
          `- **Total Employees**: ${context.totalEmployees.toLocaleString()}\n` +
          `- **Department Employees**: ${context.departmentEmployees.length}\n` +
          `- **Active Employees**: ${stats?.activeEmployees || 0}\n` +
          `- **Average Salary**: RM${stats?.avgSalary?.toLocaleString() || 0}\n\n` +
          `**Top Positions:**\n` +
          stats?.topPositions.slice(0, 3).map(([pos, count]) => `- ${pos}: ${count} employees`).join('\n') +
          `\n\n**Demographics:**\n` +
          `- Malaysian: ${stats?.demographics?.nationality?.Malaysian || 0}\n` +
          `- Degree Holders: ${stats?.demographics?.education?.Degree || 0}\n\n` +
          `*Use the employee filter or search by name/ID for specific employee details.*`;
      }
    }
    
    // Salary and compensation queries
    if (lowerQuery.includes('salary') || lowerQuery.includes('pay') || lowerQuery.includes('compensation')) {
      const stats = context.statistics;
      const salaries = context.departmentEmployees.map((e: any) => e.salary);

      const salaryRanges = {
        'Below RM3,000': salaries.filter(s => s < 3000).length,
        'RM3,000 - RM5,000': salaries.filter(s => s >= 3000 && s < 5000).length,
        'RM5,000 - RM8,000': salaries.filter(s => s >= 5000 && s < 8000).length,
        'Above RM8,000': salaries.filter(s => s >= 8000).length
      };

      return `💰 **Salary Analysis**\n\n` +
        `**Salary Statistics:**\n` +
        `- **Average Salary**: RM${stats?.avgSalary?.toLocaleString() || 0}\n` +
        `- **Minimum Salary**: RM${stats?.minSalary?.toLocaleString() || 0}\n` +
        `- **Maximum Salary**: RM${stats?.maxSalary?.toLocaleString() || 0}\n\n` +
        `**Salary Distribution:**\n` +
        Object.entries(salaryRanges).map(([range, count]) => `- ${range}: ${count} employees`).join('\n') +
        `\n\n*Salary data is based on current department selection.*`;
    }
    
    // Position and hierarchy queries
    if (lowerQuery.includes('position') || lowerQuery.includes('job') || lowerQuery.includes('role')) {
      const stats = context.statistics;
      const grades = context.departmentEmployees.reduce((acc: any, emp: any) => {
        acc[emp.grade] = (acc[emp.grade] || 0) + 1;
        return acc;
      }, {});

      return `💼 **Position Analysis**\n\n` +
        `**Most Common Positions:**\n` +
        stats?.topPositions.slice(0, 10).map(([pos, count]) => `- **${pos}**: ${count} employees`).join('\n') +
        `\n\n**Grade Distribution:**\n` +
        Object.entries(grades)
          .slice(0, 5)
          .map(([grade, count]) => `- ${grade}: ${count} employees`)
          .join('\n') +
        `\n\n*Data based on current department selection.*`;
    }
    
    // Demographics queries
    if (lowerQuery.includes('demographic') || lowerQuery.includes('nationality') || lowerQuery.includes('religion') || lowerQuery.includes('gender')) {
      const stats = context.statistics;

      return `📊 **Demographics Analysis**\n\n` +
        `**Nationality:**\n` +
        Object.entries(stats?.demographics?.nationality || {}).map(([nat, count]) => `- ${nat}: ${count} employees`).join('\n') +
        `\n\n**Religion:**\n` +
        Object.entries(stats?.demographics?.religion || {}).map(([rel, count]) => `- ${rel}: ${count} employees`).join('\n') +
        `\n\n**Gender:**\n` +
        Object.entries(stats?.demographics?.gender || {}).map(([gen, count]) => `- ${gen}: ${count} employees`).join('\n') +
        `\n\n**Education Level:**\n` +
        Object.entries(stats?.demographics?.education || {}).map(([edu, count]) => `- ${edu}: ${count} employees`).join('\n');
    }

    // Attendance queries for today
    if (lowerQuery.includes('today') || lowerQuery.includes('attendance') || lowerQuery.includes('present') ||
        lowerQuery.includes('absent') || lowerQuery.includes('late') || lowerQuery.includes('medical leave') ||
        lowerQuery.includes('check in') || lowerQuery.includes('checked in')) {

      const attendanceStats = await getTodayAttendanceStats(
        context.currentDepartment ? context.currentDepartment.dept_code : undefined,
        context.currentEmployee ? context.currentEmployee.employee_id : undefined
      );

      const todayDate = new Date().toLocaleDateString('en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let contextInfo = '';
      if (context.currentDepartment) {
        contextInfo = ` in ${context.currentDepartment.dept_name}`;
      } else if (context.currentEmployee) {
        contextInfo = ` for ${context.currentEmployee.name}`;
      }

      // Check for specific targeted questions
      const isHowManyQuestion = lowerQuery.includes('how many');

      // Handle specific "how many" questions with targeted answers
      if (isHowManyQuestion) {
        // Medical leave specific
        if (lowerQuery.includes('not') && (lowerQuery.includes('medical leave') || lowerQuery.includes('mc'))) {
          const notOnMC = attendanceStats.totalEmployees - attendanceStats.onMedicalLeave;
          return `🏥 **Medical Leave Status${contextInfo}** (${todayDate})\n\n` +
            `**Employees NOT on Medical Leave:** ${notOnMC} out of ${attendanceStats.totalEmployees}\n` +
            `**Employees on Medical Leave:** ${attendanceStats.onMedicalLeave}\n\n` +
            `*${((notOnMC / attendanceStats.totalEmployees) * 100).toFixed(1)}% of employees are not on medical leave today.*`;
        }

        if (lowerQuery.includes('medical leave') || lowerQuery.includes('mc')) {
          return `🏥 **Medical Leave Today${contextInfo}** (${todayDate})\n\n` +
            `**Employees on Medical Leave:** ${attendanceStats.onMedicalLeave} out of ${attendanceStats.totalEmployees}\n\n` +
            `*${((attendanceStats.onMedicalLeave / attendanceStats.totalEmployees) * 100).toFixed(1)}% of employees are on medical leave today.*`;
        }

        // Absent specific
        if (lowerQuery.includes('absent')) {
          return `❌ **Absent Employees${contextInfo}** (${todayDate})\n\n` +
            `**Absent:** ${attendanceStats.absent} out of ${attendanceStats.totalEmployees} employees\n\n` +
            `*${((attendanceStats.absent / attendanceStats.totalEmployees) * 100).toFixed(1)}% absence rate today.*`;
        }

        // Late specific
        if (lowerQuery.includes('late')) {
          return `⏰ **Late Check-Ins${contextInfo}** (${todayDate})\n\n` +
            `**Late Employees:** ${attendanceStats.late} out of ${attendanceStats.totalEmployees}\n\n` +
            `*${((attendanceStats.late / attendanceStats.totalEmployees) * 100).toFixed(1)}% of employees checked in late today.*`;
        }

        // Check in specific
        if (lowerQuery.includes('check in') || lowerQuery.includes('checked in')) {
          const checkedIn = attendanceStats.present + attendanceStats.late;
          return `✅ **Check-In Summary${contextInfo}** (${todayDate})\n\n` +
            `**Total Checked In:** ${checkedIn} out of ${attendanceStats.totalEmployees} employees\n` +
            `- On Time: ${attendanceStats.present}\n` +
            `- Late: ${attendanceStats.late}\n\n` +
            `*${((checkedIn / attendanceStats.totalEmployees) * 100).toFixed(1)}% check-in rate today.*`;
        }

        // Present/On time specific
        if (lowerQuery.includes('present') || lowerQuery.includes('on time')) {
          return `✅ **Present Today${contextInfo}** (${todayDate})\n\n` +
            `**On-Time Check-Ins:** ${attendanceStats.present} out of ${attendanceStats.totalEmployees} employees\n\n` +
            `*${((attendanceStats.present / attendanceStats.totalEmployees) * 100).toFixed(1)}% punctuality rate today.*`;
        }

        // Leave specific
        if (lowerQuery.includes('leave') && !lowerQuery.includes('medical')) {
          return `🏖️ **On Leave Today${contextInfo}** (${todayDate})\n\n` +
            `**Employees on Leave:** ${attendanceStats.onLeave} out of ${attendanceStats.totalEmployees}\n\n` +
            `*${((attendanceStats.onLeave / attendanceStats.totalEmployees) * 100).toFixed(1)}% of employees are on leave today.*`;
        }
      }

      // Full attendance report for general queries
      let response = `📅 **Attendance Report${contextInfo}** (${todayDate})\n\n`;

      response += `**Overall Summary:**\n` +
        `- **Total Employees**: ${attendanceStats.totalEmployees}\n` +
        `- **Total Records Today**: ${attendanceStats.total}\n\n` +
        `**Attendance Breakdown:**\n` +
        `- ✅ **Checked In (On Time)**: ${attendanceStats.present} employees\n` +
        `- ⏰ **Late Check-In**: ${attendanceStats.late} employees\n` +
        `- ❌ **Absent**: ${attendanceStats.absent} employees\n` +
        `- 🏥 **Medical Leave (MC)**: ${attendanceStats.onMedicalLeave} employees\n` +
        `- 🏖️ **On Leave**: ${attendanceStats.onLeave} employees\n` +
        `- 🎉 **Holiday**: ${attendanceStats.holiday} employees\n` +
        `- ⚠️ **Not Checked In Yet**: ${attendanceStats.notCheckedIn} employees\n\n`;

      // Calculate percentages
      if (attendanceStats.totalEmployees > 0) {
        const presentPercentage = ((attendanceStats.present / attendanceStats.totalEmployees) * 100).toFixed(1);
        const latePercentage = ((attendanceStats.late / attendanceStats.totalEmployees) * 100).toFixed(1);
        const absentPercentage = ((attendanceStats.absent / attendanceStats.totalEmployees) * 100).toFixed(1);

        response += `**Attendance Rates:**\n` +
          `- Present Rate: ${presentPercentage}%\n` +
          `- Late Rate: ${latePercentage}%\n` +
          `- Absent Rate: ${absentPercentage}%\n\n`;
      }

      response += `*Use the dashboard for detailed individual attendance records.*`;

      return response;
    }

    // Individual employee attendance and leave queries
    const empIdMatch = lowerQuery.match(/sg\d{6}/i);
    if (empIdMatch || lowerQuery.includes('attendance for') || lowerQuery.includes('leave for') ||
        lowerQuery.includes('attendance of') || lowerQuery.includes('leave of') ||
        lowerQuery.includes('attendance record') || lowerQuery.includes('leave record') ||
        lowerQuery.includes('attendance information')) {

      let employeeId = empIdMatch ? empIdMatch[0].toUpperCase() : null;

      // If no employee ID found, try to search by name
      if (!employeeId) {
        const searchTerm = lowerQuery
          .replace(/attendance|leave|show|tell|about|me|information|info|details|for|of|record|today|now|current/g, '')
          .trim();

        if (searchTerm && searchTerm.length > 2) {
          const searchResults = await searchEmployees(searchTerm);
          if (searchResults.length > 0) {
            employeeId = searchResults[0].employee_id;
          }
        }
      }

      if (employeeId) {
        // Check if asking about today's attendance
        if (lowerQuery.includes('today') || lowerQuery.includes('now') || lowerQuery.includes('current')) {
          const todayData = await getEmployeeTodayAttendance(employeeId);

          if (todayData) {
            const { employee, record } = todayData;
            const todayDate = new Date().toLocaleDateString('en-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            if (record) {
              let statusEmoji = '✅';
              if (record.status === 'Late') statusEmoji = '⏰';
              else if (record.status === 'Absent') statusEmoji = '❌';
              else if (record.status === 'On Leave') statusEmoji = '🏖️';
              else if (record.status === 'Medical Leave') statusEmoji = '🏥';

              return `${statusEmoji} **${employee.name}'s Attendance Today**\n\n` +
                `**Date:** ${todayDate}\n` +
                `**Employee:** ${employee.name} (${employee.employee_id})\n` +
                `**Department:** ${employee.department_code}\n` +
                `**Position:** ${employee.position}\n\n` +
                `**Attendance Details:**\n` +
                `- **Status**: ${record.status}\n` +
                `- **Clock In**: ${record.clock_in || 'Not checked in'}\n` +
                `- **Clock Out**: ${record.clock_out || 'Not checked out yet'}\n` +
                `- **Hours Worked**: ${record.hours_worked || 0} hours\n` +
                `- **Location**: ${record.location}\n` +
                `${record.notes ? `- **Notes**: ${record.notes}\n` : ''}` +
                `\n*Real-time attendance data from the database.*`;
            } else {
              return `⚠️ **${employee.name}'s Attendance Today**\n\n` +
                `**Date:** ${todayDate}\n` +
                `**Employee:** ${employee.name} (${employee.employee_id})\n` +
                `**Department:** ${employee.department_code}\n` +
                `**Position:** ${employee.position}\n` +
                `**Status:** ${employee.status}\n\n` +
                `**No attendance record found for today.**\n\n` +
                `This employee has not checked in yet today.`;
            }
          }
        }

        // Check if asking about leave records
        if (lowerQuery.includes('leave')) {
          const leaveData = await getEmployeeLeaveRecords(employeeId, 10);

          if (leaveData) {
            const { employee, records } = leaveData;

            if (records.length > 0) {
              const leaveList = records.map(r =>
                `- **${new Date(r.date).toLocaleDateString()}**: ${r.status}${r.notes ? ` - ${r.notes}` : ''}`
              ).join('\n');

              return `🏖️ **${employee.name}'s Leave Records**\n\n` +
                `**Employee:** ${employee.name} (${employee.employee_id})\n` +
                `**Department:** ${employee.department_code}\n` +
                `**Total Leave Records:** ${records.length}\n\n` +
                `**Recent Leave History (Last 10):**\n${leaveList}\n\n` +
                `*Leave data from the attendance database.*`;
            } else {
              return `✅ **${employee.name}'s Leave Records**\n\n` +
                `**Employee:** ${employee.name} (${employee.employee_id})\n` +
                `**Department:** ${employee.department_code}\n\n` +
                `**No leave records found.**\n\n` +
                `This employee has no recorded leave history in the system.`;
            }
          }
        }

        // General attendance records
        const attendanceData = await getEmployeeAttendanceByEmployeeId(employeeId, 15);

        if (attendanceData) {
          const { employee, records } = attendanceData;

          if (records.length > 0) {
            const stats = {
              present: records.filter(r => r.status === 'Present').length,
              late: records.filter(r => r.status === 'Late').length,
              absent: records.filter(r => r.status === 'Absent').length,
              onLeave: records.filter(r => r.status.includes('Leave')).length,
            };

            const recentRecords = records.slice(0, 10).map(r =>
              `- **${new Date(r.date).toLocaleDateString()}**: ${r.status} | In: ${r.clock_in || 'N/A'} | Out: ${r.clock_out || 'N/A'}`
            ).join('\n');

            return `📊 **${employee.name}'s Attendance Records**\n\n` +
              `**Employee:** ${employee.name} (${employee.employee_id})\n` +
              `**Department:** ${employee.department_code}\n` +
              `**Total Records:** ${records.length}\n\n` +
              `**Summary (Last ${records.length} days):**\n` +
              `- ✅ Present: ${stats.present} days\n` +
              `- ⏰ Late: ${stats.late} days\n` +
              `- ❌ Absent: ${stats.absent} days\n` +
              `- 🏖️ On Leave: ${stats.onLeave} days\n\n` +
              `**Recent Attendance (Last 10 days):**\n${recentRecords}\n\n` +
              `*Attendance data from the database.*`;
          } else {
            return `⚠️ **${employee.name}'s Attendance Records**\n\n` +
              `**Employee:** ${employee.name} (${employee.employee_id})\n` +
              `**Department:** ${employee.department_code}\n\n` +
              `**No attendance records found.**\n\n` +
              `This employee has no recorded attendance history in the system.`;
          }
        }
      }
    }

    // Statistics queries
    if (lowerQuery.includes('statistic') || lowerQuery.includes('data') || lowerQuery.includes('number')) {
      const stats = context.statistics;
      const avgAge = Math.round(context.departmentEmployees.reduce((sum: number, e: any) => {
        const age = new Date().getFullYear() - new Date(e.join_date).getFullYear();
        return sum + age;
      }, 0) / context.departmentEmployees.length);

      return `📊 **Comprehensive Statistics**\n\n` +
        `**System Overview:**\n` +
        `- **Total Departments**: ${context.totalDepartments}\n` +
        `- **Total Employees**: ${context.totalEmployees.toLocaleString()}\n` +
        `- **Current Department**: ${context.currentDepartment ? context.currentDepartment.dept_name : 'All Departments'}\n` +
        `- **Department Employees**: ${context.departmentEmployees.length}\n` +
        `- **Active Employees**: ${stats?.activeEmployees || 0}\n\n` +
        `**Department Insights:**\n` +
        `- **Average Years of Service**: ${avgAge} years\n` +
        `- **Malaysian Citizens**: ${stats?.demographics?.nationality?.Malaysian || 0}\n` +
        `- **Degree Holders**: ${stats?.demographics?.education?.Degree || 0}\n` +
        `- **Male/Female Ratio**: ${stats?.demographics?.gender?.Male || 0}:${stats?.demographics?.gender?.Female || 0}\n\n` +
        `*The dashboard shows real-time attendance and performance data.*`;
    }
    
    // Default response
    return `**I can help you with:**\n\n**Department Information**\n- "Show me department 11D" or "Tell me about JPA"\n- "List all departments"\n- Department employee counts and structure\n\n**Employee Data**\n- "Show employee SG000001" or "Tell me about Ahmad"\n- "Show Crystal Wong attendance information"\n- Individual employee profiles and details\n- Salary and position information\n\n**Individual Employee Attendance & Leave**\n- "Show attendance for SG000001" or "Show attendance for Crystal Wong"\n- "What is Ahmad's attendance today?"\n- "Show leave records for SG000500"\n- "Is employee SG000001 on leave today?"\n- "Show John Doe attendance records"\n\n**Attendance Queries (Today)**\n- "How many employees checked in today?"\n- "How many people are late today?"\n- "How many employees are absent today?"\n- "How many are on medical leave today?"\n- "Show today's attendance report"\n\n**Analytics**\n- "Show salary statistics" or "Demographics analysis"\n- Position and grade distributions\n- Real-time attendance data\n\n**Example Queries:**\n- "Show me information about department 33J"\n- "Tell me about employee Ahmad"\n- "What is Crystal Wong's attendance today?"\n- "Show leave records for SG000001"\n- "How many employees are not on medical leave today?"\n\n**💡 Tip:** You can search by employee name OR employee ID!\n\n*I have access to ${context.departmentsWithEmployees} departments with employees (${context.totalDepartments} total) and ${context.totalEmployees.toLocaleString()} employees with real-time attendance data!*`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50 group animate-pulse"
      >
        <div className="relative">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mr-1">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Assistant
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50 transition-all duration-300`}>
      <div className={`bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } transition-all duration-300`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 animate-pulse bg-emerald-400"></div>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm flex items-center">
                <Zap className="w-3 h-3 mr-1 text-emerald-400" />
                Bayu Chat
              </h3>
              <p className="text-emerald-300 text-xs flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Online
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Clear Chat"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 border border-white/20'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <div className="relative">
                          <Brain className="w-4 h-4 text-white" />
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30'
                        : 'bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-slate-600/30'
                    }`}>
                      <div className="text-white text-sm">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-blue-300">{children}</strong>,
                            code: ({ children }) => <code className="bg-slate-800/50 px-1 py-0.5 rounded text-xs font-mono text-cyan-300">{children}</code>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-blue-300">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-blue-300">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-blue-300">{children}</h3>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {message.isStreaming && (
                          <div className="flex items-center mt-2">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400 mr-1" />
                            <span className="text-xs text-blue-300">Thinking...</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-blue-500/20">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about departments, employees, or anything..."
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Database className="w-4 h-4 text-blue-400" title="Database Access" />
                    <Globe className="w-4 h-4 text-green-400" title="Internet Access" />
                    <div className={`w-2 h-2 rounded-full ${
                      llmConfig && llmConfig.apiKey ? 'bg-emerald-400' : 'bg-red-400'
                    }`} title={llmConfig && llmConfig.apiKey ? 'LLM Connected' : 'LLM Not Configured'} />
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-4 h-4" />
                      <Zap className="w-3 h-3 ml-1 text-emerald-200" />
                    </div>
                  )}
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setInput("Show today's attendance report")}
                  className="text-xs bg-emerald-600/20 text-emerald-300 px-3 py-1 rounded-full hover:bg-emerald-600/30 transition-colors border border-emerald-500/20"
                >
                  <Database className="w-3 h-3 inline mr-1" />
                  Today's Attendance
                </button>
                <button
                  onClick={() => setInput("How many employees are late today?")}
                  className="text-xs bg-cyan-600/20 text-cyan-300 px-3 py-1 rounded-full hover:bg-cyan-600/30 transition-colors border border-cyan-500/20"
                >
                  <Users className="w-3 h-3 inline mr-1" />
                  Late Today
                </button>
                <button
                  onClick={() => setInput("Show salary statistics and demographics")}
                  className="text-xs bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full hover:bg-blue-600/30 transition-colors border border-blue-500/20"
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Statistics
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;