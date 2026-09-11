import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Gift, Clock, Heart, Plus, Edit2, MessageSquare,
  Phone, Building2, User, Cake, Sparkles, MapPin, Mail, Globe,
  FileText, ShieldCheck, CheckCircle2, AlertCircle, X, Send,
  Calendar, CreditCard, ChevronRight, Check, Percent, Tag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NotificationEngine } from '../lib/notifications/notificationEngine';

export type CustomerType = 'INDIVIDUAL' | 'COMPANY';

export interface Customer {
  id: string;
  type?: CustomerType;
  name: string;
  companyName?: string;
  contactPerson?: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  stateCode?: string;
  website?: string;
  creditLimit?: number;
  paymentTerms?: string;
  birthday?: string; // YYYY-MM-DD
  anniversary?: string; // YYYY-MM-DD
  shippingAddress?: string;
  pendingBalance?: number;
  loyaltyPoints?: number;
  createdAt?: string;
  notes?: string;
  favoriteItems?: any[];
  orders?: any[];
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INDIVIDUAL' | 'COMPANY' | 'CELEBRATIONS' | 'DUE'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [offerModalData, setOfferModalData] = useState<{ customer: Customer; type: 'BIRTHDAY' | 'ANNIVERSARY' } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchCustomers = () => {
    let list: Customer[] = [];
    try {
      const saved = localStorage.getItem('universal_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {}

    fetch(`/api/customers?search=${search}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const ids = new Set(list.map(l => l.id));
          data.forEach((d: any) => { if (!ids.has(d.id)) list.push(d); });
          localStorage.setItem('universal_customers', JSON.stringify(list));
        }
        setCustomers(list);
      })
      .catch(() => {
        setCustomers(list);
      });
  };

  useEffect(() => {
    const delay = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(delay);
  }, [search]);

  // Today MM-DD lookup for celebrations
  const todayMMDD = useMemo(() => {
    const now = new Date();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    return `${mm}-${dd}`;
  }, []);

  // Today celebrations list
  const celebrationsToday = useMemo(() => {
    return customers.filter(c => {
      const bdayMMDD = c.birthday ? c.birthday.slice(5) : '';
      const annivMMDD = c.anniversary ? c.anniversary.slice(5) : '';
      return bdayMMDD === todayMMDD || annivMMDD === todayMMDD;
    });
  }, [customers, todayMMDD]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter(c => {
      // Search match
      const matchSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.companyName?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.gstNumber?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Filter tabs
      if (filterType === 'INDIVIDUAL') return (c.type || 'INDIVIDUAL') === 'INDIVIDUAL';
      if (filterType === 'COMPANY') return c.type === 'COMPANY';
      if (filterType === 'DUE') return (c.pendingBalance || 0) > 0;
      if (filterType === 'CELEBRATIONS') {
        const bdayMMDD = c.birthday ? c.birthday.slice(5) : '';
        const annivMMDD = c.anniversary ? c.anniversary.slice(5) : '';
        return bdayMMDD === todayMMDD || annivMMDD === todayMMDD;
      }
      return true;
    });
  }, [customers, search, filterType, todayMMDD]);

  const fetchCustomerDetails = (id: string) => {
    const found = customers.find(c => c.id === id);
    if (found) {
      setSelectedCustomer(found);
    } else {
      fetch(`/api/customers/${id}`)
        .then(r => r.json())
        .then(setSelectedCustomer)
        .catch(() => {});
    }
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setShowForm(true);
  };

  const handleOpenOfferModal = (customer: Customer, type: 'BIRTHDAY' | 'ANNIVERSARY') => {
    setOfferModalData({ customer, type });
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Customers & Loyalty CRM</h1>
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
              {customers.length} Profiles
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Manage Individual & B2B Company profiles, GSTIN details, credit ledgers, and automated birthday/anniversary offers
          </p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setShowForm(true); }}
          className="w-full sm:w-auto justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Customer / Company
        </button>
      </div>

      {/* Celebrations Banner Widget */}
      {celebrationsToday.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  🎉 Today's Celebrations ({celebrationsToday.length})
                </p>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                Customer special milestones today! Send automated personalized greeting with discount coupon code.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {celebrationsToday.map(c => {
              const isBday = c.birthday && c.birthday.slice(5) === todayMMDD;
              return (
                <button
                  key={c.id}
                  onClick={() => handleOpenOfferModal(c, isBday ? 'BIRTHDAY' : 'ANNIVERSARY')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-105"
                >
                  {isBday ? <Cake className="w-3.5 h-3.5 text-rose-500" /> : <Heart className="w-3.5 h-3.5 text-pink-500" />}
                  <span>{c.name} ({isBday ? 'Birthday 🎂' : 'Anniversary 💍'})</span>
                  <span className="ml-1 text-[10px] text-[#2563EB] underline">Send Offer →</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar + Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column: Filter Tabs + Customer List */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[750px]">
          
          {/* Filter Pills */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'INDIVIDUAL', label: '👤 Individual' },
              { id: 'COMPANY', label: '🏢 Company' },
              { id: 'CELEBRATIONS', label: `🎉 Today (${celebrationsToday.length})` },
              { id: 'DUE', label: 'Due' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterType === tab.id
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, GSTIN, mobile..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
              />
            </div>
          </div>

          {/* Customer Items */}
          <div className="overflow-y-auto p-2 space-y-1.5 flex-1">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700">No customers found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Try a different search or filter</p>
              </div>
            ) : (
              filteredCustomers.map(c => {
                const isSelected = selectedCustomer?.id === c.id;
                const cBalance = c.pendingBalance || 0;
                const isCompany = c.type === 'COMPANY';
                const isBdayToday = c.birthday && c.birthday.slice(5) === todayMMDD;
                const isAnnivToday = c.anniversary && c.anniversary.slice(5) === todayMMDD;

                return (
                  <button
                    key={c.id}
                    onClick={() => fetchCustomerDetails(c.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-2",
                      isSelected
                        ? "bg-blue-50/90 border-blue-300 shadow-sm"
                        : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isCompany
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-100 text-[#2563EB] border border-blue-200'
                      }`}>
                        {isCompany ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-gray-900 truncate">
                            {c.name}
                          </p>
                          {isCompany && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase font-bold">
                              B2B
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                          <span>{c.mobile}</span>
                          {c.gstNumber && <span className="truncate">· GST: {c.gstNumber}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {cBalance > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-600 border border-red-200">
                          Due: ₹{cBalance.toFixed(0)}
                        </span>
                      )}
                      {(isBdayToday || isAnnivToday) && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          {isBdayToday ? '🎂 Bday' : '💍 Anniv'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <CustomerProfile
              customer={selectedCustomer}
              refresh={() => fetchCustomerDetails(selectedCustomer.id)}
              onEdit={() => handleOpenEdit(selectedCustomer)}
              onSendOffer={handleOpenOfferModal}
              showToast={showToast}
            />
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center mb-4 shadow-sm">
                <Users className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Select a Customer / Company</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Click any profile on the left to view GSTIN information, order history, credit ledger, or dispatch celebration discount offers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => { setShowForm(false); setEditingCustomer(null); }}
          onSave={() => {
            setShowForm(false);
            setEditingCustomer(null);
            fetchCustomers();
            showToast(editingCustomer ? 'Customer profile updated successfully! ✅' : 'New customer registered successfully! 🎉');
          }}
        />
      )}

      {/* Birthday / Anniversary Offer Modal */}
      {offerModalData && (
        <OfferDispatchModal
          customer={offerModalData.customer}
          type={offerModalData.type}
          onClose={() => setOfferModalData(null)}
          onSent={() => {
            setOfferModalData(null);
            showToast(`Offer notification dispatched to ${offerModalData.customer.name}! 🎁`);
          }}
        />
      )}
    </div>
  );
}

// ─── Customer Profile View ───────────────────────────────────────────────────

function CustomerProfile({
  customer,
  refresh,
  onEdit,
  onSendOffer,
  showToast,
}: {
  customer: Customer;
  refresh: () => void;
  onEdit: () => void;
  onSendOffer: (c: Customer, type: 'BIRTHDAY' | 'ANNIVERSARY') => void;
  showToast: (msg: string) => void;
}) {
  const [notifyMsg, setNotifyMsg] = useState('');
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');

  const isCompany = customer.type === 'COMPANY';

  // Customer Orders live lookup
  const customerOrders = useMemo(() => {
    let loaded: any[] = [];
    try {
      const saved = localStorage.getItem('universal_orders');
      if (saved) loaded = JSON.parse(saved);
      const savedGst = localStorage.getItem('universal_gst_bills');
      if (savedGst) {
        const parsed = JSON.parse(savedGst);
        const ids = new Set(loaded.map(o => o.id));
        parsed.forEach((o: any) => { if (!ids.has(o.id)) loaded.push(o); });
      }
      const savedNonGst = localStorage.getItem('universal_nongst_bills');
      if (savedNonGst) {
        const parsed = JSON.parse(savedNonGst);
        const ids = new Set(loaded.map(o => o.id));
        parsed.forEach((o: any) => { if (!ids.has(o.id)) loaded.push(o); });
      }
    } catch {}

    const filtered = loaded.filter((o: any) => {
      if (o.customerId && o.customerId === customer.id) return true;
      if (o.customerMobile && customer.mobile && o.customerMobile === customer.mobile) return true;
      if (o.customerName && customer.name && o.customerName.toLowerCase() === customer.name.toLowerCase()) return true;
      return false;
    });

    if (filtered.length > 0) return filtered;
    return customer.orders || [];
  }, [customer]);

  // Compute Total Pending Balance
  const totalPendingBalance = useMemo(() => {
    if (customer.pendingBalance !== undefined && customer.pendingBalance > 0) {
      return customer.pendingBalance;
    }
    return customerOrders.reduce((sum: number, o: any) => {
      const bal = o.balanceAmount !== undefined ? o.balanceAmount : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? o.total : 0);
      return sum + bal;
    }, 0);
  }, [customer, customerOrders]);

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const paidVal = parseFloat(settleAmount) || 0;
    if (paidVal <= 0) return;

    const newBal = Math.max(0, totalPendingBalance - paidVal);

    try {
      const saved = localStorage.getItem('universal_customers');
      let list: any[] = [];
      if (saved) list = JSON.parse(saved);
      const updated = list.map((c: any) => {
        if (c.id === customer.id || c.mobile === customer.mobile) {
          return { ...c, pendingBalance: newBal };
        }
        return c;
      });
      localStorage.setItem('universal_customers', JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new Event('storage'));
    setIsSettleModalOpen(false);
    setSettleAmount('');
    showToast(`Settled ₹${paidVal.toFixed(2)} for ${customer.name}. New Due: ₹${newBal.toFixed(2)}`);
    refresh();
  };

  const sendDirectNotification = (channel: 'WHATSAPP' | 'SMS' | 'EMAIL') => {
    if (!notifyMsg.trim()) return;

    NotificationEngine.dispatch({
      event: 'CUSTOMER_CREATED',
      recipient: { name: customer.name, mobile: customer.mobile, email: customer.email },
      data: {
        customerName: customer.name,
        message: notifyMsg.trim(),
        businessName: 'Your Business',
      },
      channels: [channel],
    });

    showToast(`Message sent via ${channel} to ${customer.mobile}! ✅`);
    setNotifyMsg('');
  };

  return (
    <div className="space-y-5">
      {/* Header Profile Box */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
              isCompany ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-[#2563EB] border border-blue-200'
            }`}>
              {isCompany ? '🏢 Company / B2B' : '👤 Individual / B2C'}
            </span>
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-bold px-2 py-0.5 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
          
          {isCompany && customer.contactPerson && (
            <p className="text-xs text-gray-600 font-medium">
              Contact Person: <span className="text-gray-900 font-bold">{customer.contactPerson}</span>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-mono text-gray-900 font-semibold">{customer.mobile}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="text-gray-900">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-2 col-span-1 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-800">{customer.address}</span>
              </div>
            )}
            {customer.gstNumber && (
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="font-bold text-gray-700">GSTIN:</span>
                <span className="font-mono font-bold text-purple-700 tracking-wider">{customer.gstNumber}</span>
                {customer.panNumber && (
                  <span className="text-[11px] text-gray-500 font-mono ml-auto">PAN: {customer.panNumber}</span>
                )}
              </div>
            )}
          </div>

          {/* Celebrations & Offer Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {customer.birthday && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <Cake className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-900 font-medium">Birthday: {customer.birthday}</span>
                <button
                  onClick={() => onSendOffer(customer, 'BIRTHDAY')}
                  className="ml-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 underline"
                >
                  Send 15% Offer
                </button>
              </div>
            )}
            {customer.anniversary && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-xs">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span className="text-pink-900 font-medium">Anniversary: {customer.anniversary}</span>
                <button
                  onClick={() => onSendOffer(customer, 'ANNIVERSARY')}
                  className="ml-1 text-[11px] font-bold text-pink-600 hover:text-pink-800 underline"
                >
                  Send 20% Offer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Due Balance & Points */}
        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto">
          {/* Outstanding Pending Balance Card */}
          <div className={cn(
            "text-center p-4 rounded-2xl border shadow-sm w-full sm:w-auto min-w-[170px]",
            totalPendingBalance > 0
              ? "bg-red-50/70 border-red-200 text-red-700"
              : "bg-emerald-50/70 border-emerald-200 text-emerald-700"
          )}>
            <div className="text-[10px] font-bold uppercase tracking-wider">Pending Credit Due</div>
            <div className="text-2xl font-black font-mono mt-1 text-gray-900">₹{totalPendingBalance.toFixed(2)}</div>
            {totalPendingBalance > 0 && (
              <button
                onClick={() => {
                  setSettleAmount(totalPendingBalance.toFixed(2));
                  setIsSettleModalOpen(true);
                }}
                className="mt-2.5 w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
              >
                💳 Settle Balance
              </button>
            )}
          </div>

          {/* Loyalty Points */}
          <div className="text-center bg-gray-50 border border-gray-200 p-3.5 rounded-2xl min-w-[120px] w-full sm:w-auto">
            <Gift className="w-5 h-5 text-[#2563EB] mx-auto mb-0.5" />
            <div className="text-xl font-bold font-mono text-gray-900">{customer.loyaltyPoints || 0}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Loyalty Points</div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2563EB]" /> Order History ({customerOrders.length})
          </span>
          <span className="text-xs text-gray-500 font-normal">All past invoices and payments</span>
        </h3>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {customerOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No previous orders or bills found for this customer.
            </div>
          ) : (
            customerOrders.map((o: any) => {
              const paid = o.paidAmount !== undefined ? o.paidAmount : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? 0 : o.total);
              const pending = o.balanceAmount !== undefined ? o.balanceAmount : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? o.total : 0);

              return (
                <div key={o.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1.5 hover:bg-blue-50/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-xs">{o.orderNumber || 'INV-DIRECT'}</span>
                    <span className="text-xs font-bold text-[#2563EB] font-mono">Bill Total: ₹{o.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono border-t border-gray-200/80 pt-1.5">
                    <span className="text-emerald-600 font-bold">Paid: ₹{paid.toFixed(2)}</span>
                    {pending > 0 ? (
                      <span className="text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        Pending: ₹{pending.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Full Paid
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 flex justify-between pt-0.5 font-mono">
                    <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}</span>
                    <span>Method: {o.paymentMethod || 'CASH'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Engage & Notification Messenger */}
      <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#2563EB]" /> Quick Message & Offers
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Type special discount code or greeting message..."
            value={notifyMsg}
            onChange={e => setNotifyMsg(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:bg-white"
          />
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => sendDirectNotification('WHATSAPP')}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={() => sendDirectNotification('SMS')}
              className="px-3.5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" /> SMS
            </button>
          </div>
        </div>
      </div>

      {/* Settle Due Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                💳 Settle Due Balance for {customer.name}
              </h3>
              <button onClick={() => setIsSettleModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4 text-xs">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 flex justify-between items-center">
                <span className="text-red-800 font-medium">Total Pending Due:</span>
                <span className="font-mono font-bold text-red-600 text-base">₹{totalPendingBalance.toFixed(2)}</span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Paid Now (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  max={totalPendingBalance}
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 font-mono font-bold outline-none focus:border-[#2563EB] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={settleMethod}
                  onChange={e => setSettleMethod(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-bold outline-none focus:border-[#2563EB]"
                >
                  <option value="CASH">💵 Cash</option>
                  <option value="UPI">📲 UPI / QR</option>
                  <option value="CARD">💳 Card</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-500 hover:text-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Confirm & Clear Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Customer Form Modal (Individual vs Company with GST) ────────────────────

function CustomerFormModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [type, setType] = useState<CustomerType>(customer?.type || 'INDIVIDUAL');
  const [form, setForm] = useState({
    name: customer?.name || '',
    contactPerson: customer?.contactPerson || '',
    mobile: customer?.mobile || '',
    email: customer?.email || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || '',
    pincode: customer?.pincode || '',
    gstNumber: customer?.gstNumber || '',
    panNumber: customer?.panNumber || '',
    stateCode: customer?.stateCode || '',
    website: customer?.website || '',
    creditLimit: customer?.creditLimit ? String(customer.creditLimit) : '',
    paymentTerms: customer?.paymentTerms || 'Immediate',
    birthday: customer?.birthday || '',
    anniversary: customer?.anniversary || '',
    shippingAddress: customer?.shippingAddress || '',
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Auto-extract PAN and State code from GSTIN
  const handleGstChange = (val: string) => {
    const clean = val.toUpperCase().replace(/\s/g, '');
    let pan = form.panNumber;
    let stCode = form.stateCode;

    if (clean.length >= 2) {
      stCode = clean.slice(0, 2);
    }
    if (clean.length >= 12) {
      pan = clean.slice(2, 12);
    }

    setForm(prev => ({
      ...prev,
      gstNumber: clean,
      panNumber: pan,
      stateCode: stCode,
    }));
  };

  const handleToggleSameAddress = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setForm(prev => ({ ...prev, shippingAddress: prev.address }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) return;

    const newCust: Customer = {
      id: customer?.id || `cust-${Date.now()}`,
      type,
      name: form.name.trim(),
      companyName: type === 'COMPANY' ? form.name.trim() : undefined,
      contactPerson: form.contactPerson.trim() || undefined,
      mobile: form.mobile.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      pincode: form.pincode.trim() || undefined,
      gstNumber: type === 'COMPANY' ? (form.gstNumber.trim() || undefined) : undefined,
      panNumber: type === 'COMPANY' ? (form.panNumber.trim() || undefined) : undefined,
      stateCode: type === 'COMPANY' ? (form.stateCode.trim() || undefined) : undefined,
      website: type === 'COMPANY' ? (form.website.trim() || undefined) : undefined,
      creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
      paymentTerms: form.paymentTerms || undefined,
      birthday: form.birthday || undefined,
      anniversary: form.anniversary || undefined,
      shippingAddress: form.shippingAddress.trim() || undefined,
      pendingBalance: customer?.pendingBalance || 0,
      loyaltyPoints: customer?.loyaltyPoints || 0,
      createdAt: customer?.createdAt || new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem('universal_customers');
      let list: Customer[] = [];
      if (saved) list = JSON.parse(saved);
      const updated = [newCust, ...list.filter(c => c.id !== newCust.id && c.mobile !== newCust.mobile)];
      localStorage.setItem('universal_customers', JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new Event('storage'));

    // Trigger Notification for new customer enrollment
    if (!customer) {
      try {
        NotificationEngine.dispatch({
          event: 'CUSTOMER_CREATED',
          recipient: { name: newCust.name, mobile: newCust.mobile, email: newCust.email },
          data: {
            customerName: newCust.name,
            mobile: newCust.mobile,
            loyaltyPoints: newCust.loyaltyPoints || 0,
          },
        });
      } catch {}
    }

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust),
      });
    } catch {}

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-xl p-6 shadow-2xl my-8 animate-in fade-in space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {customer ? 'Edit Customer Profile' : 'Register New Customer'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select type below: Individual (B2C) or Company (B2B with GSTIN)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Type Toggle: Individual vs Company */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('INDIVIDUAL')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              type === 'INDIVIDUAL'
                ? 'bg-white text-[#2563EB] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" /> Individual (B2C)
          </button>
          <button
            type="button"
            onClick={() => setType('COMPANY')}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              type === 'COMPANY'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Company / Business (B2B)
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Company vs Individual Primary Info */}
          {type === 'INDIVIDUAL' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Number (Unique) *</label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="ramesh@gmail.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Address / Locality</label>
                <input
                  type="text"
                  placeholder="Flat No, Street, Landmark..."
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2563EB] focus:bg-white"
                />
              </div>

              {/* Celebration dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <div>
                  <label className="block font-bold text-amber-950 mb-1 flex items-center gap-1">
                    <Cake className="w-3.5 h-3.5 text-rose-500" /> Birthday (for special offers)
                  </label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm({ ...form, birthday: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-amber-950 mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-500" /> Anniversary (for special offers)
                  </label>
                  <input
                    type="date"
                    value={form.anniversary}
                    onChange={e => setForm({ ...form, anniversary: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </>
          ) : (
            // Company B2B form
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Company / Trade Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Apex Technologies Pvt Ltd"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN Number (GST) *</label>
                  <input
                    required
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    value={form.gstNumber}
                    onChange={e => handleGstChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono uppercase font-bold placeholder:text-gray-400 outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="AAAAA0000A"
                    value={form.panNumber}
                    onChange={e => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono uppercase outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State Code</label>
                  <input
                    type="text"
                    placeholder="33 (TN)"
                    value={form.stateCode}
                    onChange={e => setForm({ ...form, stateCode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.creditLimit}
                    onChange={e => setForm({ ...form, creditLimit: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Sharma"
                    value={form.contactPerson}
                    onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Business Mobile Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    placeholder="accounts@apextech.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={form.paymentTerms}
                    onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-purple-600"
                  >
                    <option value="Immediate">Immediate / Advance</option>
                    <option value="15 Days">Net 15 Days</option>
                    <option value="30 Days">Net 30 Days</option>
                    <option value="45 Days">Net 45 Days</option>
                    <option value="60 Days">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  placeholder="Official registered company office address..."
                  value={form.address}
                  onChange={e => {
                    const newAddr = e.target.value;
                    setForm(prev => ({
                      ...prev,
                      address: newAddr,
                      shippingAddress: sameAsBilling ? newAddr : prev.shippingAddress,
                    }));
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Shipping / Delivery Address</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={e => handleToggleSameAddress(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    Same as Billing Address
                  </label>
                </div>
                <textarea
                  rows={2}
                  disabled={sameAsBilling}
                  placeholder="Warehouse / site delivery address..."
                  value={form.shippingAddress}
                  onChange={e => setForm({ ...form, shippingAddress: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-600 focus:bg-white disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/60 border border-purple-200 rounded-2xl">
                <div>
                  <label className="block font-bold text-purple-950 mb-1">Company Anniversary / Foundation</label>
                  <input
                    type="date"
                    value={form.anniversary}
                    onChange={e => setForm({ ...form, anniversary: e.target.value })}
                    className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-purple-950 mb-1">Key Person Birthday</label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm({ ...form, birthday: e.target.value })}
                    className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer ${
                type === 'COMPANY'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-blue-200'
              }`}
            >
              {customer ? 'Save Changes' : type === 'COMPANY' ? 'Register Company (B2B)' : 'Save Customer (B2C)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Birthday / Anniversary Offer Dispatch Modal ────────────────────────────

function OfferDispatchModal({
  customer,
  type,
  onClose,
  onSent,
}: {
  customer: Customer;
  type: 'BIRTHDAY' | 'ANNIVERSARY';
  onClose: () => void;
  onSent: () => void;
}) {
  const isBday = type === 'BIRTHDAY';
  const autoCode = `${isBday ? 'BDAY' : 'ANNIV'}-${customer.name.slice(0, 4).toUpperCase()}-${isBday ? '15' : '20'}`;
  
  const [discountOffer, setDiscountOffer] = useState(isBday ? '15% OFF' : '20% OFF');
  const [couponCode, setCouponCode] = useState(autoCode);
  const [validDays, setValidDays] = useState(7);
  const [sending, setSending] = useState(false);

  const validUntilStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + validDays);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [validDays]);

  const handleSendOffer = () => {
    setSending(true);

    const event = isBday ? 'CUSTOMER_BIRTHDAY_OFFER' : 'CUSTOMER_ANNIVERSARY_OFFER';

    NotificationEngine.dispatch({
      event,
      recipient: {
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
      },
      data: {
        customerName: customer.name,
        discountOffer,
        couponCode,
        validDate: validUntilStr,
        businessName: 'Our Store & Business',
        mobile: customer.mobile,
      },
    });

    setTimeout(() => {
      setSending(false);
      onSent();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isBday ? 'bg-rose-100 text-rose-600' : 'bg-pink-100 text-pink-600'
            }`}>
              {isBday ? <Cake className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Send {isBday ? 'Birthday' : 'Anniversary'} Offer
              </h3>
              <p className="text-[11px] text-gray-500">Recipient: {customer.name} ({customer.mobile})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Offer Configuration */}
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Discount Offer Gift</label>
            <div className="grid grid-cols-3 gap-2">
              {['10% OFF', '15% OFF', '20% OFF', 'Flat ₹200 OFF', 'Flat ₹500 OFF', 'Free Item'].map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDiscountOffer(opt)}
                  className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all ${
                    discountOffer === opt
                      ? 'bg-gradient-to-r from-[#2563EB] to-blue-600 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Coupon Promo Code</label>
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2563EB] outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Valid For</label>
              <select
                value={validDays}
                onChange={e => setValidDays(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={15}>15 Days</option>
                <option value={30}>30 Days (1 Month)</option>
              </select>
            </div>
          </div>

          {/* Preview Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span>🎁 Message Preview (WhatsApp / SMS / Email)</span>
              <span className="font-mono text-[10px] text-amber-700">Valid till {validUntilStr}</span>
            </div>
            <p className="text-[11px] text-amber-950 leading-relaxed italic">
              "{isBday ? '🎂 Happy Birthday' : '💍 Happy Anniversary'} {customer.name}! Enjoy <strong>{discountOffer}</strong> on your next visit with coupon code <strong>{couponCode}</strong>. Valid till {validUntilStr}."
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSendOffer}
            disabled={sending}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending...' : 'Dispatch Offer Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
