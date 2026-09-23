/**
 * CloudSync.ts
 * 
 * Central Cloud Database Synchronization Engine.
 * Synchronizes Supabase PostgreSQL database tables with client-side state in real time
 * across all modules, so any system/browser logged into the account sees 100% up-to-date
 * data across businesses, products, categories, orders, customers, staff, and settings.
 */

export class CloudSync {
  private static isSyncing = false;
  private static lastSyncTime = 0;

  /**
   * Synchronizes all SaaS Tenants from the database into the master registry
   */
  static async syncTenants(): Promise<any[]> {
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const tenants = await res.json();
        if (Array.isArray(tenants) && tenants.length > 0) {
          localStorage.setItem('saas_tenants_master_registry', JSON.stringify(tenants));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('saas_tenants_updated'));
          }
          return tenants;
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to sync tenants from server', e);
    }
    return [];
  }

  /**
   * Synchronizes categories for a business
   */
  static async syncCategories(businessId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/categories?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('universal_categories', JSON.stringify(data));
          localStorage.setItem(`tenant_${businessId}_universal_categories`, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to sync categories', e);
    }
    return [];
  }

  /**
   * Synchronizes menu items / products for a business
   */
  static async syncMenuItems(businessId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/menu-items?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('universal_items', JSON.stringify(data));
          localStorage.setItem(`tenant_${businessId}_universal_items`, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to sync menu items', e);
    }
    return [];
  }

  /**
   * Synchronizes orders & bills for a business
   */
  static async syncOrders(businessId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/orders?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('universal_orders', JSON.stringify(data));
          localStorage.setItem(`tenant_${businessId}_universal_orders`, JSON.stringify(data));

          const gstBills = data.filter((o: any) => (o.tax && o.tax > 0) || o.isGst || o.billType === 'GST' || o.orderType === 'TAX_INVOICE');
          const nonGstBills = data.filter((o: any) => !((o.tax && o.tax > 0) || o.isGst || o.billType === 'GST' || o.orderType === 'TAX_INVOICE'));
          
          localStorage.setItem('universal_gst_bills', JSON.stringify(gstBills));
          localStorage.setItem('universal_nongst_bills', JSON.stringify(nonGstBills));
          return data;
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to sync orders', e);
    }
    return [];
  }

  /**
   * Synchronizes customers for a business
   */
  static async syncCustomers(businessId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/customers?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('universal_customers', JSON.stringify(data));
          localStorage.setItem(`tenant_${businessId}_universal_customers`, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to sync customers', e);
    }
    return [];
  }

  /**
   * Synchronizes staff and users for a business
   */
  static async syncStaff(businessId: string): Promise<any[]> {
    try {
      const [empRes, userRes] = await Promise.all([
        fetch(`/api/employees?businessId=${businessId}`, { headers: { 'x-business-id': businessId } }),
        fetch(`/api/users?businessId=${businessId}`, { headers: { 'x-business-id': businessId } }),
      ]);

      const employees = empRes.ok ? await empRes.json() : [];
      const users = userRes.ok ? await userRes.json() : [];

      const staffList: any[] = [];
      const seenPhones = new Set<string>();

      if (Array.isArray(employees)) {
        employees.forEach(emp => {
          if (emp.phone) seenPhones.add(emp.phone);
          staffList.push({
            id: emp.id,
            name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            fullName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            firstName: emp.firstName,
            lastName: emp.lastName,
            role: emp.role || 'STAFF',
            phone: emp.phone || '',
            email: emp.email || '',
            address: emp.address || '',
            status: emp.status || 'ACTIVE',
            employeeCode: emp.employeeCode || `EMP-${emp.phone}`,
            businessId: emp.businessId || businessId,
            pinCode: '1234',
            password: '1234',
            applicationAccess: emp.role === 'ADMIN' ? 'Full Business Access' : 'Billing POS, Inventory',
            shiftId: emp.shiftId,
            departmentId: emp.departmentId,
            designationId: emp.designationId,
            dateOfJoining: emp.dateOfJoining || emp.createdAt,
            baseSalary: emp.baseSalary || 0,
            aadharNumber: emp.aadharNumber || '',
          });
        });
      }

      if (Array.isArray(users)) {
        users.forEach(u => {
          if (!seenPhones.has(u.username) && !staffList.some(s => s.id === u.id)) {
            staffList.push({
              id: u.id,
              name: u.username === 'admin' ? 'Administrator' : u.username,
              fullName: u.username === 'admin' ? 'Administrator' : u.username,
              role: u.role || 'CASHIER',
              phone: u.username,
              username: u.username,
              email: u.email || '',
              status: 'ACTIVE',
              employeeCode: `EMP-${u.username}`,
              businessId: u.businessId || businessId,
              pinCode: u.password || '1234',
              password: u.password || '1234',
              applicationAccess: u.role === 'ADMIN' ? 'Full Business Access' : 'Billing POS',
            });
          }
        });
      }

      if (staffList.length > 0) {
        localStorage.setItem('universal_staff_list', JSON.stringify(staffList));
        localStorage.setItem(`tenant_${businessId}_universal_staff_list`, JSON.stringify(staffList));
      }
      return staffList;
    } catch (e) {
      console.warn('[CloudSync] Failed to sync staff', e);
    }
    return [];
  }

  /**
   * Synchronizes business profile settings
   */
  static async syncSettings(businessId: string): Promise<any> {
    try {
      const res = await fetch(`/api/settings?businessId=${businessId}`, {
        headers: { 'x-business-id': businessId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.businessProfile) {
          localStorage.setItem('universal_business_profile', JSON.stringify(data.businessProfile));
          localStorage.setItem(`tenant_${businessId}_universal_business_profile`, JSON.stringify(data.businessProfile));
          return data.businessProfile;
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to sync settings', e);
    }
    return null;
  }

  /**
   * Main method to sync ALL data across all modules from PostgreSQL database
   */
  static async syncAllData(targetBusinessId?: string, force = false): Promise<void> {
    const now = Date.now();
    if (!force && this.isSyncing && (now - this.lastSyncTime < 2000)) {
      return;
    }

    this.isSyncing = true;
    this.lastSyncTime = now;

    const activeBizId = targetBusinessId || localStorage.getItem('businessId') || 'biz-default-business';

    try {
      await Promise.allSettled([
        this.syncTenants(),
        this.syncCategories(activeBizId),
        this.syncMenuItems(activeBizId),
        this.syncOrders(activeBizId),
        this.syncCustomers(activeBizId),
        this.syncStaff(activeBizId),
        this.syncSettings(activeBizId),
      ]);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cloud_sync_completed', {
          detail: { businessId: activeBizId, timestamp: new Date().toISOString() }
        }));
        window.dispatchEvent(new Event('storage'));
      }
    } finally {
      this.isSyncing = false;
    }
  }
}
