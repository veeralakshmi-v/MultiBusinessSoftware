import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Phone, Mail, MapPin, 
  Building2, Briefcase, Calendar, DollarSign, Clock, ShieldCheck, 
  Edit2, Trash2, Eye, CheckCircle2, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, X, Plus, FileText, CreditCard,
  UserCheck, Shield, Award, ArrowUpRight, History, LogOut, Coffee, BarChart3, Palmtree, Bell, Server
} from 'lucide-react';
import { Employee, EmployeeStatus, EmployeeShift, EmployeeTimelineEvent } from '../types/employee';
import { EmployeeEngine } from '../lib/employees/employeeEngine';
import DepartmentManagementStudio from '../components/departments/DepartmentManagementStudio';
import DesignationManagementStudio from '../components/designations/DesignationManagementStudio';
import ShiftManagementStudio from '../components/shifts/ShiftManagementStudio';
import LeaveManagementStudio from '../components/leave/LeaveManagementStudio';
import GeoLocationAttendanceStudio from '../components/attendance/GeoLocationAttendanceStudio';
import OfficeLocationStudio from '../components/locations/OfficeLocationStudio';
import PunchInStudio from '../components/punch/PunchInStudio';
import PunchOutStudio from '../components/punch/PunchOutStudio';
import BreakManagementStudio from '../components/breaks/BreakManagementStudio';
import AttendanceDashboardStudio from '../components/attendance/AttendanceDashboardStudio';
import AttendanceReportsStudio from '../components/reports/AttendanceReportsStudio';
import AttendanceCalendarStudio from '../components/attendance/AttendanceCalendarStudio';
import HolidayManagementStudio from '../components/holidays/HolidayManagementStudio';
import AttendancePermissionsStudio from '../components/permissions/AttendancePermissionsStudio';
import AttendanceNotificationStudio from '../components/notifications/AttendanceNotificationStudio';
import AttendanceAPIStudio from '../components/api/AttendanceAPIStudio';
import { cn } from '../lib/utils';

type EmpTab = 'EMPLOYEES' | 'DEPARTMENTS' | 'DESIGNATIONS' | 'SHIFTS' | 'LEAVE' | 'GEO_ATTENDANCE' | 'OFFICE_LOCATIONS' | 'PUNCH_IN' | 'PUNCH_OUT' | 'BREAKS' | 'DASHBOARD' | 'REPORTS' | 'CALENDAR' | 'HOLIDAYS' | 'PERMISSIONS' | 'NOTIFICATIONS' | 'API_STUDIO';

export default function EmployeeManagement({ initialTab = 'EMPLOYEES' }: { initialTab?: EmpTab } = {}) {
  const [currentTab, setCurrentTab] = useState<EmpTab>(initialTab);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [branchId, setBranchId] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [employeesData, setEmployeesData] = useState(EmployeeEngine.getEmployees({ pageSize, page: 1 }));
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<EmployeeTimelineEvent[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'PERSONAL' | 'ROLE' | 'KYC' | 'EMERGENCY'>('PERSONAL');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    photoUrl: '',
    mobile: '',
    email: '',
    address: '',
    department: 'Billing & Cash Desk',
    designation: 'POS Cashier',
    role: 'CASHIER' as Employee['role'],
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: 30000,
    shift: 'MORNING' as EmployeeShift,
    branchId: 'br-chennai-main',
    branchName: 'Chennai Flagship Outlet',
    status: 'ACTIVE' as EmployeeStatus,
    aadharNumber: '',
    panNumber: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankName: 'HDFC Bank',
      ifscCode: 'HDFC0001245',
      branch: 'Chennai Main',
    },
    emergencyContact: {
      name: '',
      relationship: 'Parent',
      phone: '',
    },
    reportingManager: 'Anitha Venkatesh',
  });

  const refreshData = () => {
    const res = EmployeeEngine.getEmployees({
      search,
      department,
      branchId,
      status,
      page,
      pageSize,
    });
    setEmployeesData(res);
  };

  useEffect(() => {
    refreshData();
  }, [search, department, branchId, status, page]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      employeeId: '',
      photoUrl: '',
      mobile: '',
      email: '',
      address: '',
      department: 'Billing & Cash Desk',
      designation: 'POS Cashier',
      role: 'CASHIER',
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: 30000,
      shift: 'MORNING',
      branchId: 'br-chennai-main',
      branchName: 'Chennai Flagship Outlet',
      status: 'ACTIVE',
      aadharNumber: '',
      panNumber: '',
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001245',
        branch: 'Chennai Main',
      },
      emergencyContact: {
        name: '',
        relationship: 'Parent',
        phone: '',
      },
      reportingManager: 'Anitha Venkatesh',
    });
    setActiveFormTab('PERSONAL');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      employeeId: emp.employeeId,
      photoUrl: emp.photoUrl,
      mobile: emp.mobile,
      email: emp.email,
      address: emp.address,
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
      shift: emp.shift,
      branchId: emp.branchId,
      branchName: emp.branchName,
      status: emp.status,
      aadharNumber: emp.aadharNumber,
      panNumber: emp.panNumber,
      bankDetails: { ...emp.bankDetails },
      emergencyContact: { ...emp.emergencyContact },
      reportingManager: emp.reportingManager,
    });
    setActiveFormTab('PERSONAL');
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      alert('Please fill out required fields (Name and Mobile).');
      return;
    }

    if (editingEmployee) {
      EmployeeEngine.updateEmployee(editingEmployee.id, formData);
    } else {
      EmployeeEngine.addEmployee({
        ...formData,
        documents: [],
      });
    }

    setIsFormModalOpen(false);
    refreshData();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove employee "${name}"?`)) {
      EmployeeEngine.deleteEmployee(id);
      refreshData();
      if (selectedEmployee?.id === id) {
        setIsProfileModalOpen(false);
      }
    }
  };

  const handleToggleStatus = (id: string, currentStatus: EmployeeStatus) => {
    const nextStatus: EmployeeStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    EmployeeEngine.setEmployeeStatus(id, nextStatus);
    refreshData();
  };

  const handleViewProfile = (emp: Employee) => {
    setSelectedEmployee(emp);
    const events = EmployeeEngine.getTimeline(emp.id);
    setTimelineEvents(events);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 font-sans">
      
      {/* Module Navigation Tabs */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
      <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-3 w-max min-w-full">
        <button
          onClick={() => setCurrentTab('EMPLOYEES')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'EMPLOYEES'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Staff Directory (Feature 2)
        </button>

        <button
          onClick={() => setCurrentTab('DEPARTMENTS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'DEPARTMENTS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Building2 className="w-4 h-4" />
          Department Management (Feature 3)
        </button>

        <button
          onClick={() => setCurrentTab('DESIGNATIONS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'DESIGNATIONS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Award className="w-4 h-4" />
          Designation Management (Feature 4)
        </button>

        <button
          onClick={() => setCurrentTab('SHIFTS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'SHIFTS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Clock className="w-4 h-4" />
          Shift Management (Feature 5)
        </button>

        <button
          onClick={() => setCurrentTab('LEAVE')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'LEAVE'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Calendar className="w-4 h-4" />
          Leave Management (Feature 6)
        </button>

        <button
          onClick={() => setCurrentTab('GEO_ATTENDANCE')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'GEO_ATTENDANCE'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <MapPin className="w-4 h-4" />
          Geo Attendance (Feature 7)
        </button>

        <button
          onClick={() => setCurrentTab('OFFICE_LOCATIONS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'OFFICE_LOCATIONS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Building2 className="w-4 h-4" />
          Office Locations (Feature 8)
        </button>

        <button
          onClick={() => setCurrentTab('PUNCH_IN')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'PUNCH_IN'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Clock className="w-4 h-4" />
          Punch In (Feature 10)
        </button>

        <button
          onClick={() => setCurrentTab('PUNCH_OUT')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'PUNCH_OUT'
              ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <LogOut className="w-4 h-4" />
          Punch Out (Feature 11)
        </button>

        <button
          onClick={() => setCurrentTab('BREAKS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'BREAKS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Coffee className="w-4 h-4" />
          Breaks (Feature 12)
        </button>

        <button
          onClick={() => setCurrentTab('DASHBOARD')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'DASHBOARD'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard (Feature 13)
        </button>

        <button
          onClick={() => setCurrentTab('REPORTS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'REPORTS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <FileText className="w-4 h-4" />
          Reports (Feature 14)
        </button>

        <button
          onClick={() => setCurrentTab('CALENDAR')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'CALENDAR'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Calendar className="w-4 h-4" />
          Calendar (Feature 15)
        </button>

        <button
          onClick={() => setCurrentTab('HOLIDAYS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'HOLIDAYS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Palmtree className="w-4 h-4" />
          Holidays (Feature 16)
        </button>

        <button
          onClick={() => setCurrentTab('PERMISSIONS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'PERMISSIONS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Shield className="w-4 h-4" />
          Permissions (Feature 17)
        </button>

        <button
          onClick={() => setCurrentTab('NOTIFICATIONS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'NOTIFICATIONS'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Bell className="w-4 h-4" />
          Notifications (Feature 18)
        </button>

        <button
          onClick={() => setCurrentTab('API_STUDIO')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            currentTab === 'API_STUDIO'
              ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
          )}
        >
          <Server className="w-4 h-4" />
          API Studio (Feature 20 & 21)
        </button>
      </div>{/* inner flex row */}
      </div>{/* outer overflow-x-auto wrapper */}

      {currentTab === 'DEPARTMENTS' && <DepartmentManagementStudio />}
      {currentTab === 'DESIGNATIONS' && <DesignationManagementStudio />}
      {currentTab === 'SHIFTS' && <ShiftManagementStudio />}
      {currentTab === 'LEAVE' && <LeaveManagementStudio />}
      {currentTab === 'GEO_ATTENDANCE' && <GeoLocationAttendanceStudio />}
      {currentTab === 'OFFICE_LOCATIONS' && <OfficeLocationStudio />}
      {currentTab === 'PUNCH_IN' && <PunchInStudio />}
      {currentTab === 'PUNCH_OUT' && <PunchOutStudio />}
      {currentTab === 'BREAKS' && <BreakManagementStudio />}
      {currentTab === 'DASHBOARD' && <AttendanceDashboardStudio />}
      {currentTab === 'REPORTS' && <AttendanceReportsStudio />}
      {currentTab === 'CALENDAR' && <AttendanceCalendarStudio />}
      {currentTab === 'HOLIDAYS' && <HolidayManagementStudio />}
      {currentTab === 'PERMISSIONS' && <AttendancePermissionsStudio />}
      {currentTab === 'NOTIFICATIONS' && <AttendanceNotificationStudio />}
      {currentTab === 'API_STUDIO' && <AttendanceAPIStudio />}
      {currentTab === 'EMPLOYEES' && (
        <>
          {/* Top Banner & KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-gray-400 text-xs font-mono uppercase block">Total Headcount</span>
                <strong className="text-2xl font-bold text-white mt-0.5 block">{employeesData.totalCount} Staff</strong>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                <Users className="w-5 h-5" />
              </div>
            </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-400 text-xs font-mono uppercase block">Active on Duty</span>
            <strong className="text-2xl font-bold text-emerald-400 mt-0.5 block">
              {employeesData.employees.filter(e => e.status === 'ACTIVE').length} Active
            </strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-400 text-xs font-mono uppercase block">On Leave</span>
            <strong className="text-2xl font-bold text-amber-400 mt-0.5 block">
              {employeesData.employees.filter(e => e.status === 'ON_LEAVE').length} Staff
            </strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-gray-400 text-xs font-mono uppercase block">Multi-Branch Outlets</span>
            <strong className="text-2xl font-bold text-white mt-0.5 block">3 Branches</strong>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl shadow-xl p-6 space-y-6">
        
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C5A059]" />
              Employee & Staff Directory
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Comprehensive staff profiles, 20-field records, branch shifts, and chronological audit timelines.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] self-start lg:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, Employee ID, Mobile..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={e => { setDepartment(e.target.value); setPage(1); }}
              className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Billing & Cash Desk">Billing & Cash Desk</option>
              <option value="Kitchen & Culinary">Kitchen & Culinary</option>
              <option value="Management & Operations">Management & Operations</option>
              <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
              <option value="Customer Service & Floor">Customer Service & Floor</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchId}
              onChange={e => { setBranchId(e.target.value); setPage(1); }}
              className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
            >
              <option value="ALL">All Branches</option>
              <option value="br-chennai-main">Chennai Flagship Outlet</option>
              <option value="br-bangalore-outlet">Bangalore Tech Park Branch</option>
              <option value="br-mumbai-hub">Mumbai Bandra Hub</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PROBATION">Probation</option>
            </select>
          </div>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employeesData.employees.map(emp => (
            <div 
              key={emp.id}
              className="p-5 bg-[#0A0A0B] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl transition-all shadow-md flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.photoUrl}
                    alt={emp.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#2D2D30] flex-shrink-0"
                  />
                  <div>
                    <strong className="text-sm font-bold text-white block group-hover:text-[#C5A059] transition-colors">
                      {emp.name}
                    </strong>
                    <span className="text-[11px] text-gray-400 block">{emp.designation}</span>
                    <span className="text-[10px] font-mono text-[#C5A059]">{emp.employeeId}</span>
                  </div>
                </div>

                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono",
                  emp.status === 'ACTIVE' && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                  emp.status === 'ON_LEAVE' && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                  emp.status === 'INACTIVE' && "bg-gray-800 text-gray-400 border border-gray-700",
                  emp.status === 'PROBATION' && "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                )}>
                  {emp.status}
                </span>
              </div>

              {/* Card Body Details */}
              <div className="space-y-1.5 text-xs text-gray-400 pt-2 border-t border-[#1F1F21]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Building2 className="w-3.5 h-3.5" /> Department:
                  </span>
                  <span className="text-gray-300">{emp.department}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-3.5 h-3.5" /> Branch:
                  </span>
                  <span className="text-gray-300 truncate max-w-[150px]">{emp.branchName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5" /> Shift:
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#131315] text-gray-300 font-mono text-[10px]">
                    {emp.shift}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Phone className="w-3.5 h-3.5" /> Mobile:
                  </span>
                  <span className="text-gray-300 font-mono text-[11px]">{emp.mobile}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21]">
                <button
                  onClick={() => handleViewProfile(emp)}
                  className="px-3 py-1.5 rounded-lg bg-[#131315] hover:bg-[#1C1C1F] text-gray-300 hover:text-[#C5A059] text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Profile & Timeline
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 rounded-lg bg-[#131315] hover:bg-[#1C1C1F] text-gray-400 hover:text-white transition-colors"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(emp.id, emp.status)}
                    className="p-1.5 rounded-lg bg-[#131315] hover:bg-[#1C1C1F] text-gray-400 hover:text-amber-400 transition-colors"
                    title={emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  >
                    {emp.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDelete(emp.id, emp.name)}
                    className="p-1.5 rounded-lg bg-[#131315] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Empty State */}
        {employeesData.employees.length === 0 && (
          <div className="p-12 text-center bg-[#0A0A0B] border border-[#1F1F21] rounded-2xl space-y-3">
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <strong className="text-white text-sm block">No Employees Found</strong>
            <p className="text-xs text-gray-500">Try adjusting your search criteria or add a new staff member.</p>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1F1F21]">
          <span className="text-xs text-gray-400 font-mono">
            Showing Page <strong>{employeesData.currentPage}</strong> of <strong>{employeesData.totalPages}</strong> ({employeesData.totalCount} total staff)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-[#0A0A0B] border border-[#1F1F21] text-xs text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C5A059] transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {Array.from({ length: employeesData.totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all",
                  page === pageNum
                    ? "bg-[#C5A059] text-[#0A0A0B]"
                    : "bg-[#0A0A0B] border border-[#1F1F21] text-gray-400 hover:text-white"
                )}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(employeesData.totalPages, p + 1))}
              disabled={page >= employeesData.totalPages}
              className="px-3 py-1.5 rounded-lg bg-[#0A0A0B] border border-[#1F1F21] text-xs text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#C5A059] transition-all flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
      </>
      )}

      {/* PROFILE & TIMELINE MODAL */}
      {isProfileModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployee.photoUrl}
                  alt={selectedEmployee.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#2D2D30]"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEmployee.name}</h3>
                  <p className="text-xs text-gray-400">{selectedEmployee.designation} • <span className="font-mono text-[#C5A059]">{selectedEmployee.employeeId}</span></p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-xl bg-[#0A0A0B] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid: Left 20-Field Specs, Right Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Comprehensive Employee Profile Details */}
              <div className="lg:col-span-6 space-y-4 text-xs font-mono">
                
                {/* Contact & Personal */}
                <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">1. Contact & Address</span>
                  <div className="text-gray-300 space-y-1">
                    <div>📱 Mobile: <strong className="text-white">{selectedEmployee.mobile}</strong></div>
                    <div>✉️ Email: <strong className="text-white">{selectedEmployee.email}</strong></div>
                    <div>📍 Address: <span className="text-gray-400">{selectedEmployee.address}</span></div>
                    <div>🚨 Emergency Contact: <strong className="text-white">{selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relationship}) - {selectedEmployee.emergencyContact.phone}</strong></div>
                  </div>
                </div>

                {/* Job & Compensation */}
                <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">2. Employment & Shift</span>
                  <div className="text-gray-300 space-y-1">
                    <div>🏢 Department: <strong className="text-white">{selectedEmployee.department}</strong></div>
                    <div>🏬 Branch: <strong className="text-white">{selectedEmployee.branchName}</strong></div>
                    <div>🕒 Shift: <strong className="text-[#C5A059]">{selectedEmployee.shift}</strong></div>
                    <div>💵 Salary: <strong className="text-emerald-400">₹{selectedEmployee.salary.toLocaleString()} / month</strong></div>
                    <div>📅 Joining Date: <strong className="text-white">{selectedEmployee.joiningDate}</strong></div>
                    <div>👔 Reporting Manager: <span className="text-gray-300">{selectedEmployee.reportingManager}</span></div>
                  </div>
                </div>

                {/* Statutory KYC & Banking */}
                <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">3. KYC & Bank Details</span>
                  <div className="text-gray-300 space-y-1">
                    <div>🆔 Aadhar Number: <strong className="text-white">{selectedEmployee.aadharNumber}</strong></div>
                    <div>📄 PAN Number: <strong className="text-white">{selectedEmployee.panNumber}</strong></div>
                    <div>🏦 Bank: <strong className="text-white">{selectedEmployee.bankDetails.bankName} (IFSC: {selectedEmployee.bankDetails.ifscCode})</strong></div>
                    <div>💳 Account No: <strong className="text-white">{selectedEmployee.bankDetails.accountNumber}</strong></div>
                  </div>
                </div>

              </div>

              {/* Right Column: Chronological Employee Timeline */}
              <div className="lg:col-span-6 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C5A059]" />
                  Employee Chronological Timeline
                </h4>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#1F1F21]">
                  {timelineEvents.map(evt => (
                    <div key={evt.id} className="pl-8 relative text-xs space-y-0.5">
                      <div className="absolute left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#C5A059] border-2 border-[#131315]" />
                      <div className="flex items-center justify-between">
                        <strong className="text-white font-bold">{evt.title}</strong>
                        <span className="text-[10px] font-mono text-gray-500">{evt.date}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{evt.description}</p>
                    </div>
                  ))}

                  {timelineEvents.length === 0 && (
                    <div className="p-6 text-center text-gray-500 text-xs font-mono">
                      No historical timeline events recorded yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C5A059]" />
                {editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Employee Profile'}
              </h3>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#0A0A0B] text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-2 text-xs">
              {[
                { id: 'PERSONAL' as const, label: '1. Personal & Contact' },
                { id: 'ROLE' as const, label: '2. Role & Salary' },
                { id: 'KYC' as const, label: '3. KYC & Bank' },
                { id: 'EMERGENCY' as const, label: '4. Emergency' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold transition-all",
                    activeFormTab === tab.id
                      ? "bg-[#C5A059] text-[#0A0A0B]"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              
              {/* TAB 1: PERSONAL & CONTACT */}
              {activeFormTab === 'PERSONAL' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Full Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kowsalya Sundaram"
                      className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        required
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="staff@company.com"
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Residential Address</label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, City, Postal Code"
                      className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Photo Avatar URL</label>
                    <input
                      type="text"
                      value={formData.photoUrl}
                      onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ROLE & SALARY */}
              {activeFormTab === 'ROLE' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Department</label>
                      <select
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      >
                        <option value="Billing & Cash Desk">Billing & Cash Desk</option>
                        <option value="Kitchen & Culinary">Kitchen & Culinary</option>
                        <option value="Management & Operations">Management & Operations</option>
                        <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                        <option value="Customer Service & Floor">Customer Service & Floor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Senior Cashier"
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Shift</label>
                      <select
                        value={formData.shift}
                        onChange={e => setFormData({ ...formData, shift: e.target.value as EmployeeShift })}
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      >
                        <option value="MORNING">Morning</option>
                        <option value="EVENING">Evening</option>
                        <option value="NIGHT">Night</option>
                        <option value="GENERAL">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Monthly Salary (₹)</label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Joining Date</label>
                      <input
                        type="date"
                        value={formData.joiningDate}
                        onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Branch Location</label>
                      <select
                        value={formData.branchId}
                        onChange={e => {
                          const name = e.target.value === 'br-chennai-main' ? 'Chennai Flagship Outlet' : e.target.value === 'br-bangalore-outlet' ? 'Bangalore Tech Park Branch' : 'Mumbai Bandra Hub';
                          setFormData({ ...formData, branchId: e.target.value, branchName: name });
                        }}
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      >
                        <option value="br-chennai-main">Chennai Flagship Outlet</option>
                        <option value="br-bangalore-outlet">Bangalore Tech Park Branch</option>
                        <option value="br-mumbai-hub">Mumbai Bandra Hub</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Reporting Manager</label>
                      <input
                        type="text"
                        value={formData.reportingManager}
                        onChange={e => setFormData({ ...formData, reportingManager: e.target.value })}
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KYC & BANKING */}
              {activeFormTab === 'KYC' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1">Aadhar Number</label>
                      <input
                        type="text"
                        value={formData.aadharNumber}
                        onChange={e => setFormData({ ...formData, aadharNumber: e.target.value })}
                        placeholder="XXXX-XXXX-XXXX"
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">PAN Number</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                        placeholder="ABCDE1234F"
                        className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
                    <span className="text-[10px] text-[#C5A059] font-mono uppercase font-bold block">Bank Account Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Bank Name"
                        value={formData.bankDetails.bankName}
                        onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                        className="bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={formData.bankDetails.accountNumber}
                        onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                        className="bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                      <input
                        type="text"
                        placeholder="IFSC Code"
                        value={formData.bankDetails.ifscCode}
                        onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                        className="bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Bank Branch"
                        value={formData.bankDetails.branch}
                        onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, branch: e.target.value } })}
                        className="bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EMERGENCY CONTACT */}
              {activeFormTab === 'EMERGENCY' && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-3">
                    <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block">Primary Emergency Contact</span>
                    
                    <div>
                      <label className="block text-gray-400 mb-1">Contact Person Name</label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                        placeholder="e.g. Sundaram K"
                        className="w-full bg-[#131315] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Relationship</label>
                        <input
                          type="text"
                          value={formData.emergencyContact.relationship}
                          onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relationship: e.target.value } })}
                          placeholder="e.g. Father / Spouse"
                          className="w-full bg-[#131315] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Emergency Phone</label>
                        <input
                          type="text"
                          value={formData.emergencyContact.phone}
                          onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                          placeholder="+91 98400 00000"
                          className="w-full bg-[#131315] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold rounded-xl shadow-md shadow-[#C5A059]/20"
                >
                  {editingEmployee ? 'Save Changes' : 'Create Employee Profile'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
