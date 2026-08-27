import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Minus, Trash2, X, IndianRupee, Printer, Save, Tag, 
  ShoppingCart, Check, User, QrCode, CreditCard, CheckCircle2, 
  RefreshCw, Barcode, ShieldAlert, Sparkles, Layers, UserPlus, 
  ArrowRight, Clock, Receipt, Banknote, PauseCircle, PlayCircle, PackagePlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import PrintInvoiceModal, { OrderPrintData } from '../components/PrintInvoiceModal';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  costPrice?: number;
  gst: number;
  hsnCode?: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  currentStock?: number;
  isAvailable: boolean;
}

interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  discount: number;
  notes: string;
}

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
}

interface HeldBill {
  id: string;
  billNumber: string;
  time: string;
  customer: Customer | null;
  cart: CartItem[];
  discount: number;
  total: number;
}

export default function BillingPOS() {
  const { businessProfile } = useAuth();
  const currency = businessProfile.currencySymbol || '₹';

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  // Quick Add Item Modal in POS
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCatId, setNewItemCatId] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>('');
  const [newItemGst, setNewItemGst] = useState<number>(businessProfile.defaultTaxRate || 5);
  const [newItemStock, setNewItemStock] = useState<number | ''>(50);
  const [newItemUnit, setNewItemUnit] = useState('Pcs');

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Billing discounts & payment
  const [billDiscountType, setBillDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [billDiscountValue, setBillDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Held Bills
  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    const saved = localStorage.getItem('universal_held_bills');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);

  // Modals
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiTxnRef, setUpiTxnRef] = useState('');

  // Invoice Print Modal State
  const [activePrintOrder, setActivePrintOrder] = useState<OrderPrintData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Always fetch real live data from Backend API (clearing any old stale dummy cache)
  const refreshData = () => {
    // Categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          localStorage.setItem('universal_categories', JSON.stringify(data));
        }
      })
      .catch(() => setCategories([]));

    // Items
    fetch('/api/menu-items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMenuItems(data);
          localStorage.setItem('universal_items', JSON.stringify(data));
        }
      })
      .catch(() => setMenuItems([]));

    // Customers
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        }
      })
      .catch(() => setCustomers([]));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, []);

  useEffect(() => {
    localStorage.setItem('universal_held_bills', JSON.stringify(heldBills));
  }, [heldBills]);

  // Filtered Catalog
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (item.isAvailable === false) return false;
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.barcode && item.barcode.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Barcode / Enter Submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = menuItems.find(
      it => it.barcode === searchQuery.trim() || it.sku === searchQuery.trim() || it.name.toLowerCase() === searchQuery.toLowerCase().trim()
    );
    if (matched) {
      addToCart(matched);
      setSearchQuery('');
    }
  };

  // Add Item to Cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(c => c.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${item.id}`,
            menuItem: item,
            quantity: 1,
            price: item.price,
            discount: 0,
            notes: '',
          },
        ];
      }
    });
  };

  // Update Cart Item Quantity
  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove Item from Cart
  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to clear the current cart?')) {
      setCart([]);
      setSelectedCustomer(null);
      setBillDiscountValue(0);
      setCashTendered('');
    }
  };

  // Hold / Park Bill
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const newHeld: HeldBill = {
      id: `held-${Date.now()}`,
      billNumber: `HOLD-${Math.floor(100 + Math.random() * 900)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: selectedCustomer,
      cart: [...cart],
      discount: billDiscountValue,
      total: grandTotal,
    };
    setHeldBills(prev => [newHeld, ...prev]);
    setCart([]);
    setSelectedCustomer(null);
    setBillDiscountValue(0);
    setCashTendered('');
  };

  const handleRecallHeldBill = (held: HeldBill) => {
    setCart(held.cart);
    setSelectedCustomer(held.customer);
    setBillDiscountValue(held.discount);
    setHeldBills(prev => prev.filter(h => h.id !== held.id));
    setIsHeldModalOpen(false);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (billDiscountType === 'PERCENT') {
      return (subtotal * (billDiscountValue || 0)) / 100;
    }
    return Math.min(billDiscountValue || 0, subtotal);
  }, [subtotal, billDiscountType, billDiscountValue]);

  const taxAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemNet = (item.price * item.quantity) - ((item.discount || 0) * item.quantity);
      const rate = item.menuItem.gst || businessProfile.defaultTaxRate || 5;
      return sum + (itemNet * rate) / 100;
    }, 0);
  }, [cart, businessProfile.defaultTaxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const changeDue = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0;
    return tendered > grandTotal ? tendered - grandTotal : 0;
  }, [cashTendered, grandTotal]);

  // Customer Filtering
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 5);
    const q = customerSearch.toLowerCase();
    return customers.filter(
      c => c.name.toLowerCase().includes(q) || c.mobile.includes(q)
    );
  }, [customers, customerSearch]);

  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustMobile.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      mobile: newCustMobile.trim(),
      email: newCustEmail.trim() || undefined,
      address: newCustAddress.trim() || undefined,
    };

    setCustomers(prev => [newCust, ...prev]);
    setSelectedCustomer(newCust);
    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustEmail('');
    setNewCustAddress('');

    try {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust),
      });
    } catch (e) {}
  };

  // Quick Add Item from POS
  const handleQuickAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPrice === '') return;

    let targetCatId = newItemCatId;
    if (!targetCatId && categories.length > 0) {
      targetCatId = categories[0].id;
    } else if (!targetCatId) {
      // Create a default category if none exists
      const catRes = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'General Products', description: 'Standard category' }),
      });
      const newCat = await catRes.json();
      targetCatId = newCat.id;
      setCategories(prev => [...prev, newCat]);
    }

    const itemData: MenuItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      categoryId: targetCatId,
      price: Number(newItemPrice),
      gst: Number(newItemGst),
      unit: newItemUnit || 'Pcs',
      currentStock: newItemStock !== '' ? Number(newItemStock) : 50,
      isAvailable: true,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setMenuItems(prev => [itemData, ...prev]);
    localStorage.setItem('universal_items', JSON.stringify([itemData, ...menuItems]));

    try {
      fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
    } catch (e) {}

    addToCart(itemData);
    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemStock(50);
  };

  // Complete Order and Trigger Invoice Print
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const invoiceNo = `${businessProfile.invoicePrefix || 'INV/2026/'}${Date.now().toString().slice(-4)}`;

    const orderPrintData: OrderPrintData = {
      orderNumber: invoiceNo,
      orderType: 'TAX_INVOICE',
      createdAt: new Date(),
      status: 'COMPLETED',
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: grandTotal,
      customer: selectedCustomer
        ? {
            name: selectedCustomer.name,
            mobile: selectedCustomer.mobile,
            address: selectedCustomer.address,
          }
        : null,
      items: cart.map(item => ({
        quantity: item.quantity,
        price: item.price,
        menuItem: {
          name: item.menuItem.name,
          gst: item.menuItem.gst,
          hsnCode: item.menuItem.hsnCode,
        },
      })),
    };

    // Deduct stock locally
    setMenuItems(prev => {
      const updated = prev.map(m => {
        const inCart = cart.find(c => c.menuItem.id === m.id);
        if (inCart && m.currentStock !== undefined) {
          return { ...m, currentStock: Math.max(0, m.currentStock - inCart.quantity) };
        }
        return m;
      });
      localStorage.setItem('universal_items', JSON.stringify(updated));
      return updated;
    });

    // Trigger Real Notification
    try {
      const { NotificationEngine } = require('../lib/notifications/notificationEngine');
      NotificationEngine.dispatch({
        event: 'INVOICE_CREATED',
        recipient: { name: selectedCustomer?.name || 'Customer' },
        data: {
          invoiceNumber: invoiceNo,
          amount: grandTotal.toFixed(2),
          customerName: selectedCustomer?.name || 'Walk-in Customer',
          businessName: businessProfile.businessName || 'My Business',
        },
      });
    } catch {}

    // Save Order to backend
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: invoiceNo,
          status: 'COMPLETED',
          orderType: 'COUNTER_SALE',
          customerId: selectedCustomer?.id,
          subtotal: subtotal,
          tax: taxAmount,
          discount: discountAmount,
          total: grandTotal,
          paymentMethod: paymentMethod,
          items: cart.map(c => ({
            menuItemId: c.menuItem.id,
            quantity: c.quantity,
            price: c.price,
            discount: c.discount,
          })),
        }),
      });
    } catch (e) {}

    // Open Print Modal
    setActivePrintOrder(orderPrintData);
    setIsPrintModalOpen(true);

    // Reset Cart
    setCart([]);
    setSelectedCustomer(null);
    setBillDiscountValue(0);
    setCashTendered('');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-3 overflow-hidden">
      {/* LEFT: Item Catalog & Search Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0F0F10] border border-[#1F1F21] rounded-2xl overflow-hidden p-3.5 space-y-3">
        {/* Search Input Bar + Add Product Button */}
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products by Name, Barcode, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#141416] border border-[#262629] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A059] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsAddItemModalOpen(true)}
            className="px-3.5 py-2.5 bg-[#1A1A1C] hover:bg-[#252528] text-[#C5A059] border border-[#262629] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </form>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-shrink-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0",
                selectedCategory === 'ALL'
                  ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                  : "bg-[#141416] text-gray-400 border-[#262629] hover:text-white"
              )}
            >
              All Products ({menuItems.length})
            </button>

            {categories.map(cat => {
              const count = menuItems.filter(m => m.categoryId === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-shrink-0 flex items-center gap-1.5",
                    isSelected
                      ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                      : "bg-[#141416] text-gray-400 border-[#262629] hover:text-white"
                  )}
                >
                  <span>{cat.name}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", isSelected ? "bg-[#0A0A0B]/20 text-[#0A0A0B]" : "bg-[#202024] text-gray-400")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.menuItem.id === item.id);
                const stock = item.currentStock ?? 0;
                const isOut = stock <= 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className={cn(
                      "relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer select-none group",
                      inCart
                        ? "bg-[#1C1A14] border-[#C5A059] shadow-md shadow-[#C5A059]/10"
                        : "bg-[#141416] border-[#222225] hover:border-[#C5A059]/50 hover:bg-[#18181B]"
                    )}
                  >
                    {/* Cart Count Badge */}
                    {inCart && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C5A059] text-[#0A0A0B] font-bold text-xs flex items-center justify-center shadow-lg animate-in zoom-in">
                        {inCart.quantity}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-[#C5A059] transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-1">
                        <span>{item.unit || 'Pcs'}</span>
                        {item.gst > 0 && <span>• {item.gst}% GST</span>}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#222225] flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-sm">
                        {currency}{item.price.toFixed(2)}
                      </span>
                      <span className={cn(
                        "text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded",
                        isOut ? "text-red-400 bg-red-500/10" : "text-gray-400 bg-[#1F1F22]"
                      )}>
                        {isOut ? 'Out' : `${stock} left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3">
              <ShoppingCart className="w-10 h-10 text-gray-700 opacity-60" />
              <p className="text-sm font-semibold text-gray-400">No Products in Catalog</p>
              <p className="text-xs text-gray-600 max-w-sm text-center">
                Your product catalog is empty. Click below to add your custom business products and start billing!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="px-4 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product Now</span>
                </button>
                <Link
                  to="/items"
                  className="px-4 py-2 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 hover:text-white border border-[#2D2D30] font-bold text-xs rounded-xl"
                >
                  Manage Categories & Catalog →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Billing Register & Cart Panel */}
      <div className="w-full lg:w-[420px] xl:w-[450px] flex flex-col bg-[#0F0F10] border border-[#1F1F21] rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
        {/* Cart Top Bar: Customer Selector & Held Bills */}
        <div className="p-3.5 border-b border-[#1F1F21] space-y-2.5 bg-[#131315]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Current Sale</span>
            </div>

            <div className="flex items-center gap-1.5">
              {heldBills.length > 0 && (
                <button
                  onClick={() => setIsHeldModalOpen(true)}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <PlayCircle className="w-3 h-3" />
                  <span>Recall ({heldBills.length})</span>
                </button>
              )}
              {cart.length > 0 && (
                <button
                  onClick={handleHoldBill}
                  className="p-1.5 hover:bg-[#1A1A1C] text-gray-400 hover:text-amber-400 rounded-lg transition-colors"
                  title="Hold / Park Bill"
                >
                  <PauseCircle className="w-4 h-4" />
                </button>
              )}
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Selection Row */}
          <div className="relative">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.mobile})` : "Walk-in Customer (or search/select)"}
                  value={customerSearch}
                  onFocus={() => setIsCustomerDropdownOpen(true)}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setIsCustomerDropdownOpen(true);
                  }}
                  className="w-full pl-8 pr-7 py-2 bg-[#1A1A1C] border border-[#2D2D30] rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C5A059]"
                />
                {selectedCustomer && (
                  <button
                    onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="p-2 bg-[#1A1A1C] hover:bg-[#252528] text-[#C5A059] border border-[#2D2D30] rounded-xl"
                title="Add New Customer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Dropdown Results */}
            {isCustomerDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#161618] border border-[#2D2D30] rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-[#222225]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    setIsCustomerDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#1F1F22] hover:text-[#C5A059] flex items-center justify-between"
                >
                  <span className="font-semibold">Walk-in Customer</span>
                  <span className="text-[10px] text-gray-500">Default</span>
                </button>
                {filteredCustomers.map(cust => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setCustomerSearch('');
                      setIsCustomerDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#1F1F22] hover:text-white flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">{cust.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{cust.mobile}</div>
                    </div>
                    <Check className={cn("w-3.5 h-3.5 text-[#C5A059]", selectedCustomer?.id === cust.id ? "opacity-100" : "opacity-0")} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {cart.map(item => {
            const lineTotal = item.price * item.quantity;
            return (
              <div
                key={item.id}
                className="bg-[#141416] border border-[#222225] p-2.5 rounded-xl flex items-center justify-between gap-2 group hover:border-[#2D2D30] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-white text-xs truncate">{item.menuItem.name}</h5>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {currency}{item.price.toFixed(2)} × {item.quantity} {item.menuItem.unit || ''}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quantity Adjustment */}
                  <div className="flex items-center bg-[#1A1A1C] border border-[#2D2D30] rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-[#252528] text-gray-400 hover:text-white rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-xs text-white px-2 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-[#252528] text-gray-400 hover:text-white rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="font-mono font-bold text-white text-xs min-w-[65px] text-right">
                    {currency}{lineTotal.toFixed(2)}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="h-44 flex flex-col items-center justify-center text-gray-500 space-y-2">
              <ShoppingCart className="w-8 h-8 text-gray-700" />
              <p className="text-xs font-semibold text-gray-400">Cart is empty</p>
              <p className="text-[10px] text-gray-600">Click products from catalog to start billing</p>
            </div>
          )}
        </div>

        {/* Cart Bottom: Calculations & Checkout */}
        <div className="p-3.5 border-t border-[#1F1F21] bg-[#131315] space-y-3">
          {/* Bill Summary Calculations */}
          <div className="space-y-1.5 text-xs text-gray-400 border-b border-[#1F1F21] pb-2.5">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono text-white">{currency}{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>Discount</span>
                <div className="inline-flex bg-[#1A1A1C] border border-[#2D2D30] rounded-md p-0.5 text-[9px] font-bold">
                  <button
                    onClick={() => setBillDiscountType('FIXED')}
                    className={cn("px-1 rounded", billDiscountType === 'FIXED' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400")}
                  >
                    {currency}
                  </button>
                  <button
                    onClick={() => setBillDiscountType('PERCENT')}
                    className={cn("px-1 rounded", billDiscountType === 'PERCENT' ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400")}
                  >
                    %
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={billDiscountValue || ''}
                  onChange={(e) => setBillDiscountValue(Math.max(0, Number(e.target.value)))}
                  className="w-16 bg-[#1A1A1C] border border-[#2D2D30] rounded px-1.5 py-0.5 text-right text-xs font-mono text-white outline-none focus:border-[#C5A059]"
                />
                <span className="font-mono text-amber-400 min-w-[50px] text-right">
                  -{currency}{discountAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span>Estimated Tax / GST</span>
              <span className="font-mono text-white">{currency}{taxAmount.toFixed(2)}</span>
            </div>

            {/* Grand Total Highlight */}
            <div className="flex justify-between items-baseline pt-1.5 border-t border-[#1F1F21] text-white">
              <span className="font-bold text-sm tracking-tight">Grand Total</span>
              <span className="font-mono font-extrabold text-xl text-[#C5A059]">
                {currency}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'CREDIT', label: 'Credit', icon: User },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                      if (m.id === 'UPI') setIsUpiModalOpen(true);
                    }}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-1",
                      isSelected
                        ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                        : "bg-[#1A1A1C] text-gray-400 border-[#262629] hover:text-white hover:border-[#333338]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash Tendered Calculator */}
            {paymentMethod === 'CASH' && grandTotal > 0 && (
              <div className="bg-[#1A1A1C] p-2 rounded-xl border border-[#2D2D30] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Cash Received:</span>
                  <input
                    type="number"
                    placeholder={grandTotal.toFixed(2)}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-24 bg-[#141416] border border-[#2D2D30] rounded px-2 py-1 text-white font-mono text-xs outline-none focus:border-[#C5A059]"
                  />
                </div>
                {changeDue > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400">Change: </span>
                    <span className="font-mono font-bold text-green-400 text-xs">
                      {currency}{changeDue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Complete & Print Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={cn(
              "w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all",
              cart.length > 0
                ? "bg-gradient-to-r from-[#C5A059] to-[#DFBA73] text-[#0A0A0B] hover:brightness-110 shadow-[#C5A059]/25 cursor-pointer"
                : "bg-[#1E1E22] text-gray-500 cursor-not-allowed border border-[#262629]"
            )}
          >
            <Printer className="w-4 h-4" />
            <span>Complete Sale & Print Bill ({currency}{grandTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Quick Add Product Modal in POS */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-base">Add New Product</h3>
              </div>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton Shirt, Notebook, Engine Oil"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                  <select
                    value={newItemCatId}
                    onChange={(e) => setNewItemCatId(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Price ({currency}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">GST / Tax Rate (%)</label>
                  <select
                    value={newItemGst}
                    onChange={(e) => setNewItemGst(Number(e.target.value))}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Unit">Unit</option>
                    <option value="Kg">Kg</option>
                    <option value="g">g</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#222225]">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 bg-[#1A1A1C] text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold rounded-xl text-xs hover:bg-[#b08d4a]"
                >
                  Save & Add to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Held Bills Recall Modal */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Parked / Held Bills ({heldBills.length})</h3>
              </div>
              <button onClick={() => setIsHeldModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-[#222225]">
              {heldBills.map(h => (
                <div key={h.id} className="pt-2 first:pt-0 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{h.billNumber} • {h.time}</div>
                    <div className="text-[11px] text-gray-400">
                      {h.customer ? h.customer.name : 'Walk-in'} • {h.cart.length} items
                    </div>
                    <div className="font-mono font-bold text-[#C5A059] text-xs mt-0.5">
                      {currency}{h.total.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRecallHeldBill(h)}
                    className="px-3 py-1.5 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-lg hover:bg-[#b08d4a]"
                  >
                    Resume Bill
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-sm">Quick Add Customer</h3>
              </div>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Billing Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-3.5 py-2 bg-[#1A1A1C] text-gray-400 hover:text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-[#0A0A0B] font-bold rounded-xl text-xs hover:bg-[#b08d4a]"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI / QR Code Payment Modal */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#141416] border border-[#2D2D30] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-[#222225] pb-3 text-left">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-sm">UPI Instant Payment</h3>
              </div>
              <button onClick={() => setIsUpiModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              {/* Dynamic QR SVG */}
              <div className="w-40 h-40 flex items-center justify-center border-4 border-black p-2">
                <div className="text-center">
                  <QrCode className="w-28 h-28 mx-auto text-black" />
                  <span className="text-[10px] font-bold font-mono text-black">SCAN & PAY {currency}{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-300">
              <div>Merchant: <span className="font-bold text-white">{businessProfile.businessName}</span></div>
              <div className="text-gray-400 text-[11px] mt-0.5">UPI ID: <span className="font-mono text-[#C5A059]">pay@{businessProfile.phone?.replace(/[^0-9]/g, '') || '9876543210'}</span></div>
            </div>

            <div>
              <input
                type="text"
                placeholder="UPI UTR / Txn ID (Optional)"
                value={upiTxnRef}
                onChange={(e) => setUpiTxnRef(e.target.value)}
                className="w-full bg-[#1A1A1C] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white text-center font-mono outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              onClick={() => setIsUpiModalOpen(false)}
              className="w-full py-2.5 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl hover:bg-[#b08d4a]"
            >
              Confirm UPI Received
            </button>
          </div>
        </div>
      )}

      {/* Universal Print Invoice Modal */}
      <PrintInvoiceModal
        order={activePrintOrder}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
