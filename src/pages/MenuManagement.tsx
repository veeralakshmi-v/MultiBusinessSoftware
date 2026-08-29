import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Plus, Search, Edit2, Trash2, Tag, Check, X, 
  AlertCircle, DollarSign, Layers, Filter, CheckCircle2, ShieldAlert, Sparkles,
  Boxes, Barcode, ArrowUpDown, ChevronRight, FolderPlus, HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  costPrice?: number;
  mrp?: number;
  gst: number;
  hsnCode?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  currentStock?: number;
  minStock?: number;
  description?: string;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt?: string;
}

export default function MenuManagement() {
  const { businessProfile } = useAuth();
  const currency = businessProfile.currencySymbol || '₹';

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields for Item
  const [itemName, setItemName] = useState('');
  const [itemCatId, setItemCatId] = useState('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [itemCostPrice, setItemCostPrice] = useState<number | ''>('');
  const [itemMrp, setItemMrp] = useState<number | ''>('');
  const [itemGst, setItemGst] = useState<number>(businessProfile.defaultTaxRate || 5);
  const [itemHsn, setItemHsn] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemBarcode, setItemBarcode] = useState('');
  const [itemUnit, setItemUnit] = useState('Pcs');
  const [itemStock, setItemStock] = useState<number | ''>(50);
  const [itemMinStock, setItemMinStock] = useState<number | ''>(10);
  const [itemDesc, setItemDesc] = useState('');
  const [itemAvailable, setItemAvailable] = useState<boolean>(true);

  // Refresh from server and sync
  const refreshCatalog = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          localStorage.setItem('universal_categories', JSON.stringify(data));
        }
      })
      .catch(() => {});

    fetch('/api/menu-items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          localStorage.setItem('universal_items', JSON.stringify(data));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshCatalog();
    window.addEventListener('storage', refreshCatalog);
    return () => window.removeEventListener('storage', refreshCatalog);
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('universal_categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('universal_items', JSON.stringify(items));
    }
  }, [items]);

  // Compute item count per category
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => {
      const count = items.filter(it => it.categoryId === cat.id).length;
      return { ...cat, itemCount: count };
    });
  }, [categories, items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const searchTerms = q ? q.split(/\s+/) : [];

    return items.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      if (!matchCat) return false;

      const stock = item.currentStock ?? 0;
      const min = item.minStock ?? 10;
      let matchStock = true;
      if (stockFilter === 'IN_STOCK') matchStock = stock > min;
      else if (stockFilter === 'LOW_STOCK') matchStock = stock > 0 && stock <= min;
      else if (stockFilter === 'OUT_OF_STOCK') matchStock = stock <= 0;

      if (!matchStock) return false;
      if (searchTerms.length === 0) return true;

      const searchableText = [
        item.name,
        item.categoryName,
        item.description,
        item.sku,
        item.barcode,
        item.hsnCode,
        item.unit
      ].filter(Boolean).join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [items, selectedCategory, searchQuery, stockFilter]);

  // Category Modal Handlers
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDesc('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    let updatedCats: Category[];
    if (editingCategory) {
      const updatedCat = { ...editingCategory, name: catName.trim(), description: catDesc.trim() };
      updatedCats = categories.map(c => c.id === editingCategory.id ? updatedCat : c);
      try {
        fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCat),
        });
      } catch (e) {}
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: catName.trim(),
        description: catDesc.trim(),
      };
      updatedCats = [...categories, newCat];
      try {
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCat),
        });
      } catch (e) {}
    }

    setCategories(updatedCats);
    localStorage.setItem('universal_categories', JSON.stringify(updatedCats));
    window.dispatchEvent(new Event('storage'));
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (catId: string) => {
    const hasItems = items.some(it => it.categoryId === catId);
    if (hasItems) {
      if (!confirm('This category contains products. Deleting it will reassign items to General. Continue?')) {
        return;
      }
      setItems(prev => prev.map(it => it.categoryId === catId ? { ...it, categoryId: categories[0]?.id || 'cat-1' } : it));
    } else {
      if (!confirm('Are you sure you want to delete this category?')) return;
    }

    const updatedCats = categories.filter(c => c.id !== catId);
    setCategories(updatedCats);
    localStorage.setItem('universal_categories', JSON.stringify(updatedCats));
    window.dispatchEvent(new Event('storage'));
    if (selectedCategory === catId) setSelectedCategory('ALL');

    try {
      fetch(`/api/categories/${catId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Item Modal Handlers
  const handleOpenItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCatId(item.categoryId || categories[0]?.id || 'cat-1');
      setItemPrice(item.price);
      setItemCostPrice(item.costPrice ?? '');
      setItemMrp(item.mrp ?? '');
      setItemGst(item.gst ?? businessProfile.defaultTaxRate);
      setItemHsn(item.hsnCode || '');
      setItemSku(item.sku || '');
      setItemBarcode(item.barcode || '');
      setItemUnit(item.unit || 'Pcs');
      setItemStock(item.currentStock ?? 50);
      setItemMinStock(item.minStock ?? 10);
      setItemDesc(item.description || '');
      setItemAvailable(item.isAvailable !== false);
    } else {
      setEditingItem(null);
      setItemName('');
      setItemCatId(selectedCategory !== 'ALL' ? selectedCategory : (categories[0]?.id || 'cat-1'));
      setItemPrice('');
      setItemCostPrice('');
      setItemMrp('');
      setItemGst(businessProfile.defaultTaxRate || 5);
      setItemHsn('');
      setItemSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setItemBarcode('');
      setItemUnit('Pcs');
      setItemStock(50);
      setItemMinStock(10);
      setItemDesc('');
      setItemAvailable(true);
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || itemPrice === '') return;

    const catObj = categories.find(c => c.id === itemCatId);

    const itemData: MenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: itemName.trim(),
      categoryId: itemCatId || categories[0]?.id || 'cat-1',
      categoryName: catObj?.name || 'General',
      price: Number(itemPrice),
      costPrice: itemCostPrice !== '' ? Number(itemCostPrice) : undefined,
      mrp: itemMrp !== '' ? Number(itemMrp) : undefined,
      gst: Number(itemGst),
      hsnCode: itemHsn.trim() || undefined,
      sku: itemSku.trim() || undefined,
      barcode: itemBarcode.trim() || undefined,
      unit: itemUnit.trim() || 'Pcs',
      currentStock: itemStock !== '' ? Number(itemStock) : 0,
      minStock: itemMinStock !== '' ? Number(itemMinStock) : 10,
      description: itemDesc.trim() || undefined,
      isAvailable: itemAvailable,
    };

    let updatedItems: MenuItem[];
    if (editingItem) {
      updatedItems = items.map(i => i.id === editingItem.id ? itemData : i);
      try {
        fetch(`/api/menu-items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
      } catch (e) {}
    } else {
      updatedItems = [itemData, ...items];
      try {
        fetch('/api/menu-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
      } catch (e) {}
    }

    setItems(updatedItems);
    localStorage.setItem('universal_items', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('storage'));
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const updated = items.filter(i => i.id !== itemId);
    setItems(updated);
    localStorage.setItem('universal_items', JSON.stringify(updated));
    try {
      fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleToggleAvailability = (item: MenuItem) => {
    const updated = { ...item, isAvailable: !item.isAvailable };
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    try {
      fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {}
  };

  const totalLowStock = items.filter(it => (it.currentStock ?? 0) <= (it.minStock ?? 10)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131315] border border-[#1F1F21] p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#C5A059]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Categories & Product Catalog</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Create categories and add products, prices, tax rates, and inventory stock for your business.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCategoryModal()}
            className="px-3.5 py-2 bg-theme-surface text-theme-primary border border-theme-secondary/30 hover:bg-theme-secondary/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4 text-theme-accent" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => handleOpenItemModal()}
            className="px-4 py-2 btn-theme-secondary rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4 text-current" />
            <span>Add New Item</span>
          </button>
        </div>

      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131315] border border-[#1F1F21] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Categories</div>
            <div className="text-base font-bold text-white">{categories.length}</div>
          </div>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Total Items</div>
            <div className="text-base font-bold text-white">{items.length}</div>
          </div>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Active for Sale</div>
            <div className="text-base font-bold text-white">{items.filter(i => i.isAvailable).length}</div>
          </div>
        </div>

        <div className="bg-[#131315] border border-[#1F1F21] p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Low Stock Alerts</div>
            <div className="text-base font-bold text-amber-400">{totalLowStock} items</div>
          </div>
        </div>
      </div>

      {/* Category Selection Tabs / Chips */}
      <div className="bg-[#131315] border border-[#1F1F21] p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Category to View Items</span>
          <span className="text-[11px] text-theme-accent font-medium">{filteredItems.length} products listed</span>

        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 border",
              selectedCategory === 'ALL'
                ? "btn-theme-secondary shadow-md border-transparent"
                : "bg-theme-surface text-theme-primary border-theme-secondary/30 hover:bg-theme-secondary/20"
            )}
          >
            <span>All Items</span>
            <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-mono", selectedCategory === 'ALL' ? "bg-black/20 text-current" : "bg-white/10 text-theme-primary")}>
              {items.length}
            </span>
          </button>

          {categoriesWithCounts.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="relative group flex-shrink-0">
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border pr-8",
                    isSelected
                      ? "btn-theme-secondary shadow-md border-transparent"
                      : "bg-theme-surface text-theme-primary border-theme-secondary/30 hover:bg-theme-secondary/20"
                  )}
                >
                  <span>{cat.name}</span>
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-mono", isSelected ? "bg-black/20 text-current" : "bg-white/10 text-theme-primary")}>
                    {cat.itemCount}
                  </span>
                </button>

                {/* Quick Edit/Delete buttons on hover */}
                <div className="absolute right-1 top-1 hidden group-hover:flex items-center gap-1 bg-[#141416] p-0.5 rounded-md border border-[#2D2D30] shadow-lg z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }}
                    className="p-1 hover:text-[#C5A059] text-gray-400"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                    className="p-1 hover:text-red-400 text-gray-400"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items Filtering & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by Name, Barcode, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#131315] border border-[#1F1F21] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-[#131315] border border-[#1F1F21] text-gray-300 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-[#C5A059]"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock (≤ threshold)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Items Catalog Table / Grid */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161618] text-gray-400 font-bold uppercase text-[10px] border-b border-[#1F1F21] tracking-wider">
              <tr>
                <th className="p-3.5">Product / Item</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-right">Cost Price</th>
                <th className="p-3.5 text-center">Tax / GST</th>
                <th className="p-3.5 text-center">Unit</th>
                <th className="p-3.5 text-center">Stock Level</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {filteredItems.map(item => {
                const catObj = categories.find(c => c.id === item.categoryId);
                const stock = item.currentStock ?? 0;
                const min = item.minStock ?? 10;
                const isLow = stock <= min && stock > 0;
                const isOut = stock <= 0;

                return (
                  <tr key={item.id} className="hover:bg-[#18181A] transition-colors group">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        {item.barcode && <span>• Barcode: {item.barcode}</span>}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1A1A1C] border border-[#2D2D30] text-gray-300 text-[11px] font-medium">
                        {catObj?.name || 'General'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                      {currency}{item.price.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-right font-mono text-gray-400">
                      {item.costPrice !== undefined ? `${currency}${item.costPrice.toFixed(2)}` : '—'}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 font-mono text-[10px] font-bold">
                        {item.gst}% GST
                      </span>
                    </td>

                    <td className="p-3.5 text-center text-gray-400 font-medium">
                      {item.unit || 'Pcs'}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1",
                        isOut ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                        isLow ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        "bg-green-500/10 text-green-400 border border-green-500/30"
                      )}>
                        {stock} {item.unit || 'Pcs'}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                          item.isAvailable
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/30 hover:bg-gray-500/20"
                        )}
                      >
                        {item.isAvailable ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenItemModal(item)}
                          className="p-1.5 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 hover:text-[#C5A059] border border-[#2D2D30] rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 bg-[#1A1A1C] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-[#2D2D30] rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <Package className="w-10 h-10 mx-auto text-gray-600 opacity-60" />
              <p className="text-sm font-semibold text-gray-400">No items match your criteria</p>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Click "Add New Item" to create your first product under this category.
              </p>
              <button
                onClick={() => handleOpenItemModal()}
                className="px-4 py-2 btn-theme-secondary font-bold text-xs rounded-xl shadow-md"
              >
                + Add Item Now
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-base">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beverages, Groceries, Apparel, Electronics"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief description for category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl p-3 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222225]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1A1C] text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold rounded-xl text-xs hover:bg-[#b08d4a]"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Add/Edit Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-base">
                  {editingItem ? 'Edit Product Item' : 'Add Item under Category'}
                </h3>
              </div>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Product / Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Masala Chai, USB Cable, Paracetamol 500mg, Cotton T-Shirt"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category *</label>
                  <select
                    value={itemCatId}
                    onChange={(e) => setItemCatId(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Unit of Measurement</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Unit">Unit</option>
                    <option value="Kg">Kg (Kilograms)</option>
                    <option value="g">g (Grams)</option>
                    <option value="Ltr">Ltr (Liters)</option>
                    <option value="ml">ml (Milliliters)</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                    <option value="Plate">Plate / Portion</option>
                    <option value="Cup">Cup</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Strip">Strip</option>
                    <option value="Service">Service</option>
                    <option value="Hour">Hour</option>
                  </select>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Selling Price ({currency}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Cost / Purchase Price ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={itemCostPrice}
                    onChange={(e) => setItemCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Tax / GST Rate */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">GST / Tax Rate (%)</label>
                  <select
                    value={itemGst}
                    onChange={(e) => setItemGst(Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value={0}>0% (Tax Exempt / Nil)</option>
                    <option value={5}>5% (Standard Essential)</option>
                    <option value={12}>12% (Standard FMCG/Pharma)</option>
                    <option value={18}>18% (Standard Services/Goods)</option>
                    <option value={28}>28% (Luxury / High Rate)</option>
                  </select>
                </div>

                {/* Opening Stock */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* SKU Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">SKU / Item Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-1001"
                    value={itemSku}
                    onChange={(e) => setItemSku(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Barcode / EAN (Optional)</label>
                  <input
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={itemBarcode}
                    onChange={(e) => setItemBarcode(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Notes / Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Additional item details or specifications"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  />
                </div>

                {/* Active Status Toggle */}
                <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemAvailable}
                      onChange={(e) => setItemAvailable(e.target.checked)}
                      className="rounded border-[#2D2D30] text-[#C5A059] focus:ring-0 bg-[#1A1A1C] w-4 h-4"
                    />
                    <span className="text-xs text-gray-200 font-semibold">Available for active billing in POS</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#222225]">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1A1C] text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C5A059] text-[#0A0A0B] font-bold rounded-xl text-xs hover:bg-[#b08d4a] shadow-lg shadow-[#C5A059]/20"
                >
                  {editingItem ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
