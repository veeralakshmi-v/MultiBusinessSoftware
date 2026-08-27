import React, { useState, useEffect } from 'react';
import { Users, Search, Gift, Clock, Heart, Plus, Edit2, MessageSquare, Phone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCustomers = () => {
    fetch(`/api/customers?search=${search}`).then(r => r.json()).then(setCustomers);
  };

  useEffect(() => {
    const delay = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const fetchCustomerDetails = (id: string) => {
    fetch(`/api/customers/${id}`).then(r => r.json()).then(setSelectedCustomer);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Customers & Loyalty</h1>
          <p className="text-gray-400 text-sm mt-1">Manage profiles, order history, and rewards</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#C5A059] text-[#0A0A0B] px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus className="w-5 h-5"/> New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#131315] border border-[#2D2D30] rounded-xl overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-4 border-b border-[#2D2D30] bg-[#0A0A0B]">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search name or mobile..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
            {customers.map(c => (
              <button
                key={c.id}
                onClick={() => fetchCustomerDetails(c.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all",
                  selectedCustomer?.id === c.id ? "bg-[#C5A059]/10 text-[#C5A059]" : "text-gray-300 hover:bg-[#1A1A1C]"
                )}
              >
                <div className="font-bold">{c.name}</div>
                <div className="text-sm opacity-70">{c.mobile}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <CustomerProfile customer={selectedCustomer} refresh={() => fetchCustomerDetails(selectedCustomer.id)} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#131315] border border-[#2D2D30] rounded-xl p-12">
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
      <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
          <div className="text-gray-400 mt-1 space-y-1 text-sm">
            <div>📞 {customer.mobile}</div>
            {customer.address && <div>📍 {customer.address}</div>}
            {customer.gstNumber && <div>🏢 GST: {customer.gstNumber}</div>}
            {customer.birthday && <div>🎂 Birthday: {new Date(customer.birthday).toLocaleDateString()}</div>}
            {customer.anniversary && <div>💍 Anniversary: {new Date(customer.anniversary).toLocaleDateString()}</div>}
          </div>
        </div>
        <div className="text-center bg-[#1A1A1C] border border-[#2D2D30] p-4 rounded-xl">
          <Gift className="w-8 h-8 text-[#C5A059] mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{customer.loyaltyPoints}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Points</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500"/> Order History</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {customer.orders?.length === 0 && <div className="text-gray-500 text-sm">No past orders.</div>}
            {customer.orders?.map((o: any) => (
              <div key={o.id} className="bg-[#0A0A0B] p-3 rounded-lg border border-[#2D2D30]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">{o.orderNumber}</span>
                  <span className="text-sm font-bold text-[#C5A059]">₹{o.total.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-1">{o.items?.map((i: any) => i.menuItem?.name).join(', ')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-red-500"/> Favorite Orders</h3>
          <div className="flex flex-wrap gap-2">
            {customer.favoriteItems?.length === 0 && <div className="text-gray-500 text-sm">No favorites yet.</div>}
            {customer.favoriteItems?.map((f: any) => (
              <span key={f.id} className="bg-[#0A0A0B] border border-[#2D2D30] text-gray-300 px-3 py-1.5 rounded-full text-sm font-bold">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Quick Engage</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message (e.g. Happy Birthday discount code)..."
            value={notifyMsg}
            onChange={e => setNotifyMsg(e.target.value)}
            className="flex-1 bg-[#0A0A0B] border border-[#2D2D30] rounded-lg px-4 text-sm text-white"
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
    await fetch('/api/customers', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    });
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#131315] border border-[#2D2D30] rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Add Customer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-400">Name</label><input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
            <div><label className="text-xs font-bold text-gray-400">Mobile (Unique)</label><input required value={form.mobile} onChange={e=>setForm({...form, mobile: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-400">Address</label><input value={form.address} onChange={e=>setForm({...form, address: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          <div><label className="text-xs font-bold text-gray-400">GST Number</label><input value={form.gstNumber} onChange={e=>setForm({...form, gstNumber: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-400">Birthday</label><input type="date" value={form.birthday} onChange={e=>setForm({...form, birthday: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
            <div><label className="text-xs font-bold text-gray-400">Anniversary</label><input type="date" value={form.anniversary} onChange={e=>setForm({...form, anniversary: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold">Cancel</button>
            <button type="submit" className="bg-[#C5A059] text-[#0A0A0B] px-4 py-2 rounded font-bold">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
