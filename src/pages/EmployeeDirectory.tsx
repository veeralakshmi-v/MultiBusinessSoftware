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

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('universal_staff_list');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'emp-1',
        name: 'Administrator',
        username: 'admin',
        role: 'ADMIN',
        category: 'Management',
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
  const [staffRole, setStaffRole] = useState<Role>('CASHIER');
  const [staffCategory, setStaffCategory] = useState('Billing POS');
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

  // Open modal for adding new or editing selected
  const handleOpenModal = (st?: StaffUser) => {
    if (st) {
      setSelectedStaff(st);
      setIsEditing(true);
      setStaffName(st.name || '');
      setStaffUsername(st.username || '');
      setStaffRole(st.role || 'CASHIER');
      setStaffCategory(st.category || 'Billing POS');
      setStaffPhone(st.phone || '');
      setStaffFamilyPhone(st.familyPhone || '');
      setStaffEmail(st.email || '');
      setStaffPin(st.pinCode || '1234');
      setStaffStatus(st.status || 'ACTIVE');
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
      setStaffUsername('');
      setStaffRole('CASHIER');
      setStaffCategory('Billing POS');
      setStaffPhone('');
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

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffUsername.trim()) {
      alert('Full Name and Username are required!');
      return;
    }
    if (!staffAadhar.trim()) {
      alert('Aadhar Number is mandatory!');
      return;
    }

    if (selectedStaff && isEditing) {
      setStaffList(prev =>
        prev.map(s =>
          s.id === selectedStaff.id
            ? {
                ...s,
                name: staffName.trim(),
                username: staffUsername.trim(),
                role: staffRole,
                category: staffCategory,
                phone: staffPhone.trim(),
                familyPhone: staffFamilyPhone.trim(),
                email: staffEmail.trim(),
                pinCode: staffPin.trim() || '1234',
                status: staffStatus,
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
        username: staffUsername.trim(),
        role: staffRole,
        category: staffCategory,
        phone: staffPhone.trim(),
        familyPhone: staffFamilyPhone.trim(),
        email: staffEmail.trim(),
        pinCode: staffPin.trim() || '1234',
        status: staffStatus,
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-gray-500 font-semibold text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#C5A059]" /> Role:
          </span>
          {['ALL', 'ADMIN', 'MANAGER', 'CASHIER', 'STAFF'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r as any)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-semibold transition-all",
                roleFilter === r
                  ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
                  : "bg-[#141416] text-gray-400 hover:text-white border border-[#222225]"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              viewMode === 'grid' ? "bg-[#1F1F22] text-[#C5A059] border-[#C5A059]/40" : "bg-[#141416] text-gray-500 border-[#222225]"
            )}
          >
            Grid Cards View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              viewMode === 'table' ? "bg-[#1F1F22] text-[#C5A059] border-[#C5A059]/40" : "bg-[#141416] text-gray-500 border-[#222225]"
            )}
          >
            Table List View
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
                  className="px-3 py-1.5 bg-[#1F1F22] hover:bg-[#C5A059] text-gray-300 hover:text-[#0A0A0B] rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-white/10"
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
                    required
                    placeholder="e.g. ramesh_pos"
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category / Department *</label>
                  <select
                    value={staffCategory}
                    onChange={(e) => setStaffCategory(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value="Billing POS">Billing POS</option>
                    <option value="Sales">Sales</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Management">Management</option>
                    <option value="Accounts">Accounts</option>
                    <option value="Security">Security</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Role *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value="CASHIER">CASHIER (POS & Customers)</option>
                    <option value="MANAGER">MANAGER (POS, Stock, Reports)</option>
                    <option value="ADMIN">ADMIN (Full Access)</option>
                    <option value="KITCHEN_STAFF">KITCHEN_STAFF (Orders & Prep)</option>
                    <option value="STAFF">STAFF (Attendance & POS)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#C5A059]" /> Granted Role Access Scope:
                    </span>
                    <span className="font-mono text-[#C5A059] font-bold">{staffRole}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {staffRole === 'ADMIN' && "👑 Full System Administrator: Unrestricted access to all billing, items, inventory, sales reports, settings, and employee directory."}
                    {staffRole === 'MANAGER' && "📊 Branch Manager: Granted access to POS Billing, Items Catalog, Inventory, Sales Reports, Customers & Staff Attendance."}
                    {staffRole === 'CASHIER' && "💳 Billing Counter Cashier: Granted access to POS Billing, Customer Lookup, and Punch Attendance."}
                    {staffRole === 'KITCHEN_STAFF' && "🍳 Kitchen Chef: Granted access to Items/Prep Queue & Punch Attendance."}
                    {staffRole === 'STAFF' && "📋 General Staff: Granted access to Punch IN / OUT Attendance & POS Billing."}
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
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
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
                    <p className="text-[10px] text-gray-400">Set whether this staff account is currently Active or Inactive</p>
                  </div>
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
