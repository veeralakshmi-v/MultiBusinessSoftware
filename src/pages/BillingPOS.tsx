import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Minus, Trash2, X, IndianRupee, Printer, Save, Tag, 
  ShoppingCart, Check, User, QrCode, CreditCard, CheckCircle2, 
  RefreshCw, Barcode, ShieldAlert, Sparkles, Layers, UserPlus, 
  ArrowRight, ArrowRightLeft, Clock, Receipt, Banknote, PauseCircle, PlayCircle, PackagePlus,
  Image as ImageIcon, Upload
} from 'lucide-react';
import { cn, compressImageFile } from '../lib/utils';
import PrintInvoiceModal, { OrderPrintData } from '../components/PrintInvoiceModal';
import { COMMON_UNITS } from './Inventory';
import { NotificationEngine } from '../lib/notifications/notificationEngine';
import { TenantEngine } from '../lib/tenant/tenantEngine';

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
  description?: string;
  isAvailable: boolean;
  showInWebsite?: boolean;
  imageUrl?: string;
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
  pendingBalance?: number;
}

interface HeldBill {
  id: string;
  billNumber?: string;
  heldAt?: string;
  time?: string;
  customer: Customer | null;
  cart: CartItem[];
  discount?: number;
  total?: number;
  billType?: 'GST' | 'NON_GST';
}

export function getUnitType(unitStr?: string): 'WEIGHT' | 'VOLUME' | 'LENGTH' | 'PIECE' {
  if (!unitStr) return 'PIECE';
  const u = unitStr.toLowerCase().trim();
  if (['kg', 'kilogram', 'kilograms', 'g', 'gram', 'grams', 'gm'].includes(u)) return 'WEIGHT';
  if (['l', 'liter', 'liters', 'litre', 'litres', 'ml', 'milliliter', 'milliliters'].includes(u)) return 'VOLUME';
  if (['m', 'meter', 'meters', 'cm', 'centimeter', 'centimeters'].includes(u)) return 'LENGTH';
  return 'PIECE';
}

export function formatQuantityWithSubunit(qty: number, unitStr?: string): string {
  if (!unitStr) return `${qty}`;
  const u = unitStr.toLowerCase().trim();

  if (['kg', 'kilogram', 'kilograms'].includes(u)) {
    const grams = Math.round(qty * 1000);
    if (grams < 1000) {
      return `${grams} g (${qty} Kg)`;
    } else {
      return `${qty} Kg (${grams} g)`;
    }
  }

  if (['g', 'gram', 'grams', 'gm'].includes(u)) {
    return `${qty} g`;
  }

  if (['l', 'liter', 'liters', 'litre', 'litres'].includes(u)) {
    const ml = Math.round(qty * 1000);
    if (ml < 1000) {
      return `${ml} ml (${qty} L)`;
    } else {
      return `${qty} L (${ml} ml)`;
    }
  }

  if (['ml', 'milliliter', 'milliliters'].includes(u)) {
    return `${qty} ml`;
  }

  if (['m', 'meter', 'meters'].includes(u)) {
    const cm = Math.round(qty * 100);
    if (cm < 100) {
      return `${cm} cm (${qty} m)`;
    } else {
      return `${qty} m (${cm} cm)`;
    }
  }

  return `${qty} ${unitStr}`;
}

// Universal Unit conversion / label helper
function formatUnitQty(qty: number, unit?: string) {
  const unitStr = unit || 'Pcs';
  if (['Kg', 'Ltr', 'Meter'].includes(unitStr)) {
    if (qty >= 1) {
      return `${qty.toFixed(2)} ${unitStr}`;
    } else {
      const sub = unitStr === 'Kg' ? 'g' : (unitStr === 'Ltr' ? 'ml' : 'cm');
      return `${Math.round(qty * 1000)} ${sub}`;
    }
  }

  return `${qty} ${unitStr}`;
}

export default function BillingPOS() {
  const { businessProfile, activeTenant, user, businessId } = useAuth();
  const allTenants = TenantEngine.getTenants();
  const effectiveTenant = activeTenant || TenantEngine.getTenantById(user?.businessId || localStorage.getItem('businessId') || '') || (allTenants.length > 0 ? allTenants[0] : null);
  const currentBusinessId = effectiveTenant?.id || activeTenant?.id || businessId || user?.businessId || localStorage.getItem('businessId') || (allTenants.length > 0 ? allTenants[0].id : 'biz-default-business');
  const tenantPrefix = `tenant_${currentBusinessId}_`;
  const currency = effectiveTenant?.currencySymbol || businessProfile.currencySymbol || '₹';

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${tenantPrefix}universal_categories`) || localStorage.getItem('universal_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(`${tenantPrefix}universal_items`) || localStorage.getItem('universal_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${tenantPrefix}universal_customers`) || localStorage.getItem('universal_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { id: 'cust-1', name: 'Ramesh Kumar', mobile: '9876543210', email: 'ramesh@gmail.com', pendingBalance: 0 },
      { id: 'cust-2', name: 'Priya Sharma', mobile: '9123456789', email: 'priya@gmail.com', pendingBalance: 0 },
    ];
  });

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
  const [newItemImageUrl, setNewItemImageUrl] = useState('');

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Billing discounts, bill type & payment
  const [billType, setBillType] = useState<'GST' | 'NON_GST'>('GST');
  const [billDiscountType, setBillDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [billDiscountValue, setBillDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'SPLIT'>('CASH');
  const [splitPaidAmount, setSplitPaidAmount] = useState<string>('');
  const [splitPaidMethod, setSplitPaidMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
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
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load live data from LocalStorage & Backend API
  const refreshData = () => {
    // 1. Read from LocalStorage immediately
    try {
      const savedCats = localStorage.getItem(`${tenantPrefix}universal_categories`) || localStorage.getItem('universal_categories');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
      const savedItems = localStorage.getItem(`${tenantPrefix}universal_items`) || localStorage.getItem('universal_items');
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.length > 0) setMenuItems(parsed);
      }
      const savedCusts = localStorage.getItem(`${tenantPrefix}universal_customers`) || localStorage.getItem('universal_customers');
      if (savedCusts) {
        const parsed = JSON.parse(savedCusts);
        if (Array.isArray(parsed) && parsed.length > 0) setCustomers(parsed);
      }
    } catch {}

    // 2. Fetch from Backend API and sync state
    fetch(`/api/categories?businessId=${currentBusinessId}`, {
      headers: { 'x-business-id': currentBusinessId }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          localStorage.setItem(`${tenantPrefix}universal_categories`, JSON.stringify(data));
        }
      })
      .catch(() => {});

    fetch(`/api/menu-items?businessId=${currentBusinessId}`, {
      headers: { 'x-business-id': currentBusinessId }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          let existing: any[] = [];
          try {
            const saved = localStorage.getItem(`${tenantPrefix}universal_items`) || localStorage.getItem('universal_items');
            if (saved) existing = JSON.parse(saved);
          } catch {}

          const stockMap = new Map(existing.map((it: any) => [it.id, it.currentStock]));
          const nameStockMap = new Map(existing.map((it: any) => [it.name?.toLowerCase(), it.currentStock]));
          const availMap = new Map(existing.map((it: any) => [it.id, it.isAvailable]));
          const websiteMap = new Map(existing.map((it: any) => [it.id, it.showInWebsite]));
          const nameWebsiteMap = new Map(existing.map((it: any) => [it.name?.toLowerCase(), it.showInWebsite]));
          const imageMap = new Map(existing.map((it: any) => [it.id, it.imageUrl]));
          const nameImageMap = new Map(existing.map((it: any) => [it.name?.toLowerCase(), it.imageUrl]));

          const merged = data.map((d: any) => {
            const savedStock = stockMap.get(d.id) ?? nameStockMap.get(d.name?.toLowerCase());
            const savedAvail = availMap.get(d.id);
            const savedWeb = websiteMap.get(d.id) ?? nameWebsiteMap.get(d.name?.toLowerCase());
            const savedImg = imageMap.get(d.id) ?? nameImageMap.get(d.name?.toLowerCase());
            return {
              ...d,
              currentStock: (savedStock !== undefined && savedStock !== null) ? savedStock : (d.currentStock ?? 50),
              isAvailable: savedAvail !== undefined ? savedAvail : (d.isAvailable !== false),
              showInWebsite: savedWeb !== undefined ? savedWeb : (d.showInWebsite === true),
              imageUrl: d.imageUrl || savedImg || '',
            };
          });

          // Keep custom items from localStorage
          const apiIds = new Set(data.map((d: any) => d.id));
          existing.forEach((ex: any) => {
            if (!apiIds.has(ex.id)) merged.push(ex);
          });

          setMenuItems(merged);
          localStorage.setItem(`${tenantPrefix}universal_items`, JSON.stringify(merged));
        }
      })
      .catch(() => {});

    // Customers
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCustomers(data);
          localStorage.setItem('universal_customers', JSON.stringify(data));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, []);

  useEffect(() => {
    localStorage.setItem('universal_held_bills', JSON.stringify(heldBills));
  }, [heldBills]);

  // Comprehensive Filtered Catalog
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const searchTerms = q ? q.split(/\s+/).filter(Boolean) : [];

    return menuItems.filter(item => {
      // Show disabled items only if search explicitly typed, otherwise filter available items
      if (item.isAvailable === false && searchTerms.length === 0) return false;

      // 1. Category Matching:
      // Search query searches across ALL categories; otherwise filter by selectedCategory chip
      let matchCat = selectedCategory === 'ALL' || searchTerms.length > 0;
      if (!matchCat && selectedCategory) {
        const selectedCatObj = categories.find(c => c.id === selectedCategory);
        const selectedCatName = selectedCatObj ? selectedCatObj.name.toLowerCase() : selectedCategory.toLowerCase();

        matchCat =
          item.categoryId === selectedCategory ||
          (item.categoryName && item.categoryName.toLowerCase() === selectedCatName) ||
          (item.categoryName && item.categoryName.toLowerCase() === selectedCategory.toLowerCase());
      }

      if (!matchCat) return false;

      // 2. Search Query Matching
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
  }, [menuItems, categories, selectedCategory, searchQuery]);

  // Weight & Volume Custom Quantity Modal
  const [weightModalItem, setWeightModalItem] = useState<{ item: MenuItem; cartItemId?: string } | null>(null);
  const [subUnitVal, setSubUnitVal] = useState<string>('250');

  // Barcode / Enter Submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const exactMatched = menuItems.find(
      it => it.barcode === searchQuery.trim() || it.sku === searchQuery.trim() || it.name.toLowerCase() === searchQuery.toLowerCase().trim()
    );
    const targetItem = exactMatched || (filteredItems.length === 1 ? filteredItems[0] : null);

    if (targetItem) {
      const stock = (targetItem.currentStock !== undefined && targetItem.currentStock !== null) ? targetItem.currentStock : 50;
      if (targetItem.isAvailable === false || stock <= 0) {
        alert(`⚠️ "${targetItem.name}" is Out of Stock! Cannot add to bill.`);
        return;
      }
      handleProductCardClick(targetItem);
      setSearchQuery('');
    }
  };

  // Click Product Card from Catalog Grid
  const handleProductCardClick = (item: MenuItem) => {
    const stock = (item.currentStock !== undefined && item.currentStock !== null) ? item.currentStock : 50;
    if (item.isAvailable === false || stock <= 0) {
      alert(`⚠️ "${item.name}" is Out of Stock (0 remaining)! Cannot add to bill.`);
      return;
    }

    const unitType = getUnitType(item.unit);
    if (unitType !== 'PIECE') {
      const u = (item.unit || '').toLowerCase().trim();
      const isSub = u === 'g' || u === 'ml' || u === 'cm';
      const existingInCart = cart.find(c => c.menuItem.id === item.id);
      const curVal = existingInCart
        ? (isSub ? String(existingInCart.quantity) : String(Math.round(existingInCart.quantity * 1000)))
        : '250';

      setWeightModalItem({ item, cartItemId: existingInCart?.id });
      setSubUnitVal(curVal || '250');
      return;
    }

    addToCart(item, 1);
  };

  // Add Item to Cart
  const addToCart = (item: MenuItem, customQty?: number) => {
    const stock = item.currentStock ?? 0;
    const existingInCart = cart.find(c => c.menuItem.id === item.id);
    const currentQty = existingInCart ? existingInCart.quantity : 0;
    const qtyToAdd = customQty !== undefined ? customQty : 1;

    if (stock <= 0) {
      alert(`⚠️ "${item.name}" is Out of Stock (0 remaining)! Cannot add to bill.`);
      return;
    }

    if (currentQty + qtyToAdd > stock) {
      alert(`⚠️ Cannot add more of "${item.name}". Only ${stock} left in stock!`);
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(c => c.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = customQty !== undefined ? customQty : updated[existingIndex].quantity + 1;
        updated[existingIndex].quantity = Number(newQty.toFixed(3));
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${item.id}`,
            menuItem: item,
            quantity: Number(qtyToAdd.toFixed(3)),
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
    const targetItem = cart.find(item => item.id === cartItemId);
    if (!targetItem) return;

    const uType = getUnitType(targetItem.menuItem.unit);

    if (uType !== 'PIECE') {
      // Step delta by 0.25 (250g or 250ml) for weight/volume items
      const step = (targetItem.menuItem.unit?.toLowerCase().trim() === 'g' || targetItem.menuItem.unit?.toLowerCase().trim() === 'ml') ? 100 : 0.25;
      const stepDelta = delta > 0 ? step : -step;
      const stock = targetItem.menuItem.currentStock ?? 0;
      const newQty = Number((targetItem.quantity + stepDelta).toFixed(3));

      if (newQty > stock) {
        alert(`⚠️ Stock limit reached! Only ${stock} units available for "${targetItem.menuItem.name}".`);
        return;
      }

      if (newQty <= 0) {
        removeFromCart(cartItemId);
        return;
      }

      setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
      return;
    }

    // Standard piece quantity update (+1 / -1)
    const stock = targetItem.menuItem.currentStock ?? 0;
    if (delta > 0 && targetItem.quantity + delta > stock) {
      alert(`⚠️ Stock limit reached! Only ${stock} units available for "${targetItem.menuItem.name}".`);
      return;
    }

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

  // Delete Product from Catalog
  const handleDeleteProduct = (itemId: string, itemName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${itemName}" from your catalog?`)) {
      const updated = menuItems.filter(m => m.id !== itemId);
      setMenuItems(updated);
      localStorage.setItem('universal_items', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      setCart(prev => prev.filter(c => c.menuItem.id !== itemId));

      try {
        fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' });
      } catch {}
    }
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
    setHeldBills(prev => {
      const updated = [newHeld, ...prev];
      localStorage.setItem('universal_held_bills', JSON.stringify(updated));
      return updated;
    });
    setCart([]);
    setSelectedCustomer(null);
    setBillDiscountValue(0);
    setCashTendered('');
  };

  const handleRecallHeldBill = (held: HeldBill) => {
    setCart(held.cart);
    setSelectedCustomer(held.customer);
    setBillDiscountValue(held.discount);
    setHeldBills(prev => {
      const updated = prev.filter(h => h.id !== held.id);
      localStorage.setItem('universal_held_bills', JSON.stringify(updated));
      return updated;
    });
    setIsHeldModalOpen(false);
  };

  const handleDeleteHeldBill = (e: React.MouseEvent, heldId: string) => {
    e.stopPropagation();
    setHeldBills(prev => {
      const updated = prev.filter(h => h.id !== heldId);
      localStorage.setItem('universal_held_bills', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllHeldBills = () => {
    if (heldBills.length === 0) return;
    if (confirm('Are you sure you want to delete all parked / held bills?')) {
      setHeldBills([]);
      localStorage.setItem('universal_held_bills', JSON.stringify([]));
    }
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
    if (billType === 'NON_GST') return 0;
    return cart.reduce((sum, item) => {
      const itemNet = (item.price * item.quantity) - ((item.discount || 0) * item.quantity);
      const rate = item.menuItem.gst || businessProfile.defaultTaxRate || 5;
      return sum + (itemNet * rate) / 100;
    }, 0);
  }, [cart, billType, businessProfile.defaultTaxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const computedPaidAmount = useMemo(() => {
    if (paymentMethod === 'SPLIT') {
      const val = parseFloat(splitPaidAmount) || 0;
      return Math.min(val, grandTotal);
    }
    if (paymentMethod === 'CREDIT') return 0;
    return grandTotal;
  }, [paymentMethod, splitPaidAmount, grandTotal]);

  const computedBalanceDue = useMemo(() => {
    return Math.max(0, grandTotal - computedPaidAmount);
  }, [grandTotal, computedPaidAmount]);

  const changeDue = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0;
    return (paymentMethod === 'CASH' && tendered > grandTotal) ? tendered - grandTotal : 0;
  }, [paymentMethod, cashTendered, grandTotal]);

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
      pendingBalance: 0,
    };

    setCustomers(prev => {
      const updated = [newCust, ...prev.filter(c => c.id !== newCust.id && c.mobile !== newCust.mobile)];
      localStorage.setItem('universal_customers', JSON.stringify(updated));
      return updated;
    });

    fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCust),
    }).catch(err => console.error('Error saving quick customer to Supabase:', err));

    setSelectedCustomer(newCust);
    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustEmail('');
    setNewCustAddress('');
    window.dispatchEvent(new Event('storage'));

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
      imageUrl: newItemImageUrl || undefined,
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
    setNewItemImageUrl('');
  };

  // Complete Order and Trigger Invoice Print
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (computedBalanceDue > 0 && !selectedCustomer) {
      alert(`⚠️ Pending balance of ₹${computedBalanceDue.toFixed(2)} must be saved to a Customer's account. Please select or add a Customer above!`);
      return;
    }

    const prefix = billType === 'GST' 
      ? (businessProfile.invoicePrefix || 'INV/GST/2026/') 
      : 'BILL/NON-GST/';
    const invoiceNo = `${prefix}${Date.now().toString().slice(-4)}`;

    const orderPrintData: OrderPrintData = {
      orderNumber: invoiceNo,
      orderType: billType === 'GST' ? 'TAX_INVOICE' : 'NON_GST_BILL',
      createdAt: new Date(),
      status: 'COMPLETED',
      paymentMethod: paymentMethod === 'SPLIT' ? `SPLIT (${splitPaidMethod} + CREDIT)` : paymentMethod,
      subtotal: subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: grandTotal,
      paidAmount: computedPaidAmount,
      balanceAmount: computedBalanceDue,
      splitPaidMethod: paymentMethod === 'SPLIT' ? splitPaidMethod : undefined,
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
          unit: item.menuItem.unit,
          gst: billType === 'GST' ? item.menuItem.gst : 0,
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
      window.dispatchEvent(new Event('storage'));
      return updated;
    });

    const newOrderObj = {
      id: `ord-${Date.now()}`,
      orderNumber: invoiceNo,
      billType: billType, // 'GST' | 'NON_GST'
      isGst: billType === 'GST',
      status: 'COMPLETED',
      orderType: billType === 'GST' ? 'TAX_INVOICE' : 'NON_GST_BILL',
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      customerMobile: selectedCustomer?.mobile || '',
      subtotal: subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: grandTotal,
      paidAmount: computedPaidAmount,
      balanceAmount: computedBalanceDue,
      paymentMethod: paymentMethod === 'SPLIT' ? `SPLIT (${splitPaidMethod} + CREDIT)` : paymentMethod,
      splitPaidMethod: paymentMethod === 'SPLIT' ? splitPaidMethod : undefined,
      createdAt: new Date().toISOString(),
      items: cart.map(c => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        quantity: c.quantity,
        price: c.price,
        discount: c.discount,
        gst: billType === 'GST' ? (c.menuItem.gst || 5) : 0,
      })),
    };

    // Save separately to GST vs Non-GST localStorage columns & combined universal_orders
    try {
      if (billType === 'GST') {
        const gstBills = JSON.parse(localStorage.getItem('universal_gst_bills') || '[]');
        localStorage.setItem('universal_gst_bills', JSON.stringify([newOrderObj, ...gstBills]));
      } else {
        const nonGstBills = JSON.parse(localStorage.getItem('universal_nongst_bills') || '[]');
        localStorage.setItem('universal_nongst_bills', JSON.stringify([newOrderObj, ...nonGstBills]));
      }

      const allOrders = JSON.parse(localStorage.getItem('universal_orders') || '[]');
      localStorage.setItem('universal_orders', JSON.stringify([newOrderObj, ...allOrders]));

      // Sync Order to Supabase PostgreSQL database
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderObj),
      }).then(res => res.json())
        .then(data => console.log('✅ Order saved to Supabase:', data))
        .catch(err => console.error('Error saving order to Supabase:', err));
    } catch {}

    // Trigger Real Notification
    try {
      NotificationEngine.dispatch({
        event: 'INVOICE_CREATED',
        recipient: { name: selectedCustomer?.name || 'Walk-in Customer' },
        data: {
          invoiceNumber: invoiceNo,
          amount: grandTotal.toFixed(2),
          customerName: selectedCustomer?.name || 'Walk-in Customer',
          businessName: businessProfile.businessName || 'My Business',
        },
      });

      if (computedBalanceDue > 0 && selectedCustomer) {
        NotificationEngine.dispatch({
          event: 'PAYMENT_DUE',
          recipient: { name: selectedCustomer.name },
          data: {
            invoiceNumber: invoiceNo,
            amount: computedBalanceDue.toFixed(2),
            dueDate: 'Immediate / Credit',
            customerName: selectedCustomer.name,
            businessName: businessProfile.businessName || 'My Business',
          },
        });
      }
    } catch {}

    // Save Order to backend database API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderObj),
      });
    } catch (e) {
      console.error('Failed to post order to backend:', e);
    }

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
    <div className="h-full flex flex-col lg:flex-row gap-2.5 sm:gap-3.5 overflow-hidden min-h-0 w-full">

      {/* LEFT: Item Catalog & Search Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl sm:rounded-3xl overflow-hidden p-2.5 sm:p-3.5 shadow-lg shadow-gray-200/50 space-y-2.5 min-h-0">
        {/* Search Input Bar + Add Product Button */}
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#2563EB] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products by Name, Barcode, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl sm:rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Category Filter Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 px-0.5 no-scrollbar flex-shrink-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer shadow-xs",
                selectedCategory === 'ALL'
                  ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs",
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <span>{cat.name}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold", isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-0.5 sm:p-1 min-h-0">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-2.5">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.menuItem.id === item.id);
                const stock = (item.currentStock !== undefined && item.currentStock !== null) ? item.currentStock : 50;
                const isOut = item.isAvailable === false || stock <= 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleProductCardClick(item)}
                    className={cn(
                      "relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 select-none group shadow-xs hover:shadow-md min-h-[110px]",
                      isOut
                        ? "opacity-60 cursor-not-allowed bg-gray-50 border-red-200 text-gray-500"
                        : inCart
                          ? "bg-blue-50/90 border-[#2563EB] shadow-md shadow-blue-500/10 cursor-pointer ring-1 ring-[#2563EB]"
                          : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer"
                    )}
                  >
                    {/* Cart Count Badge inside card */}
                    {inCart && (
                      <div className="absolute top-2.5 right-2.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#2563EB] text-white font-bold text-[11px] flex items-center justify-center shadow-md ring-2 ring-white animate-in zoom-in z-10">
                        {inCart.quantity}
                      </div>
                    )}

                    <div className="flex items-start gap-2.5">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 flex-shrink-0 bg-gray-50 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className={cn(
                            "font-bold text-gray-900 text-xs leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors",
                            inCart && !item.imageUrl ? "pr-6" : ""
                          )}>
                            {item.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono mt-1">
                          <span>{item.unit || 'Pcs'}</span>
                          {item.gst > 0 && <span>• {item.gst}% GST</span>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        {currency}{item.price.toFixed(2)}
                      </span>
                      <span className={cn(
                        "text-[9px] font-mono font-semibold px-2 py-0.5 rounded-lg border",
                        isOut ? "text-red-600 bg-red-50 border-red-200" : "text-gray-600 bg-gray-50 border-gray-200"
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
              <ShoppingCart className="w-10 h-10 text-gray-300" />
              {menuItems.length === 0 ? (
                <>
                  <p className="text-sm font-semibold text-gray-800">No Products in Catalog</p>
                  <p className="text-xs text-gray-500 max-w-sm text-center">
                    Your product catalog is empty. Click below to add your custom business products and start billing!
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to="/dashboard/inventory"
                      className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Manage Categories & Catalog →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-800">No products match "{searchQuery}"</p>
                  <p className="text-xs text-gray-500 max-w-sm text-center">
                    Try checking for typos or clear the search to view all catalog products.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Clear Search
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Sticky Bottom Cart Action Bar for Mobile (<lg) */}
      {cart.length > 0 && !isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/90 border border-gray-200 p-3 rounded-2xl shadow-xl flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Total Bill</div>
              <div className="text-sm font-bold text-gray-900 font-mono">{currency}{grandTotal.toFixed(2)}</div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="px-4 py-2.5 bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Cart ({cart.length}) →</span>
          </button>
        </div>
      )}

      {/* Mobile Drawer Backdrop overlay */}
      {isMobileCartOpen && (
        <div 
          onClick={() => setIsMobileCartOpen(false)} 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-45 animate-in fade-in" 
        />
      )}

      {/* RIGHT: Billing Register & Cart Panel (Mobile Slide-up Drawer / Desktop Right Column) */}
      <div className={cn(
        "w-full lg:w-[350px] xl:w-[390px] 2xl:w-[430px] flex flex-col bg-white/80 backdrop-blur-md border border-white/60 overflow-hidden shadow-lg shadow-gray-200/50 flex-shrink-0 transition-all duration-300",
        "fixed inset-x-0 bottom-0 z-50 h-[90vh] rounded-t-3xl border-t border-gray-200 lg:static lg:h-full lg:rounded-2xl sm:lg:rounded-3xl lg:z-auto min-h-0",
        isMobileCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0 hidden lg:flex"
      )}>

        {/* Cart Top Bar: Customer Selector & Held Bills */}
        <div className="p-2.5 sm:p-3 border-b border-gray-200 space-y-2 bg-gray-50/80 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="lg:hidden p-1 rounded-lg text-gray-500 hover:text-gray-900 bg-gray-200 mr-1"
                title="Close Cart Drawer"
              >
                <X className="w-4 h-4" />
              </button>
              <Receipt className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Current Sale ({cart.length} items)</span>
            </div>

            <div className="flex items-center gap-1.5">
              {heldBills.length > 0 && (
                <button
                  onClick={() => setIsHeldModalOpen(true)}
                  className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <PlayCircle className="w-3 h-3" />
                  <span>Recall ({heldBills.length})</span>
                </button>
              )}
              {cart.length > 0 && (
                <button
                  onClick={handleHoldBill}
                  className="p-1 hover:bg-gray-200 text-gray-500 hover:text-amber-600 rounded-lg transition-colors"
                  title="Hold / Park Bill"
                >
                  <PauseCircle className="w-4 h-4" />
                </button>
              )}
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="p-1 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
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
                  className="w-full pl-8 pr-7 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2563EB]"
                />
                {selectedCustomer && (
                  <button
                    onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="p-1.5 sm:p-2 bg-white hover:bg-gray-100 text-[#2563EB] border border-gray-300 rounded-xl"
                title="Add New Customer"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Dropdown Results */}
            {isCustomerDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                    setIsCustomerDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-[#2563EB] flex items-center justify-between"
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
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{cust.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{cust.mobile}</div>
                    </div>
                    <Check className={cn("w-3.5 h-3.5 text-[#2563EB]", selectedCustomer?.id === cust.id ? "opacity-100" : "opacity-0")} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-2.5 space-y-1.5 bg-white min-h-0">
          {cart.map(item => {
            const lineTotal = item.price * item.quantity;
            return (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 p-2 sm:p-2.5 rounded-xl flex items-center justify-between gap-2 group hover:border-gray-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-gray-900 text-xs truncate">{item.menuItem.name}</h5>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {currency}{item.price.toFixed(2)} × {formatQuantityWithSubunit(item.quantity, item.menuItem.unit)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Quantity Adjustment */}
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-0.5 sm:p-1 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded"
                      title="Reduce quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const uType = getUnitType(item.menuItem.unit);
                        if (uType !== 'PIECE') {
                          const u = (item.menuItem.unit || '').toLowerCase().trim();
                          const isSub = u === 'g' || u === 'ml' || u === 'cm';
                          const curVal = isSub ? String(item.quantity) : String(Math.round(item.quantity * 1000));
                          setWeightModalItem({ item: item.menuItem, cartItemId: item.id });
                          setSubUnitVal(curVal || '250');
                        }
                      }}
                      className="font-mono font-bold text-xs text-gray-900 px-1.5 min-w-[18px] text-center hover:text-[#2563EB] transition-colors cursor-pointer"
                      title="Click to edit custom weight/volume (grams / ml)"
                    >
                      {item.quantity}
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-0.5 sm:p-1 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="font-mono font-bold text-gray-900 text-xs min-w-[55px] sm:min-w-[65px] text-right">
                    {currency}{lineTotal.toFixed(2)}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="h-32 sm:h-40 flex flex-col items-center justify-center text-gray-400 space-y-1.5">
              <ShoppingCart className="w-7 h-7 text-gray-300" />
              <p className="text-xs font-semibold text-gray-600">Cart is empty</p>
              <p className="text-[10px] text-gray-400">Click products from catalog to start billing</p>
            </div>
          )}
        </div>

        {/* Cart Bottom: Calculations & Checkout */}
        <div className="p-2.5 sm:p-3.5 border-t border-gray-200 bg-gray-50/90 space-y-2 sm:space-y-2.5 flex-shrink-0 overflow-y-auto max-h-[55vh] lg:max-h-none">
          {/* Bill Type Selector (GST vs Non-GST) - Theme Adaptive */}
          <div className="flex items-center justify-between p-1.5 sm:p-2 bg-white border border-gray-200 rounded-xl mb-1 shadow-2xs">
            <span className="text-xs font-bold text-gray-900">Bill Type:</span>
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 sm:p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setBillType('GST')}
                className={cn(
                  "px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1",
                  billType === 'GST'
                    ? "bg-[#2563EB] text-white shadow font-extrabold"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                <span>📄 GST Bill</span>
              </button>
              <button
                type="button"
                onClick={() => setBillType('NON_GST')}
                className={cn(
                  "px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1",
                  billType === 'NON_GST'
                    ? "bg-amber-500 text-white shadow font-extrabold"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                <span>📝 Non-GST Bill</span>
              </button>
            </div>
          </div>

          {/* Bill Summary Calculations */}
          <div className="space-y-1 text-xs text-gray-600 border-b border-gray-200 pb-2">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-mono font-bold text-gray-900">{currency}{subtotal.toFixed(2)}</span>
            </div>

            {/* Discount Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>Discount</span>
                <div className="inline-flex bg-white border border-gray-300 rounded-md p-0.5 text-[9px] font-bold">
                  <button
                    onClick={() => setBillDiscountType('FIXED')}
                    className={cn("px-1 rounded", billDiscountType === 'FIXED' ? "bg-[#2563EB] text-white" : "text-gray-500")}
                  >
                    {currency}
                  </button>
                  <button
                    onClick={() => setBillDiscountType('PERCENT')}
                    className={cn("px-1 rounded", billDiscountType === 'PERCENT' ? "bg-[#2563EB] text-white" : "text-gray-500")}
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
                  className="w-16 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-right text-xs font-mono text-gray-900 outline-none focus:border-[#2563EB]"
                />
                <span className="font-mono text-amber-600 font-bold min-w-[50px] text-right">
                  -{currency}{discountAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className={billType === 'NON_GST' ? 'line-through text-gray-400' : ''}>
                Estimated Tax / GST {billType === 'NON_GST' && '(Exempt)'}
              </span>
              <span className={cn("font-mono font-bold", billType === 'NON_GST' ? "text-amber-600 font-normal" : "text-gray-900")}>
                {currency}{taxAmount.toFixed(2)}
              </span>
            </div>

            {/* Grand Total Highlight */}
            <div className="flex justify-between items-baseline pt-1 border-t border-gray-200 text-gray-900">
              <span className="font-bold text-xs sm:text-sm tracking-tight">Grand Total</span>
              <span className="font-mono font-extrabold text-lg sm:text-xl text-[#2563EB]">
                {currency}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'CREDIT', label: 'Credit', icon: User },
                { id: 'SPLIT', label: 'Split', icon: ArrowRightLeft },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id as any);
                    }}
                    className={cn(
                      "py-1.5 px-0.5 sm:py-2 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-bold border transition-all flex flex-col items-center gap-0.5 sm:gap-1",
                      isSelected
                        ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md border-transparent font-extrabold"
                        : "bg-white text-gray-900 border-gray-100 hover:bg-blue-50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Split / Partial Payment Box */}
            {paymentMethod === 'SPLIT' && grandTotal > 0 && (
              <div className="bg-white p-2.5 rounded-2xl border border-gray-100 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" /> Split Payment
                  </span>
                  <span className="text-[10px] text-gray-900 opacity-60">
                    Total: <strong className="font-mono text-[#2563EB]">₹{grandTotal.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-900 opacity-75 uppercase">Paid Amount (₹)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder={(grandTotal / 2).toFixed(0)}
                      value={splitPaidAmount}
                      onChange={e => setSplitPaidAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-1.5 text-xs font-mono font-bold text-gray-900 outline-none focus:border-gray-100 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-900 opacity-75 uppercase">Paid Via</label>
                    <select
                      value={splitPaidMethod}
                      onChange={e => setSplitPaidMethod(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-1.5 text-xs font-bold text-gray-900 outline-none focus:border-gray-100 mt-0.5"
                    >
                      <option value="CASH">💵 Cash</option>
                      <option value="UPI">📲 UPI / QR</option>
                      <option value="CARD">💳 Card</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-gray-900 opacity-70 text-[10px]">Paid: </span>
                    <span className="font-bold text-emerald-600">₹{computedPaidAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 opacity-70 text-[10px]">Due: </span>
                    <span className="font-bold text-red-500">₹{computedBalanceDue.toFixed(2)}</span>
                  </div>
                </div>

                {computedBalanceDue > 0 && !selectedCustomer && (
                  <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 p-1.5 rounded-lg flex items-center gap-1 font-medium">
                    <span>⚠️ Unpaid balance will be saved to Customer Credit. Please select a customer above.</span>
                  </div>
                )}
              </div>
            )}

            {/* Cash Tendered Calculator */}
            {paymentMethod === 'CASH' && grandTotal > 0 && (
              <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="opacity-80">Cash Received:</span>
                  <input
                    type="number"
                    placeholder={grandTotal.toFixed(2)}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-20 sm:w-24 bg-theme-primary border border-gray-100 rounded px-2 py-0.5 text-gray-900 font-mono text-xs outline-none focus:border-gray-100"
                  />
                </div>
                {changeDue > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] opacity-80">Change: </span>
                    <span className="font-mono font-bold text-green-500 text-xs">
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
              "w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all border",
              cart.length > 0
                ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md border-transparent cursor-pointer active:scale-98"
                : "bg-white text-gray-900 opacity-50 cursor-not-allowed border-gray-100"
            )}
          >
            <Printer className="w-4 h-4" />
            <span>Complete Sale ({currency}{grandTotal.toFixed(2)})</span>
          </button>

        </div>
      </div>

      {/* Quick Add Product Modal in POS */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-gray-900 text-base">Add New Product</h3>
              </div>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton Shirt, Notebook, Engine Oil"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              {categories.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newItemCatId}
                    onChange={(e) => setNewItemCatId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price ({currency}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GST / Tax Rate (%)</label>
                  <select
                    value={newItemGst}
                    onChange={(e) => setNewItemGst(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB] font-medium"
                  >
                    <option value="">Select Unit</option>
                    {COMMON_UNITS.map(grp => (
                      <optgroup key={grp.group} label={`── ${grp.group} ──`}>
                        {grp.units.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </optgroup>
                    ))}
                    {newItemUnit && !COMMON_UNITS.some(g => g.units.includes(newItemUnit)) && (
                      <option value={newItemUnit}>{newItemUnit} (Custom)</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Product Image Upload Field */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Product Image (Optional)</label>
                <div className="flex items-center gap-3">
                  {newItemImageUrl ? (
                    <div className="relative group w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs flex-shrink-0">
                      <img src={newItemImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewItemImageUrl('')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] font-bold gap-0.5"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                      <ImageIcon className="w-4 h-4 stroke-[1.5]" />
                      <span className="text-[7px] mt-0.5 font-semibold">No Image</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#2563EB] text-[#2563EB] text-xs font-bold shadow-xs hover:bg-blue-50 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{newItemImageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const dataUrl = await compressImageFile(file);
                                setNewItemImageUrl(dataUrl);
                              } catch (err: any) {
                                alert(err?.message || 'Failed to upload image');
                              }
                            }
                          }}
                        />
                      </label>

                      {newItemImageUrl && (
                        <button
                          type="button"
                          onClick={() => setNewItemImageUrl('')}
                          className="px-2 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold border border-red-200 transition-all inline-flex items-center gap-1"
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

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-sm">Parked / Held Bills ({heldBills.length})</h3>
              </div>
              <div className="flex items-center gap-2">
                {heldBills.length > 0 && (
                  <button
                    onClick={handleClearAllHeldBills}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 hover:underline px-2 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsHeldModalOpen(false)}
                  className="text-gray-400 hover:text-gray-900 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {heldBills.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs space-y-1">
                <p className="font-semibold text-gray-700">No parked bills</p>
                <p className="text-[11px] text-gray-400">Parked bills will appear here when you hold a cart.</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2.5 divide-y divide-gray-100 pr-1">
                {heldBills.map(h => (
                  <div key={h.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-xs truncate">{h.billNumber} • {h.time}</div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {h.customer ? h.customer.name : 'Walk-in'} • {h.cart.length} items
                      </div>
                      <div className="font-mono font-bold text-[#2563EB] text-xs mt-0.5">
                        {currency}{h.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRecallHeldBill(h)}
                        className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        Resume Bill
                      </button>
                      <button
                        onClick={(e) => handleDeleteHeldBill(e, h.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete parked bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-gray-900 text-sm">Quick Add Customer</h3>
              </div>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weight / Volume Sub-unit Custom Quantity Modal */}
      {weightModalItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-100 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{weightModalItem.item.name}</h3>
                <p className="text-xs text-gray-900 opacity-60">
                  Rate: <span className="font-mono font-bold text-[#2563EB]">₹{weightModalItem.item.price.toFixed(2)}</span> per {weightModalItem.item.unit || 'Kg'}
                </p>
              </div>
              <button onClick={() => setWeightModalItem(null)} className="text-gray-900 opacity-60 hover:opacity-100 font-bold text-sm">✕</button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-75 uppercase tracking-wider">Quick Presets</label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {getUnitType(weightModalItem.item.unit) === 'WEIGHT' ? (
                  [
                    { label: '50 g', val: 50 },
                    { label: '100 g', val: 100 },
                    { label: '250 g', val: 250 },
                    { label: '500 g', val: 500 },
                    { label: '750 g', val: 750 },
                    { label: '1 Kg', val: 1000 },
                    { label: '1.5 Kg', val: 1500 },
                    { label: '2 Kg', val: 2000 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSubUnitVal(String(preset.val))}
                      className={cn(
                        "py-2 rounded-xl text-xs font-mono font-bold border transition-all",
                        Number(subUnitVal) === preset.val
                          ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md border-transparent font-extrabold"
                          : "bg-gray-50 text-gray-900 border-gray-100 hover:border-gray-100"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))
                ) : (
                  [
                    { label: '50 ml', val: 50 },
                    { label: '100 ml', val: 100 },
                    { label: '250 ml', val: 250 },
                    { label: '500 ml', val: 500 },
                    { label: '750 ml', val: 750 },
                    { label: '1 Liter', val: 1000 },
                    { label: '1.5 L', val: 1500 },
                    { label: '2 Liters', val: 2000 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSubUnitVal(String(preset.val))}
                      className={cn(
                        "py-2 rounded-xl text-xs font-mono font-bold border transition-all",
                        Number(subUnitVal) === preset.val
                          ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md border-transparent font-extrabold"
                          : "bg-gray-50 text-gray-900 border-gray-100 hover:border-gray-100"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Custom Input */}
            <div>
              <label className="text-[10px] font-bold text-gray-900 opacity-75 uppercase tracking-wider">
                Custom Quantity ({getUnitType(weightModalItem.item.unit) === 'WEIGHT' ? 'Grams' : 'Milliliters (ml)'})
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  step="any"
                  autoFocus
                  value={subUnitVal}
                  onChange={e => setSubUnitVal(e.target.value)}
                  placeholder="e.g. 250, 500, 750"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-lg font-mono font-bold text-gray-900 outline-none focus:border-gray-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-900 opacity-60">
                  {getUnitType(weightModalItem.item.unit) === 'WEIGHT' ? 'Grams' : 'ml'}
                </span>
              </div>
            </div>

            {/* Calculated Price Live Preview */}
            {(() => {
              const numGrams = Number(subUnitVal) || 0;
              const u = (weightModalItem.item.unit || '').toLowerCase().trim();
              const isSub = u === 'g' || u === 'ml' || u === 'cm';
              const convertedQty = isSub ? numGrams : numGrams / 1000;
              const totalPrice = weightModalItem.item.price * convertedQty;
              return (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-gray-900 opacity-70">Quantity: </span>
                    <span className="font-bold text-gray-900">{formatQuantityWithSubunit(convertedQty, weightModalItem.item.unit)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 opacity-70">Total: </span>
                    <span className="font-bold text-[#2563EB] text-sm">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Submit Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const numGrams = Number(subUnitVal) || 0;
                  if (numGrams <= 0) {
                    alert('Please enter a valid quantity.');
                    return;
                  }
                  const u = (weightModalItem.item.unit || '').toLowerCase().trim();
                  const isSub = u === 'g' || u === 'ml' || u === 'cm';
                  const calculatedQty = isSub ? numGrams : Number((numGrams / 1000).toFixed(3));

                  if (weightModalItem.cartItemId) {
                    setCart(prev => prev.map(c => c.id === weightModalItem.cartItemId ? { ...c, quantity: calculatedQty } : c));
                  } else {
                    addToCart(weightModalItem.item, calculatedQty);
                  }
                  setWeightModalItem(null);
                }}
                className="flex-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg"
              >
                Confirm Quantity
              </button>
              <button
                type="button"
                onClick={() => setWeightModalItem(null)}
                className="px-5 py-3 bg-gray-50 text-gray-900 opacity-70 font-bold text-xs rounded-xl uppercase hover:opacity-100"
              >
                Cancel
              </button>
            </div>
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
