import React, { useState, useEffect, useRef } from 'react';
import { useAuth, Role, LandingSlide } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { 
  Building2, Printer, Shield, Users, Save, CheckCircle2, 
  UserPlus, Edit2, Trash2, Key, Phone, Mail, FileText, Sparkles,
  Image as ImageIcon, Upload, Plus, X, Monitor, ExternalLink
} from 'lucide-react';

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  role: Role;
  category: string;
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

export default function Settings({ initialTab = 'profile' }: { initialTab?: 'profile' | 'billing' | 'staff' | 'landing' }) {
  const { businessProfile, updateBusinessProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'staff' | 'landing'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_STAFF;
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
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

  // Staff Modal
  const handleOpenStaffModal = (st?: StaffUser) => {
    if (st) {
      setEditingStaff(st);
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
      setEditingStaff(null);
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
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffUsername.trim()) {
      alert('Full Name and Username are required!');
      return;
    }
    if (!staffAadhar.trim()) {
      alert('Aadhar Number is required!');
      return;
    }

    if (editingStaff) {
      setStaffList(prev =>
        prev.map(s =>
          s.id === editingStaff.id
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
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (staffList.length <= 1) {
      alert('At least one staff/admin account must be maintained.');
      return;
    }
    if (confirm('Delete this staff account?')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#C5A059]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Business & System Settings</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
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
      <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'profile'
              ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-[#1F1F21]"
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
              ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-[#1F1F21]"
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
              ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-[#1F1F21]"
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
              ? "bg-[#C5A059] text-[#0A0A0B] shadow-md shadow-[#C5A059]/20"
              : "bg-[#131315] text-gray-400 hover:text-white border border-[#1F1F21]"
          )}
        >
          <Monitor className="w-4 h-4" />
          <span>Landing Page</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base border-b border-[#1F1F21] pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C5A059]" />
            <span>Store / Business Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Legal / Registered Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tagline / Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Physical Store / Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">GSTIN / Tax ID Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="33AAAAA0000A1Z5"
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">FSSAI / Trade License (Optional)</label>
              <input
                type="text"
                value={fssai}
                onChange={(e) => setFssai(e.target.value)}
                placeholder="12421001000543"
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Currency Code</label>
              <input
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1F1F21]">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#DFBA73] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20 hover:brightness-110 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: BILLING & INVOICE SETTINGS */}
      {activeTab === 'billing' && (
        <form onSubmit={handleSaveSettings} className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="font-bold text-white text-base border-b border-[#1F1F21] pb-3 flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#C5A059]" />
            <span>Invoice & Print Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Invoice Number Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV/2026/"
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Next Starting Number</label>
              <input
                type="number"
                value={nextInvoiceNumber}
                onChange={(e) => setNextInvoiceNumber(Number(e.target.value))}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Default Tax / GST Rate (%)</label>
              <select
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={5}>5% (Standard Essential)</option>
                <option value={12}>12% (Standard FMCG)</option>
                <option value={18}>18% (Standard Rate)</option>
                <option value={28}>28% (Luxury Rate)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Default Paper Format</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              >
                <option value="80MM">80mm Thermal Receipt (Standard POS)</option>
                <option value="58MM">58mm Thermal Receipt (Compact POS)</option>
                <option value="A4">A4 Full Tax Invoice (Standard Print)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Terms & Conditions (Printed on Invoice)</label>
              <textarea
                rows={2}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl p-3 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Thank You Note</label>
              <input
                type="text"
                value={thankYouNote}
                onChange={(e) => setThankYouNote(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1F1F21]">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#DFBA73] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20 hover:brightness-110 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Billing Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: STAFF & CASHIERS */}
      {activeTab === 'staff' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-bold text-white text-base">Cashier & Staff Accounts</h3>
            </div>
            <button
              onClick={() => handleOpenStaffModal()}
              className="px-3.5 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl hover:bg-[#b08d4a] flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1F1F21] bg-[#0E0E10] shadow-xl">
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
                {staffList.map(st => (
                  <tr key={st.id} className="hover:bg-[#18181A] transition-colors">
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenStaffModal(st)}
                          className="p-1.5 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 hover:text-[#C5A059] border border-[#2D2D30] rounded-lg"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(st.id)}
                          className="p-1.5 bg-[#1A1A1C] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-[#2D2D30] rounded-lg"
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
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-base">
                  {editingStaff ? 'Edit Staff Details' : 'Add New Staff Member'}
                </h3>
              </div>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Employee Photo Upload Card */}
              <div className="flex items-center gap-4 p-3 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl">
                {staffPhoto ? (
                  <img src={staffPhoto} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-[#C5A059]/40 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#252528] border border-[#3D3D40] flex items-center justify-center text-gray-500 text-xs flex-shrink-0 font-semibold">
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
                    <input ref={staffPhotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleStaffPhotoUpload} />
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
                    <option value="CASHIER">CASHIER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                  </select>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-[#222225]">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1A1C] text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
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
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base border-b border-[#1F1F21] pb-3 flex items-center gap-2 mb-5">
              <ImageIcon className="w-5 h-5 text-[#C5A059]" />
              <span>Business Logo</span>
            </h3>

            <div className="flex items-center gap-6">
              {/* Current Logo Preview */}
              <div className="flex-shrink-0">
                {businessProfile.logoUrl ? (
                  <img
                    src={businessProfile.logoUrl}
                    alt="logo"
                    className="w-24 h-24 rounded-2xl object-contain border-2 border-[#2D2D30] bg-[#1A1A1C]"
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
                  className="px-4 py-2.5 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-gray-200 hover:text-[#C5A059] text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
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
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base border-b border-[#1F1F21] pb-3 flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-[#C5A059]" />
              <span>Landing Page Tagline</span>
            </h3>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Short description shown below your business name on the landing page
            </label>
            <textarea
              rows={3}
              value={landingTagline}
              onChange={e => setLandingTagline(e.target.value)}
              placeholder="e.g. Your trusted store for quality products and fast billing since 2010."
              className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#C5A059] resize-none"
            />
          </div>

          {/* Image Carousel */}
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3 mb-5">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Monitor className="w-5 h-5 text-[#C5A059]" />
                <span>Image Carousel Slides</span>
              </h3>
              <span className="text-xs text-gray-500">{landingSlides.length} slide{landingSlides.length !== 1 ? 's' : ''}</span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Add images that will auto-rotate on the landing page. Great for founder photos, store interior, products, team, about us, etc.
            </p>

            <div className="space-y-3 mb-4">
              {landingSlides.map((slide, idx) => (
                <div key={slide.id} className="flex items-start gap-3 p-3.5 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl">
                  {/* Image Thumbnail */}
                  <label className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-dashed border-[#3D3D40] hover:border-[#C5A059] transition-colors cursor-pointer">
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
                        className="flex-1 bg-[#141416] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A059]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Sub-caption (e.g. Founded in 2010, serving 5000+ customers)"
                      value={slide.subCaption || ''}
                      onChange={e => updateSlide(slide.id, { subCaption: e.target.value })}
                      className="w-full bg-[#141416] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#C5A059]"
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
                <div className="text-center py-8 border-2 border-dashed border-[#2D2D30] rounded-xl">
                  <ImageIcon className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No slides yet — click Add Slide to upload your first image</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addSlide}
              className="w-full py-2.5 border-2 border-dashed border-[#2D2D30] hover:border-[#C5A059]/60 rounded-xl text-xs text-gray-400 hover:text-[#C5A059] font-semibold flex items-center justify-center gap-2 transition-all"
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
                className="px-6 py-3 bg-gradient-to-r from-[#C5A059] to-[#9E7B35] hover:from-[#b08d4a] hover:to-[#8C6D2B] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#C5A059]/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Landing Page</span>
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
}
