import React, { useState, useEffect, useRef } from 'react';
import { useAuth, Role, LandingSlide } from '../context/AuthContext';
import { cn } from '../lib/utils';
import {
  Building2, Printer, Shield, Users, Save, CheckCircle2,
  UserPlus, Edit2, Trash2, Key, Phone, Mail, FileText, Sparkles,
  Image as ImageIcon, Upload, Plus, X, Monitor, ExternalLink, Lock, KeyRound, ShieldCheck, Eye, EyeOff, Palette
} from 'lucide-react';
import ThemeCustomizer from '../components/theme/ThemeCustomizer';
import { PROJECT_MENU_ITEMS, parseAppAccess } from './EmployeeDirectory';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  role: Role | string;
  category: string;
  applicationAccess?: string;
  phone: string;
  familyPhone?: string;
  email: string;
  pinCode: string;
  status: 'ACTIVE' | 'INACTIVE';
  dob?: string;
  doj?: string;
  dor?: string;
  aadharNumber?: string;
  address?: string;
  photoUrl?: string;
}

const DEFAULT_STAFF: StaffUser[] = [
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

export default function Settings({ initialTab = 'profile' }: { initialTab?: 'profile' | 'billing' | 'staff' | 'landing' | 'security' | 'theme' }) {
  const { businessProfile, updateBusinessProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'staff' | 'landing' | 'security' | 'theme'>(initialTab);


  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const savedPass = localStorage.getItem('admin_custom_password') || 'admin123';

    if (currentPassword !== savedPass && currentPassword !== 'admin123' && currentPassword !== 'admin') {
      setPasswordError('Current Admin password is incorrect!');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match!');
      return;
    }

    localStorage.setItem('admin_custom_password', newPassword);
    setPasswordSuccess('Admin password updated successfully! ✅');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Profile State
  const [businessName, setBusinessName] = useState(businessProfile.businessName || '');
  const [legalName, setLegalName] = useState(businessProfile.legalName || '');
  const [tagline, setTagline] = useState(businessProfile.tagline || '');
  const [phone, setPhone] = useState(businessProfile.phone || '');
  const [email, setEmail] = useState(businessProfile.email || '');
  const [address, setAddress] = useState(businessProfile.address || '');
  const [city, setCity] = useState(businessProfile.city || 'Chennai');
  const [state, setState] = useState(businessProfile.state || 'Tamil Nadu');
  const [pincode, setPincode] = useState(businessProfile.pincode || '600001');
  const [gstin, setGstin] = useState(businessProfile.gstin || '');
  const [fssai, setFssai] = useState(businessProfile.fssai || '');
  const [currencySymbol, setCurrencySymbol] = useState(businessProfile.currencySymbol || '₹');
  const [currencyCode, setCurrencyCode] = useState(businessProfile.currencyCode || 'INR');

  // Billing / Invoice State
  const [invoicePrefix, setInvoicePrefix] = useState(businessProfile.invoicePrefix || 'INV/2026/');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(businessProfile.nextInvoiceNumber || 1001);
  const [defaultTaxRate, setDefaultTaxRate] = useState(businessProfile.defaultTaxRate || 5);
  const [taxMode, setTaxMode] = useState<'EXCLUSIVE' | 'INCLUSIVE'>(businessProfile.taxMode || 'EXCLUSIVE');
  const [paperSize, setPaperSize] = useState<'80MM' | '58MM' | 'A4'>(businessProfile.paperSize || '80MM');
  const [termsText, setTermsText] = useState(businessProfile.termsText || '');
  const [thankYouNote, setThankYouNote] = useState(businessProfile.thankYouNote || '');

  // Staff Management State
  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('universal_staff_list');
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return DEFAULT_STAFF;
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
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
  const staffPhotoInputRef = useRef<HTMLInputElement>(null);

  const [saveToast, setSaveToast] = useState(false);

  // Landing Page state
  const [landingTagline, setLandingTagline] = useState(businessProfile.landingTagline || businessProfile.tagline || '');
  const [landingSlides, setLandingSlides] = useState<LandingSlide[]>(businessProfile.landingSlides || []);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 600, 600, 0.85);
      updateBusinessProfile({ logoUrl: dataUrl });
    } catch {
      const dataUrl = await fileToDataUrl(file);
      updateBusinessProfile({ logoUrl: dataUrl });
    }
  };

  const handleSaveLanding = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      landingTagline,
      landingSlides,
      tagline: landingTagline || businessProfile.tagline,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const addSlide = () => {
    setLandingSlides(prev => [
      ...prev,
      { id: `slide-${Date.now()}`, imageUrl: '', caption: '', subCaption: '' },
    ]);
  };

  const updateSlide = (id: string, updates: Partial<LandingSlide>) => {
    setLandingSlides(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSlide = (id: string) => {
    setLandingSlides(prev => prev.filter(s => s.id !== id));
  };

  const handleSlideImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1400, 1400, 0.8);
      updateSlide(id, { imageUrl: dataUrl });
    } catch {
      const dataUrl = await fileToDataUrl(file);
      updateSlide(id, { imageUrl: dataUrl });
    }
  };

  useEffect(() => {
    localStorage.setItem('universal_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  // Handle Save Profile & Billing
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      businessName,
      legalName,
      tagline,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      gstin,
      fssai,
      currencySymbol,
      currencyCode,
      invoicePrefix,
      nextInvoiceNumber: Number(nextInvoiceNumber),
      defaultTaxRate: Number(defaultTaxRate),
      taxMode,
      paperSize,
      termsText,
      thankYouNote,
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 400, 400, 0.85);
      setStaffPhoto(dataUrl);
    } catch {
      const dataUrl = await fileToDataUrl(file);
      setStaffPhoto(dataUrl);
    }
  };

  const STANDARD_ROLES = ['CASHIER', 'MANAGER', 'ADMIN', 'STAFF'];

  // Staff Modal
  const handleOpenStaffModal = (st?: StaffUser) => {
    if (st) {
      setEditingStaff(st);
      setStaffName(st.name || '');
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
      setStaffFamilyPhone(st.familyPhone || '');
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
      setEditingStaff(null);
      setStaffName('');
      setStaffUsername('');
      setStaffRole('CASHIER');
      setCustomRoleTitle('');
      setIsCustomRole(false);
      setStaffCategory('Management/Admin');
      setCustomCategoryTitle('');
      setIsCustomCategory(false);
      setSelectedAppAccess([]);
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
    setIsStaffModalOpen(true);
  };

  const isStaffPhoneDuplicate = !!staffPhone.trim() && staffList.some(s => {
    if (editingStaff && s.id === editingStaff.id) return false;
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
    if (isStaffPhoneDuplicate) {
      alert('this number is already exits, give another number');
      return;
    }
    if (!staffAadhar.trim()) {
      alert('Aadhar Number is required!');
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

    if (editingStaff) {
      setStaffList(prev =>
        prev.map(s =>
          s.id === editingStaff.id
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

    // Save to backend database API
    try {
      const staffPayload = {
        name: staffName.trim(),
        username: effectiveUsername,
        phone: staffPhone.trim(),
        password: staffPin.trim() || '1234',
        pinCode: staffPin.trim() || '1234',
        role: computedRole,
        aadharNumber: staffAadhar.trim(),
        address: staffAddress.trim(),
        email: staffEmail.trim(),
      };
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffPayload),
      }).catch(err => console.error('Failed to sync user to API:', err));

      fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffPayload),
      }).catch(err => console.error('Failed to sync employee to API:', err));
    } catch (e) {}

    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (staffList.length <= 1) {
      alert('At least one staff/admin account must be maintained.');
      return;
    }
    if (confirm('Delete this staff account?')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      try {
        fetch(`/api/users/${id}`, { method: 'DELETE' }).catch(() => {});
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-lg shadow-gray-200/50">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2563EB]" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Business & System Settings</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure your business profile, receipt layouts, taxes, currency, and staff logins.
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar touch-pan-x">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0",
            activeTab === 'profile'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-extrabold"
              : "bg-[#131315] text-gray-400 hover:text-white border border-gray-200"
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'billing'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-gray-200"
          )}
        >
          <Printer className="w-4 h-4" />
          <span>Billing & Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'staff'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-gray-200"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Staff & Cashiers ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('landing')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'landing'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-gray-200"
          )}
        >
          <Monitor className="w-4 h-4" />
          <span>Landing Page</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'security'
              ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md"
              : "bg-[#131315] text-gray-400 hover:text-white border border-gray-200"
          )}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'theme'
              ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md"
              : "bg-[#131315] text-gray-400 hover:text-white border border-gray-200"
          )}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Color Palette</span>
        </button>
      </div>

      {/* TAB: THEME & COLOR PALETTE */}
      {activeTab === 'theme' && <ThemeCustomizer />}

      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40 space-y-6">
          <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#2563EB]" />
            <span>Store / Business Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Legal / Registered Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tagline / Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Physical Store / Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">GSTIN / Tax ID Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="33AAAAA0000A1Z5"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">FSSAI / Trade License (Optional)</label>
              <input
                type="text"
                value={fssai}
                onChange={(e) => setFssai(e.target.value)}
                placeholder="12421001000543"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Currency Code</label>
              <input
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: BILLING & INVOICE SETTINGS */}
      {activeTab === 'billing' && (
        <form onSubmit={handleSaveSettings} className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40 space-y-6">
          <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#2563EB]" />
            <span>Invoice & Print Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Invoice Number Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV/2026/"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Next Starting Number</label>
              <input
                type="number"
                value={nextInvoiceNumber}
                onChange={(e) => setNextInvoiceNumber(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Tax / GST Rate (%)</label>
              <select
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={5}>5% (Standard Essential)</option>
                <option value={12}>12% (Standard FMCG)</option>
                <option value={18}>18% (Standard Rate)</option>
                <option value={28}>28% (Luxury Rate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Paper Format</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              >
                <option value="80MM">80mm Thermal Receipt (Standard POS)</option>
                <option value="58MM">58mm Thermal Receipt (Compact POS)</option>
                <option value="A4">A4 Full Tax Invoice (Standard Print)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Terms & Conditions (Printed on Invoice)</label>
              <textarea
                rows={2}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Thank You Note</label>
              <input
                type="text"
                value={thankYouNote}
                onChange={(e) => setThankYouNote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Billing Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: STAFF & CASHIERS */}
      {activeTab === 'staff' && (
        <div className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-bold text-gray-900 text-base">Cashier & Staff Accounts</h3>
            </div>
            <button
              onClick={() => handleOpenStaffModal()}
              className="px-3.5 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl hover:bg-[#b08d4a] flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Employee</th>
                  <th className="p-3.5 whitespace-nowrap">Category</th>
                  <th className="p-3.5 whitespace-nowrap">Role</th>
                  <th className="p-3.5 whitespace-nowrap">Status</th>
                  <th className="p-3.5 whitespace-nowrap">DOB</th>
                  <th className="p-3.5 whitespace-nowrap">DOJ</th>
                  <th className="p-3.5 whitespace-nowrap">DOR</th>
                  <th className="p-3.5 text-[#C5A059] whitespace-nowrap">Aadhar No. *</th>
                  <th className="p-3.5 whitespace-nowrap">Contact No.</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {staffList.map(st => (
                  <tr key={st.id} className="hover:bg-gray-50 transition-colors">
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
                    <td className="p-3.5 font-mono text-[#C5A059] font-bold text-[11px] whitespace-nowrap">
                      {st.aadharNumber ? st.aadharNumber : <span className="text-red-400 text-[10px]">Required *</span>}
                    </td>
                    <td className="p-3.5 font-mono text-gray-600 text-[11px] whitespace-nowrap">
                      {st.phone || '—'}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenStaffModal(st)}
                          className="p-1.5 bg-gray-50 hover:bg-[#252528] text-gray-600 hover:text-[#C5A059] border border-gray-200 rounded-lg"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(st.id)}
                          className="p-1.5 bg-gray-50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-200 rounded-lg"
                          title="Delete Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-gray-900 text-base">
                  {editingStaff ? 'Edit Staff Details' : 'New Employee Details'}
                </h3>
              </div>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Employee Photo Upload Card */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {staffPhoto ? (
                  <img src={staffPhoto} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-[#C5A059]/40 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#252528] border border-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0 font-semibold">
                    No Photo
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">Employee Photo</p>
                  <p className="text-[10px] text-gray-400">Upload profile photo or identity picture (PNG/JPG)</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => staffPhotoInputRef.current?.click()}
                      className="px-3 py-1 bg-[#252528] hover:bg-gray-200 border border-gray-200 text-gray-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
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
                    <input ref={staffPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleStaffPhotoUpload} />
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
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
                      isStaffPhoneDuplicate
                        ? "bg-red-950/20 border border-red-500/50 text-red-300"
                        : "bg-[#141416] border border-[#222225] text-gray-400"
                    )}
                  />
                  <p className={cn("text-[10px] mt-1 flex items-center gap-1 font-medium", isStaffPhoneDuplicate ? "text-red-400 font-bold" : "text-gray-400")}>
                    {isStaffPhoneDuplicate ? "⚠️ this number is already exits, give another number" : "ℹ️ Mobile number is default username"}
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
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
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
                        className="w-full bg-gray-50 border border-[#C5A059]/40 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none font-medium"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
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
                        className="w-full bg-gray-50 border border-[#C5A059]/40 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none font-medium"
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
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all"
                    >
                      POS Cashier
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Dashboard', 'Billing POS', 'Categories & Items', 'Inventory', 'Sales Reports', 'Customers', 'Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all"
                    >
                      Store Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#C5A059] hover:border-[#C5A059]/50 transition-all"
                    >
                      Attendance Only
                    </button>
                  </div>

                  {/* Checklist Multi-Select Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-56 overflow-y-auto">
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
                        <span>Selected <strong className="text-[#2563EB]">{selectedAppAccess.length}</strong> of {PROJECT_MENU_ITEMS.length} menu modules</span>
                      )}
                    </span>
                  </div>
                </div>


                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={staffDob}
                    onChange={(e) => setStaffDob(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 text-[#2563EB]">Aadhar Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012"
                    value={staffAadhar}
                    onChange={(e) => setStaffAadhar(e.target.value)}
                    className="w-full bg-gray-50 border border-[#C5A059]/40 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Joining (DOJ)</label>
                  <input
                    type="date"
                    value={staffDoj}
                    onChange={(e) => setStaffDoj(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Relieving (DOR)</label>
                  <input
                    type="date"
                    value={staffDor}
                    onChange={(e) => setStaffDor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold mb-1", isStaffPhoneDuplicate ? "text-red-400 font-bold" : "text-[#2563EB]")}>
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
                      "w-full bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono outline-none transition-all",
                      isStaffPhoneDuplicate
                        ? "border-2 border-red-500 text-red-300 focus:border-red-400"
                        : "border border-[#C5A059]/40 focus:border-blue-400 text-white"
                    )}
                  />
                  {isStaffPhoneDuplicate && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-bold animate-in fade-in">
                      ⚠️ this number is already exits, give another number
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Family Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 11111"
                    value={staffFamilyPhone}
                    onChange={(e) => setStaffFamilyPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@business.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-blue-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Residential Address</label>
                  <textarea
                    rows={2}
                    placeholder="Full residential address..."
                    value={staffAddress}
                    onChange={(e) => setStaffAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
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

              <div className="flex justify-end gap-2 pt-3 border-t border-[#222225]">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-gray-50 text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold rounded-xl text-xs hover:bg-[#b08d4a]"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TAB 4: LANDING PAGE CUSTOMIZATION */}
      {activeTab === 'landing' && (
        <form onSubmit={handleSaveLanding} className="space-y-6">

          {/* Logo Upload */}
          <div className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2 mb-5">
              <ImageIcon className="w-5 h-5 text-[#2563EB]" />
              <span>Business Logo</span>
            </h3>

            <div className="flex items-center gap-6">
              {/* Current Logo Preview */}
              <div className="flex-shrink-0">
                {businessProfile.logoUrl ? (
                  <img
                    src={businessProfile.logoUrl}
                    alt="logo"
                    className="w-24 h-24 rounded-2xl object-contain border-2 border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#8C6D2B] flex items-center justify-center text-[#0A0A0B] font-bold text-4xl font-serif">
                    {businessProfile.businessName?.charAt(0)?.toUpperCase() || 'B'}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">Upload Your Business Logo</p>
                <p className="text-xs text-gray-400">PNG, JPG, or SVG. Displayed in the landing page header and printed invoices.</p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2.5 bg-gray-50 hover:bg-[#252528] border border-gray-200 hover:border-[#C5A059] text-gray-200 hover:text-[#C5A059] text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Choose Logo File
                </button>
                {businessProfile.logoUrl && (
                  <button
                    type="button"
                    onClick={() => updateBusinessProfile({ logoUrl: '' })}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Logo
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-200 pb-3 flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              <span>Landing Page Tagline</span>
            </h3>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Short description shown below your business name on the landing page
            </label>
            <textarea
              rows={3}
              value={landingTagline}
              onChange={e => setLandingTagline(e.target.value)}
              placeholder="e.g. Your trusted store for quality products and fast billing since 2010."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Image Carousel */}
          <div className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#2563EB]" />
                <span>Image Carousel Slides</span>
              </h3>
              <span className="text-xs text-gray-500">{landingSlides.length} slide{landingSlides.length !== 1 ? 's' : ''}</span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Add images that will auto-rotate on the landing page. Great for founder photos, store interior, products, team, about us, etc.
            </p>

            <div className="space-y-3 mb-4">
              {landingSlides.map((slide, idx) => (
                <div key={slide.id} className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* Image Thumbnail */}
                  <label className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-200 hover:border-[#C5A059] transition-colors cursor-pointer">
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} className="w-full h-full object-cover" alt="slide" />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[9px] mt-1 font-mono">Upload</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleSlideImageUpload(slide.id, e)}
                    />
                  </label>

                  {/* Caption fields */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-500 flex-shrink-0">#{idx + 1}</span>
                      <input
                        type="text"
                        placeholder="Caption (e.g. Our Founder — Mr. Ramesh Kumar)"
                        value={slide.caption}
                        onChange={e => updateSlide(slide.id, { caption: e.target.value })}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Sub-caption (e.g. Founded in 2010, serving 5000+ customers)"
                      value={slide.subCaption || ''}
                      onChange={e => updateSlide(slide.id, { subCaption: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteSlide(slide.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove slide"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {landingSlides.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <ImageIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No slides yet — click Add Slide to upload your first image</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addSlide}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-[#C5A059]/60 rounded-xl text-xs text-gray-400 hover:text-[#C5A059] font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Slide
            </button>
          </div>

          {/* Preview Link + Save */}
          <div className="flex items-center justify-between">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[#C5A059] hover:text-[#b08d4a] font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Landing Page
            </a>

            <div className="flex items-center gap-3">
              {saveToast && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Landing Page Saved!</span>
                </div>
              )}
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#C5A059] to-[#9E7B35] hover:from-[#b08d4a] hover:to-[#8C6D2B] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Landing Page</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: SECURITY & CHANGE PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleChangeAdminPassword} className="bg-white/90 border border-gray-100 rounded-2xl p-6 shadow-lg shadow-gray-200/40 space-y-5 max-w-2xl">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#2563EB]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base font-serif">Change Administrator Password</h3>
                <p className="text-xs text-gray-400">Update your Admin login credentials for system access security</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Current Admin Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Admin Password *</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#9E7B35] hover:from-[#d4b06a] hover:to-[#b08d4a] text-[#080809] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Update Admin Password</span>
              </button>
            </div>
          </form>

          {/* Security Information Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xl max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Administrator Account Security Status</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Admin Username</p>
                <p className="font-bold text-gray-900 font-mono text-xs mt-0.5">admin</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Security Level</p>
                <p className="font-bold text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Protected
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
