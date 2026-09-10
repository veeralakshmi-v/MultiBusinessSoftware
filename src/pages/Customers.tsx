import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Gift, Clock, Heart, Plus, Edit2, MessageSquare, Phone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = () => {
    let list: any[] = [];
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
        const q = search.toLowerCase().trim();
        const filtered = q
          ? list.filter(c => c.name?.toLowerCase().includes(q) || c.mobile?.includes(q))
          : list;
        setCustomers(filtered);
      })
      .catch(() => {
        const q = search.toLowerCase().trim();
        const filtered = q
          ? list.filter(c => c.name?.toLowerCase().includes(q) || c.mobile?.includes(q))
          : list;
        setCustomers(filtered);
      });
  };

  useEffect(() => {
    const delay = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchCustomerDetails = (id: string) => {
    fetch(`/api/customers/${id}`).then(r => r.json()).then(setSelectedCustomer);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-lg shadow-gray-200/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Customers & Loyalty CRM</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Manage customer profiles, order history, credit balance, and rewards</p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-full sm:w-auto justify-center bg-[#2563EB] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs shadow-md">
          <Plus className="w-4 h-4"/> New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 bg-white/90 border border-gray-100 rounded-2xl overflow-hidden shadow-md shadow-gray-100/50 flex flex-col max-h-[350px] sm:max-h-[700px]">
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search name or mobile..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
            {customers.map(c => {
              const cBalance = c.pendingBalance !== undefined ? c.pendingBalance : 0;
              return (
                <button
                  key={c.id}
                  onClick={() => fetchCustomerDetails(c.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all flex items-center justify-between",
                    selectedCustomer?.id === c.id ? "bg-blue-50 text-[#2563EB]" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs opacity-70 font-mono">{c.mobile}</div>
                  </div>
                  {cBalance > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                      Due: ₹{cBalance.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <CustomerProfile customer={selectedCustomer} refresh={() => fetchCustomerDetails(selectedCustomer.id)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white/90 border border-gray-100 rounded-xl shadow-md shadow-gray-100/50 p-12">
              <Users className="w-12 h-12 mb-4 opacity-50" />
              <div className="text-lg font-bold">Select a Customer</div>
              <div className="text-sm">View their order history, preferences, and loyalty points.</div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <CustomerFormModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); fetchCustomers(); }} />
      )}
    </div>
  );
}

function CustomerProfile({ customer, refresh }: { customer: any, refresh: () => void }) {
  const [notifyMsg, setNotifyMsg] = useState('');
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');

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
    refresh();
  };

  const sendNotification = async (channel: string) => {
    if(!notifyMsg) return;
    await fetch(`/api/customers/${customer.id}/notify`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ channel, message: notifyMsg })
    });
    setNotifyMsg('');
    alert(`Mock: ${channel} sent to ${customer.mobile}`);
  };

  return (
    <div className="space-y-6">
      {/* Profile & Credit Due Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
          <div className="text-gray-400 mt-1 space-y-1 text-sm">
            <div>📞 {customer.mobile}</div>
            {customer.address && <div>📍 {customer.address}</div>}
            {customer.gstNumber && <div>🏢 GST: {customer.gstNumber}</div>}
            {customer.birthday && <div>🎂 Birthday: {new Date(customer.birthday).toLocaleDateString()}</div>}
            {customer.anniversary && <div>💍 Anniversary: {new Date(customer.anniversary).toLocaleDateString()}</div>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Outstanding Pending Balance Card */}
          <div className={cn(
            "text-center border p-4 rounded-xl shadow-lg transition-all",
            totalPendingBalance > 0 
              ? "bg-red-500/10 border-red-500/30 text-red-400" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          )}>
            <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Pending Credit Due</div>
            <div className="text-2xl font-black font-mono mt-1">₹{totalPendingBalance.toFixed(2)}</div>
            {totalPendingBalance > 0 && (
              <button
                onClick={() => {
                  setSettleAmount(totalPendingBalance.toFixed(2));
                  setIsSettleModalOpen(true);
                }}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 shadow transition-all"
              >
                💳 Clear / Settle Due
              </button>
            )}
          </div>

          {/* Loyalty Points */}
          <div className="text-center bg-gray-50 border border-gray-200 p-4 rounded-xl min-w-[100px]">
            <Gift className="w-6 h-6 text-[#2563EB] mx-auto mb-1" />
            <div className="text-xl font-bold text-gray-900">{customer.loyaltyPoints || 0}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Points</div>
          </div>
        </div>
      </div>

      {/* Orders & Favorites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500"/> Order History ({customerOrders.length})</span>
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {customerOrders.length === 0 && <div className="text-gray-500 text-sm">No past orders found.</div>}
            {customerOrders.map((o: any) => {
              const paid = o.paidAmount !== undefined ? o.paidAmount : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? 0 : o.total);
              const pending = o.balanceAmount !== undefined ? o.balanceAmount : ((o.paymentMethod || '').toUpperCase() === 'CREDIT' ? o.total : 0);

              return (
                <div key={o.id} className="bg-[#F8FAFC] p-3.5 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-xs">{o.orderNumber || 'INV-LOCAL'}</span>
                    <span className="text-xs font-bold text-[#2563EB] font-mono">Bill Total: ₹{o.total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono border-t border-gray-200 pt-1.5">
                    <span className="text-emerald-400 font-bold">Paid: ₹{paid.toFixed(2)}</span>
                    {pending > 0 ? (
                      <span className="text-red-400 font-extrabold bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                        Pending Due: ₹{pending.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        Full Paid
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 flex justify-between pt-0.5">
                    <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}</span>
                    <span className="font-mono">{o.paymentMethod || 'CASH'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500"/> Favorite Orders</h3>
          <div className="flex flex-wrap gap-2">
            {(!customer.favoriteItems || customer.favoriteItems.length === 0) && <div className="text-gray-500 text-sm">No favorites recorded yet.</div>}
            {customer.favoriteItems?.map((f: any) => (
              <span key={f.id} className="bg-[#F8FAFC] border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm font-bold">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Settle Due Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              💳 Settle Due Balance for {customer.name}
            </h3>
            <p className="text-xs text-gray-400">Record payment received to reduce customer's pending credit balance.</p>

            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                <span className="text-gray-600">Total Pending Due:</span>
                <span className="font-mono font-bold text-red-400 text-sm">₹{totalPendingBalance.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Amount Paid Now (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  max={totalPendingBalance}
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 font-mono font-bold outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Payment Method</label>
                <select
                  value={settleMethod}
                  onChange={e => setSettleMethod(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-[#2563EB]"
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
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400"
                >
                  Confirm & Clear Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Quick Engage</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message (e.g. Happy Birthday discount code)..."
            value={notifyMsg}
            onChange={e => setNotifyMsg(e.target.value)}
            className="flex-1 bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 text-sm text-white"
          />
          <button onClick={() => sendNotification('WHATSAPP')} className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-500/20">
            <MessageSquare className="w-4 h-4"/> WhatsApp
          </button>
          <button onClick={() => sendNotification('SMS')} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-500/20">
            <Phone className="w-4 h-4"/> SMS
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerFormModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({ name: '', mobile: '', address: '', gstNumber: '', birthday: '', anniversary: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) return;

    const newCust = {
      id: `cust-${Date.now()}`,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      address: form.address.trim() || undefined,
      gstNumber: form.gstNumber.trim() || undefined,
      birthday: form.birthday || undefined,
      anniversary: form.anniversary || undefined,
      pendingBalance: 0,
      loyaltyPoints: 0,
    };

    try {
      const saved = localStorage.getItem('universal_customers');
      let list: any[] = [];
      if (saved) list = JSON.parse(saved);
      const updated = [newCust, ...list.filter(c => c.id !== newCust.id && c.mobile !== newCust.mobile)];
      localStorage.setItem('universal_customers', JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new Event('storage'));

    try {
      await fetch('/api/customers', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newCust)
      });
    } catch {}
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Add Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-400">Name</label><input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
            <div><label className="text-xs font-bold text-gray-400">Mobile (Unique)</label><input required value={form.mobile} onChange={e=>setForm({...form, mobile: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-400">Address</label><input value={form.address} onChange={e=>setForm({...form, address: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
          <div><label className="text-xs font-bold text-gray-400">GST Number</label><input value={form.gstNumber} onChange={e=>setForm({...form, gstNumber: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-400">Birthday</label><input type="date" value={form.birthday} onChange={e=>setForm({...form, birthday: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
            <div><label className="text-xs font-bold text-gray-400">Anniversary</label><input type="date" value={form.anniversary} onChange={e=>setForm({...form, anniversary: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-gray-900 font-bold">Cancel</button>
            <button type="submit" className="bg-[#2563EB] text-white px-4 py-2 rounded font-bold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
