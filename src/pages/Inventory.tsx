import React, { useState, useEffect, useMemo } from 'react';
import { Package, Truck, ArrowRightLeft, DollarSign, AlertTriangle, Search, Plus, Trash2, Edit2, Link, CalendarClock, FlaskConical } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
  const { businessProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const tabs = ['DASHBOARD', 'STOCK LIST', 'SUPPLIERS', 'STOCK MOVEMENTS'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Inventory Management</h1>
          <p className="text-gray-400 text-sm mt-1">Track product stock levels, low-stock warnings, and vendor supplies</p>
        </div>
        <div className="px-3 py-1 rounded-xl bg-[#1A1A1C] text-[#C5A059] border border-[#C5A059]/30 font-bold text-[11px] uppercase tracking-wider">
          Universal Stock Tracking
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#2D2D30] overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap",
              activeTab === tab ? "border-[#C5A059] text-[#C5A059]" : "border-transparent text-gray-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'DASHBOARD' && <DashboardTab businessType="RETAIL" stockNoun="Products" />}
        {activeTab === 'STOCK LIST' && <MaterialsTab stockNoun="Products" />}
        {activeTab === 'SUPPLIERS' && <SuppliersTab />}
        {activeTab === 'STOCK MOVEMENTS' && <TransactionsTab />}
      </div>
    </div>
  );
}



function DashboardTab({ businessType, stockNoun }: { businessType: string; stockNoun: string }) {
  const [materials, setMaterials] = useState<any[]>([]);
  useEffect(() => { fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials).catch(() => {}); }, []);

  const totalValue = materials.reduce((acc, m) => acc + ((m.currentStock || 0) * (m.pricePerUnit || 0)), 0);
  const lowStock = materials.filter(m => (m.currentStock || 0) <= (m.minStockLevel || 0));
  const expiringSoon = materials.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-[#C5A059]/40 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
            <DollarSign className="w-4 h-4 text-[#C5A059]" /> Stock Valuation
          </div>
          <div className="text-2xl font-bold text-white font-mono">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="text-[10px] text-gray-500 mt-1">Total inventory value</div>
        </div>
        <div className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-[#C5A059]/40 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
            <Package className="w-4 h-4 text-blue-400" /> Total {stockNoun.split(' ')[0]}
          </div>
          <div className="text-2xl font-bold text-white font-mono">{materials.length}</div>
          <div className="text-[10px] text-gray-500 mt-1">Items being tracked</div>
        </div>
        <div className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-red-500/40 transition-colors">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Low Stock
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{lowStock.length}</div>
          <div className="text-[10px] text-gray-500 mt-1">Need replenishment</div>
        </div>
        {['MEDICAL', 'RETAIL', 'WHOLESALE'].includes(businessType) && (
          <div className="bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
              <CalendarClock className="w-4 h-4 text-amber-400" /> Expiring Soon
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{expiringSoon.length}</div>
            <div className="text-[10px] text-gray-500 mt-1">Within 30 days</div>
          </div>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" /> Items Below Minimum Stock Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(m => (
              <div key={m.id} className="bg-[#0A0A0B] p-4 rounded-xl border border-red-500/20">
                <div className="font-bold text-white text-sm">{m.name}</div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-red-400 font-bold">{m.currentStock ?? 0} {m.unit} left</span>
                  <span className="text-gray-500">Min: {m.minStockLevel ?? 0} {m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialsTab({ stockNoun }: { stockNoun: string }) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState('');
  
  const fetchMats = () => fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials).catch(() => {});
  
  useEffect(() => {
    fetchMats();
    fetch('/api/inventory/suppliers').then(r => r.json()).then(setSuppliers).catch(() => {});
  }, []);

  const [form, setForm] = useState({ name: '', unit: '', minStockLevel: 0, pricePerUnit: 0, supplierId: '', sku: '', barcode: '' });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/inventory/materials', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...form, minStockLevel: Number(form.minStockLevel), pricePerUnit: Number(form.pricePerUnit)})
    });
    fetchMats();
    setForm({ name: '', unit: '', minStockLevel: 0, pricePerUnit: 0, supplierId: '', sku: '', barcode: '' });
    setShowForm(false);
  };

  const filtered = materials.filter(m => !searchQ || m.name.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            placeholder={`Search ${stockNoun.toLowerCase()}...`}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none w-64"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl hover:bg-[#b08d4a]"
        >
          <Plus className="w-3.5 h-3.5" /> Add {stockNoun.split(' ')[0]}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#131315] border border-[#C5A059]/30 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Add New {stockNoun.split(' ')[0]}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Name</label><input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Unit</label><input required placeholder="kg, pcs, L" value={form.unit} onChange={e=>setForm({...form, unit: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Min Stock</label><input type="number" required value={form.minStockLevel} onChange={e=>setForm({...form, minStockLevel: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Price/Unit (₹)</label><input type="number" required value={form.pricePerUnit} onChange={e=>setForm({...form, pricePerUnit: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">SKU / Code</label><input value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Supplier</label>
              <select value={form.supplierId} onChange={e=>setForm({...form, supplierId: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1">
                <option value="">No Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-4 flex gap-3 mt-2">
              <button type="submit" className="px-6 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl uppercase hover:bg-[#b08d4a]">Save Item</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-[#1A1A1C] text-gray-400 font-bold text-xs rounded-xl uppercase hover:text-white">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0A0A0B] text-gray-400 font-bold uppercase text-xs">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Min Level</th>
              <th className="px-5 py-3">Price/Unit</th>
              <th className="px-5 py-3">Supplier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F21]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-xs">No items found. Click "Add {stockNoun.split(' ')[0]}" to get started.</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="hover:bg-[#1A1A1C] transition-colors">
                <td className="px-5 py-3 font-bold text-white">{m.name}</td>
                <td className="px-5 py-3">
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-xs font-bold",
                    m.currentStock <= m.minStockLevel
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  )}>
                    {m.currentStock ?? 0} {m.unit}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{m.minStockLevel ?? 0} {m.unit}</td>
                <td className="px-5 py-3 text-[#C5A059] font-mono font-bold">₹{m.pricePerUnit}</td>
                <td className="px-5 py-3 text-gray-400">{m.supplier?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const fetchSups = () => fetch('/api/inventory/suppliers').then(r => r.json()).then(setSuppliers);
  useEffect(() => { fetchSups(); }, []);
  
  const [form, setForm] = useState({ name: '', contact: '', email: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/inventory/suppliers', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    fetchSups(); setForm({ name: '', contact: '', email: '' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-[#131315] border border-[#2D2D30] p-5 rounded-xl">
            <h3 className="text-lg font-bold text-white">{s.name}</h3>
            <div className="text-sm text-gray-400 mt-2">📞 {s.contact || 'N/A'}</div>
            <div className="text-sm text-gray-400">✉️ {s.email || 'N/A'}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl h-fit">
        <h3 className="text-lg font-bold text-white mb-4">Add Supplier</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-bold text-gray-400">Name</label><input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          <div><label className="text-xs font-bold text-gray-400">Contact</label><input value={form.contact} onChange={e=>setForm({...form, contact: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          <div><label className="text-xs font-bold text-gray-400">Email</label><input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          <button className="w-full bg-[#C5A059] text-[#0A0A0B] font-bold py-2 rounded">Add Supplier</button>
        </form>
      </div>
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const fetchTxs = () => fetch('/api/inventory/transactions').then(r => r.json()).then(setTransactions);
  useEffect(() => {
    fetchTxs();
    fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials);
  }, []);

  const [form, setForm] = useState({ rawMaterialId: '', type: 'STOCK_IN', quantity: 0, unitPrice: 0, notes: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/inventory/transactions', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...form, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice)})
    });
    fetchTxs();
    setForm({ rawMaterialId: '', type: 'STOCK_IN', quantity: 0, unitPrice: 0, notes: '' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-[#131315] border border-[#2D2D30] rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0A0A0B] text-gray-400 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Material</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D2D30]">
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-[#1A1A1C]">
                <td className="px-6 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-bold text-white">{tx.rawMaterial?.name}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-bold",
                    tx.type === 'STOCK_IN' || tx.type === 'PURCHASE' ? 'bg-green-500/10 text-green-500' :
                    tx.type === 'WASTE' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                  )}>{tx.type}</span>
                </td>
                <td className="px-6 py-4">{tx.quantity}</td>
                <td className="px-6 py-4">₹{tx.totalValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl h-fit">
        <h3 className="text-lg font-bold text-white mb-4">Record Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400">Material</label>
            <select required value={form.rawMaterialId} onChange={e=>setForm({...form, rawMaterialId: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white">
              <option value="">Select Material</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400">Type</label>
            <select required value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white">
              <option value="STOCK_IN">Stock In</option>
              <option value="STOCK_OUT">Stock Out</option>
              <option value="WASTE">Waste</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-400">Quantity</label><input type="number" required value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
            <div><label className="text-xs font-bold text-gray-400">Unit Price</label><input type="number" required value={form.unitPrice} onChange={e=>setForm({...form, unitPrice: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          </div>
          <div><label className="text-xs font-bold text-gray-400">Notes</label><input value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2 text-white" /></div>
          <button className="w-full bg-[#C5A059] text-[#0A0A0B] font-bold py-2 rounded">Submit</button>
        </form>
      </div>
    </div>
  );
}

function RecipesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
    fetch('/api/inventory/materials').then(r => r.json()).then(setMaterials);
  }, []);

  const fetchRecipes = (menuItemId: string) => {
    fetch(`/api/inventory/recipes/${menuItemId}`).then(r => r.json()).then(setRecipes);
  };

  const [form, setForm] = useState({ rawMaterialId: '', quantityUsed: 0 });

  const handleAddRecipe = async (e: any) => {
    e.preventDefault();
    if (!selectedMenuItem) return;
    await fetch('/api/inventory/recipes', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ menuItemId: selectedMenuItem.id, rawMaterialId: form.rawMaterialId, quantityUsed: Number(form.quantityUsed) })
    });
    fetchRecipes(selectedMenuItem.id);
    setForm({ rawMaterialId: '', quantityUsed: 0 });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory/recipes/${id}`, { method: 'DELETE' });
    fetchRecipes(selectedMenuItem.id);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 bg-[#131315] border border-[#2D2D30] rounded-xl overflow-hidden flex flex-col max-h-[700px]">
        <div className="p-4 border-b border-[#2D2D30] bg-[#0A0A0B]">
          <h3 className="font-bold text-white">Menu Items</h3>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {categories.map(c => (
            <div key={c.id}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{c.name}</div>
              <div className="space-y-2">
                {c.items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedMenuItem(item); fetchRecipes(item.id); }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border text-sm font-bold transition-all",
                      selectedMenuItem?.id === item.id ? "bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]" : "bg-[#0A0A0B] border-[#2D2D30] text-gray-300 hover:border-gray-600"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:col-span-2">
        {selectedMenuItem ? (
          <div className="space-y-6">
            <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Link className="w-5 h-5 text-[#C5A059]" /> {selectedMenuItem.name} Bill of Materials (BOM)
              </h3>
              <p className="text-sm text-gray-400 mt-1">These materials will be automatically deducted from stock when this item is billed.</p>
              
              <div className="mt-6 space-y-3">
                {recipes.length === 0 ? (
                  <div className="text-gray-500 text-sm py-4">No recipe defined yet.</div>
                ) : recipes.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-4 bg-[#0A0A0B] border border-[#2D2D30] rounded-lg">
                    <div>
                      <div className="font-bold text-white">{r.rawMaterial?.name}</div>
                      <div className="text-sm text-gray-400">Uses {r.quantityUsed} {r.rawMaterial?.unit}</div>
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="text-gray-500 hover:text-red-500 transition-colors p-2"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#131315] border border-[#2D2D30] p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Add Material to Recipe</h3>
              <form onSubmit={handleAddRecipe} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400">Raw Material</label>
                  <select required value={form.rawMaterialId} onChange={e=>setForm({...form, rawMaterialId: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2.5 text-white">
                    <option value="">Select Material...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-xs font-bold text-gray-400">Qty Used</label>
                  <input type="number" step="0.01" required value={form.quantityUsed} onChange={e=>setForm({...form, quantityUsed: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded p-2.5 text-white" />
                </div>
                <button className="bg-[#C5A059] text-[#0A0A0B] font-bold px-6 py-2.5 rounded hover:bg-[#D5B069] transition-colors">Add</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#131315] border border-[#2D2D30] rounded-xl p-12">
            <Link className="w-12 h-12 mb-4 opacity-50" />
            <div className="text-lg font-bold">Select a Menu Item</div>
            <div className="text-sm">Link raw materials to menu items for auto-deduction.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Batch & Expiry Tracking - for Pharmacy, Retail, Wholesale
function BatchExpiryTab() {
  const [batches, setBatches] = useState<any[]>([]);
  const [form, setForm] = useState({ productName: '', batchNo: '', mfgDate: '', expiryDate: '', quantity: 0, mrp: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/inventory/batches').then(r => r.json()).then(setBatches).catch(() => {});
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/inventory/batches', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ ...form, quantity: Number(form.quantity), mrp: Number(form.mrp) })
    }).catch(() => {});
    setForm({ productName: '', batchNo: '', mfgDate: '', expiryDate: '', quantity: 0, mrp: 0 });
    setShowForm(false);
  };

  const today = new Date();
  const daysUntilExpiry = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Batch & Expiry Tracking</h3>
          <p className="text-xs text-gray-400">Track product batches, manufacturing & expiry dates</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl hover:bg-[#b08d4a]"
        >
          <Plus className="w-3.5 h-3.5" /> Add Batch
        </button>
      </div>

      {showForm && (
        <div className="bg-[#131315] border border-[#C5A059]/30 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4">Add New Batch</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Product Name</label><input required value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Batch No.</label><input required value={form.batchNo} onChange={e => setForm({...form, batchNo: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Mfg. Date</label><input type="date" required value={form.mfgDate} onChange={e => setForm({...form, mfgDate: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Expiry Date</label><input type="date" required value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase">MRP (₹)</label><input type="number" required value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value as any})} className="w-full bg-[#0A0A0B] border border-[#2D2D30] focus:border-[#C5A059] rounded-lg p-2 text-white text-sm outline-none mt-1" /></div>
            <div className="col-span-3 flex gap-3 mt-2">
              <button type="submit" className="px-6 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl uppercase hover:bg-[#b08d4a]">Save Batch</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-[#1A1A1C] text-gray-400 font-bold text-xs rounded-xl uppercase hover:text-white">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#0A0A0B] text-gray-400 font-bold uppercase text-[10px]">
            <tr>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Batch No.</th>
              <th className="px-5 py-3">Mfg. Date</th>
              <th className="px-5 py-3">Expiry Date</th>
              <th className="px-5 py-3">Qty</th>
              <th className="px-5 py-3">MRP</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F21]">
            {batches.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">No batch records found. Add a batch to get started.</td></tr>
            ) : batches.map((b: any) => {
              const days = b.expiryDate ? daysUntilExpiry(b.expiryDate) : 999;
              const expiryClass = days < 0 ? 'text-red-400' : days < 30 ? 'text-amber-400' : 'text-emerald-400';
              const expiryLabel = days < 0 ? 'EXPIRED' : days < 30 ? `${days}d left` : 'Good';
              return (
                <tr key={b.id} className="hover:bg-[#1A1A1C] transition-colors">
                  <td className="px-5 py-3 font-bold text-white">{b.productName}</td>
                  <td className="px-5 py-3 font-mono text-gray-300">{b.batchNo}</td>
                  <td className="px-5 py-3 text-gray-400">{b.mfgDate ? new Date(b.mfgDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-5 py-3 text-gray-400">{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="px-5 py-3 font-bold text-white">{b.quantity}</td>
                  <td className="px-5 py-3 text-[#C5A059] font-mono font-bold">₹{b.mrp}</td>
                  <td className="px-5 py-3">
                    <span className={cn('font-bold', expiryClass)}>{expiryLabel}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
