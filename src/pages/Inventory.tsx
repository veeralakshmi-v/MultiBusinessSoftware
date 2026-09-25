import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Package, Truck, ArrowRightLeft, DollarSign, AlertTriangle, Search, Plus, Trash2, Edit2, Link, CalendarClock, FlaskConical, Globe, Image as ImageIcon, Upload, X } from 'lucide-react';
import { cn, compressImageFile } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { NotificationEngine } from '../lib/notifications/notificationEngine';

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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Products & Inventory Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Unified product catalog, category pricing, stock counts, and supplier management</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-white text-[#2563EB] border border-gray-100 font-bold text-xs uppercase tracking-wider">
          Products & Stock Manager
        </div>
      </div>

      {/* Visible Pill Button Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-gray-100 rounded-2xl overflow-x-auto no-scrollbar touch-pan-x">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0",
              activeTab === tab.id
                ? "shadow-md font-extrabold btn-theme-secondary"
                : "text-gray-600 hover:opacity-100 hover:bg-gray-100"
            )}
            style={activeTab === tab.id ? {
              backgroundColor: 'var(--theme-btn-secondary)',
              color: 'var(--theme-btn-text)'
            } : {}}
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
    fetch('/api/menu-items')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.map((d: any) => {
            const attrs = typeof d.attributes === 'string' ? JSON.parse(d.attributes || '{}') : (d.attributes || {});
            return {
              id: d.id,
              name: d.name,
              categoryId: d.categoryId || d.category?.id || '',
              categoryName: d.category?.name || attrs.categoryName || 'General',
              currentStock: (typeof d.currentStock === 'number' && !isNaN(d.currentStock)) ? d.currentStock : (attrs.currentStock ?? 50),
              minStockLevel: (typeof d.minStockLevel === 'number' && !isNaN(d.minStockLevel)) ? d.minStockLevel : (attrs.minStockLevel ?? attrs.minStock ?? 10),
              minStock: (typeof d.minStock === 'number' && !isNaN(d.minStock)) ? d.minStock : (attrs.minStock ?? attrs.minStockLevel ?? 10),
              pricePerUnit: (typeof d.price === 'number' && !isNaN(d.price)) ? d.price : (d.pricePerUnit || 0),
              price: (typeof d.price === 'number' && !isNaN(d.price)) ? d.price : (d.pricePerUnit || 0),
              costPrice: (typeof d.costPrice === 'number' && !isNaN(d.costPrice)) ? d.costPrice : (attrs.costPrice || 0),
              unit: d.unit || attrs.unit || 'Pcs',
              sku: d.sku || attrs.sku || '',
              barcode: d.barcode || attrs.barcode || '',
              hsnCode: d.hsnCode || '',
              gst: (typeof d.gst === 'number' && !isNaN(d.gst)) ? d.gst : 5,
              isAvailable: d.isAvailable !== false,
              showInWebsite: d.showInWebsite === true || attrs.showInWebsite === true,
              description: d.description || attrs.description || '',
              imageUrl: d.imageUrl || '',
              supplierId: d.supplierId || attrs.supplierId || '',
              supplierName: d.supplierName || attrs.supplierName || '',
            };
          });
          localStorage.setItem('universal_items', JSON.stringify(list));
          resolve(list);
          return;
        }
        resolve([]);
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('universal_items');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return resolve(parsed);
          }
        } catch { }
        resolve([]);
      });
  });
}

export async function fetchUnifiedCategories(): Promise<any[]> {
  let localCats: any[] = [];
  try {
    const saved = localStorage.getItem('universal_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) localCats = parsed;
    }
  } catch {}

  let serverCats: any[] = [];
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) serverCats = data;
    }
  } catch {}

  const catMap = new Map<string, any>();

  // 1. Add local categories first
  for (const c of localCats) {
    if (c && c.name && typeof c.name === 'string') {
      const nameKey = c.name.trim().toLowerCase();
      catMap.set(nameKey, { ...c, name: c.name.trim() });
    }
  }

  // 2. Overlay server categories (server IDs take precedence)
  for (const c of serverCats) {
    if (c && c.name && typeof c.name === 'string') {
      const nameKey = c.name.trim().toLowerCase();
      const existing = catMap.get(nameKey);
      catMap.set(nameKey, { ...existing, ...c, name: c.name.trim() });
    }
  }

  // Always ensure 'General' exists
  if (!catMap.has('general')) {
    catMap.set('general', { id: 'cat-general', name: 'General' });
  }

  const merged = Array.from(catMap.values());
  try {
    localStorage.setItem('universal_categories', JSON.stringify(merged));
  } catch {}

  // Auto-sync any local categories not yet on the server in the background
  localCats.forEach(async (lc) => {
    if (lc && lc.name && typeof lc.name === 'string' && lc.name.trim().toLowerCase() !== 'general') {
      const onServer = serverCats.some(sc => sc.name?.trim().toLowerCase() === lc.name?.trim().toLowerCase());
      if (!onServer) {
        try {
          const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: lc.name.trim(), description: lc.description || '' })
          });
          if (res.ok) {
            const created = await res.json();
            if (created && created.id) {
              const curSaved = JSON.parse(localStorage.getItem('universal_categories') || '[]');
              const updatedSaved = curSaved.map((item: any) => 
                item.name?.trim().toLowerCase() === created.name?.trim().toLowerCase() ? { ...item, id: created.id } : item
              );
              localStorage.setItem('universal_categories', JSON.stringify(updatedSaved));
            }
          }
        } catch {}
      }
    }
  });

  return merged;
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

  const totalValue = useMemo(() => {
    return materials.reduce((acc, m) => {
      const stock = Number(m.currentStock) || 0;
      const unitVal = (Number(m.costPrice) > 0 ? Number(m.costPrice) : (Number(m.pricePerUnit) || Number(m.price) || 0));
      return acc + (stock * unitVal);
    }, 0);
  }, [materials]);

  const lowStock = useMemo(() => {
    return materials.filter(m => (Number(m.currentStock) || 0) <= (Number(m.minStockLevel) || 10));
  }, [materials]);

  const expiringSoon = useMemo(() => {
    return materials.filter(m => m.expiryDate && new Date(m.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  }, [materials]);

  // Group valuation by category
  const categoryValuations = useMemo(() => {
    const groups: { [cat: string]: { count: number; totalQty: number; value: number } } = {};
    materials.forEach(m => {
      const cat = m.categoryName || 'General';
      if (!groups[cat]) {
        groups[cat] = { count: 0, totalQty: 0, value: 0 };
      }
      const qty = Number(m.currentStock) || 0;
      const price = (Number(m.costPrice) > 0 ? Number(m.costPrice) : (Number(m.pricePerUnit) || Number(m.price) || 0));
      groups[cat].count += 1;
      groups[cat].totalQty += qty;
      groups[cat].value += qty * price;
    });
    return Object.entries(groups).map(([category, data]) => ({
      category,
      ...data,
    })).sort((a, b) => b.value - a.value);
  }, [materials]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-gray-700 text-xs font-semibold mb-2">
            <DollarSign className="w-4 h-4 text-[#2563EB]" /> Total Stock Valuation
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">
            ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Live asset value of catalog</div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-gray-700 text-xs font-semibold mb-2">
            <Package className="w-4 h-4 text-[#2563EB]" /> Total Products Tracked
          </div>
          <div className="text-2xl font-bold text-gray-900 font-mono">{materials.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Active inventory SKUs</div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-gray-700 text-xs font-semibold mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{lowStock.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">At or below minimum threshold</div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-gray-700 text-xs font-semibold mb-2">
            <CalendarClock className="w-4 h-4 text-emerald-600" /> Stock Health Rate
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {materials.length > 0 ? `${Math.round(((materials.length - lowStock.length) / materials.length) * 100)}%` : '100%'}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Optimal stock sufficiency</div>
        </div>
      </div>

      {/* Category-Wise Valuation Breakdown */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#2563EB]" />
          <span>Category-Wise Valuation & Asset Distribution</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-y border-gray-100">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Products Count</th>
                <th className="px-4 py-3">Units in Stock</th>
                <th className="px-4 py-3 text-right">Valuation (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoryValuations.map(cat => (
                <tr key={cat.category} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900">{cat.category}</td>
                  <td className="px-4 py-3 font-mono">{cat.count} items</td>
                  <td className="px-4 py-3 font-mono font-semibold">{cat.totalQty}</td>
                  <td className="px-4 py-3 font-mono font-bold text-gray-900 text-right">
                    ₹{cat.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {categoryValuations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No product categories tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Items Warning Grid */}
      {lowStock.length > 0 && (
        <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
          <h3 className="text-red-700 font-bold flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Items Below Minimum Threshold ({lowStock.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(m => (
              <div key={m.id} className="bg-white p-3.5 rounded-xl border border-red-200 shadow-2xs space-y-2">
                <div className="font-bold text-gray-900 text-xs truncate">{m.name}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-600 font-bold font-mono px-2 py-0.5 rounded-md bg-red-50 border border-red-200">
                    {m.currentStock ?? 0} {m.unit || 'Pcs'} left
                  </span>
                  <span className="text-gray-500 font-mono text-[11px]">
                    Min: {m.minStockLevel ?? 10} {m.unit || 'Pcs'}
                  </span>
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
    id: '', name: '', categoryId: '', categoryName: '', supplierId: '', price: 0, costPrice: 0, currentStock: 0, minStock: 10, unit: '', sku: '', barcode: '', hsnCode: '', gst: 5, isAvailable: true, showInWebsite: false, description: '', imageUrl: ''
  });

  const fetchMats = useCallback(() => {
    getCombinedMaterials().then(setMaterials);
    try {
      const savedSups = localStorage.getItem('universal_suppliers');
      if (savedSups) {
        const parsed = JSON.parse(savedSups);
        if (Array.isArray(parsed) && parsed.length > 0) setSuppliers(parsed);
      }
    } catch { }
  }, []);

  useEffect(() => {
    fetchMats();
    fetchUnifiedCategories().then(setCategories);

    fetch('/api/inventory/suppliers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSuppliers(data);
          localStorage.setItem('universal_suppliers', JSON.stringify(data));
        }
      })
      .catch(() => { });

    const handleStorageChange = (e: Event) => {
      const se = e as StorageEvent;
      if (!se.key || se.key.includes('universal_') || se.key.includes('item') || se.key.includes('cat')) {
        fetchMats();
        fetchUnifiedCategories().then(setCategories);
      }
    };

    const handleCatsUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        fetchUnifiedCategories().then(setCategories);
      }
    };

    window.addEventListener('categories_updated', handleCatsUpdated);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('categories_updated', handleCatsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchMats]);

  const [form, setForm] = useState({
    name: '', unit: 'Pcs', minStockLevel: 10, pricePerUnit: 0, costPrice: 0, supplierId: '', categoryId: '', sku: '', barcode: '', hsnCode: '', gst: 5, showInWebsite: false, imageUrl: ''
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const selectedCat = categories.find(c => c.id === form.categoryId) || categories[0] || { id: 'cat-1', name: 'General' };
    const selectedSup = suppliers.find(s => s.id === form.supplierId);

    const parsedPrice = parseFloat(String(form.pricePerUnit)) || 0;
    const parsedCost = parseFloat(String(form.costPrice)) || 0;
    const parsedGst = (form.gst !== undefined && form.gst !== null && !isNaN(Number(form.gst))) ? Number(form.gst) : 5;
    const parsedMinStock = parseFloat(String(form.minStockLevel)) || 10;

    const payload = {
      name: form.name.trim(),
      categoryId: selectedCat.id,
      supplierId: form.supplierId || '',
      supplierName: selectedSup?.name || '',
      price: parsedPrice,
      pricePerUnit: parsedPrice,
      costPrice: parsedCost,
      unit: form.unit.trim() || 'Pcs',
      currentStock: parsedMinStock * 2 || 50,
      minStock: parsedMinStock,
      minStockLevel: parsedMinStock,
      sku: form.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: form.barcode.trim(),
      hsnCode: form.hsnCode.trim(),
      gst: isNaN(parsedGst) ? 5 : parsedGst,
      isAvailable: true,
      showInWebsite: form.showInWebsite === true,
      imageUrl: form.imageUrl || '',
    };

    try {
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setMaterials(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      }
    } catch (err) {
      console.error('Failed to create product in DB:', err);
    }

    fetchMats();
    setForm({ name: '', unit: 'Pcs', minStockLevel: 10, pricePerUnit: 0, costPrice: 0, supplierId: '', categoryId: '', sku: '', barcode: '', hsnCode: '', gst: 5, showInWebsite: false, imageUrl: '' });
    setShowForm(false);
  };

  const handleAdjustStock = async (itemId: string, delta: number) => {
    const item = materials.find(m => m.id === itemId);
    if (!item) return;
    const newStock = Math.max(0, (item.currentStock ?? 50) + delta);
    try {
      await fetch(`/api/menu-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStock: newStock })
      });
    } catch { }
    fetchMats();
  };

  const handleSetStock = async (itemId: string, newStock: number) => {
    const targetStock = Math.max(0, newStock);
    try {
      await fetch(`/api/menu-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStock: targetStock })
      });
    } catch { }
    fetchMats();
  };

  const handleToggleAvailability = async (item: any) => {
    const target = !(item.isAvailable !== false);
    try {
      await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: target })
      });
    } catch { }
    fetchMats();
  };

  const handleToggleWebsiteVisibility = async (item: any) => {
    const target = !(item.showInWebsite === true);
    try {
      await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInWebsite: target })
      });
    } catch { }
    fetchMats();
  };

  const handleEditClick = (item: any) => {
    let matchedCat = categories.find(c => c.id === item.categoryId || c.name?.toLowerCase() === (item.categoryName || '').toLowerCase());
    if (!matchedCat && item.categoryName && item.categoryName !== 'General') {
      matchedCat = { id: item.categoryId || `cat-${Date.now()}`, name: item.categoryName };
      setCategories(prev => [...prev, matchedCat]);
    }

    setEditingItem(item);
    setEditForm({
      id: item.id,
      name: item.name,
      categoryId: matchedCat ? matchedCat.id : (item.categoryId || ''),
      categoryName: matchedCat ? matchedCat.name : (item.categoryName || ''),
      supplierId: item.supplierId || '',
      price: (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : (item.pricePerUnit || 0),
      costPrice: item.costPrice || 0,
      currentStock: item.currentStock ?? 50,
      minStock: item.minStockLevel || item.minStock || 10,
      unit: item.unit || 'Pcs',
      sku: item.sku || '',
      barcode: item.barcode || '',
      hsnCode: item.hsnCode || '',
      gst: (typeof item.gst === 'number' && !isNaN(item.gst)) ? item.gst : 5,
      isAvailable: item.isAvailable !== false,
      showInWebsite: item.showInWebsite === true,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id || !editForm.name.trim()) return;

    const selectedCat = categories.find(c => c.id === editForm.categoryId) || 
      categories.find(c => c.name?.toLowerCase() === (editForm.categoryName || '').toLowerCase()) || 
      categories[0] || { id: 'cat-general', name: 'General' };
    const selectedSup = suppliers.find(s => s.id === editForm.supplierId);

    const parsedPrice = parseFloat(String(editForm.price)) || 0;
    const parsedCost = parseFloat(String(editForm.costPrice)) || 0;
    const parsedGst = (editForm.gst !== undefined && editForm.gst !== null && !isNaN(Number(editForm.gst))) ? Number(editForm.gst) : 5;
    const parsedStock = parseFloat(String(editForm.currentStock)) || 0;
    const parsedMinStock = parseFloat(String(editForm.minStock)) || 10;

    if (isNaN(parsedGst) || parsedGst < 0) {
      alert('Please enter a valid non-negative GST percentage');
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      supplierId: editForm.supplierId || '',
      supplierName: selectedSup?.name || '',
      price: parsedPrice,
      pricePerUnit: parsedPrice,
      costPrice: parsedCost,
      currentStock: parsedStock,
      minStock: parsedMinStock,
      minStockLevel: parsedMinStock,
      unit: editForm.unit.trim() || 'Pcs',
      sku: editForm.sku.trim(),
      barcode: editForm.barcode.trim(),
      hsnCode: editForm.hsnCode.trim(),
      gst: parsedGst,
      isAvailable: editForm.isAvailable,
      showInWebsite: editForm.showInWebsite === true,
      description: editForm.description.trim(),
      imageUrl: editForm.imageUrl || '',
    };

    try {
      const res = await fetch(`/api/menu-items/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        const fullItem = {
          ...updated,
          categoryId: selectedCat.id,
          categoryName: selectedCat.name,
          category: { id: selectedCat.id, name: selectedCat.name }
        };

        setMaterials(prev => prev.map(m => (m.id === editForm.id ? { ...m, ...fullItem } : m)));
        setEditingItem(null);

        // Update universal_items in localStorage
        try {
          const saved = localStorage.getItem('universal_items');
          if (saved) {
            const list = JSON.parse(saved);
            const newList = list.map((m: any) => m.id === editForm.id ? { ...m, ...fullItem } : m);
            localStorage.setItem('universal_items', JSON.stringify(newList));
          }
        } catch {}

        window.dispatchEvent(new CustomEvent('inventory_updated', { detail: fullItem }));
        window.dispatchEvent(new Event('storage'));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update product in database');
      }
    } catch (err: any) {
      alert('Network error while updating product');
    }

    fetchMats();
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setMaterials(prev => prev.filter(m => m.id !== itemId));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) { }

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
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 cursor-pointer",
              selectedCategory === 'ALL'
                ? "shadow-md border-transparent font-extrabold btn-theme-secondary"
                : "bg-white text-gray-900 border-gray-100 hover:bg-gray-50"
            )}
            style={selectedCategory === 'ALL' ? {
              backgroundColor: 'var(--theme-btn-secondary)',
              color: 'var(--theme-btn-text)'
            } : {}}
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
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 flex items-center gap-1.5 cursor-pointer",
                  isSelected
                    ? "shadow-md border-transparent font-extrabold btn-theme-secondary"
                    : "bg-white text-gray-900 border-gray-100 hover:bg-gray-50"
                )}
                style={isSelected ? {
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-btn-text)'
                } : {}}
              >
                <span>{cat.name}</span>
                <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-mono", isSelected ? "bg-black/20 text-current" : "bg-gray-50 text-gray-900")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto min-w-0">
          <div className="relative w-full sm:w-72 min-w-0">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              placeholder={`Search products by Name, Barcode, SKU, HSN...`}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="bg-white border border-gray-100 focus:border-gray-100 text-gray-900 text-xs pl-9 pr-3 py-2 rounded-xl outline-none w-full"
            />
          </div>

          {/* Stock Level Filter Dropdown */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-white border border-gray-100 text-gray-900 text-xs px-3 py-2 rounded-xl outline-none w-full sm:w-auto flex-shrink-0"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock Warning</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 font-bold text-xs rounded-xl shadow-md w-full sm:w-auto flex-shrink-0 cursor-pointer btn-theme-secondary"
          style={{
            backgroundColor: 'var(--theme-btn-secondary)',
            color: 'var(--theme-btn-text)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Add {stockNoun.split(' ')[0]}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 p-4 sm:p-5 rounded-2xl shadow-xl">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Product</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Product Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" placeholder="e.g. Garam Masala 100g" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Category</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1">
                <option value="">Default Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Selling Price (₹)</label>
              <input type="number" required value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value as any })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Cost Price (₹)</label>
              <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value as any })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">GST Tax (%)</label>
              <select value={String(form.gst)} onChange={e => setForm({ ...form, gst: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1 font-medium">
                <option value="0">0% (Exempt)</option>
                <option value="3">3% GST</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">HSN Code</label>
              <input value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" placeholder="e.g. 0910" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Unit</label>
              <select
                required
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1 font-medium"
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
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Min Stock Warning</label>
              <input type="number" required value={form.minStockLevel} onChange={e => setForm({ ...form, minStockLevel: e.target.value as any })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">SKU / Code</label>
              <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Barcode</label>
              <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Supplier</label>
              <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-gray-900 text-sm outline-none mt-1">
                <option value="">No Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Product Image Upload Dropzone / Field */}
            <div className="col-span-1 sm:col-span-2 md:col-span-4 p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase block">Product Image (Optional)</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                {form.imageUrl ? (
                  <div className="relative group w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs flex-shrink-0">
                    <img src={form.imageUrl} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold gap-0.5"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                    <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                    <span className="text-[8px] mt-0.5 font-semibold">No Image</span>
                  </div>
                )}

                <div className="flex-1 space-y-1.5 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2563EB] text-[#2563EB] text-xs font-bold shadow-xs hover:bg-blue-50 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{form.imageUrl ? 'Change Photo' : 'Upload Product Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const dataUrl = await compressImageFile(file);
                              setForm(prev => ({ ...prev, imageUrl: dataUrl }));
                            } catch (err: any) {
                              alert(err?.message || 'Failed to upload image');
                            }
                          }
                        }}
                      />
                    </label>

                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-all inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Upload PNG, JPG, or WEBP. Automatically optimized for fast loading across Billing & Website.
                  </p>
                </div>
              </div>
            </div>

            {/* Website Visibility Checkbox */}
            <div className="col-span-1 sm:col-span-2 md:col-span-4 p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Show on Website / Online Store</div>
                  <div className="text-[10px] text-gray-500">If checked, this product will be visible to customers on your public website catalog</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showInWebsite}
                  onChange={e => setForm({ ...form, showInWebsite: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="col-span-1 sm:col-span-2 md:col-span-4 flex flex-wrap gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 font-bold text-xs rounded-xl uppercase shadow-md cursor-pointer btn-theme-secondary"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-btn-text)',
                  boxShadow: 'var(--theme-glow)'
                }}
              >
                Save Item
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-50 text-gray-900 opacity-70 font-bold text-xs rounded-xl uppercase hover:opacity-100">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingItem && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingItem(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-2xl sm:rounded-3xl shadow-2xl my-auto flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    Edit Product: <span className="text-[#2563EB]">{editingItem.name}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 truncate">Update pricing, inventory levels, tax rate, and catalog details</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingItem(null)} 
                className="w-8 h-8 rounded-xl bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Product Name</label>
                    <input 
                      required 
                      value={editForm.name} 
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                      placeholder="e.g. Cheese Pizza Regular"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Category</label>
                    <select 
                      value={editForm.categoryId} 
                      onChange={e => {
                        const chosen = categories.find(c => c.id === e.target.value);
                        setEditForm({ 
                          ...editForm, 
                          categoryId: e.target.value,
                          categoryName: chosen ? chosen.name : ''
                        });
                      }} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Selling Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      value={editForm.price} 
                      onChange={e => setEditForm({ ...editForm, price: e.target.value as any })} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Cost Price (₹)</label>
                    <input 
                      type="number" 
                      value={editForm.costPrice} 
                      onChange={e => setEditForm({ ...editForm, costPrice: e.target.value as any })} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">GST Tax (%)</label>
                    <select
                      value={String(editForm.gst)}
                      onChange={e => setEditForm({ ...editForm, gst: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium"
                    >
                      <option value="0">0% (Exempt / Nil-Rated)</option>
                      <option value="3">3% GST</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST</option>
                      <option value="28">28% GST</option>
                      {![0, 3, 5, 12, 18, 28].includes(Number(editForm.gst)) && (
                        <option value={editForm.gst}>{editForm.gst}% (Custom)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">HSN Code</label>
                    <input 
                      value={editForm.hsnCode} 
                      onChange={e => setEditForm({ ...editForm, hsnCode: e.target.value })} 
                      placeholder="e.g. 2106"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Stock Level</label>
                    <input 
                      type="number" 
                      required 
                      value={editForm.currentStock} 
                      onChange={e => setEditForm({ ...editForm, currentStock: e.target.value as any })} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Min Stock Warning</label>
                    <input 
                      type="number" 
                      required 
                      value={editForm.minStock} 
                      onChange={e => setEditForm({ ...editForm, minStock: e.target.value as any })} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Unit</label>
                    <select
                      required
                      value={editForm.unit}
                      onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium"
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
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">SKU / Code</label>
                    <input 
                      value={editForm.sku} 
                      onChange={e => setEditForm({ ...editForm, sku: e.target.value })} 
                      placeholder="e.g. SKU-1001"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Barcode</label>
                    <input 
                      value={editForm.barcode} 
                      onChange={e => setEditForm({ ...editForm, barcode: e.target.value })} 
                      placeholder="e.g. 8901234567890"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium" 
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Supplier</label>
                    <select 
                      value={editForm.supplierId} 
                      onChange={e => setEditForm({ ...editForm, supplierId: e.target.value })} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-900 outline-none mt-1 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all font-medium"
                    >
                      <option value="">No Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* Edit Modal Image Upload Dropzone */}
                  <div className="col-span-1 sm:col-span-2 p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Product Image</label>
                    <div className="flex items-center gap-3.5">
                      {editForm.imageUrl ? (
                        <div className="relative group w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs flex-shrink-0">
                          <img src={editForm.imageUrl} alt="Product preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold gap-0.5 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                          <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                          <span className="text-[8px] mt-0.5 font-semibold">No Image</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2563EB] text-[#2563EB] text-xs font-bold shadow-xs hover:bg-blue-50 transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{editForm.imageUrl ? 'Change Photo' : 'Upload Product Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const dataUrl = await compressImageFile(file);
                                    setEditForm(prev => ({ ...prev, imageUrl: dataUrl }));
                                  } catch (err: any) {
                                    alert(err?.message || 'Failed to upload image');
                                  }
                                }
                              }}
                            />
                          </label>

                          {editForm.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Auto-compressed JPEG for fastest loading.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Modal Website Visibility Checkbox */}
                  <div className="col-span-1 sm:col-span-2 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Show on Website / Online Store</div>
                        <div className="text-[10px] text-gray-500">If checked, this product is visible on your public website</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.showInWebsite}
                        onChange={e => setEditForm({ ...editForm, showInWebsite: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100 bg-gray-50/90 backdrop-blur-sm flex items-center justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all hover:opacity-95 btn-theme-secondary"
                  style={{
                    backgroundColor: 'var(--theme-btn-secondary)',
                    color: 'var(--theme-btn-text)',
                    boxShadow: 'var(--theme-glow)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Card List View (<sm) */}
      <div className="block sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 p-6 rounded-2xl text-center text-xs text-gray-500">
            No products found matching your search or filters. Click "Add {stockNoun.split(' ')[0]}" above to create one.
          </div>
        ) : (
          filtered.map(m => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt={m.name} className="w-11 h-11 rounded-xl object-cover border border-gray-200 flex-shrink-0 bg-gray-50" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{m.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">{m.categoryName || 'General'}</span>
                      <button
                        onClick={() => handleToggleWebsiteVisibility(m)}
                        className={cn(
                          "px-1.5 py-0.2 rounded text-[9px] font-bold border inline-flex items-center gap-1",
                          m.showInWebsite === true
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                        )}
                      >
                        <Globe className="w-2.5 h-2.5" />
                        {m.showInWebsite === true ? 'Website: Yes' : 'Website: No'}
                      </button>
                    </div>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#2563EB] text-sm flex-shrink-0">
                  ₹{(m.pricePerUnit || m.price || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                  (m.currentStock ?? 0) <= (m.minStockLevel ?? 10)
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                )}>
                  {m.currentStock ?? 0} {m.unit || 'Pcs'} left
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 bg-gray-50 px-1 py-0.5 rounded-xl border border-gray-100">
                    <button
                      onClick={() => handleAdjustStock(m.id, -1)}
                      className="w-5 h-5 flex items-center justify-center font-extrabold text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Decrease Stock (-1)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={m.currentStock ?? 0}
                      onChange={(e) => handleSetStock(m.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-11 text-center font-mono font-bold text-xs bg-transparent border-0 outline-none text-gray-900 focus:ring-1 focus:ring-theme-accent rounded"
                    />
                    <button
                      onClick={() => handleAdjustStock(m.id, 1)}
                      className="w-5 h-5 flex items-center justify-center font-extrabold text-xs text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                      title="Increase Stock (+1)"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleEditClick(m)}
                    className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-lg"
                    title="Edit Product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(m.id, m.name)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comprehensive Products Table (>=sm) */}
      <div className="hidden sm:block bg-white border border-gray-100 rounded-2xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-sm text-gray-900 min-w-[1050px]">
          <thead className="bg-gray-50 text-gray-900 font-bold uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Product / Item</th>
              <th className="px-4 py-3 whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Selling Price</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Cost Price</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Tax / GST</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Stock Level</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Stock Adjust</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">POS Status</th>
              <th className="px-4 py-3 text-center whitespace-nowrap">Website</th>
              <th className="px-4 py-3 text-center whitespace-nowrap pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-5 py-8 text-center text-gray-500 text-xs">No products found matching your search or filters. Click "Add {stockNoun.split(' ')[0]}" above to create one.</td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-900">
                  <div className="flex items-center gap-3">
                    {m.imageUrl ? (
                      <img src={m.imageUrl} alt={m.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0 bg-gray-50" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-gray-900">{m.name}</div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                        {m.sku && <span>SKU: {m.sku}</span>}
                        {m.barcode && <span>• Barcode: {m.barcode}</span>}
                        {m.hsnCode && <span>• HSN: {m.hsnCode}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-900 opacity-80 text-xs">{m.categoryName || 'General'}</td>
                <td className="px-4 py-3 text-right text-[#2563EB] font-mono font-bold">₹{(m.pricePerUnit || m.price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900 opacity-70">{m.costPrice ? `₹${Number(m.costPrice).toFixed(2)}` : '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-100 font-mono text-[10px] font-bold">
                    {typeof m.gst === 'number' ? m.gst : 0}% GST
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 border",
                    (m.currentStock ?? 0) <= (m.minStockLevel ?? 10)
                      ? 'bg-red-500/15 text-red-500 border-red-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                  )}>
                    {m.currentStock ?? 0} {m.unit || 'Pcs'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-xl border border-gray-200">
                    <button
                      onClick={() => handleAdjustStock(m.id, -1)}
                      className="w-5 h-5 flex items-center justify-center font-extrabold text-xs text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Decrease Stock (-1)"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={m.currentStock ?? 0}
                      onChange={(e) => handleSetStock(m.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-12 text-center font-mono font-bold text-xs bg-transparent border-0 outline-none text-gray-900 focus:ring-1 focus:ring-blue-500 rounded"
                    />
                    <button
                      onClick={() => handleAdjustStock(m.id, 1)}
                      className="w-5 h-5 flex items-center justify-center font-extrabold text-xs text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      title="Increase Stock (+1)"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleAvailability(m)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer",
                      m.isAvailable !== false
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-gray-500/15 text-gray-500 border-gray-500/30 hover:bg-gray-500/25"
                    )}
                  >
                    {m.isAvailable !== false ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleWebsiteVisibility(m)}
                    title={m.showInWebsite ? "Visible on Website - Click to Hide" : "Hidden from Website - Click to Show"}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border inline-flex items-center gap-1 cursor-pointer",
                      m.showInWebsite === true
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-gray-500/15 text-gray-500 border-gray-500/30 hover:bg-gray-500/25"
                    )}
                  >
                    <Globe className="w-3 h-3" />
                    <span>{m.showInWebsite === true ? 'Visible' : 'Hidden'}</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-center pr-6">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                      title="Edit Product Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(m.id, m.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
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

  const loadCatData = useCallback(() => {
    fetchUnifiedCategories().then(cats => {
      setCategories(cats);
    });
    try {
      const savedItems = localStorage.getItem('universal_items');
      if (savedItems) setItems(JSON.parse(savedItems));
    } catch { }
  }, []);

  useEffect(() => {
    loadCatData();
    const handleCatsUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        loadCatData();
      }
    };
    window.addEventListener('categories_updated', handleCatsUpdated);
    window.addEventListener('storage', loadCatData);
    return () => {
      window.removeEventListener('categories_updated', handleCatsUpdated);
      window.removeEventListener('storage', loadCatData);
    };
  }, [loadCatData]);

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = catName.trim();
    if (!trimmed) return;

    let createdCat: any = { id: `cat-${Date.now()}`, name: trimmed, description: catDesc.trim() };
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, description: catDesc.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          createdCat = { ...createdCat, id: data.id, name: data.name || createdCat.name };
        }
      }
    } catch {}

    const updated = [...categories.filter(c => c.name?.toLowerCase() !== trimmed.toLowerCase()), createdCat];
    setCategories(updated);
    try {
      localStorage.setItem('universal_categories', JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new CustomEvent('categories_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
    setCatName('');
    setCatDesc('');
    setShowCatModal(false);
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    } catch {}

    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    try {
      localStorage.setItem('universal_categories', JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new CustomEvent('categories_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Product Categories ({categories.length})</h3>
        <button
          onClick={() => setShowCatModal(true)}
          className="flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl shadow-sm cursor-pointer btn-theme-secondary"
          style={{
            backgroundColor: 'var(--theme-btn-secondary)',
            color: 'var(--theme-btn-text)'
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      {showCatModal && (
        <div className="bg-white border border-gray-100 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Add Category</h4>
          <form onSubmit={handleSaveCat} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Category Name</label>
              <input
                required
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="e.g. Groceries, Spices, Beverages"
                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs text-gray-900 outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-70 uppercase">Description</label>
              <input
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
                placeholder="Short description"
                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs text-gray-900 outline-none mt-1"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl shadow-sm cursor-pointer btn-theme-secondary"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-btn-text)'
                }}
              >
                Save
              </button>
              <button type="button" onClick={() => setShowCatModal(false)} className="px-5 py-2 bg-gray-50 text-gray-900 opacity-70 text-xs font-bold rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const count = items.filter(i => i.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{cat.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{cat.description || 'General category'}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-gray-50 text-[#2563EB] border border-gray-100 rounded text-[10px] font-mono font-bold">
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
  const [suppliers, setSuppliers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('universal_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { }
    return [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({ name: '', contact: '', email: '' });

  const fetchSups = () => {
    fetch('/api/inventory/suppliers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSuppliers(data);
          localStorage.setItem('universal_suppliers', JSON.stringify(data));
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    fetchSups();
  }, []);

  const validatePhone = (val: string): string => {
    if (!val.trim()) return '';
    if (/[^\d]/.test(val)) {
      return 'Phone number must contain only numeric digits (no alphabets or symbols)';
    }
    if (val.length > 10) {
      return 'Phone number cannot exceed 10 digits';
    }
    if (val.length < 10) {
      return 'Phone number must be exactly 10 numeric digits';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setErrorMessage('Supplier name is required');
      return;
    }

    const trimmedContact = form.contact.trim();
    if (trimmedContact) {
      const phoneValidationMsg = validatePhone(trimmedContact);
      if (phoneValidationMsg) {
        setPhoneError(phoneValidationMsg);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setPhoneError('');

    try {
      const payload = {
        name: trimmedName,
        contact: trimmedContact,
        phone: trimmedContact,
        email: form.email.trim(),
      };

      const res = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setSuppliers(prev => {
          const filtered = prev.filter(s => s.id !== created.id);
          const updated = [created, ...filtered];
          localStorage.setItem('universal_suppliers', JSON.stringify(updated));
          return updated;
        });
        setForm({ name: '', contact: '', email: '' });
        setPhoneError('');
        setErrorMessage('');
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || 'Failed to create supplier';
        setErrorMessage(msg);
        if (msg.toLowerCase().includes('phone')) {
          setPhoneError(msg);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while adding supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const res = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuppliers(prev => {
          const updated = prev.filter(s => s.id !== id);
          localStorage.setItem('universal_suppliers', JSON.stringify(updated));
          return updated;
        });
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to delete supplier from database');
      }
    } catch (e) {
      alert('Network error while deleting supplier from database');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{s.name}</h3>
                </div>
                <button
                  onClick={() => handleDeleteSupplier(s.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-gray-600 font-mono">📞 {s.contact || s.phone || 'No phone'}</div>
                <div className="text-xs text-gray-600 font-mono">✉️ {s.email || 'No email'}</div>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span>Verified Vendor</span>
              <span className="text-[#2563EB] font-bold">Active</span>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-2 py-12 text-center text-gray-500 text-xs bg-white border border-gray-100 rounded-2xl">
            No suppliers added yet. Fill out the form to add your first supplier!
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-2xl h-fit shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#2563EB]" />
          <span>Add New Supplier</span>
        </h3>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700">Supplier Name *</label>
            <input
              required
              disabled={isSubmitting}
              value={form.name}
              onChange={e => {
                setForm({ ...form, name: e.target.value });
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-medium disabled:opacity-50"
              placeholder="e.g. Metro Traders"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Phone / Contact (10 digits max)</label>
            <input
              disabled={isSubmitting}
              value={form.contact}
              onChange={e => {
                const val = e.target.value;
                setForm({ ...form, contact: val });
                setPhoneError(validatePhone(val));
                if (errorMessage) setErrorMessage('');
              }}
              className={`w-full bg-gray-50 border ${phoneError ? 'border-red-400 bg-red-50/30' : 'border-gray-200'} rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-medium disabled:opacity-50`}
              placeholder="9876543210"
            />
            {phoneError && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{phoneError}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              disabled={isSubmitting}
              value={form.email}
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-medium disabled:opacity-50"
              placeholder="supplier@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting ? 'Saving Supplier...' : 'Add Supplier'}
          </button>
        </form>
      </div>
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('universal_stock_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [];
  });
  const [materials, setMaterials] = useState<any[]>([]);

  const fetchTxs = () => {
    fetch('/api/inventory/transactions')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTransactions(prev => {
            const ids = new Set(prev.map(p => p.id));
            const merged = [...prev];
            data.forEach((d: any) => { if (!ids.has(d.id)) merged.push(d); });
            localStorage.setItem('universal_stock_transactions', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => { });
  };

  const loadMaterials = () => {
    getCombinedMaterials().then(setMaterials);
  };

  useEffect(() => {
    fetchTxs();
    loadMaterials();
    window.addEventListener('storage', loadMaterials);
    return () => window.removeEventListener('storage', loadMaterials);
  }, []);

  const [form, setForm] = useState({
    rawMaterialId: '',
    type: 'STOCK_IN',
    quantity: '' as any,
    unitPrice: '' as any,
    notes: ''
  });

  const selectedProductInfo = useMemo(() => {
    return materials.find(m => m.id === form.rawMaterialId);
  }, [materials, form.rawMaterialId]);

  const parsedQty = parseFloat(form.quantity) || 0;
  const parsedPrice = parseFloat(form.unitPrice) || (selectedProductInfo?.costPrice || selectedProductInfo?.pricePerUnit || 0);

  const projectedStock = useMemo(() => {
    if (!selectedProductInfo) return null;
    const current = Number(selectedProductInfo.currentStock) || 0;
    if (form.type === 'STOCK_IN' || form.type === 'PURCHASE') {
      return current + parsedQty;
    } else if (form.type === 'STOCK_OUT' || form.type === 'WASTE') {
      return Math.max(0, current - parsedQty);
    } else if (form.type === 'ADJUSTMENT') {
      return parsedQty;
    }
    return current;
  }, [selectedProductInfo, form.type, parsedQty]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.rawMaterialId) {
      alert('Please select a product or material.');
      return;
    }

    if (parsedQty <= 0 && form.type !== 'ADJUSTMENT') {
      alert('Please enter a quantity greater than 0.');
      return;
    }

    const currentStock = Number(selectedProductInfo?.currentStock) || 0;
    let newStock = currentStock;
    if (form.type === 'STOCK_IN' || form.type === 'PURCHASE') {
      newStock = currentStock + parsedQty;
    } else if (form.type === 'STOCK_OUT' || form.type === 'WASTE') {
      newStock = Math.max(0, currentStock - parsedQty);
    } else if (form.type === 'ADJUSTMENT') {
      newStock = parsedQty;
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      rawMaterialId: form.rawMaterialId,
      rawMaterial: {
        id: selectedProductInfo?.id,
        name: selectedProductInfo?.name || 'Product Item',
        unit: selectedProductInfo?.unit || 'Pcs'
      },
      type: form.type,
      quantity: parsedQty,
      unitPrice: parsedPrice,
      totalValue: parsedQty * parsedPrice,
      prevStock: currentStock,
      newStock: newStock,
      notes: form.notes || '',
      createdAt: new Date().toISOString()
    };

    // Update local transactions list
    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    localStorage.setItem('universal_stock_transactions', JSON.stringify(updatedTxs));

    // Update Product Stock Count in universal_items
    try {
      const savedItems = localStorage.getItem('universal_items');
      let items: any[] = savedItems ? JSON.parse(savedItems) : [...materials];
      if (!Array.isArray(items) || items.length === 0) items = [...materials];

      const existingIdx = items.findIndex((it: any) => it.id === form.rawMaterialId || it.name.toLowerCase() === selectedProductInfo?.name?.toLowerCase());

      if (existingIdx >= 0) {
        items[existingIdx] = { ...items[existingIdx], currentStock: newStock };
      } else if (selectedProductInfo) {
        items.push({ ...selectedProductInfo, currentStock: newStock });
      }

      localStorage.setItem('universal_items', JSON.stringify(items));
      window.dispatchEvent(new Event('storage'));
      loadMaterials();

      // Trigger relevant operational notification
      if (form.type === 'STOCK_IN' || form.type === 'PURCHASE') {
        NotificationEngine.dispatch({
          event: 'PURCHASE_RECEIVED',
          recipient: { name: 'Store Manager' },
          data: {
            purchaseOrderNo: newTx.id.toUpperCase(),
            supplierName: form.notes || 'Inward Restock',
            itemCount: `${parsedQty} ${selectedProductInfo?.unit || 'Pcs'} of ${selectedProductInfo?.name}`,
            totalAmount: (parsedQty * parsedPrice).toFixed(2),
          }
        });
      }

      if (newStock <= (selectedProductInfo?.minStockLevel || 10)) {
        NotificationEngine.dispatch({
          event: 'LOW_STOCK',
          recipient: { name: 'Store Manager' },
          data: {
            itemName: selectedProductInfo?.name || 'Product',
            stockRemaining: newStock.toString(),
            unit: selectedProductInfo?.unit || 'Pcs',
            sku: selectedProductInfo?.sku || 'SKU-001',
          }
        });
      }
    } catch { }

    // Post to API asynchronously
    try {
      await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMaterialId: form.rawMaterialId,
          type: form.type,
          quantity: parsedQty,
          unitPrice: parsedPrice,
          notes: form.notes
        })
      });
    } catch { }

    setForm({ rawMaterialId: '', type: 'STOCK_IN', quantity: '', unitPrice: '', notes: '' });
  };

  const handleDeleteTx = (tx: any) => {
    if (confirm(`Delete this movement log entry and revert stock for "${tx.rawMaterial?.name || 'Item'}"?`)) {
      // Revert stock change
      try {
        const savedItems = localStorage.getItem('universal_items');
        if (savedItems) {
          const items = JSON.parse(savedItems);
          const q = Number(tx.quantity) || 0;
          const updatedItems = items.map((it: any) => {
            if (it.id === tx.rawMaterialId || it.name.toLowerCase() === tx.rawMaterial?.name?.toLowerCase()) {
              const cur = Number(it.currentStock) || 0;
              let reverted = cur;
              if (tx.type === 'STOCK_IN' || tx.type === 'PURCHASE') {
                reverted = Math.max(0, cur - q);
              } else if (tx.type === 'STOCK_OUT' || tx.type === 'WASTE') {
                reverted = cur + q;
              } else if (tx.type === 'ADJUSTMENT' && tx.prevStock !== undefined) {
                reverted = Number(tx.prevStock);
              }
              return { ...it, currentStock: reverted };
            }
            return it;
          });
          localStorage.setItem('universal_items', JSON.stringify(updatedItems));
          window.dispatchEvent(new Event('storage'));
          loadMaterials();
        }
      } catch { }

      const updated = transactions.filter(t => t.id !== tx.id);
      setTransactions(updated);
      localStorage.setItem('universal_stock_transactions', JSON.stringify(updated));
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left: Stock Movement Transactions Ledger */}
      <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#2563EB]" />
            <h3 className="font-bold text-gray-900 text-sm">Stock Movement Ledger</h3>
          </div>
          <span className="text-xs text-gray-500 font-mono font-bold">
            {transactions.length} Records
          </span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs sm:text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Product / Item</th>
                <th className="px-4 py-3 whitespace-nowrap">Type</th>
                <th className="px-4 py-3 whitespace-nowrap">Qty Change</th>
                <th className="px-4 py-3 whitespace-nowrap">Valuation</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => {
                const isPositive = tx.type === 'STOCK_IN' || tx.type === 'PURCHASE';
                const isNegative = tx.type === 'STOCK_OUT' || tx.type === 'WASTE';
                const isAdjust = tx.type === 'ADJUSTMENT';

                return (
                  <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      <div>{tx.rawMaterial?.name || 'Product Item'}</div>
                      {tx.notes && <div className="text-[10px] text-gray-400 font-normal truncate max-w-xs">{tx.notes}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border inline-flex items-center gap-1",
                        isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          tx.type === 'WASTE' ? 'bg-red-50 text-red-700 border-red-200' :
                            isAdjust ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                      )}>
                        {tx.type === 'STOCK_IN' ? 'Stock In (+)' :
                          tx.type === 'STOCK_OUT' ? 'Stock Out (-)' :
                            tx.type === 'WASTE' ? 'Waste / Spoil' :
                              tx.type === 'PURCHASE' ? 'Purchase (+)' :
                                'Adjustment'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-xs",
                        isPositive ? "bg-emerald-50 text-emerald-700 font-bold" :
                          isNegative ? "bg-rose-50 text-rose-700 font-bold" :
                            "bg-amber-50 text-amber-700 font-bold"
                      )}>
                        {isPositive ? `+${tx.quantity}` : isNegative ? `-${tx.quantity}` : `=${tx.quantity}`} {tx.rawMaterial?.unit || 'Pcs'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold">
                      <span className={isPositive ? "text-emerald-700 font-bold" : isNegative ? "text-rose-700 font-bold" : "text-gray-900"}>
                        {isPositive ? '+₹' : isNegative ? '-₹' : '₹'}
                        {(Number(tx.totalValue) || (Number(tx.quantity) * Number(tx.unitPrice)) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteTx(tx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete log & revert stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-xs">
                    No stock movement transactions recorded yet. Use the form to record stock in/out!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Record Stock Movement Form */}
      <div className="bg-white border border-gray-100 p-5 sm:p-6 rounded-2xl h-fit shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#2563EB]" />
          <span>Record Stock Transaction</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-gray-700">Select Product / Item *</label>
            <select
              required
              value={form.rawMaterialId}
              onChange={e => {
                const mat = materials.find(m => m.id === e.target.value);
                setForm({
                  ...form,
                  rawMaterialId: e.target.value,
                  unitPrice: mat ? (mat.costPrice || mat.pricePerUnit || mat.price || '') : ''
                });
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-medium"
            >
              <option value="">Choose item...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Stock: {m.currentStock ?? 0} {m.unit || 'Pcs'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">Movement Type *</label>
            <select
              required
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-medium"
            >
              <option value="STOCK_IN">Stock In (Restock / Inward +)</option>
              <option value="STOCK_OUT">Stock Out (Transfer / Dispatch -)</option>
              <option value="WASTE">Waste / Spoilage (-)</option>
              <option value="ADJUSTMENT">Stock Audit / Count Adjustment (=)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Quantity *</label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                placeholder="e.g. 10"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-mono font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Unit Price (₹)</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 50"
                value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-mono font-medium"
              />
            </div>
          </div>

          {/* Live Dynamic Stock & Valuation Preview Box */}
          {selectedProductInfo && (
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-medium">Current Stock:</span>
                <span className="font-mono font-bold text-gray-900">
                  {selectedProductInfo.currentStock ?? 0} {selectedProductInfo.unit || 'Pcs'}
                </span>
              </div>
              {parsedQty > 0 && (
                <>
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="font-medium">Projected New Stock:</span>
                    <span className={cn(
                      "font-mono font-bold px-1.5 py-0.5 rounded text-[11px]",
                      (form.type === 'STOCK_IN' || form.type === 'PURCHASE') ? "bg-emerald-100 text-emerald-800" :
                        (form.type === 'STOCK_OUT' || form.type === 'WASTE') ? "bg-rose-100 text-rose-800" :
                          "bg-amber-100 text-amber-800"
                    )}>
                      {projectedStock} {selectedProductInfo.unit || 'Pcs'}
                      {' '}
                      ({(form.type === 'STOCK_IN' || form.type === 'PURCHASE') ? `+${parsedQty}` :
                        (form.type === 'STOCK_OUT' || form.type === 'WASTE') ? `-${parsedQty}` :
                          `=${parsedQty}`})
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                    <span className="font-medium text-gray-700">Movement Value:</span>
                    <span className="font-mono font-bold text-[#2563EB]">
                      {(form.type === 'STOCK_IN' || form.type === 'PURCHASE') ? '+₹' :
                        (form.type === 'STOCK_OUT' || form.type === 'WASTE') ? '-₹' : '₹'}
                      {(parsedQty * parsedPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700">Notes / Remarks</label>
            <input
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none mt-1 font-medium"
              placeholder="e.g. Received from supplier Metro Traders"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            Record Movement
          </button>
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
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => { });
    getCombinedMaterials().then(setMaterials);
  }, []);

  const fetchRecipes = (menuItemId: string) => {
    fetch(`/api/inventory/recipes/${menuItemId}`).then(r => r.json()).then(setRecipes).catch(() => { });
  };

  const [form, setForm] = useState({ rawMaterialId: '', quantityUsed: 0 });

  const handleAddRecipe = async (e: any) => {
    e.preventDefault();
    if (!selectedMenuItem) return;
    await fetch('/api/inventory/recipes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: selectedMenuItem.id, rawMaterialId: form.rawMaterialId, quantityUsed: Number(form.quantityUsed) })
    }).catch(() => { });
    fetchRecipes(selectedMenuItem.id);
    setForm({ rawMaterialId: '', quantityUsed: 0 });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/inventory/recipes/${id}`, { method: 'DELETE' }).catch(() => { });
    fetchRecipes(selectedMenuItem.id);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[700px] shadow-xs">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Products / Menu Items</h3>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {categories.map(c => (
            <div key={c.id}>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{c.name}</div>
              <div className="space-y-2">
                {c.items?.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedMenuItem(item); fetchRecipes(item.id); }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border text-xs font-bold transition-all",
                      selectedMenuItem?.id === item.id ? "bg-blue-50 border-[#2563EB] text-[#2563EB]" : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50"
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
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Link className="w-5 h-5 text-[#2563EB]" /> {selectedMenuItem.name} Bill of Materials (BOM)
              </h3>
              <p className="text-xs text-gray-500 mt-1">These materials will be automatically deducted from stock when this item is billed.</p>

              <div className="mt-6 space-y-3">
                {recipes.length === 0 ? (
                  <div className="text-gray-400 text-xs py-4 text-center">No recipe defined yet.</div>
                ) : recipes.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{r.rawMaterial?.name}</div>
                      <div className="text-xs text-gray-500">Uses {r.quantityUsed} {r.rawMaterial?.unit}</div>
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Add Material to Recipe</h3>
              <form onSubmit={handleAddRecipe} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-700">Raw Material</label>
                  <select
                    required
                    value={form.rawMaterialId}
                    onChange={e => setForm({ ...form, rawMaterialId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] outline-none mt-1 font-medium"
                  >
                    <option value="">Select Material...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-xs font-bold text-gray-700">Qty Used</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.quantityUsed}
                    onChange={e => setForm({ ...form, quantityUsed: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#2563EB] outline-none mt-1 font-mono font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs shadow-xs">
            Select a product from the left to configure its recipe and BOM deduction rules.
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
    fetch('/api/inventory/batches').then(r => r.json()).then(setBatches).catch(() => { });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch('/api/inventory/batches', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quantity: Number(form.quantity), mrp: Number(form.mrp) })
    }).catch(() => { });
    setForm({ productName: '', batchNo: '', mfgDate: '', expiryDate: '', quantity: 0, mrp: 0 });
    setShowForm(false);
  };

  const today = new Date();
  const daysUntilExpiry = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Batch & Expiry Tracking</h3>
          <p className="text-xs text-gray-500">Track product batches, manufacturing & expiry dates</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Batch
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-md">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Add New Batch</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase">Product Name</label><input required value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Batch No.</label><input required value={form.batchNo} onChange={e => setForm({ ...form, batchNo: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Mfg. Date</label><input type="date" required value={form.mfgDate} onChange={e => setForm({ ...form, mfgDate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Expiry Date</label><input type="date" required value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" /></div>
            <div><label className="text-[10px] font-bold text-gray-500 uppercase">MRP (₹)</label><input type="number" required value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 focus:border-[#2563EB] rounded-lg p-2 text-gray-900 text-sm outline-none mt-1" /></div>
            <div className="col-span-3 flex gap-3 mt-2">
              <button type="submit" className="px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl uppercase shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">Save Batch</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl uppercase transition-all cursor-pointer shadow-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#F8FAFC] text-gray-400 font-bold uppercase text-[10px]">
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
                <tr key={b.id} className="hover:bg-blue-50/40 transition-colors">
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
