import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Calendar, Clock, Percent, Gift } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Promotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);

  const fetchPromos = () => fetch('/api/promotions').then(r => r.json()).then(setPromotions);
  
  useEffect(() => {
    fetchPromos();
  }, []);

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure?')) return;
    await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    fetchPromos();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-lg shadow-gray-200/50">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Promotional Engine</h1>
          <p className="text-gray-400 text-sm mt-1">Manage BOGO, combos, and discounts</p>
        </div>
        <button onClick={() => { setEditingPromo(null); setShowForm(true); }} className="bg-[#2563EB] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus className="w-5 h-5"/> New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promo => (
          <div key={promo.id} className="bg-white/90 border border-gray-100 rounded-xl shadow-md shadow-gray-100/50 p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
              <button onClick={() => { setEditingPromo(promo); setShowForm(true); }} className="text-gray-600 hover:text-gray-900"><Edit2 className="w-4 h-4"/></button>
              <button onClick={() => handleDelete(promo.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                {promo.type === 'BOGO' ? <Gift className="w-5 h-5 text-purple-500"/> :
                 promo.type === 'PERCENTAGE' ? <Percent className="w-5 h-5 text-green-500"/> :
                 <Tag className="w-5 h-5 text-blue-500"/>}
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-sm">{promo.name}</h3>
                <div className="text-xs font-bold text-gray-500">{promo.type} • Priority {promo.priority}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4 flex-1">
              {promo.type === 'BOGO' && promo.buyItem && promo.getItem && (
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <span className="text-[#2563EB]">Buy {promo.buyQty}</span> {promo.buyItem?.name}<br/>
                  <span className="text-green-500">Get {promo.getQty}</span> {promo.getItem?.name} <span className="text-gray-600">for ₹{promo.getPrice}</span>
                </div>
              )}
              {promo.type === 'PERCENTAGE' && <div className="text-2xl font-bold text-gray-900">{promo.discountValue}% OFF</div>}
              {promo.type === 'FLAT' && <div className="text-2xl font-bold text-gray-900">₹{promo.discountValue} OFF</div>}
              {promo.minOrderValue > 0 && <div className="text-xs text-gray-400 mt-2">Min order: ₹{promo.minOrderValue}</div>}
              {promo.code && !promo.autoApply && <div className="mt-2 text-xs font-bold bg-blue-50 text-[#2563EB] px-2 py-1 rounded inline-block">CODE: {promo.code}</div>}
              {promo.autoApply && <div className="mt-2 text-xs font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded inline-block">AUTO APPLY</div>}
            </div>
            
            <div className="border-t border-gray-200 pt-3 text-xs text-gray-500 space-y-1">
              {(promo.startDate || promo.endDate) && (
                <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> 
                  {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Always'} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Ongoing'}
                </div>
              )}
              {(promo.happyHourStart && promo.happyHourEnd) && (
                <div className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> {promo.happyHourStart} to {promo.happyHourEnd}</div>
              )}
              {!promo.isActive && <div className="text-red-500 font-bold">INACTIVE</div>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <PromoFormModal 
          promo={editingPromo} 
          onClose={() => setShowForm(false)} 
          onSave={() => { setShowForm(false); fetchPromos(); }} 
        />
      )}
    </div>
  );
}

function PromoFormModal({ promo, onClose, onSave }: { promo: any, onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState<any>(promo || {
    name: '', description: '', type: 'PERCENTAGE', code: '', autoApply: true, priority: 0,
    startDate: '', endDate: '', happyHourStart: '', happyHourEnd: '', daysOfWeek: '',
    minOrderValue: 0, discountValue: 0, buyItemId: '', buyQty: 1, getItemId: '', getQty: 1, getPrice: 0, isActive: true
  });
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(setMenuItems);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = promo ? `/api/promotions/${promo.id}` : '/api/promotions';
    const method = promo ? 'PATCH' : 'POST';
    
    // clean up types
    const data = { ...form };
    data.priority = Number(data.priority);
    data.minOrderValue = Number(data.minOrderValue);
    data.discountValue = Number(data.discountValue);
    data.buyQty = Number(data.buyQty);
    data.getQty = Number(data.getQty);
    data.getPrice = Number(data.getPrice);

    // format dates for input type date
    if(data.startDate === '') data.startDate = null;
    if(data.endDate === '') data.endDate = null;
    if(data.happyHourStart === '') data.happyHourStart = null;
    if(data.happyHourEnd === '') data.happyHourEnd = null;

    if (data.type !== 'BOGO') {
      data.buyItemId = null; data.getItemId = null;
    } else {
      if(!data.buyItemId || !data.getItemId) return alert('Select items for BOGO');
    }

    await fetch(url, {
      method, headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    onSave();
  };

  const handleDateFmt = (d: string) => d ? new Date(d).toISOString().split('T')[0] : '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{promo ? 'Edit Promotion' : 'New Promotion'}</h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form id="promoForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Core Info */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400">Offer Name</label><input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
              <div><label className="text-xs font-bold text-gray-400">Type</label>
                <select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Discount (₹)</option>
                  <option value="BOGO">Buy X Get Y (BOGO)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">Application Mode</label>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 text-white text-sm"><input type="radio" checked={form.autoApply} onChange={()=>setForm({...form, autoApply: true})} /> Auto Apply</label>
                  <label className="flex items-center gap-2 text-white text-sm"><input type="radio" checked={!form.autoApply} onChange={()=>setForm({...form, autoApply: false})} /> Use Code</label>
                </div>
              </div>
              {!form.autoApply && <div><label className="text-xs font-bold text-gray-400">Coupon Code</label><input required={!form.autoApply} value={form.code} onChange={e=>setForm({...form, code: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white uppercase" /></div>}
            </div>

            {/* Value Inputs based on Type */}
            {form.type !== 'BOGO' && (
              <div><label className="text-xs font-bold text-gray-400">Discount Value {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</label><input type="number" required value={form.discountValue} onChange={e=>setForm({...form, discountValue: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
            )}

            {form.type === 'BOGO' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3"><label className="text-xs font-bold text-gray-400">Condition (Buy Item)</label>
                    <select required value={form.buyItemId || ''} onChange={e=>setForm({...form, buyItemId: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white">
                      <option value="">Select Item...</option>{menuItems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-gray-400">Buy Qty</label><input type="number" min="1" required value={form.buyQty} onChange={e=>setForm({...form, buyQty: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3"><label className="text-xs font-bold text-gray-400">Reward (Get Item)</label>
                    <select required value={form.getItemId || ''} onChange={e=>setForm({...form, getItemId: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white">
                      <option value="">Select Item...</option>{menuItems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-bold text-gray-400">Get Qty</label><input type="number" min="1" required value={form.getQty} onChange={e=>setForm({...form, getQty: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
                  <div><label className="text-xs font-bold text-gray-400">For Price</label><input type="number" min="0" required value={form.getPrice} onChange={e=>setForm({...form, getPrice: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" placeholder="0 = Free" /></div>
                </div>
              </div>
            )}

            {/* Constraints */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h3 className="text-sm font-bold text-white">Constraints & Timing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400">Priority (Higher runs first)</label><input type="number" value={form.priority} onChange={e=>setForm({...form, priority: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
                <div><label className="text-xs font-bold text-gray-400">Min Order Value (₹)</label><input type="number" value={form.minOrderValue} onChange={e=>setForm({...form, minOrderValue: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400">Start Date</label><input type="date" value={form.startDate ? handleDateFmt(form.startDate) : ''} onChange={e=>setForm({...form, startDate: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
                <div><label className="text-xs font-bold text-gray-400">End Date</label><input type="date" value={form.endDate ? handleDateFmt(form.endDate) : ''} onChange={e=>setForm({...form, endDate: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400">Happy Hour Start (HH:MM)</label><input type="time" value={form.happyHourStart || ''} onChange={e=>setForm({...form, happyHourStart: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
                <div><label className="text-xs font-bold text-gray-400">Happy Hour End (HH:MM)</label><input type="time" value={form.happyHourEnd || ''} onChange={e=>setForm({...form, happyHourEnd: e.target.value})} className="w-full bg-[#F8FAFC] border border-gray-200 rounded p-2 text-white" /></div>
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-gray-900 font-bold">Cancel</button>
          <button type="submit" form="promoForm" className="bg-[#2563EB] text-white px-6 py-2 rounded font-bold">Save Promotion</button>
        </div>
      </div>
    </div>
  );
}
