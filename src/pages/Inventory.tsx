import React, { useState, useEffect, useMemo } from 'react';
import { Package, Truck, ArrowRightLeft, DollarSign, AlertTriangle, Search, Plus, Trash2, Edit2, Link, CalendarClock, FlaskConical } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const COMMON_UNITS = [
  { group: 'Weight Units', units: ['Kg', 'g', 'Quintal', 'Ton', 'mg', 'lb'] },
  { group: 'Volume & Liquid', units: ['Liter', 'ml', 'Gallon', 'Barrel'] },
  { group: 'Count & Packaging', units: ['Pcs', 'Box', 'Packet', 'Bag', 'Bottle', 'Can', 'Carton', 'Dozen', 'Pair', 'Set', 'Bundle', 'Roll', 'Strip', 'Tablet', 'Plate', 'Portion'] },
  { group: 'Length & Area', units: ['Meter', 'cm', 'Feet', 'Inch', 'Sq Ft', 'Sq Meter'] },
  { group: 'Time & Service', units: ['Hour', 'Day', 'Session', 'Service'] },
];

export default function Inventory() {
  const { businessProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES' | 'VALUATION' | 'SUPPLIERS' | 'MOVEMENTS'>('PRODUCTS');

  const tabs = [
    { id: 'PRODUCTS', label: '📦 All Products & Stock' },
    { id: 'CATEGORIES', label: '🏷️ Categories' },
    { id: 'VALUATION', label: '📊 Valuation & Low Stock' },
    { id: 'SUPPLIERS', label: '🚚 Suppliers & Vendors' },
    { id: 'MOVEMENTS', label: '🔄 Stock Movements' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-theme-primary">Products & Inventory Hub</h1>
          <p className="text-theme-primary opacity-60 text-sm mt-1">Unified product catalog, category pricing, stock counts, and supplier management</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-theme-surface text-theme-accent border border-theme-secondary/30 font-bold text-xs uppercase tracking-wider">
          Unified Catalog & Stock
        </div>
      </div>

      {/* Visible Pill Button Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-theme-surface border border-theme-secondary/30 rounded-2xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5",
              activeTab === tab.id
                ? "btn-theme-secondary shadow-md font-extrabold"
                : "text-theme-primary opacity-75 hover:opacity-100 hover:bg-theme-secondary/15"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {activeTab === 'PRODUCTS' && <MaterialsTab stockNoun="Products" />}
        {activeTab === 'CATEGORIES' && <CategoriesTab />}
        {activeTab === 'VALUATION' && <DashboardTab businessType="RETAIL" stockNoun="Products" />}
        {activeTab === 'SUPPLIERS' && <SuppliersTab />}
        {activeTab === 'MOVEMENTS' && <TransactionsTab />}
      </div>
    </div>
  );
}



function getCombinedMaterials(): Promise<any[]> {
  return new Promise(resolve => {
    let list: any[] = [];
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map((it: any) => ({
            id: it.id,
            name: it.name,
            categoryId: it.categoryId || '',
            categoryName: it.categoryName || 'General',
            currentStock: it.currentStock ?? 50,
            minStockLevel: it.minStockLevel ?? it.minStock ?? 10,
            pricePerUnit: it.price || it.pricePerUnit || 0,
            costPrice: it.costPrice || 0,
            unit: it.unit || 'Pcs',
            sku: it.sku || '',
            barcode: it.barcode || '',
            hsnCode: it.hsnCode || '',
            gst: it.gst ?? 5,
            isAvailable: it.isAvailable !== false,
            description: it.description || '',
          }));
        }
      }
    } catch {}

    fetch('/api/menu-items')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const ids = new Set(list.map(l => l.id));
          data.forEach((d: any) => {
            if (!ids.has(d.id)) {
              list.push({
                id: d.id,
                name: d.name,
                categoryId: d.categoryId || d.category?.id || '',
                categoryName: d.categoryName || d.category?.name || 'General',
                currentStock: d.currentStock ?? 50,
                minStockLevel: d.minStockLevel ?? d.minStock ?? 10,
                pricePerUnit: d.price || d.pricePerUnit || 0,
                costPrice: d.costPrice || 0,
                unit: d.unit || 'Pcs',
                sku: d.sku || '',
                barcode: d.barcode || '',
                hsnCode: d.hsnCode || '',
                gst: d.gst ?? 5,
                isAvailable: d.isAvailable !== false,
                description: d.description || '',
              });
            }
          });
        }
        resolve(list);
      })
      .catch(() => resolve(list));
  });
}

function DashboardTab({ businessType, stockNoun }: { businessType: string; stockNoun: string }) {
  const [materials, setMaterials] = useState<any[]>([]);

  const loadData = () => {
    getCombinedMaterials().then(setMaterials);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const totalValue = materials.reduce((acc, m) => acc + ((m.currentStock || 0) * (m.pricePerUnit || 0)), 0);
  const lowStock = materials.filter(m => (m.currentStock || 0) <= (m.minStockLevel || 0));
  const expiringSoon = materials.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-theme-surface border border-theme-secondary/20 p-5 rounded-2xl hover:border-theme-secondary/40 transition-colors">
          <div className="flex items-center gap-2 text-theme-primary opacity-70 text-xs mb-3">
            <DollarSign className="w-4 h-4 text-theme-accent" /> Stock Valuation
          </div>
          <div className="text-2xl font-bold text-theme-primary font-mono">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="text-[10px] text-theme-primary opacity-60 mt-1">Total inventory value</div>
        </div>
        <div className="bg-theme-surface border border-theme-secondary/20 p-5 rounded-2xl hover:border-theme-secondary/40 transition-colors">
          <div className="flex items-center gap-2 text-theme-primary opacity-70 text-xs mb-3">
            <Package className="w-4 h-4 text-blue-400" /> Total {stockNoun.split(' ')[0]}
          </div>
          <div className="text-2xl font-bold text-theme-primary font-mono">{materials.length}</div>
          <div className="text-[10px] text-theme-primary opacity-60 mt-1">Items being tracked</div>
        </div>
        <div className="bg-theme-surface border border-theme-secondary/20 p-5 rounded-2xl hover:border-red-500/40 transition-colors">
          <div className="flex items-center gap-2 text-theme-primary opacity-70 text-xs mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Low Stock
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{lowStock.length}</div>
          <div className="text-[10px] text-theme-primary opacity-60 mt-1">Need replenishment</div>
        </div>
        {['MEDICAL', 'RETAIL', 'WHOLESALE'].includes(businessType) && (
          <div className="bg-theme-surface border border-theme-secondary/20 p-5 rounded-2xl hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 text-theme-primary opacity-70 text-xs mb-3">
              <CalendarClock className="w-4 h-4 text-amber-400" /> Expiring Soon
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{expiringSoon.length}</div>
            <div className="text-[10px] text-theme-primary opacity-60 mt-1">Within 30 days</div>
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
              <div key={m.id} className="bg-theme-surface p-4 rounded-xl border border-red-500/20">
                <div className="font-bold text-theme-primary text-sm">{m.name}</div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-red-400 font-bold">{m.currentStock ?? 0} {m.unit} left</span>
                  <span className="text-theme-primary opacity-60">Min: {m.minStockLevel ?? 0} {m.unit}</span>
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
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  const [editingItem, setEditingItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    id: '', name: '', categoryId: '', price: 0, costPrice: 0, currentStock: 0, minStock: 10, unit: '', sku: '', barcode: '', hsnCode: '', gst: 5, isAvailable: true, description: ''
  });

  const fetchMats = () => {
    getCombinedMaterials().then(setMaterials);
    try {
      const savedCats = localStorage.getItem('universal_categories');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
    } catch {}
  };

  useEffect(() => {
    fetchMats();
    window.addEventListener('storage', fetchMats);
    fetch('/api/inventory/suppliers').then(r => r.json()).then(setSuppliers).catch(() => {});
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setCategories(data);
    }).catch(() => {});
    return () => window.removeEventListener('storage', fetchMats);
  }, []);

  const [form, setForm] = useState({
    name: '', unit: 'Pcs', minStockLevel: 10, pricePerUnit: 0, costPrice: 0, supplierId: '', categoryId: '', sku: '', barcode: '', hsnCode: '', gst: 5
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const selectedCat = categories.find(c => c.id === form.categoryId) || categories[0] || { id: 'cat-1', name: 'Grocery' };

    const newItem = {
      id: `item-${Date.now()}`,
      name: form.name.trim(),
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      price: Number(form.pricePerUnit),
      costPrice: Number(form.costPrice),
      unit: form.unit.trim() || 'Pcs',
      currentStock: Number(form.minStockLevel) * 2 || 50,
      minStock: Number(form.minStockLevel) || 10,
      sku: form.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: form.barcode.trim(),
      hsnCode: form.hsnCode.trim(),
      gst: Number(form.gst) || 5,
      isAvailable: true,
    };

    let existing: any[] = [];
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) existing = JSON.parse(saved);
    } catch {}

    const updated = [newItem, ...existing].map(item => {
      if (item.name.toLowerCase() === newItem.name.toLowerCase()) {
        return { ...item, categoryId: selectedCat.id, categoryName: selectedCat.name };
      }
      return item;
    });

    localStorage.setItem('universal_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    await fetch('/api/inventory/materials', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...form, minStockLevel: Number(form.minStockLevel), pricePerUnit: Number(form.pricePerUnit)})
    });
    fetchMats();
    setForm({ name: '', unit: 'Pcs', minStockLevel: 10, pricePerUnit: 0, costPrice: 0, supplierId: '', categoryId: '', sku: '', barcode: '', hsnCode: '', gst: 5 });
    setShowForm(false);
  };

  const handleAdjustStock = (itemId: string, delta: number) => {
    let existing: any[] = [];
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) existing = JSON.parse(saved);
    } catch {}
    const updated = existing.map(i => {
      if (i.id === itemId) {
        const cur = i.currentStock ?? 50;
        return { ...i, currentStock: Math.max(0, cur + delta) };
      }
      return i;
    });
    localStorage.setItem('universal_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    fetchMats();
  };

  const handleToggleAvailability = (item: any) => {
    let existing: any[] = [];
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) existing = JSON.parse(saved);
    } catch {}

    const updated = existing.map(i => {
      if (i.id === item.id || i.name.toLowerCase() === item.name.toLowerCase()) {
        return { ...i, isAvailable: !i.isAvailable };
      }
      return i;
    });

    localStorage.setItem('universal_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    fetchMats();
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setEditForm({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId || '',
      price: item.pricePerUnit || item.price || 0,
      costPrice: item.costPrice || 0,
      currentStock: item.currentStock ?? 50,
      minStock: item.minStockLevel || item.minStock || 10,
      unit: item.unit || 'Pcs',
      sku: item.sku || '',
      barcode: item.barcode || '',
      hsnCode: item.hsnCode || '',
      gst: item.gst ?? 5,
      isAvailable: item.isAvailable !== false,
      description: item.description || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    const selectedCat = categories.find(c => c.id === editForm.categoryId) || categories[0] || { id: 'cat-1', name: 'Grocery' };

    let existing: any[] = [];
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) existing = JSON.parse(saved);
    } catch {}

    const updated = existing.map(item => {
      if (item.id === editForm.id || item.name.toLowerCase() === editForm.name.toLowerCase()) {
        return {
          ...item,
          name: editForm.name.trim(),
          categoryId: selectedCat.id,
          categoryName: selectedCat.name,
          price: Number(editForm.price),
          costPrice: Number(editForm.costPrice),
          currentStock: Number(editForm.currentStock),
          minStock: Number(editForm.minStock),
          unit: editForm.unit.trim() || 'Pcs',
          sku: editForm.sku.trim(),
          barcode: editForm.barcode.trim(),
          hsnCode: editForm.hsnCode.trim(),
          gst: Number(editForm.gst),
          isAvailable: editForm.isAvailable,
          description: editForm.description.trim(),
        };
      }
      return item;
    });

    localStorage.setItem('universal_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    fetchMats();
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    let existing: any[] = [];
    try {
      const saved = localStorage.getItem('universal_items');
      if (saved) existing = JSON.parse(saved);
    } catch {}

    const updated = existing.filter(item => item.id !== itemId && item.name !== name);
    localStorage.setItem('universal_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    fetchMats();
  };

  // Filter products by Search, Category Chip, and Stock Level Filter
  const filtered = materials.filter(m => {
    const q = searchQ.toLowerCase().trim();
    const searchTerms = q ? q.split(/\s+/).filter(Boolean) : [];

    // Category matching
    const matchCat = selectedCategory === 'ALL' || m.categoryId === selectedCategory || (m.categoryName && m.categoryName.toLowerCase() === selectedCategory.toLowerCase());
    if (!matchCat) return false;

    // Stock Filter matching
    const stock = m.currentStock ?? 0;
    const min = m.minStockLevel ?? 10;
    let matchStock = true;
    if (stockFilter === 'IN_STOCK') matchStock = stock > min;
    else if (stockFilter === 'LOW_STOCK') matchStock = stock > 0 && stock <= min;
    else if (stockFilter === 'OUT_OF_STOCK') matchStock = stock <= 0;
    if (!matchStock) return false;

    if (searchTerms.length === 0) return true;

    const searchableText = [m.name, m.categoryName, m.sku, m.barcode, m.hsnCode, m.unit, m.description].filter(Boolean).join(' ').toLowerCase();
    return searchTerms.every(term => searchableText.includes(term));
  });

  return (
    <div className="space-y-4">
      {/* Category Chips Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-shrink-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0",
              selectedCategory === 'ALL'
                ? "btn-theme-secondary shadow-md border-transparent font-extrabold"
                : "bg-theme-surface text-theme-primary border-theme-secondary/30 hover:bg-theme-secondary/20"
            )}
          >
            All Products ({materials.length})
          </button>

          {categories.map(cat => {
            const count = materials.filter(m => m.categoryId === cat.id || (m.categoryName && m.categoryName.toLowerCase() === cat.name.toLowerCase())).length;
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 flex items-center gap-1.5",
                  isSelected
                    ? "btn-theme-secondary shadow-md border-transparent font-extrabold"
                    : "bg-theme-surface text-theme-primary border-theme-secondary/30 hover:bg-theme-secondary/20"
                )}
              >
                <span>{cat.name}</span>
                <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-mono", isSelected ? "bg-black/20 text-current" : "bg-theme-card text-theme-primary")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-theme-primary opacity-60 absolute left-3 top-2.5" />
            <input
              placeholder={`Search products by Name, Barcode, SKU, HSN...`}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="bg-theme-surface border border-theme-secondary/30 focus:border-theme-secondary text-theme-primary text-xs pl-9 pr-3 py-2 rounded-xl outline-none w-72"
            />
          </div>

          {/* Stock Level Filter Dropdown */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-theme-surface border border-theme-secondary/30 text-theme-primary text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock Warning</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 btn-theme-secondary font-bold text-xs rounded-xl shadow-md"
        >
          <Plus className="w-3.5 h-3.5" /> Add {stockNoun.split(' ')[0]}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-theme-surface border border-theme-secondary/30 p-5 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-theme-primary mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Product Name</label>
              <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" placeholder="e.g. Garam Masala 100g" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Category</label>
              <select value={form.categoryId} onChange={e=>setForm({...form, categoryId: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1">
                <option value="">Default Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Selling Price (₹)</label>
              <input type="number" required value={form.pricePerUnit} onChange={e=>setForm({...form, pricePerUnit: e.target.value as any})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Cost Price (₹)</label>
              <input type="number" value={form.costPrice} onChange={e=>setForm({...form, costPrice: e.target.value as any})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">GST Tax (%)</label>
              <select value={form.gst} onChange={e=>setForm({...form, gst: e.target.value as any})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1">
                <option value="0">0% (Exempt)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">HSN Code</label>
              <input value={form.hsnCode} onChange={e=>setForm({...form, hsnCode: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" placeholder="e.g. 0910" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Unit</label>
              <select
                required
                value={form.unit}
                onChange={e=>setForm({...form, unit: e.target.value})}
                className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1 font-medium"
              >
                <option value="">Select Unit</option>
                {COMMON_UNITS.map(grp => (
                  <optgroup key={grp.group} label={`── ${grp.group} ──`}>
                    {grp.units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                ))}
                {form.unit && !COMMON_UNITS.some(g => g.units.includes(form.unit)) && (
                  <option value={form.unit}>{form.unit} (Custom)</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Min Stock Warning</label>
              <input type="number" required value={form.minStockLevel} onChange={e=>setForm({...form, minStockLevel: e.target.value as any})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">SKU / Code</label>
              <input value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Barcode</label>
              <input value={form.barcode} onChange={e=>setForm({...form, barcode: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Supplier</label>
              <select value={form.supplierId} onChange={e=>setForm({...form, supplierId: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-theme-primary text-sm outline-none mt-1">
                <option value="">No Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-4 flex gap-3 mt-2">
              <button type="submit" className="px-6 py-2 btn-theme-secondary font-bold text-xs rounded-xl uppercase shadow-md">Save Item</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-theme-card text-theme-primary opacity-70 font-bold text-xs rounded-xl uppercase hover:opacity-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-theme-surface border border-theme-secondary/30 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme-secondary/20 pb-3">
              <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-theme-accent" /> Edit Product: {editingItem.name}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-theme-primary opacity-60 hover:opacity-100 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Product Name</label>
                <input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Category</label>
                <select value={editForm.categoryId} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Selling Price (₹)</label>
                <input type="number" required value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value as any })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Cost Price (₹)</label>
                <input type="number" value={editForm.costPrice} onChange={e => setEditForm({ ...editForm, costPrice: e.target.value as any })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">GST Tax (%)</label>
                <select value={editForm.gst} onChange={e => setEditForm({ ...editForm, gst: e.target.value as any })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1">
                  <option value="0">0% (Exempt)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% GST</option>
                  <option value="28">28% GST</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">HSN Code</label>
                <input value={editForm.hsnCode} onChange={e => setEditForm({ ...editForm, hsnCode: e.target.value })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Stock Level</label>
                <input type="number" required value={editForm.currentStock} onChange={e => setEditForm({ ...editForm, currentStock: e.target.value as any })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Min Stock Warning</label>
                <input type="number" required value={editForm.minStock} onChange={e => setEditForm({ ...editForm, minStock: e.target.value as any })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Unit</label>
                <select
                  required
                  value={editForm.unit}
                  onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                  className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1 font-medium"
                >
                  <option value="">Select Unit</option>
                  {COMMON_UNITS.map(grp => (
                    <optgroup key={grp.group} label={`── ${grp.group} ──`}>
                      {grp.units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </optgroup>
                  ))}
                  {editForm.unit && !COMMON_UNITS.some(g => g.units.includes(editForm.unit)) && (
                    <option value={editForm.unit}>{editForm.unit} (Custom)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">SKU / Code</label>
                <input value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-theme-primary opacity-75 uppercase">Barcode</label>
                <input value={editForm.barcode} onChange={e => setEditForm({ ...editForm, barcode: e.target.value })} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" />
              </div>

              <div className="col-span-2 flex gap-3 pt-3 border-t border-theme-secondary/20">
                <button type="submit" className="flex-1 btn-theme-secondary font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md">
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-2.5 bg-theme-card text-theme-primary opacity-70 font-bold text-xs rounded-xl uppercase hover:opacity-100">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Products Table */}
      <div className="bg-theme-surface border border-theme-secondary/20 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-theme-primary">
          <thead className="bg-theme-card text-theme-primary font-bold uppercase text-xs border-b border-theme-secondary/20">
            <tr>
              <th className="px-4 py-3">Product / Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Selling Price</th>
              <th className="px-4 py-3 text-right">Cost Price</th>
              <th className="px-4 py-3 text-center">Tax / GST</th>
              <th className="px-4 py-3 text-center">Stock Level</th>
              <th className="px-4 py-3 text-center">POS Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-secondary/20">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-theme-primary opacity-60 text-xs">No products found matching your search or filters. Click "Add {stockNoun.split(' ')[0]}" above to create one.</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="hover:bg-theme-card/60 transition-colors">
                <td className="px-4 py-3 font-bold text-theme-primary">
                  <div>{m.name}</div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-theme-primary opacity-60 font-mono mt-0.5">
                    {m.sku && <span>SKU: {m.sku}</span>}
                    {m.barcode && <span>• Barcode: {m.barcode}</span>}
                    {m.hsnCode && <span>• HSN: {m.hsnCode}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-theme-primary opacity-80 text-xs">{m.categoryName || 'General'}</td>
                <td className="px-4 py-3 text-right text-theme-accent font-mono font-bold">₹{(m.pricePerUnit || m.price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-theme-primary opacity-70">{m.costPrice ? `₹${Number(m.costPrice).toFixed(2)}` : '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-theme-secondary/15 text-theme-accent border border-theme-secondary/30 font-mono text-[10px] font-bold">
                    {m.gst || 5}% GST
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 border",
                    (m.currentStock ?? 0) <= (m.minStockLevel ?? 10)
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  )}>
                    {m.currentStock ?? 0} {m.unit || 'Pcs'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleAvailability(m)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                      m.isAvailable !== false
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/25"
                    )}
                  >
                    {m.isAvailable !== false ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <div className="inline-flex items-center gap-0.5 bg-theme-card p-0.5 rounded-lg border border-theme-secondary/30 mr-1">
                      <button
                        onClick={() => handleAdjustStock(m.id, -10)}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 hover:bg-red-500/20 rounded"
                        title="Reduce 10 stock"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleAdjustStock(m.id, 10)}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 rounded"
                        title="Add 10 stock"
                      >
                        +10
                      </button>
                    </div>
                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-1.5 text-theme-accent hover:bg-theme-secondary/20 rounded-lg transition-all"
                      title="Edit Product Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(m.id, m.name)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete Product"
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
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const loadCatData = () => {
    try {
      const savedCats = localStorage.getItem('universal_categories');
      if (savedCats) setCategories(JSON.parse(savedCats));
      const savedItems = localStorage.getItem('universal_items');
      if (savedItems) setItems(JSON.parse(savedItems));
    } catch {}
  };

  useEffect(() => {
    loadCatData();
    window.addEventListener('storage', loadCatData);
    return () => window.removeEventListener('storage', loadCatData);
  }, []);

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const newCat = { id: `cat-${Date.now()}`, name: catName.trim(), description: catDesc.trim() };
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('universal_categories', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setCatName('');
    setCatDesc('');
    setShowCatModal(false);
  };

  const handleDeleteCat = (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem('universal_categories', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-theme-primary">Product Categories ({categories.length})</h3>
        <button
          onClick={() => setShowCatModal(true)}
          className="flex items-center gap-2 px-4 py-2 btn-theme-secondary font-bold text-xs rounded-xl"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      {showCatModal && (
        <div className="bg-theme-surface border border-theme-secondary/30 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-theme-primary mb-3">Add Category</h4>
          <form onSubmit={handleSaveCat} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Category Name</label>
              <input
                required
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="e.g. Groceries, Spices, Beverages"
                className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-xs text-theme-primary outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-primary opacity-70 uppercase">Description</label>
              <input
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                placeholder="Short description"
                className="w-full bg-theme-card border border-theme-secondary/30 rounded-lg p-2 text-xs text-theme-primary outline-none mt-1"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="px-5 py-2 btn-theme-secondary text-xs font-bold rounded-xl">Save</button>
              <button type="button" onClick={() => setShowCatModal(false)} className="px-5 py-2 bg-theme-card text-theme-primary opacity-70 text-xs font-bold rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const count = items.filter(i => i.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="bg-theme-surface border border-theme-secondary/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-theme-primary text-sm">{cat.name}</h4>
                <p className="text-[11px] text-theme-primary opacity-60 mt-0.5">{cat.description || 'General category'}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-theme-card text-theme-accent border border-theme-secondary/30 rounded text-[10px] font-mono font-bold">
                  {count} Products
                </span>
              </div>
              <button
                onClick={() => handleDeleteCat(cat.id)}
                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const fetchSups = () => {
    try {
      const saved = localStorage.getItem('universal_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setSuppliers(parsed);
      }
    } catch {}

    fetch('/api/inventory/suppliers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSuppliers(prev => {
            const ids = new Set(prev.map(p => p.id));
            const merged = [...prev];
            data.forEach((d: any) => { if (!ids.has(d.id)) merged.push(d); });
            localStorage.setItem('universal_suppliers', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => { fetchSups(); }, []);
  
  const [form, setForm] = useState({ name: '', contact: '', email: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newSup = { id: `sup-${Date.now()}`, name: form.name.trim(), contact: form.contact.trim(), email: form.email.trim() };
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem('universal_suppliers', JSON.stringify(updated));

    try {
      await fetch('/api/inventory/suppliers', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newSup) });
    } catch {}
    setForm({ name: '', contact: '', email: '' });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-theme-surface border border-theme-secondary/20 p-5 rounded-2xl shadow-md">
            <h3 className="text-base font-bold text-theme-primary">{s.name}</h3>
            <div className="text-xs text-theme-primary opacity-70 mt-2 font-mono">📞 {s.contact || 'N/A'}</div>
            <div className="text-xs text-theme-primary opacity-70 font-mono">✉️ {s.email || 'N/A'}</div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-2 py-12 text-center text-theme-primary opacity-60 text-xs bg-theme-surface border border-theme-secondary/20 rounded-2xl">
            No suppliers added yet. Fill out the form to add your first supplier!
          </div>
        )}
      </div>
      <div className="bg-theme-surface border border-theme-secondary/30 p-6 rounded-2xl h-fit shadow-xl">
        <h3 className="text-base font-bold text-theme-primary mb-4">Add Supplier</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-theme-primary opacity-75">Supplier Name</label>
            <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" placeholder="e.g. Metro Traders" />
          </div>
          <div>
            <label className="text-xs font-bold text-theme-primary opacity-75">Phone / Contact</label>
            <input value={form.contact} onChange={e=>setForm({...form, contact: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-xs font-bold text-theme-primary opacity-75">Email Address</label>
            <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full bg-theme-card border border-theme-secondary/30 rounded-xl p-2.5 text-xs text-theme-primary outline-none mt-1" placeholder="supplier@email.com" />
          </div>
          <button className="w-full btn-theme-secondary font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md">Add Supplier</button>
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
