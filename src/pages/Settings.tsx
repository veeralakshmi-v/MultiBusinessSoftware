import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth, Role, LandingSlide } from '../context/AuthContext';
import { cn } from '../lib/utils';
import {
  Building2, Printer, Shield, Users, Save, CheckCircle2,
  UserPlus, Edit2, Trash2, Key, Phone, Mail, FileText, Sparkles,
  Image as ImageIcon, Upload, Plus, X, Monitor, ExternalLink, Lock, KeyRound, ShieldCheck, Eye, EyeOff, Palette,
  LifeBuoy, MessageSquare, Send, Clock, AlertCircle
} from 'lucide-react';
import ThemeCustomizer from '../components/theme/ThemeCustomizer';
import {
  PROJECT_MENU_ITEMS, parseAppAccess, UNIVERSAL_CATEGORIES,
  getRolesForCategory, getDefaultRoleForCategory
} from './EmployeeDirectory';
import {
  isValidPhone, isValidAadhar, cleanPhone, cleanAadhar, formatAadhar
} from '../utils/validation';
import { PlatformEngine, SupportTicket, TicketPriority, TicketStatus } from '../lib/tenant/platformEngine';

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

export type SettingsTab = 'profile' | 'billing' | 'staff' | 'landing' | 'security' | 'theme' | 'support';

export default function Settings({ initialTab = 'profile' }: { initialTab?: SettingsTab }) {
  const { businessProfile, updateBusinessProfile, user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getResolvedTab = (): SettingsTab => {
    const stateTab = (location.state as { tab?: SettingsTab })?.tab;
    const queryTab = searchParams.get('tab') as SettingsTab;
    const validTabs: SettingsTab[] = ['profile', 'billing', 'staff', 'landing', 'security', 'theme', 'support'];
    if (stateTab && validTabs.includes(stateTab)) return stateTab;
    if (queryTab && validTabs.includes(queryTab)) return queryTab;
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getResolvedTab);

  useEffect(() => {
    const resolved = getResolvedTab();
    setActiveTab(resolved);
  }, [location.state, location.search, initialTab]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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

  // Help & Support Helpdesk State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const all = PlatformEngine.getSupportTickets();
    const currentBizName = businessProfile?.businessName || '';
    const currentTenantId = user?.businessId || '';
    return all.filter(t => (currentTenantId && t.tenantId === currentTenantId) || (currentBizName && t.businessName === currentBizName));
  });

  const [isRaiseTicketModalOpen, setIsRaiseTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Printer / POS Setup');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('MEDIUM');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'ALL' | TicketStatus>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  const refreshSupportTickets = () => {
    const all = PlatformEngine.getSupportTickets();
    const currentBizName = businessProfile?.businessName || '';
    const currentTenantId = user?.businessId || '';
    setSupportTickets(all.filter(t => (currentTenantId && t.tenantId === currentTenantId) || (currentBizName && t.businessName === currentBizName)));
  };

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const currentBizName = businessProfile?.businessName || 'Business Admin';
    const currentTenantId = user?.businessId || `biz-${Date.now()}`;
    const ownerEmail = businessProfile?.email || 'admin@business.com';

    const fullDesc = `[Category: ${ticketCategory}]\n${ticketDescription.trim()}`;

    const newTicket = PlatformEngine.createTicket({
      tenantId: currentTenantId,
      businessName: currentBizName,
      ownerEmail,
      subject: ticketSubject.trim(),
      description: fullDesc,
      priority: ticketPriority,
    });

    refreshSupportTickets();

    setTicketSubject('');
    setTicketDescription('');
    setTicketPriority('MEDIUM');
    setIsRaiseTicketModalOpen(false);
    alert(`Support Ticket #${newTicket.id} created successfully! Our Super Admin team has been notified.`);
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const currentBizName = businessProfile?.businessName || 'Business Admin';
    const updated = PlatformEngine.addTicketReply(selectedTicket.id, currentBizName, ticketReplyText.trim(), false);
    if (updated) {
      setSelectedTicket(updated);
      refreshSupportTickets();
      setTicketReplyText('');
    }
  };

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
      setEditingStaff(null);
      setStaffName('');
      setStaffUsername('');
      setStaffRole(getDefaultRoleForCategory('Management/Admin'));
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
    if (isStaffPhoneDuplicate) {
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

    // Save to backend database API
    try {
      const staffPayload = {
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
          onClick={() => handleTabChange('profile')}
          className={cn(
            "px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer",
            activeTab === 'profile'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => handleTabChange('billing')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
            activeTab === 'billing'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <Printer className="w-4 h-4" />
          <span>Billing & Invoices</span>
        </button>

        <button
          onClick={() => handleTabChange('staff')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
            activeTab === 'staff'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Staff & Cashiers ({staffList.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('landing')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
            activeTab === 'landing'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <Monitor className="w-4 h-4" />
          <span>Landing Page</span>
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
            activeTab === 'security'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => handleTabChange('theme')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
            activeTab === 'theme'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Color Palette</span>
        </button>

        <button
          onClick={() => handleTabChange('support')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer",
            activeTab === 'support'
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25 font-extrabold"
              : "bg-white hover:bg-slate-50 text-gray-700 border border-gray-200 shadow-xs"
          )}
        >
          <LifeBuoy className="w-4 h-4 text-blue-600" />
          <span>Help & Support</span>
          {supportTickets.filter(t => t.status !== 'RESOLVED').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-[#2563EB] font-mono font-bold">
              {supportTickets.filter(t => t.status !== 'RESOLVED').length}
            </span>
          )}
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
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
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
                  <th className="p-3.5 text-[#2563EB] whitespace-nowrap">Aadhar No. *</th>
                  <th className="p-3.5 whitespace-nowrap">Contact No.</th>
                  <th className="p-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map(st => (
                  <tr key={st.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {st.photoUrl ? (
                          <img src={st.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-blue-200 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center font-bold text-xs flex-shrink-0">
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
                        st.role === 'ADMIN' ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          st.role === 'MANAGER' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      )}>
                        {st.role}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        st.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-red-50 text-red-700 border border-red-200"
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
                      {st.aadharNumber ? st.aadharNumber : <span className="text-red-500 text-[10px]">Required *</span>}
                    </td>
                    <td className="p-3.5 font-mono text-gray-600 text-[11px] whitespace-nowrap">
                      {st.phone || '—'}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenStaffModal(st)}
                          className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-[#2563EB] border border-gray-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(st.id)}
                          className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-gray-900 text-base">
                  {editingStaff ? 'Edit Staff Details' : 'New Employee Details'}
                </h3>
              </div>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-400 hover:text-gray-900 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Employee Photo Upload Card */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {staffPhoto ? (
                  <img src={staffPhoto} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-blue-200 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0 font-semibold">
                    No Photo
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-900">Employee Photo</p>
                  <p className="text-[10px] text-gray-500">Upload profile photo or identity picture (PNG/JPG)</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => staffPhotoInputRef.current?.click()}
                      className="px-3 py-1 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{staffPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>
                    {staffPhoto && (
                      <button
                        type="button"
                        onClick={() => setStaffPhoto('')}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
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
                        ? "bg-red-50 border border-red-300 text-red-700"
                        : "bg-gray-100 border border-gray-200 text-gray-700"
                    )}
                  />
                  <p className={cn("text-[10px] mt-1 flex items-center gap-1 font-medium", isStaffPhoneDuplicate ? "text-red-500 font-bold" : "text-gray-500")}>
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
                        const defaultRole = getDefaultRoleForCategory(val);
                        setStaffRole(defaultRole);
                        setIsCustomRole(false);
                        if (defaultRole === 'ADMIN') {
                          setStaffStatus('ACTIVE');
                        }
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
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
                        className="w-full bg-gray-50 border border-blue-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none font-medium"
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
                        className="w-full bg-gray-50 border border-blue-300 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Application Access * <span className="text-[10px] text-[#2563EB] font-normal">(Select allowed Project Menu items)</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedAppAccess([...PROJECT_MENU_ITEMS])}
                        className="text-[11px] text-[#2563EB] hover:underline font-bold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 transition-all hover:bg-blue-100 cursor-pointer"
                      >
                        Select All (Full Access)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAppAccess([])}
                        className="text-[11px] text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg bg-slate-100 border border-gray-200 transition-all hover:bg-slate-200 cursor-pointer"
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
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#2563EB] hover:border-blue-300 transition-all cursor-pointer"
                    >
                      POS Cashier
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Dashboard', 'Billing POS', 'Categories & Items', 'Inventory', 'Sales Reports', 'Customers', 'Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#2563EB] hover:border-blue-300 transition-all cursor-pointer"
                    >
                      Store Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppAccess(['Staff Attendance'])}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-[#2563EB] hover:border-blue-300 transition-all cursor-pointer"
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
                              ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
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

                  <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-0.5">
                    <span>
                      {selectedAppAccess.length === PROJECT_MENU_ITEMS.length ? (
                        <span className="text-emerald-600 font-semibold">⚡ Full Access (All 9 Menu Modules Selected)</span>
                      ) : selectedAppAccess.length === 0 ? (
                        <span className="text-red-500 font-semibold">⚠️ No access selected (Please check at least 1 menu module)</span>
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#2563EB]">Aadhar Number (12 Digits) *</label>
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
                    className="w-full bg-gray-50 border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">12-digit UIDAI Aadhaar card number</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Joining (DOJ)</label>
                  <input
                    type="date"
                    value={staffDoj}
                    onChange={(e) => setStaffDoj(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Relieving (DOR)</label>
                  <input
                    type="date"
                    value={staffDor}
                    onChange={(e) => setStaffDor(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className={cn("block text-xs font-semibold mb-1", isStaffPhoneDuplicate ? "text-red-500 font-bold" : "text-[#2563EB]")}>
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
                      isStaffPhoneDuplicate
                        ? "border-2 border-red-500 text-red-700 focus:border-red-400"
                        : "border border-gray-200 focus:border-blue-400 text-gray-900"
                    )}
                  />
                  {isStaffPhoneDuplicate ? (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-bold animate-in fade-in">
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
                    <p className="text-xs font-semibold text-gray-900">Employment Status</p>
                    <p className="text-[10px] text-gray-500">
                      {staffRole === 'ADMIN'
                        ? "Admin accounts are protected and strictly maintained as Active"
                        : "Set whether this staff account is currently Active or Inactive"}
                    </p>
                  </div>
                  {staffRole === 'ADMIN' ? (
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ALWAYS ACTIVE (ADMIN)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffStatus('ACTIVE')}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          staffStatus === 'ACTIVE'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
                            : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900"
                        )}
                      >
                        ACTIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaffStatus('INACTIVE')}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          staffStatus === 'INACTIVE'
                            ? "bg-red-50 text-red-700 border border-red-300 shadow-xs"
                            : "bg-white border border-gray-200 text-gray-500 hover:text-gray-900"
                        )}
                      >
                        INACTIVE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-4xl font-serif shadow-md">
                    {businessProfile.businessName?.charAt(0)?.toUpperCase() || 'B'}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Upload Your Business Logo</p>
                <p className="text-xs text-gray-500">PNG, JPG, or SVG. Displayed in the landing page header and printed invoices.</p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-gray-200 hover:border-blue-400 text-gray-800 hover:text-[#2563EB] text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#2563EB]" />
                  Choose Logo File
                </button>
                {businessProfile.logoUrl && (
                  <button
                    type="button"
                    onClick={() => updateBusinessProfile({ logoUrl: '' })}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 resize-none"
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

            <p className="text-xs text-gray-500 mb-4">
              Add images that will auto-rotate on the landing page. Great for founder photos, store interior, products, team, about us, etc.
            </p>

            <div className="space-y-3 mb-4">
              {landingSlides.map((slide, idx) => (
                <div key={slide.id} className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* Image Thumbnail */}
                  <label className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-white">
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} className="w-full h-full object-cover" alt="slide" />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-[9px] mt-1 font-mono text-gray-500">Upload</span>
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
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Sub-caption (e.g. Founded in 2010, serving 5000+ customers)"
                      value={slide.subCaption || ''}
                      onChange={e => updateSlide(slide.id, { subCaption: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteSlide(slide.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                    title="Remove slide"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {landingSlides.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No slides yet — click Add Slide to upload your first image</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addSlide}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl text-xs text-gray-500 hover:text-[#2563EB] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
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
              className="flex items-center gap-2 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Landing Page
            </a>

            <div className="flex items-center gap-3">
              {saveToast && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Landing Page Saved!</span>
                </div>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Change Administrator Password</h3>
                <p className="text-xs text-gray-500">Update your Admin login credentials for system access security</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Update Admin Password</span>
              </button>
            </div>
          </form>

          {/* Security Information Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xl max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Administrator Account Security Status</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Admin Username</p>
                <p className="font-mono font-bold text-gray-900 mt-0.5">admin</p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Password Protection</p>
                <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Encrypted in Secure Local Storage</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: HELP & SUPPORT HELPDESK */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner & Action */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Super Admin Helpdesk & Support</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Need assistance with thermal printers, GST billing, or subscription changes? Raise a ticket directly to the platform Super Admin.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsRaiseTicketModalOpen(true)}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto whitespace-nowrap transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Support Ticket</span>
            </button>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as (TicketStatus | 'ALL')[]).map((st) => (
              <button
                key={st}
                onClick={() => setTicketFilterStatus(st)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  ticketFilterStatus === st
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Tickets Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Ticket ID</th>
                    <th className="px-6 py-4 min-w-[280px]">Subject & Category</th>
                    <th className="px-4 py-4 whitespace-nowrap text-center">Priority</th>
                    <th className="px-4 py-4 whitespace-nowrap text-center">Status</th>
                    <th className="px-4 py-4 whitespace-nowrap">Created Date</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {supportTickets.filter(t => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                        <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-500" />
                        <p className="font-semibold text-gray-600">No support tickets found.</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 mb-4">You have not submitted any tickets yet under this category.</p>
                        <button
                          onClick={() => setIsRaiseTicketModalOpen(true)}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Submit a New Ticket</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    supportTickets
                      .filter(t => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                      .map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">{ticket.id}</td>
                          <td className="px-6 py-4 min-w-[280px] max-w-md">
                            <div className="font-bold text-gray-900">{ticket.subject}</div>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{ticket.description}</p>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={cn(
                                'px-3 py-1 rounded-md text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center min-w-[70px]',
                                ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : ticket.priority === 'MEDIUM'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              )}
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap inline-flex items-center justify-center min-w-[90px]',
                                ticket.status === 'OPEN'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              )}
                            >
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-[11px] whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              View & Reply ({ticket.replies.length})
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RAISE NEW SUPPORT TICKET */}
      {isRaiseTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Raise Support Ticket</h3>
                  <p className="text-[11px] text-gray-500">Directly contact the Super Admin platform team</p>
                </div>
              </div>
              <button
                onClick={() => setIsRaiseTicketModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Issue Category *</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  >
                    <option value="Printer / POS Setup">Printer / POS Setup</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                    <option value="GST & Taxes">GST & Taxes</option>
                    <option value="Subscription & Plan Upgrade">Subscription & Plan Upgrade</option>
                    <option value="Custom Domain & Website">Custom Domain & Website</option>
                    <option value="Staff & Access Issue">Staff & Access Issue</option>
                    <option value="Technical Bug / Other">Technical Bug / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Priority Level *</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Billing Down)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 80mm ESC/POS thermal printer layout alignment assistance"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue, questions, or setup requirements in detail..."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2 text-[11px] text-blue-800">
                <Clock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <span>Super Admin receives high-priority instant notifications for all new tickets and will respond directly to this helpdesk thread.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRaiseTicketModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW TICKET CONVERSATION & REPLY */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">{selectedTicket.id}</span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                      selectedTicket.status === 'OPEN'
                        ? 'bg-rose-50 text-rose-700'
                        : selectedTicket.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    )}
                  >
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">• Priority: {selectedTicket.priority}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mt-1">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px]">
              {selectedTicket.replies.map((rep) => (
                <div
                  key={rep.id}
                  className={cn(
                    'p-4 rounded-2xl border text-xs space-y-1.5',
                    rep.isSuperAdmin
                      ? 'bg-blue-50/70 border-blue-200 text-blue-950 ml-4 sm:ml-8'
                      : 'bg-gray-50 border-gray-200 text-gray-900 mr-4 sm:mr-8'
                  )}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className={rep.isSuperAdmin ? 'text-[#2563EB] flex items-center gap-1' : 'text-gray-700'}>
                      {rep.isSuperAdmin ? '🛡️ Super Admin Support' : rep.author}
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">
                      {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(rep.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-xs">{rep.message}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendTicketReply} className="pt-2 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                placeholder="Type your reply to Super Admin..."
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
              <button
                type="submit"
                disabled={!ticketReplyText.trim()}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reply</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
