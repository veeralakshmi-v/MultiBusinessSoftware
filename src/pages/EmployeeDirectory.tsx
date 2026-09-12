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
import {
  isValidPhone, isValidAadhar, cleanPhone, cleanAadhar, formatAadhar
} from '../utils/validation';

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
  if (!val || val === 'No Access' || val === 'None' || val.includes('Full Access') || val.includes('ALL_MODULES')) {
    return [];
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
  return matched;
}

export const UNIVERSAL_CATEGORIES = [
  'Management/Admin',
  'Billing & Cash Desk',
  'Sales & Marketing',
  'Accounts & Finance',
  'Inventory & Warehouse',
  'Operations & Support',
  'Customer Support & Service',
  'HouseKeeping',
  'General',
] as const;

export const CATEGORY_ROLE_MAP: Record<string, string[]> = {
  'Management/Admin': ['ADMIN', 'MANAGER', 'SUPERVISOR'],
  'Management & Admin': ['ADMIN', 'MANAGER', 'SUPERVISOR'],
  'Billing & Cash Desk': ['CASHIER', 'BILLING_OPERATOR', 'STAFF'],
  'Billing POS': ['CASHIER', 'STAFF'],
  'Sales & Marketing': ['SALES_EXECUTIVE', 'MARKETING_MANAGER', 'STAFF'],
  'Accounts & Finance': ['ACCOUNTANT', 'FINANCE_MANAGER', 'STAFF'],
  'Inventory & Warehouse': ['STORE_KEEPER', 'INVENTORY_MANAGER', 'STAFF'],
  'Operations & Support': ['OPERATIONS_MANAGER', 'COORDINATOR', 'STAFF'],
  'Customer Support & Service': ['CUSTOMER_SUPPORT', 'RECEPTIONIST', 'STAFF'],
  'HouseKeeping': ['STAFF', 'SUPERVISOR'],
  'General': ['STAFF', 'OPERATOR', 'CASHIER'],
};

export const CATEGORY_DEFAULT_ROLE_MAP: Record<string, string> = {
  'Management/Admin': 'ADMIN',
  'Management & Admin': 'ADMIN',
  'Billing & Cash Desk': 'CASHIER',
  'Billing POS': 'CASHIER',
  'Sales & Marketing': 'SALES_EXECUTIVE',
  'Accounts & Finance': 'ACCOUNTANT',
  'Inventory & Warehouse': 'STORE_KEEPER',
  'Operations & Support': 'OPERATIONS_MANAGER',
  'Customer Support & Service': 'CUSTOMER_SUPPORT',
  'HouseKeeping': 'STAFF',
  'General': 'STAFF',
};

export function getRolesForCategory(cat: string): string[] {
  return CATEGORY_ROLE_MAP[cat] || ['CASHIER', 'MANAGER', 'ADMIN', 'STAFF'];
}

export function getDefaultRoleForCategory(cat: string): string {
  return CATEGORY_DEFAULT_ROLE_MAP[cat] || 'STAFF';
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
        applicationAccess: 'No Access',
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
  const [selectedAppAccess, setSelectedAppAccess] = useState<string[]>([]);
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

  // Fetch backend users/staff from API on mount
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setStaffList(prev => {
            const map = new Map<string, StaffUser>();
            prev.forEach(p => {
              const key = p.username || p.phone || p.id;
              if (key) map.set(key, p);
            });

            data.forEach((u: any) => {
              const key = u.username || u.phone || u.id;
              if (!key) return;
              const existing = map.get(key);

              const serverName = (u.fullName && u.fullName.trim()) || (u.name && u.name.trim());
              const isServerNameValid = serverName && serverName !== u.username && serverName !== u.phone;
              const isExistingNameValid = existing?.name && existing.name !== existing.username && existing.name !== existing.phone;

              const displayName = isServerNameValid
                ? serverName
                : (isExistingNameValid ? existing!.name : (serverName || u.username));

              map.set(key, {
                id: u.id || existing?.id || `emp-${Date.now()}`,
                name: displayName,
                username: u.username || existing?.username || key,
                phone: u.phone || existing?.phone || u.username || '',
                email: u.email || existing?.email || '',
                role: u.role || existing?.role || 'CASHIER',
                category: existing?.category || 'Management/Admin',
                applicationAccess: existing?.applicationAccess || u.applicationAccess || 'No Access',
                status: u.status || existing?.status || 'ACTIVE',
                pinCode: u.password || existing?.pinCode || '1234',
                aadharNumber: u.aadharNumber || existing?.aadharNumber || '',
                address: u.address || existing?.address || '',
                dob: u.dob || existing?.dob || '',
                doj: u.doj || existing?.doj || '',
                photoUrl: u.photoUrl || existing?.photoUrl,
              });
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

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

      const STANDARD_CATEGORIES = [
        'Management/Admin',
        'Billing & Cash Desk',
        'Sales & Marketing',
        'Accounts & Finance',
        'Inventory & Warehouse',
        'Operations & Support',
        'Customer Support & Service',
        'HouseKeeping',
        'General',
      ];
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
      setStaffFamilyPhone(st.familyPhone ? cleanPhone(st.familyPhone).slice(0, 10) : '');
      setStaffEmail(st.email || '');
      setStaffPin(st.pinCode || '1234');
      setStaffStatus(roleVal === 'ADMIN' ? 'ACTIVE' : (st.status || 'ACTIVE'));
      setStaffDob(st.dob || '');
      setStaffDoj(st.doj || '');
      setStaffDor(st.dor || '');
      setStaffAadhar(st.aadharNumber ? formatAadhar(st.aadharNumber) : '');
      setStaffAddress(st.address || '');
      setStaffPhoto(st.photoUrl || '');
    } else {
      setSelectedStaff(null);
      setIsEditing(false);
      setStaffName('');
      setStaffPhone('');
      setStaffUsername('');
      setStaffRole(getDefaultRoleForCategory('Management/Admin'));
      setCustomRoleTitle('');
      setIsCustomRole(false);
      setStaffCategory('Management/Admin');
      setCustomCategoryTitle('');
      setIsCustomCategory(false);
      setSelectedAppAccess([]);
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
    const p = cleanPhone(staffPhone).toLowerCase();
    return (
      (s.phone && cleanPhone(s.phone).toLowerCase() === p) ||
      (s.username && cleanPhone(s.username).toLowerCase() === p)
    );
  });

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = cleanPhone(staffPhone);
    const effectiveUsername = phoneDigits || staffUsername.trim();

    if (!staffName.trim()) {
      alert('Full Name is required!');
      return;
    }
    if (!phoneDigits || phoneDigits.length !== 10 || !/^\d{10}$/.test(phoneDigits)) {
      alert('Contact Number (Phone Number) must be exactly 10 digits!');
      return;
    }
    if (isPhoneDuplicate) {
      alert('this number is already exits, give another number');
      return;
    }
    if (staffFamilyPhone.trim()) {
      const familyDigits = cleanPhone(staffFamilyPhone);
      if (familyDigits.length !== 10 || !/^\d{10}$/.test(familyDigits)) {
        alert('Family Contact Number must be exactly 10 digits!');
        return;
      }
    }
    const aadharDigits = cleanAadhar(staffAadhar);
    if (!aadharDigits || aadharDigits.length !== 12 || !/^\d{12}$/.test(aadharDigits)) {
      alert('Aadhar card number must be exactly 12 digits!');
      return;
    }

    const computedCategory = isCustomCategory ? (customCategoryTitle.trim() || 'General') : staffCategory;
    const computedAppAccess = selectedAppAccess.length === PROJECT_MENU_ITEMS.length
      ? 'Full Access (All Modules & POS)'
      : selectedAppAccess.length === 0
        ? 'No Access'
        : selectedAppAccess.join(', ');
    const computedRole = isCustomRole ? (customRoleTitle.trim() || 'CUSTOM') : staffRole;
    const computedStatus = computedRole === 'ADMIN' ? 'ACTIVE' : staffStatus;
    const formattedAadharVal = formatAadhar(aadharDigits);

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
              phone: phoneDigits,
              familyPhone: staffFamilyPhone ? cleanPhone(staffFamilyPhone) : '',
              email: staffEmail.trim(),
              pinCode: staffPin.trim() || '1234',
              status: computedStatus,
              dob: staffDob,
              doj: staffDoj,
              dor: staffDor,
              aadharNumber: formattedAadharVal,
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
        phone: phoneDigits,
        familyPhone: staffFamilyPhone ? cleanPhone(staffFamilyPhone) : '',
        email: staffEmail.trim(),
        pinCode: staffPin.trim() || '1234',
        status: computedStatus,
        dob: staffDob,
        doj: staffDoj,
        dor: staffDor,
        aadharNumber: formattedAadharVal,
        address: staffAddress.trim(),
        photoUrl: staffPhoto,
      };
      setStaffList(prev => [...prev, newStaff]);
    }

    // Persist employee to Supabase PostgreSQL database via API
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: staffName.trim(),
        fullName: staffName.trim(),
        staffName: staffName.trim(),
        username: effectiveUsername,
        phone: phoneDigits,
        password: staffPin.trim() || '1234',
        pinCode: staffPin.trim() || '1234',
        role: computedRole,
        aadharNumber: formattedAadharVal,
        address: staffAddress.trim(),
        email: staffEmail.trim(),
      })
    }).then(res => res.json())
      .then(data => {
        console.log('✅ Employee saved to Supabase:', data);
      })
      .catch(err => console.error('Error syncing staff to Supabase:', err));

    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (staffList.length <= 1) {
      alert('At least one staff member must be maintained.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      fetch(`/api/users/${id}`, { method: 'DELETE' }).catch(() => {});
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
    <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto w-full min-w-0 overflow-hidden">

      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/80 backdrop-blur-md border border-white/60 p-5 sm:p-6 rounded-3xl shadow-lg shadow-gray-200/50 w-full min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] shadow-md flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 font-serif tracking-wide truncate">Employee Directory</h1>
            <p className="text-[11px] sm:text-xs text-gray-400 truncate">Total {staffList.length} staff accounts enrolled</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full md:w-auto min-w-0">
          <div className="relative w-full md:w-64 min-w-0">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff, username, Aadhar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* ── CATEGORY & ROLE FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs w-full min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x pb-1 w-full max-w-full min-w-0 flex-shrink">
          <span className="text-gray-500 font-semibold text-[11px] flex items-center gap-1 whitespace-nowrap flex-shrink-0">
            <Filter className="w-3 h-3 text-[#2563EB]" /> Role:
          </span>
          {['ALL', 'ADMIN', 'MANAGER', 'CASHIER', 'STAFF'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r as any)}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all border whitespace-nowrap flex-shrink-0 cursor-pointer",
                roleFilter === r
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 border-transparent font-extrabold"
                  : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-100"
              )}
            >
              {r}
            </button>
          ))}

          <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2 flex-shrink-0">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap">Dept:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 text-xs text-gray-900 outline-none focus:border-[#2563EB] max-w-[140px] sm:max-w-[200px]"
            >
              <option value="ALL">All Departments</option>
              {UNIVERSAL_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 justify-end flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
              viewMode === 'grid' ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 border-transparent" : "bg-white text-gray-600 border border-gray-100"
            )}
          >
            Tiles
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
              viewMode === 'table' ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 border-transparent" : "bg-white text-gray-600 border border-gray-100"
            )}
          >
            Table
          </button>
        </div>
      </div>

      {/* ── GRID CARDS VIEW ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4.5">
          {filteredStaff.map(st => (
            <div
              key={st.id}
              onClick={() => handleOpenModal(st)}
              className="group relative bg-white hover:bg-blue-50/40 border border-gray-200 hover:border-[#2563EB]/40 rounded-2xl p-4 sm:p-4.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Card Header: Photo & Role Badge */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="relative flex-shrink-0">
                  {st.photoUrl ? (
                    <img src={st.photoUrl} alt={st.name} className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover border-2 border-[#2563EB]/20 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#E2B755] to-[#8C6D2B] flex items-center justify-center text-[#0A0A0B] font-bold text-lg shadow-sm border border-[#2563EB]/20">
                      {st.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                    st.status === 'ACTIVE' ? "bg-emerald-400" : "bg-red-400"
                  )} />
                </div>

                <div className="flex flex-col items-end gap-1 min-w-0 max-w-[65%]">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border truncate max-w-full",
                    st.role === 'ADMIN' ? "bg-purple-50 text-purple-700 border-purple-200" :
                      st.role === 'MANAGER' ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}>
                    {st.role}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 truncate max-w-full" title={st.category}>
                    {st.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Staff Main Info */}
              <div className="my-3 space-y-0.5 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-[#2563EB] transition-colors truncate" title={st.name}>{st.name}</h3>
                <p className="font-mono text-xs text-gray-400 truncate">@{st.username}</p>
              </div>

              {/* Detail Chips */}
              <div className="space-y-1.5 pt-2.5 border-t border-gray-100 text-xs font-mono">
                <div className="flex items-center justify-between text-gray-600 gap-2">
                  <span className="text-gray-500 text-[11px] flex items-center gap-1 flex-shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" /> Aadhar:
                  </span>
                  <span className="font-bold text-[#2563EB] truncate text-right font-mono text-[11px] sm:text-xs">
                    {st.aadharNumber || 'Required *'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600 gap-2">
                  <span className="text-gray-500 text-[11px] flex items-center gap-1 flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-cyan-600" /> Phone:
                  </span>
                  <span className="truncate text-right font-mono text-[11px] sm:text-xs">{st.phone || '—'}</span>
                </div>

                {st.doj && (
                  <div className="flex items-center justify-between text-gray-500 gap-2">
                    <span className="text-gray-500 text-[11px] flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Joining:
                    </span>
                    <span className="truncate text-right text-[11px]">{st.doj}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Edit Button */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(st);
                  }}
                  className="px-3.5 py-1.5 bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
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
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-100">
              <tr>
                <th className="p-3.5 whitespace-nowrap">Employee</th>
                <th className="p-3.5 whitespace-nowrap">Category</th>
                <th className="p-3.5 whitespace-nowrap">Role</th>
                <th className="p-3.5 whitespace-nowrap">Status</th>
                <th className="p-3.5 whitespace-nowrap">DOB</th>
                <th className="p-3.5 whitespace-nowrap">DOJ</th>
                <th className="p-3.5 whitespace-nowrap">DOR</th>
                <th className="p-3.5 text-[#2563EB] whitespace-nowrap">Aadhar No. *</th>
                <th className="p-3.5 whitespace-nowrap">Contact No.</th>
                <th className="p-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {filteredStaff.map(st => (
                <tr
                  key={st.id}
                  onClick={() => handleOpenModal(st)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {st.photoUrl ? (
                        <img src={st.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-[#2563EB]/30 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-[#2563EB]/25 flex items-center justify-center font-bold text-[#2563EB] text-xs flex-shrink-0">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-xs whitespace-nowrap">{st.name}</p>
                        <p className="font-mono text-[10px] text-gray-400">@{st.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-gray-600 whitespace-nowrap">
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
                  <td className="p-3.5 font-mono text-gray-600 text-[11px] whitespace-nowrap">
                    {st.dob || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-gray-600 text-[11px] whitespace-nowrap">
                    {st.doj || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-gray-400 text-[11px] whitespace-nowrap">
                    {st.dor || '—'}
                  </td>
                  <td className="p-3.5 font-mono text-[#2563EB] font-bold text-[11px] whitespace-nowrap">
                    {st.aadharNumber ? st.aadharNumber : <span className="text-red-400 text-[10px]">Required *</span>}
                  </td>
                  <td className="p-3.5 font-mono text-gray-600 text-[11px] whitespace-nowrap">
                    {st.phone || '—'}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(st);
                      }}
                      className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#2563EB] border border-gray-100 rounded-lg"
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
          <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-gray-900 text-base">
                  {selectedStaff ? `Employee Details: ${selectedStaff.name}` : 'New Employee Details'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Employee Photo Upload Card */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                {staffPhoto ? (
                  <img src={staffPhoto} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-[#2563EB]/40 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-500 text-xs flex-shrink-0 font-semibold">
                    No Photo
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-900">Employee Photo</p>
                  <p className="text-[10px] text-gray-400">Upload profile photo or identity picture (PNG/JPG)</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-100 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Login Username *</label>
                  <input
                    type="text"
                    disabled
                    placeholder="Mobile number is default username"
                    value={staffPhone || staffUsername}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-xs font-mono outline-none cursor-not-allowed opacity-80 transition-all",
                      isPhoneDuplicate
                        ? "bg-red-950/20 border border-red-500/50 text-red-300"
                        : "bg-white border border-gray-100 text-gray-400"
                    )}
                  />
                  <p className={cn("text-[10px] mt-1 flex items-center gap-1 font-medium", isPhoneDuplicate ? "text-red-400 font-bold" : "text-gray-400")}>
                    {isPhoneDuplicate ? "⚠️ this number is already exits, give another number" : "ℹ️ Mobile number is default username"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category / Department *</label>
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
                        const defaultRole = getDefaultRoleForCategory(val);
                        setStaffRole(defaultRole);
                        setIsCustomRole(false);
                        if (defaultRole === 'ADMIN') {
                          setStaffStatus('ACTIVE');
                        }
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  >
                    {UNIVERSAL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="CUSTOM">⚡ CUSTOM CATEGORY (Enter custom department)</option>
                  </select>

                  {isCustomCategory && (
                    <div className="mt-2 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-[#2563EB] mb-1">Custom Department Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IT & Security, Quality Control, Logistics"
                        value={customCategoryTitle}
                        onChange={(e) => setCustomCategoryTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-[#2563EB]/40 focus:border-[#2563EB] rounded-xl px-3 py-2 text-xs text-gray-900 outline-none font-medium"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Role *</label>
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
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  >
                    {getRolesForCategory(staffCategory).map((r) => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                    ))}
                    <option value="CUSTOM">⚡ CUSTOM ROLE</option>
                  </select>

                  {isCustomRole && (
                    <div className="mt-2 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-[#2563EB] mb-1">Custom Role Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Supervisor, Storekeeper, Delivery Executive"
                        value={customRoleTitle}
                        onChange={(e) => setCustomRoleTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-[#2563EB]/40 focus:border-[#2563EB] rounded-xl px-3 py-2 text-xs text-gray-900 outline-none font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-gray-300">
                      Application Access * <span className="text-[10px] text-[#2563EB] font-normal">(Select allowed Project Menu items)</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedAppAccess([...PROJECT_MENU_ITEMS])}
                        className="text-[11px] text-[#2563EB] hover:underline font-bold px-2.5 py-1 rounded-lg bg-blue-50 border border-[#2563EB]/30 transition-all hover:bg-blue-100"
                      >
                        Select All (Full Access)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAppAccess([])}
                        className="text-[11px] text-gray-400 hover:text-gray-900 px-2 py-1 rounded-lg bg-slate-100 border border-gray-200 transition-all hover:bg-slate-200"
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
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#2563EB] hover:border-[#2563EB]/50 transition-all"
                    >
                      POS Cashier
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Dashboard', 'Billing POS', 'Categories & Items', 'Inventory', 'Sales Reports', 'Customers', 'Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#2563EB] hover:border-[#2563EB]/50 transition-all"
                    >
                      Store Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#2563EB] hover:border-[#2563EB]/50 transition-all"
                    >
                      Attendance Only
                    </button>
                  </div>

                  {/* Checklist Multi-Select Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl max-h-56 overflow-y-auto">
                    {PROJECT_MENU_ITEMS.map((item) => {
                      const isChecked = selectedAppAccess.includes(item);
                      return (
                        <label
                          key={item}
                          className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none",
                            isChecked
                              ? "bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold shadow-xs"
                              : "bg-white border-gray-100 text-gray-400 hover:border-gray-600 hover:text-gray-700"
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
                            className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 cursor-pointer flex-shrink-0"
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
                        <span>Selected <strong className="text-[#2563EB]">{selectedAppAccess.length}</strong> of {PROJECT_MENU_ITEMS.length} menu modules</span>
                      )}
                    </span>
                  </div>
                </div>


                <div className="sm:col-span-2 p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#2563EB]" /> Assigned Role Title:
                    </span>
                    <span className="font-mono text-[#2563EB] font-bold">
                      {isCustomRole ? (customRoleTitle || 'CUSTOM ROLE') : staffRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    ℹ️ Specific menu access rights are configured using the Application Access checklist above.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={staffDob}
                    onChange={(e) => setStaffDob(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB] [color-scheme:light]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 text-[#2563EB]">Aadhar Number (12 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="1234 5678 9012"
                    value={staffAadhar}
                    onChange={(e) => {
                      const digits = cleanAadhar(e.target.value).slice(0, 12);
                      setStaffAadhar(formatAadhar(digits));
                    }}
                    className="w-full bg-gray-50 border border-[#2563EB]/40 focus:border-[#2563EB] rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">12-digit UIDAI Aadhaar card number</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Joining (DOJ)</label>
                  <input
                    type="date"
                    value={staffDoj}
                    onChange={(e) => setStaffDoj(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB] [color-scheme:light]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Relieving (DOR)</label>
                  <input
                    type="date"
                    value={staffDor}
                    onChange={(e) => setStaffDor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB] [color-scheme:light]"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold mb-1", isPhoneDuplicate ? "text-red-400 font-bold" : "text-[#2563EB]")}>
                    Contact Number (10 Digits - Default Username) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={staffPhone}
                    onChange={(e) => {
                      const digits = cleanPhone(e.target.value).slice(0, 10);
                      setStaffPhone(digits);
                      setStaffUsername(digits);
                    }}
                    className={cn(
                      "w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono outline-none transition-all",
                      isPhoneDuplicate
                        ? "border-2 border-red-500 text-red-300 focus:border-red-400"
                        : "border border-[#2563EB]/40 focus:border-[#2563EB] text-gray-900"
                    )}
                  />
                  {isPhoneDuplicate ? (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-bold animate-in fade-in">
                      ⚠️ this number is already exits, give another number
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">Must be exactly 10 numeric digits</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Family Contact Number (10 Digits)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876511111"
                    value={staffFamilyPhone}
                    onChange={(e) => {
                      const digits = cleanPhone(e.target.value).slice(0, 10);
                      setStaffFamilyPhone(digits);
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@business.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">4-Digit PIN Code *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="1234"
                    value={staffPin}
                    onChange={(e) => setStaffPin(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    placeholder="Full residential address..."
                    value={staffAddress}
                    onChange={(e) => setStaffAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-[#2563EB] resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Employment Status</p>
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
                            : "bg-white text-gray-400 hover:text-gray-900"
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
                            : "bg-white text-gray-400 hover:text-gray-900"
                        )}
                      >
                        INACTIVE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
                    className="px-4 py-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#2563EB] text-white font-bold rounded-xl text-xs hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
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
