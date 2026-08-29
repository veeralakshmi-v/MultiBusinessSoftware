import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { cn } from '../lib/utils';
import {
  Users, UserPlus, Edit2, Trash2, Search, Filter, Phone, Mail,
  Calendar, CreditCard, MapPin, Shield, CheckCircle2, XCircle,
  ArrowLeft, Upload, X, Save, Clock, ChevronRight, UserCheck
} from 'lucide-react';
import { StaffUser } from './Settings';

export const PROJECT_MENU_ITEMS = [
  'Dashboard',
  'Billing POS',
  'Categories & Items',
  'Inventory',
  'Sales Reports',
  'Employee Details',
  'Staff Attendance',
  'Customers',
  'Settings',
] as const;

export function parseAppAccess(val?: string): string[] {
  if (!val || val.includes('Full Access') || val.includes('ALL_MODULES')) {
    return [...PROJECT_MENU_ITEMS];
  }
  if (val === 'POS & Sales Billing Only') {
    return ['Billing POS', 'Customers', 'Staff Attendance'];
  }
  if (val === 'Inventory & Stock Management') {
    return ['Inventory', 'Categories & Items'];
  }
  if (val === 'Reports & Financial Ledgers') {
    return ['Sales Reports'];
  }
  if (val === 'Attendance & Staff Portal') {
    return ['Staff Attendance'];
  }
  const parts = val.split(',').map(s => s.trim()).filter(Boolean);
  const matched = parts.filter(p => PROJECT_MENU_ITEMS.includes(p as any));
  return matched.length > 0 ? matched : [...PROJECT_MENU_ITEMS];
}

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('universal_staff_list');
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return [
      {
        id: 'emp-1',
        name: 'Administrator',
        username: 'admin',
        role: 'ADMIN',
        category: 'Management/Admin',
        applicationAccess: 'Full Access (All Modules & POS)',
        phone: '9876543210',
        familyPhone: '9876543211',
        email: 'admin@mybusiness.com',
        pinCode: '1234',
        status: 'ACTIVE',
        dob: '1990-01-01',
        doj: '2022-01-01',
        dor: '',
        aadharNumber: '1234 5678 9012',
        address: '123 Main St, Central City',
      },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected employee for viewing/editing
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Modal Form States
  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffRole, setStaffRole] = useState<string>('CASHIER');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [staffCategory, setStaffCategory] = useState('Management/Admin');
  const [customCategoryTitle, setCustomCategoryTitle] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedAppAccess, setSelectedAppAccess] = useState<string[]>([...PROJECT_MENU_ITEMS]);
  const [staffPhone, setStaffPhone] = useState('');
  const [staffFamilyPhone, setStaffFamilyPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [staffStatus, setStaffStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [staffDob, setStaffDob] = useState('');
  const [staffDoj, setStaffDoj] = useState('');
  const [staffDor, setStaffDor] = useState('');
  const [staffAadhar, setStaffAadhar] = useState('');
  const [staffAddress, setStaffAddress] = useState('');
  const [staffPhoto, setStaffPhoto] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('universal_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  const STANDARD_ROLES = ['CASHIER', 'MANAGER', 'ADMIN', 'STAFF'];

  // Open modal for adding new or editing selected
  const handleOpenModal = (st?: StaffUser) => {
    if (st) {
      setSelectedStaff(st);
      setIsEditing(true);
      setStaffName(st.name || '');
      setStaffPhone(st.phone || '');
      setStaffUsername(st.phone || st.username || '');
      
      const roleVal = st.role || 'CASHIER';
      if (STANDARD_ROLES.includes(roleVal)) {
        setStaffRole(roleVal);
        setCustomRoleTitle('');
        setIsCustomRole(false);
      } else {
        setStaffRole('CUSTOM');
        setCustomRoleTitle(roleVal);
        setIsCustomRole(true);
      }

      const STANDARD_CATEGORIES = ['Management/Admin', 'Accounts & Finance', 'Sales & Marketing', 'HouseKeeping', 'General'];
      const catVal = st.category || 'Management/Admin';
      if (STANDARD_CATEGORIES.includes(catVal)) {
        setStaffCategory(catVal);
        setCustomCategoryTitle('');
        setIsCustomCategory(false);
      } else {
        setStaffCategory('CUSTOM');
        setCustomCategoryTitle(catVal);
        setIsCustomCategory(true);
      }
      setSelectedAppAccess(parseAppAccess(st.applicationAccess));
      setStaffEmail(st.email || '');
      setStaffPin(st.pinCode || '1234');
      setStaffStatus(roleVal === 'ADMIN' ? 'ACTIVE' : (st.status || 'ACTIVE'));
      setStaffDob(st.dob || '');
      setStaffDoj(st.doj || '');
      setStaffDor(st.dor || '');
      setStaffAadhar(st.aadharNumber || '');
      setStaffAddress(st.address || '');
      setStaffPhoto(st.photoUrl || '');
    } else {
      setSelectedStaff(null);
      setIsEditing(false);
      setStaffName('');
      setStaffPhone('');
      setStaffUsername('');
      setStaffRole('CASHIER');
      setCustomRoleTitle('');
      setIsCustomRole(false);
      setStaffCategory('Management/Admin');
      setCustomCategoryTitle('');
      setIsCustomCategory(false);
      setSelectedAppAccess([...PROJECT_MENU_ITEMS]);
      setStaffFamilyPhone('');
      setStaffEmail('');
      setStaffPin('');
      setStaffStatus('ACTIVE');
      setStaffDob('');
      setStaffDoj('');
      setStaffDor('');
      setStaffAadhar('');
      setStaffAddress('');
      setStaffPhoto('');
    }
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setStaffPhoto(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isPhoneDuplicate = !!staffPhone.trim() && staffList.some(s => {
    if (selectedStaff && isEditing && s.id === selectedStaff.id) return false;
    const p = staffPhone.trim().toLowerCase();
    return (
      (s.phone && s.phone.trim().toLowerCase() === p) ||
      (s.username && s.username.trim().toLowerCase() === p)
    );
  });

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUsername = staffPhone.trim() || staffUsername.trim();
    if (!staffName.trim()) {
      alert('Full Name is required!');
      return;
    }
    if (!effectiveUsername) {
      alert('Contact Number (Mobile Number) is required as the default username!');
      return;
    }
    if (isPhoneDuplicate) {
      alert('this number is already exits, give another number');
      return;
    }
    if (!staffAadhar.trim()) {
      alert('Aadhar Number is mandatory!');
      return;
    }

    const computedCategory = isCustomCategory ? (customCategoryTitle.trim() || 'General') : staffCategory;
    const computedAppAccess = selectedAppAccess.length === PROJECT_MENU_ITEMS.length
      ? 'Full Access (All Modules & POS)'
      : selectedAppAccess.length === 0
      ? 'Full Access (All Modules & POS)'
      : selectedAppAccess.join(', ');
    const computedRole = isCustomRole ? (customRoleTitle.trim() || 'CUSTOM') : staffRole;
    const computedStatus = computedRole === 'ADMIN' ? 'ACTIVE' : staffStatus;

    if (selectedStaff && isEditing) {
      setStaffList(prev =>
        prev.map(s =>
          s.id === selectedStaff.id
            ? {
              ...s,
              name: staffName.trim(),
              username: effectiveUsername,
              role: computedRole,
              category: computedCategory,
              applicationAccess: computedAppAccess,
              phone: staffPhone.trim(),
              familyPhone: staffFamilyPhone.trim(),
              email: staffEmail.trim(),
              pinCode: staffPin.trim() || '1234',
              status: computedStatus,
              dob: staffDob,
              doj: staffDoj,
              dor: staffDor,
              aadharNumber: staffAadhar.trim(),
              address: staffAddress.trim(),
              photoUrl: staffPhoto,
            }
            : s
        )
      );
    } else {
      const newStaff: StaffUser = {
        id: `emp-${Date.now()}`,
        name: staffName.trim(),
        username: effectiveUsername,
        role: computedRole,
        category: computedCategory,
        applicationAccess: computedAppAccess,
        phone: staffPhone.trim(),
        familyPhone: staffFamilyPhone.trim(),
        email: staffEmail.trim(),
        pinCode: staffPin.trim() || '1234',
        status: computedStatus,
        dob: staffDob,
        doj: staffDoj,
        dor: staffDor,
        aadharNumber: staffAadhar.trim(),
        address: staffAddress.trim(),
        photoUrl: staffPhoto,
      };
      setStaffList(prev => [...prev, newStaff]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (staffList.length <= 1) {
      alert('At least one staff member must be maintained.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      if (selectedStaff?.id === id) setIsModalOpen(false);
    }
  };

  // Filter staff list
  const filteredStaff = staffList.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      (s.aadharNumber && s.aadharNumber.includes(searchQuery));
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesRole && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">

      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/5 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">Employee Directory</h1>
            <p className="text-xs text-gray-400">Total {staffList.length} staff accounts enrolled</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff, username, Aadhar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-[#C5A059] to-[#9E7B35] hover:from-[#d4b06a] hover:to-[#b08d4a] text-[#080809] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#C5A059]/20 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* ── CATEGORY & ROLE FILTERS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-1 max-w-full">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#C5A059]" /> Role:
            </span>
            {['ALL', 'ADMIN', 'MANAGER', 'CASHIER', 'STAFF'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r as any)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  roleFilter === r
                    ? "btn-theme-secondary shadow-md border-transparent"
                    : "bg-theme-surface text-theme-primary hover:bg-theme-secondary/20 border-theme-secondary/30"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <span className="text-gray-500 font-semibold text-[11px]">Dept:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-2.5 py-1 text-xs text-white outline-none focus:border-[#C5A059]"
            >
              <option value="ALL">All Departments</option>
              <option value="Management/Admin">Management/Admin</option>
              <option value="Accounts & Finance">Accounts & Finance</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="HouseKeeping">HouseKeeping</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all",
              viewMode === 'grid' ? "btn-theme-secondary shadow-md border-transparent" : "bg-theme-surface text-theme-primary border-theme-secondary/30"
            )}
          >
            Tiles
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all",
              viewMode === 'table' ? "btn-theme-secondary shadow-md border-transparent" : "bg-theme-surface text-theme-primary border-theme-secondary/30"
            )}
          >
            Table
          </button>
        </div>
      </div>


      {/* ── GRID CARDS VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredStaff.map(st => (
            <div
              key={st.id}
              onClick={() => handleOpenModal(st)}
              className="group relative bg-[#131315] hover:bg-[#18181B] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl p-5 shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header: Photo & Role Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="relative">
                  {st.photoUrl ? (
                    <img src={st.photoUrl} alt={st.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#C5A059]/30 shadow-md group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E2B755] to-[#8C6D2B] flex items-center justify-center text-[#0A0A0B] font-bold text-xl shadow-md border border-[#C5A059]/30 group-hover:scale-105 transition-transform">
                      {st.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={cn(
                    "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#131315]",
                    st.status === 'ACTIVE' ? "bg-emerald-400" : "bg-red-400"
                  )} />
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                    st.role === 'ADMIN' ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                      st.role === 'MANAGER' ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                        "bg-green-500/10 text-green-400 border-green-500/30"
                  )}>
                    {st.role}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    {st.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Staff Main Info */}
              <div className="my-4 space-y-1.5">
                <h3 className="font-bold text-white text-base group-hover:text-[#C5A059] transition-colors">{st.name}</h3>
                <p className="font-mono text-xs text-gray-400">@{st.username}</p>
              </div>

              {/* Detail Chips */}
              <div className="space-y-1.5 pt-3 border-t border-white/[0.06] text-xs font-mono">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-500 text-[11px] flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#C5A059]" /> Aadhar:
                  </span>
                  <span className="font-bold text-[#C5A059]">{st.aadharNumber || 'Required *'}</span>
                </div>

                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-gray-500 text-[11px] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-cyan-400" /> Phone:
                  </span>
                  <span>{st.phone || '—'}</span>
                </div>

                {st.doj && (
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-gray-500 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" /> Joining:
                    </span>
                    <span>{st.doj}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Edit Button */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold">
                  Click card to Edit details
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(st);
                  }}
                  className="px-3.5 py-1.5 btn-theme-secondary rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-white/20 shadow-md"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE LIST VIEW ── */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-[#1F1F21] bg-[#131315] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21]">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">DOB</th>
                <th className="p-3.5">DOJ</th>
                <th className="p-3.5">DOR</th>
                <th className="p-3.5 text-[#C5A059]">Aadhar No. *</th>
                <th className="p-3.5">Contact No.</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {filteredStaff.map(st => (
                <tr
                  key={st.id}
                  onClick={() => handleOpenModal(st)}
                  className="hover:bg-[#18181A] transition-colors cursor-pointer"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {st.photoUrl ? (
                        <img src={st.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-[#C5A059]/30 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/25 flex items-center justify-center font-bold text-[#C5A059] text-xs flex-shrink-0">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-xs whitespace-nowrap">{st.name}</p>
                        <p className="font-mono text-[10px] text-gray-400">@{st.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-gray-300 whitespace-nowrap">
                    {st.category || 'General'}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                      st.role === 'ADMIN' ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                        st.role === 'MANAGER' ? "bg-blue-500/10 text-blue-400 border border-blue-500/30" :
                          "bg-green-500/10 text-green-400 border border-green-500/30"
                    )}>
                      {st.role}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                      st.status === 'ACTIVE' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" :
                        "bg-red-500/15 text-red-400 border border-red-500/25"
                    )}>
                      {st.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-gray-300 text-[11px] whitespace-nowrap">
                    {st.dob || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-gray-300 text-[11px] whitespace-nowrap">
                    {st.doj || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                    {st.dor || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-[#C5A059] font-bold text-[11px] whitespace-nowrap">
                    {st.aadharNumber ? st.aadharNumber : <span className="text-red-400 text-[10px]">Required *</span>}
                  </td>
                  <td className="p-3.5 font-mono text-gray-300 text-[11px] whitespace-nowrap">
                    {st.phone || '—'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(st);
                      }}
                      className="p-1.5 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 hover:text-[#C5A059] border border-[#2D2D30] rounded-lg"
                      title="Edit Staff"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── INDIVIDUAL EMPLOYEE DETAIL & EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-base">
                  {selectedStaff ? `Employee Details: ${selectedStaff.name}` : 'Add New Staff Member'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Employee Photo Upload Card */}
              <div className="flex items-center gap-4 p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl">
                {staffPhoto ? (
                  <img src={staffPhoto} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-[#C5A059]/40 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#252528] border border-[#3D3D40] flex items-center justify-center text-gray-500 text-xs flex-shrink-0 font-semibold">
                    No Photo
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">Employee Photo</p>
                  <p className="text-[10px] text-gray-400">Upload profile photo or identity picture (PNG/JPG)</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1 bg-[#252528] hover:bg-[#303035] border border-[#3D3D40] text-gray-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{staffPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {staffPhoto && (
                      <button
                        type="button"
                        onClick={() => setStaffPhoto('')}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Login Username *</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Mobile number is default username"
                    value={staffPhone || staffUsername}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-xs font-mono outline-none cursor-not-allowed opacity-80 transition-all",
                      isPhoneDuplicate
                        ? "bg-red-950/20 border border-red-500/50 text-red-300"
                        : "bg-[#141416] border border-[#222225] text-gray-400"
                    )}
                  />
                  <p className={cn("text-[10px] mt-1 flex items-center gap-1 font-medium", isPhoneDuplicate ? "text-red-400 font-bold" : "text-gray-400")}>
                    {isPhoneDuplicate ? "⚠️ this number is already exits, give another number" : "ℹ️ Mobile number is default username"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category / Department *</label>
                  <select
                    value={isCustomCategory ? 'CUSTOM' : staffCategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setIsCustomCategory(true);
                        setStaffCategory('CUSTOM');
                      } else {
                        setIsCustomCategory(false);
                        setStaffCategory(val);
                      }
                    }}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value="Management/Admin">Management/Admin</option>
                    <option value="Accounts & Finance">Accounts & Finance</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="HouseKeeping">HouseKeeping</option>
                    <option value="General">General</option>
                    <option value="CUSTOM">⚡ CUSTOM CATEGORY (Enter custom department)</option>
                  </select>

                  {isCustomCategory && (
                    <div className="mt-2 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-[#C5A059] mb-1">Custom Department Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IT & Security, Quality Control, Logistics"
                        value={customCategoryTitle}
                        onChange={(e) => setCustomCategoryTitle(e.target.value)}
                        className="w-full bg-[#1A1A1C] border border-[#C5A059]/40 focus:border-[#C5A059] rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Role *</label>
                  <select
                    value={isCustomRole ? 'CUSTOM' : staffRole}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setIsCustomRole(true);
                        setStaffRole('CUSTOM');
                      } else {
                        setIsCustomRole(false);
                        setStaffRole(val);
                        if (val === 'ADMIN') setStaffStatus('ACTIVE');
                      }
                    }}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value="CASHIER">CASHIER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="CUSTOM">⚡ CUSTOM ROLE</option>
                  </select>

                  {isCustomRole && (
                    <div className="mt-2 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-[#C5A059] mb-1">Custom Role Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Supervisor, Storekeeper, Delivery Executive"
                        value={customRoleTitle}
                        onChange={(e) => setCustomRoleTitle(e.target.value)}
                        className="w-full bg-[#1A1A1C] border border-[#C5A059]/40 focus:border-[#C5A059] rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-gray-300">
                      Application Access * <span className="text-[10px] text-[#C5A059] font-normal">(Select allowed Project Menu items)</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedAppAccess([...PROJECT_MENU_ITEMS])}
                        className="text-[11px] text-[#C5A059] hover:underline font-bold px-2.5 py-1 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30 transition-all hover:bg-[#C5A059]/20"
                      >
                        Select All (Full Access)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAppAccess([])}
                        className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Billing POS', 'Customers', 'Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#1A1A1C] border border-[#2D2D30] text-gray-300 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all"
                    >
                      POS Cashier
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Dashboard', 'Billing POS', 'Categories & Items', 'Inventory', 'Sales Reports', 'Customers', 'Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#1A1A1C] border border-[#2D2D30] text-gray-300 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all"
                    >
                      Store Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#1A1A1C] border border-[#2D2D30] text-gray-300 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all"
                    >
                      Attendance Only
                    </button>
                  </div>

                  {/* Checklist Multi-Select Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl max-h-56 overflow-y-auto">
                    {PROJECT_MENU_ITEMS.map((item) => {
                      const isChecked = selectedAppAccess.includes(item);
                      return (
                        <label
                          key={item}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                            isChecked
                              ? "bg-[#C5A059]/15 border-[#C5A059]/50 text-white font-bold shadow-sm"
                              : "bg-[#141416] border-[#222225] text-gray-400 hover:border-gray-600 hover:text-gray-200"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAppAccess(prev => [...prev, item]);
                              } else {
                                setSelectedAppAccess(prev => prev.filter(i => i !== item));
                              }
                            }}
                            className="w-4 h-4 rounded accent-[#C5A059] cursor-pointer flex-shrink-0"
                          />
                          <span className="truncate">{item}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-0.5">
                    <span>
                      {selectedAppAccess.length === PROJECT_MENU_ITEMS.length ? (
                        <span className="text-emerald-400 font-semibold">⚡ Full Access (All 9 Menu Modules Selected)</span>
                      ) : selectedAppAccess.length === 0 ? (
                        <span className="text-red-400 font-semibold">⚠️ No access selected (Please check at least 1 menu module)</span>
                      ) : (
                        <span>Selected <strong className="text-[#C5A059]">{selectedAppAccess.length}</strong> of {PROJECT_MENU_ITEMS.length} menu modules</span>
                      )}
                    </span>
                  </div>
                </div>


                <div className="sm:col-span-2 p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#C5A059]" /> Assigned Role Title:
                    </span>
                    <span className="font-mono text-[#C5A059] font-bold">
                      {isCustomRole ? (customRoleTitle || 'CUSTOM ROLE') : staffRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    ℹ️ Specific menu access rights are configured using the Application Access checklist above.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={staffDob}
                    onChange={(e) => setStaffDob(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 text-[#C5A059]">Aadhar Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012"
                    value={staffAadhar}
                    onChange={(e) => setStaffAadhar(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#C5A059]/40 focus:border-[#C5A059] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Joining (DOJ)</label>
                  <input
                    type="date"
                    value={staffDoj}
                    onChange={(e) => setStaffDoj(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Relieving (DOR)</label>
                  <input
                    type="date"
                    value={staffDor}
                    onChange={(e) => setStaffDor(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold mb-1", isPhoneDuplicate ? "text-red-400 font-bold" : "text-[#C5A059]")}>
                    Contact Number (Default Username) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={staffPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStaffPhone(val);
                      setStaffUsername(val);
                    }}
                    className={cn(
                      "w-full bg-[#1A1A1C] rounded-xl px-3 py-2 text-xs font-mono outline-none transition-all",
                      isPhoneDuplicate
                        ? "border-2 border-red-500 text-red-300 focus:border-red-400"
                        : "border border-[#C5A059]/40 focus:border-[#C5A059] text-white"
                    )}
                  />
                  {isPhoneDuplicate && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-bold animate-in fade-in">
                      ⚠️ this number is already exits, give another number
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Family Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 11111"
                    value={staffFamilyPhone}
                    onChange={(e) => setStaffFamilyPhone(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@business.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">4-Digit PIN Code *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="1234"
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    placeholder="Full residential address..."
                    value={staffAddress}
                    onChange={(e) => setStaffAddress(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl p-3 text-xs text-white outline-none focus:border-[#C5A059] resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-white">Employment Status</p>
                    <p className="text-[10px] text-gray-400">
                      {staffRole === 'ADMIN'
                        ? "Admin accounts are protected and strictly maintained as Active"
                        : "Set whether this staff account is currently Active or Inactive"}
                    </p>
                  </div>
                  {staffRole === 'ADMIN' ? (
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ALWAYS ACTIVE (ADMIN)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffStatus('ACTIVE')}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                          staffStatus === 'ACTIVE'
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-[#141416] text-gray-400 hover:text-white"
                        )}
                      >
                        ACTIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaffStatus('INACTIVE')}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                          staffStatus === 'INACTIVE'
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-[#141416] text-gray-400 hover:text-white"
                        )}
                      >
                        INACTIVE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#222225]">
                {selectedStaff ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteStaff(selectedStaff.id, selectedStaff.name)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#1A1A1C] text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold rounded-xl text-xs hover:bg-[#b08d4a] shadow-lg shadow-[#C5A059]/20 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Employee Details</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
