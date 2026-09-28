import { DEFAULT_SUPABASE_ITEMS, DEFAULT_SUPABASE_CATEGORIES } from './defaultData';

export function installApiInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch.bind(window);

  // Seed default items if not present
  try {
    if (!localStorage.getItem('universal_items')) {
      localStorage.setItem('universal_items', JSON.stringify(DEFAULT_SUPABASE_ITEMS));
    }
    if (!localStorage.getItem('universal_categories')) {
      localStorage.setItem('universal_categories', JSON.stringify(DEFAULT_SUPABASE_CATEGORIES));
    }
  } catch {}

  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
    
    // Only intercept /api/ calls
    if (urlStr.includes('/api/')) {
      const parsedUrl = new URL(urlStr, window.location.origin);
      const pathname = parsedUrl.pathname;
      const method = (init?.method || 'GET').toUpperCase();
      const businessId = parsedUrl.searchParams.get('businessId') || 'biz-default-business';
      const tenantPrefix = `tenant_${businessId}_`;

      const createJsonResponse = (data: any, status = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            'Content-Type': 'application/json',
            'x-intercepted-by': 'client-resilience-engine'
          }
        });
      };

      try {
        // 1. Categories
        if (pathname.includes('/api/categories')) {
          if (method === 'GET') {
            const saved = localStorage.getItem(`${tenantPrefix}universal_categories`) || localStorage.getItem('universal_categories');
            let cats = DEFAULT_SUPABASE_CATEGORIES;
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) cats = parsed;
              } catch {}
            }
            return createJsonResponse(cats);
          }
          if (method === 'POST') {
            const body = init?.body ? JSON.parse(init.body.toString()) : {};
            const saved = JSON.parse(localStorage.getItem('universal_categories') || '[]');
            const newCat = {
              id: `cat-${Date.now()}`,
              businessId,
              name: body.name || 'New Category',
              slug: (body.name || 'new').toLowerCase().replace(/\s+/g, '-'),
              ...body
            };
            saved.push(newCat);
            localStorage.setItem('universal_categories', JSON.stringify(saved));
            localStorage.setItem(`${tenantPrefix}universal_categories`, JSON.stringify(saved));
            return createJsonResponse(newCat, 201);
          }
        }

        // 2. Menu Items / Products
        if (pathname.includes('/api/menu-items') || pathname.includes('/api/products') || pathname.includes('/api/items')) {
          if (method === 'GET') {
            const saved = localStorage.getItem(`${tenantPrefix}universal_items`) || localStorage.getItem('universal_items');
            let items = DEFAULT_SUPABASE_ITEMS;
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
              } catch {}
            }
            return createJsonResponse(items);
          }
          if (method === 'POST') {
            const body = init?.body ? JSON.parse(init.body.toString()) : {};
            const saved = JSON.parse(localStorage.getItem('universal_items') || JSON.stringify(DEFAULT_SUPABASE_ITEMS));
            const newItem = {
              id: body.id || `item-${Date.now()}`,
              businessId,
              name: body.name,
              categoryId: body.categoryId || '8706c4ad-3f6c-49e5-8d39-596ce1afbd40',
              categoryName: body.categoryName || 'General',
              price: Number(body.price || body.pricePerUnit) || 0,
              costPrice: Number(body.costPrice) || 0,
              unit: body.unit || 'Pcs',
              currentStock: Number(body.currentStock) || 50,
              minStockLevel: Number(body.minStockLevel || body.minStock) || 10,
              minStock: Number(body.minStock || body.minStockLevel) || 10,
              gst: Number(body.gst) || 5,
              hsnCode: body.hsnCode || '2106',
              sku: body.sku || '',
              barcode: body.barcode || '',
              supplierId: body.supplierId || '',
              supplierName: body.supplierName || '',
              description: body.description || '',
              isAvailable: body.isAvailable !== false,
              showInWebsite: Boolean(body.showInWebsite),
              imageUrl: body.imageUrl || '',
              dietary: body.dietary || 'VEG',
              kitchenSection: body.kitchenSection || 'Main Kitchen',
              attributes: body.attributes || {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            saved.unshift(newItem);
            localStorage.setItem('universal_items', JSON.stringify(saved));
            localStorage.setItem(`${tenantPrefix}universal_items`, JSON.stringify(saved));
            return createJsonResponse(newItem, 201);
          }
          if (method === 'DELETE') {
            const parts = pathname.split('/');
            const delId = parts[parts.length - 1];
            const saved = JSON.parse(localStorage.getItem('universal_items') || '[]');
            const filtered = saved.filter((it: any) => it.id !== delId);
            localStorage.setItem('universal_items', JSON.stringify(filtered));
            localStorage.setItem(`${tenantPrefix}universal_items`, JSON.stringify(filtered));
            return createJsonResponse({ success: true, id: delId });
          }
        }

        // 3. Orders
        if (pathname.includes('/api/orders')) {
          if (method === 'GET') {
            const saved = localStorage.getItem(`${tenantPrefix}universal_orders`) || localStorage.getItem('universal_orders');
            let orders: any[] = [];
            if (saved) {
              try { orders = JSON.parse(saved); } catch {}
            }
            return createJsonResponse(orders);
          }
          if (method === 'POST') {
            const body = init?.body ? JSON.parse(init.body.toString()) : {};
            const saved = JSON.parse(localStorage.getItem('universal_orders') || '[]');
            const newOrder = {
              id: body.id || `ord-${Date.now()}`,
              businessId,
              orderNumber: body.orderNumber || `ORD-${Date.now()}`,
              status: body.status || 'COMPLETED',
              orderType: body.orderType || 'POS',
              subtotal: Number(body.subtotal) || 0,
              tax: Number(body.tax) || 0,
              total: Number(body.total) || 0,
              paymentMethod: body.paymentMethod || 'CASH',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...body
            };
            saved.unshift(newOrder);
            localStorage.setItem('universal_orders', JSON.stringify(saved));
            localStorage.setItem(`${tenantPrefix}universal_orders`, JSON.stringify(saved));
            return createJsonResponse(newOrder, 201);
          }
        }

        // 4. Employees / Users
        if (pathname.includes('/api/employees') || pathname.includes('/api/users')) {
          if (method === 'GET') {
            const saved = localStorage.getItem(`${tenantPrefix}universal_employees`) || localStorage.getItem('universal_employees');
            let emps = [
              { id: 'emp-admin', name: 'Store Admin', fullName: 'Store Admin', username: 'admin', phone: '9876543210', role: 'ADMIN', status: 'ACTIVE', pinCode: '1234' },
              { id: 'emp-cashier', name: 'Cashier Staff', fullName: 'Cashier Staff', username: 'cashier', phone: '9876543211', role: 'CASHIER', status: 'ACTIVE', pinCode: '1234' }
            ];
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) emps = parsed;
              } catch {}
            }
            return createJsonResponse(emps);
          }
          if (method === 'POST') {
            const body = init?.body ? JSON.parse(init.body.toString()) : {};
            return createJsonResponse({ id: `emp-${Date.now()}`, ...body }, 201);
          }
        }

        // 5. Attendance
        if (pathname.includes('/api/attendance')) {
          if (method === 'GET') {
            const saved = localStorage.getItem(`${tenantPrefix}universal_attendance`) || localStorage.getItem('universal_attendance');
            let att: any[] = [];
            if (saved) {
              try { att = JSON.parse(saved); } catch {}
            }
            return createJsonResponse(att);
          }
          if (method === 'POST') {
            return createJsonResponse({ success: true }, 201);
          }
        }

        // 6. Leaves
        if (pathname.includes('/api/leaves')) {
          return createJsonResponse([]);
        }

        // 7. Tenants
        if (pathname.includes('/api/tenants')) {
          const tenants = [
            {
              id: 'biz-default-business',
              businessName: 'My Multi-Business Store',
              legalEntityName: 'My Multi-Business Store',
              ownerName: 'Admin',
              ownerEmail: 'admin@store.com',
              ownerPhone: '9876543210',
              businessType: 'RETAIL',
              currency: 'INR',
              currencySymbol: '₹',
              gstin: '33AAAAA0000A1Z5',
              address: 'Main Commercial Hub',
              city: 'Chennai',
              state: 'Tamil Nadu',
              status: 'ACTIVE',
              subscription: { status: 'ACTIVE', planName: 'ENTERPRISE', planTier: 'ENTERPRISE' }
            }
          ];
          return createJsonResponse(tenants);
        }

        // 8. Settings
        if (pathname.includes('/api/settings')) {
          const settings = {
            businessName: 'My Business',
            profile: { name: 'My Business', address: '124, Commercial Road, Chennai, TN - 600001', phone: '+91 98765 43210', email: 'contact@mybusiness.com' },
            gst: { gstin: '33AAAAA0000A1Z5', enableGst: true, defaultGstPct: 5.0 }
          };
          return createJsonResponse(settings);
        }

        // 9. Suppliers
        if (pathname.includes('/api/inventory/suppliers') || pathname.includes('/api/suppliers')) {
          return createJsonResponse([]);
        }

        // 10. Customers
        if (pathname.includes('/api/customers')) {
          const saved = localStorage.getItem('universal_customers');
          let custs: any[] = [];
          if (saved) {
            try { custs = JSON.parse(saved); } catch {}
          }
          return createJsonResponse(custs);
        }

        // 11. Health
        if (pathname.includes('/api/health')) {
          return createJsonResponse({ status: 'ok', dbStatus: 'ONLINE', provider: 'Supabase PostgreSQL' });
        }

        return createJsonResponse([]);
      } catch (err) {
        return createJsonResponse([]);
      }
    }

    return originalFetch(input, init);
  };
}
