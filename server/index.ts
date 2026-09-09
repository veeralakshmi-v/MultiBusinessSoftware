import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.yqciwlvmoboszvxzodrl:Kousalya%402252@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=15&pool_timeout=20&connection_limit=10';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

// Auto-reconnect helper for Desktop Application socket resilience
async function checkAndReconnectDb() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    console.warn('⚠️ Supabase connection dropped. Attempting desktop reconnect...', err);
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log('✅ Reconnected to Supabase PostgreSQL successfully!');
    } catch (reconnectErr) {
      console.error('❌ Failed to reconnect to Supabase:', reconnectErr);
    }
  }
}

// Validation Utilities for API endpoints
function isValidPhone(val: string | null | undefined): boolean {
  if (!val) return false;
  let digits = val.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 && /^\d{10}$/.test(digits);
}

function isValidAadhar(val: string | null | undefined): boolean {
  if (!val) return false;
  const digits = val.replace(/\D/g, '');
  return digits.length === 12 && /^\d{12}$/.test(digits);
}

// In-Memory Seed Data Fallbacks if DB is uninitialized
const DEMO_BUSINESS_ID = 'biz-default-business';

let mockSettings = {
  profile: {
    name: "My Business",
    tagline: "Authentic South Indian & Multi-Cuisine Dining",
    address: "124, NSC Bose Road, Chennai, Tamil Nadu - 600001",
    phone: "+91 98765 43210",
    email: "contact@mybusiness.com",
    fssai: "12421001000543",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80",
  },
  gst: {
    gstin: "33AAAAA0000A1Z5",
    enableGst: true,
    defaultGstPct: 5.0,
    cgstPct: 2.5,
    sgstPct: 2.5,
    hsnMandatory: true,
  },
  billPrefix: {
    invoicePrefix: "INV/2026/",
    orderPrefix: "ORD-",
    counterStart: 1001,
    resetFrequency: "YEARLY",
  },
  printer: {
    defaultPrinter: "Thermal POS 80mm (USB)",
    paperSize: "80mm",
    autoPrintOnCheckout: true,
    copyCount: 1,
    cutPaper: true,
  },
  taxSettings: {
    taxMode: "EXCLUSIVE",
    packingTaxPct: 5.0,
    deliveryServiceChargePct: 0.0,
  },
  themeSettings: {
    activeTheme: "DARK_GOLD",
    fontSize: "MEDIUM",
    compactLayout: false,
  },
  moduleSettings: {
    enableTables: true,
    enableInventory: true,
    enablePromotions: true,
    enableCustomers: true,
  },
};

// 1. Health & Desktop DB Status API
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;
    res.json({
      status: 'ok',
      dbStatus: 'CONNECTED',
      latencyMs,
      provider: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString(),
      service: 'Multi-Business Billing Desktop API'
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'degraded',
      dbStatus: 'DISCONNECTED',
      error: err.message || String(err),
      timestamp: new Date().toISOString(),
      service: 'Multi-Business Billing Desktop API'
    });
  }
});


// 2. Authentication
app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { username },
    });
    if (user) {
      return res.json({
        token: `jwt-token-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          businessId: user.businessId,
        },
      });
    }
  } catch (err) {
    // Fallback demo user
  }

  // Fallback demo login response
  return res.json({
    token: `demo-live-token-${username || 'admin'}`,
    user: {
      id: 'user-admin',
      username: username || 'admin',
      role: role || 'ADMIN',
      businessId: DEMO_BUSINESS_ID,
      businessType: 'RESTAURANT',
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    user: {
      id: 'user-admin',
      username: 'admin',
      role: 'ADMIN',
      businessId: DEMO_BUSINESS_ID,
      businessType: 'RESTAURANT',
    },
  });
});

// Automatic Initial Seed Helper to populate fresh database
async function ensureInitialDbData() {
  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const settingsCount = await prisma.businessProfileSettings.count();
    if (settingsCount === 0) {
      await prisma.businessProfileSettings.create({
        data: {
          businessId: DEMO_BUSINESS_ID,
          businessName: 'My Business',
          address: '124, Commercial Road, Chennai, TN - 600001',
          phone: '+91 98765 43210',
          email: 'contact@mybusiness.com',
          currencyCode: 'INR',
          currencySymbol: '₹',
          invoicePrefix: 'INV/2026/',
          orderPrefix: 'ORD-',
          nextInvoiceNumber: 1001,
          gstin: '33AAAAA0000A1Z5',
          enableGst: true,
          termsText: 'Goods once sold will not be taken back without original bill.',
          thankYouNote: 'Thank you for your business! Visit again soon 😊',
        }
      });
      console.log('🌱 Seeded initial BusinessProfileSettings into PostgreSQL');
    }

    const userCount = await prisma.user.count();
    if (userCount === 0) {
      await prisma.user.create({
        data: {
          businessId: DEMO_BUSINESS_ID,
          username: 'admin',
          password: 'admin123',
          role: 'ADMIN',
        }
      });
      console.log('🌱 Seeded initial Admin User into PostgreSQL');
    }

    let categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      const defaultCats = [
        { name: 'General', slug: 'general' },
        { name: 'Main Course', slug: 'main-course' },
        { name: 'Beverages', slug: 'beverages' },
        { name: 'Starters & Snacks', slug: 'starters-snacks' },
        { name: 'Desserts', slug: 'desserts' },
      ];
      for (const cat of defaultCats) {
        await prisma.category.upsert({
          where: { name: cat.name },
          update: {},
          create: { businessId: DEMO_BUSINESS_ID, name: cat.name, slug: cat.slug }
        });
      }
      console.log('🌱 Seeded initial Categories into PostgreSQL');
    }

    const itemCount = await prisma.menuItem.count();
    if (itemCount === 0) {
      const mainCat = await prisma.category.findFirst({ where: { name: 'Main Course' } });
      const bevCat = await prisma.category.findFirst({ where: { name: 'Beverages' } });
      const starterCat = await prisma.category.findFirst({ where: { name: 'Starters & Snacks' } });
      const genCat = await prisma.category.findFirst({ where: { businessId: DEMO_BUSINESS_ID } });

      const defaultItems = [
        { name: 'Paneer Butter Masala', categoryId: mainCat?.id || genCat!.id, price: 220.0, gst: 5.0, dietary: 'VEG' },
        { name: 'Chicken Biryani', categoryId: mainCat?.id || genCat!.id, price: 280.0, gst: 5.0, dietary: 'NON_VEG' },
        { name: 'Masala Dosa', categoryId: starterCat?.id || genCat!.id, price: 90.0, gst: 5.0, dietary: 'VEG' },
        { name: 'Fresh Lime Soda', categoryId: bevCat?.id || genCat!.id, price: 50.0, gst: 5.0, dietary: 'VEG' },
      ];

      for (const item of defaultItems) {
        await prisma.menuItem.create({
          data: {
            businessId: DEMO_BUSINESS_ID,
            name: item.name,
            categoryId: item.categoryId,
            price: item.price,
            gst: item.gst,
            dietary: item.dietary,
            isAvailable: true,
          }
        });
      }
      console.log('🌱 Seeded initial MenuItems into PostgreSQL');
    }

    const custCount = await prisma.customer.count();
    if (custCount === 0) {
      await prisma.customer.create({
        data: {
          businessId: DEMO_BUSINESS_ID,
          name: 'Walk-in Customer',
          mobile: '9999999999',
        }
      });
      console.log('🌱 Seeded initial Customer into PostgreSQL');
    }
  } catch (err) {
    console.error('Initial DB seeding error:', err);
  }
}

// 3. Settings API
app.get('/api/settings', async (req, res) => {
  try {
    await ensureInitialDbData();
    const settings = await prisma.businessProfileSettings.findFirst({
      where: { businessId: DEMO_BUSINESS_ID },
    });
    if (settings) {
      return res.json({
        businessName: settings.businessName,
        legalName: settings.legalName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        gstin: settings.gstin,
        currencySymbol: settings.currencySymbol,
        currencyCode: settings.currencyCode,
        invoicePrefix: settings.invoicePrefix,
        nextInvoiceNumber: settings.nextInvoiceNumber,
        taxMode: settings.taxCalculationMode,
        termsText: settings.termsText,
        thankYouNote: settings.thankYouNote,
        logoUrl: settings.logoUrl,
        profile: {
          name: settings.businessName,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          fssai: settings.licenseNumber,
          logoUrl: settings.logoUrl,
        },
        gst: {
          gstin: settings.gstin,
          enableGst: settings.enableGst,
          defaultGstPct: 5.0,
        },
        moduleSettings: JSON.parse(settings.enabledModules || '{}'),
      });
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
  res.json(mockSettings);
});

app.post('/api/settings', async (req, res) => {
  const body = req.body;
  mockSettings = { ...mockSettings, ...body };
  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: body.businessName || body.profile?.name || 'My Business', type: 'RETAIL' }
    });

    const settings = await prisma.businessProfileSettings.upsert({
      where: { businessId: DEMO_BUSINESS_ID },
      update: {
        businessName: body.businessName || body.profile?.name || mockSettings.profile.name,
        legalName: body.legalName,
        address: body.address || body.profile?.address || mockSettings.profile.address,
        phone: body.phone || body.profile?.phone || mockSettings.profile.phone,
        email: body.email || body.profile?.email || mockSettings.profile.email,
        gstin: body.gstin || body.gst?.gstin || mockSettings.gst.gstin,
        currencySymbol: body.currencySymbol || '₹',
        currencyCode: body.currencyCode || 'INR',
        invoicePrefix: body.invoicePrefix || 'INV/2026/',
        nextInvoiceNumber: body.nextInvoiceNumber ? parseInt(body.nextInvoiceNumber) : 1001,
        taxCalculationMode: body.taxMode || 'EXCLUSIVE',
        termsText: body.termsText,
        thankYouNote: body.thankYouNote,
        logoUrl: body.logoUrl || mockSettings.profile.logoUrl,
        enabledModules: JSON.stringify(body.enabledModules || body.moduleSettings || {}),
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        businessName: body.businessName || body.profile?.name || 'My Business',
        legalName: body.legalName || '',
        address: body.address || body.profile?.address || '',
        phone: body.phone || body.profile?.phone || '',
        email: body.email || body.profile?.email || '',
        gstin: body.gstin || body.gst?.gstin || '',
        currencySymbol: body.currencySymbol || '₹',
        currencyCode: body.currencyCode || 'INR',
        invoicePrefix: body.invoicePrefix || 'INV/2026/',
        nextInvoiceNumber: body.nextInvoiceNumber ? parseInt(body.nextInvoiceNumber) : 1001,
        taxCalculationMode: body.taxMode || 'EXCLUSIVE',
        termsText: body.termsText || '',
        thankYouNote: body.thankYouNote || '',
        logoUrl: body.logoUrl || '',
        enabledModules: JSON.stringify(body.enabledModules || body.moduleSettings || {}),
      },
    });
    console.log(`✅ Settings stored in DB for: ${settings.businessName}`);
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('❌ Error saving settings:', err);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
});

// 3.5 Users / Staff & Employee Management API
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      orderBy: { createdAt: 'desc' }
    });
    const employees = await prisma.employee.findMany({
      where: { businessId: DEMO_BUSINESS_ID }
    });

    const empMap = new Map<string, any>();
    employees.forEach(e => {
      if (e.phone) empMap.set(e.phone, e);
      if (e.employeeCode) {
        empMap.set(e.employeeCode, e);
        empMap.set(e.employeeCode.replace('EMP-', ''), e);
      }
    });

    const enriched = users.map(u => {
      const emp = empMap.get(u.username) || empMap.get(`EMP-${u.username}`);
      const displayName = emp?.fullName || (emp?.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : '') || u.username;
      return {
        ...u,
        name: displayName,
        fullName: displayName,
        phone: emp?.phone || u.username,
        email: emp?.email || '',
        aadharNumber: emp?.aadharNumber || '',
        address: emp?.address || '',
        status: emp?.status || 'ACTIVE',
      };
    });

    return res.json(enriched);
  } catch (err) {
    return res.json([]);
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(employees);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/users', async (req, res) => {
  const { name, fullName, staffName, username, phone, password, pinCode, role, aadharNumber, address, email } = req.body;
  const effectiveUsername = (phone || username || '').trim();
  const effectiveName = (name || fullName || staffName || effectiveUsername).trim();
  if (!effectiveUsername) return res.status(400).json({ error: 'Username or phone is required' });

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }
  if (aadharNumber && !isValidAadhar(aadharNumber)) {
    return res.status(400).json({ error: 'Aadhar number must be exactly 12 digits' });
  }

  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    // 1. Save to User table in Supabase
    const user = await prisma.user.upsert({
      where: { username: effectiveUsername },
      update: { role: role || 'CASHIER', password: password || pinCode || '1234' },
      create: {
        businessId: DEMO_BUSINESS_ID,
        username: effectiveUsername,
        password: password || pinCode || '1234',
        role: role || 'CASHIER',
      }
    });

    // 2. Save to Employee table in Supabase
    const empCode = `EMP-${effectiveUsername}`;
    const parts = effectiveName.split(' ');
    const firstName = parts[0] || 'Employee';
    const lastName = parts.slice(1).join(' ') || 'Staff';

    const emp = await prisma.employee.upsert({
      where: { employeeCode: empCode },
      update: {
        fullName: effectiveName,
        firstName,
        lastName,
        phone: effectiveUsername,
        email: email || undefined,
        aadharNumber: aadharNumber || undefined,
        address: address || undefined,
        role: role || 'CASHIER',
        status: 'ACTIVE',
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        employeeCode: empCode,
        firstName,
        lastName,
        fullName: effectiveName,
        phone: effectiveUsername,
        email: email || undefined,
        aadharNumber: aadharNumber || undefined,
        address: address || undefined,
        role: role || 'CASHIER',
        status: 'ACTIVE',
      }
    });

    console.log(`✅ User & Employee stored in Supabase PostgreSQL: ${effectiveName} (${effectiveUsername})`);
    return res.status(201).json({
      ...user,
      name: effectiveName,
      fullName: effectiveName,
      phone: effectiveUsername,
      email: emp.email || '',
      aadharNumber: emp.aadharNumber || '',
      address: emp.address || ''
    });
  } catch (err) {
    console.error('❌ Error saving user & employee:', err);
    return res.status(500).json({ error: 'Failed to save user & employee' });
  }
});

app.post('/api/employees', async (req, res) => {
  const { name, fullName, staffName, username, phone, role, aadharNumber, address, email } = req.body;
  const effectiveUsername = (phone || username || '').trim();
  const effectiveName = (name || fullName || staffName || effectiveUsername).trim();

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }
  if (aadharNumber && !isValidAadhar(aadharNumber)) {
    return res.status(400).json({ error: 'Aadhar number must be exactly 12 digits' });
  }

  const empCode = `EMP-${effectiveUsername || Date.now()}`;
  const parts = effectiveName.split(' ');
  const firstName = parts[0] || 'Employee';
  const lastName = parts.slice(1).join(' ') || 'Staff';

  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const emp = await prisma.employee.upsert({
      where: { employeeCode: empCode },
      update: {
        fullName: effectiveName,
        firstName,
        lastName,
        phone: effectiveUsername,
        email: email || undefined,
        aadharNumber: aadharNumber || undefined,
        address: address || undefined,
        role: role || 'CASHIER',
        status: 'ACTIVE',
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        employeeCode: empCode,
        firstName,
        lastName,
        fullName: effectiveName,
        phone: effectiveUsername,
        email: email || undefined,
        aadharNumber: aadharNumber || undefined,
        address: address || undefined,
        role: role || 'CASHIER',
        status: 'ACTIVE',
      }
    });

    if (effectiveUsername) {
      await prisma.user.upsert({
        where: { username: effectiveUsername },
        update: { role: role || 'CASHIER' },
        create: {
          businessId: DEMO_BUSINESS_ID,
          username: effectiveUsername,
          password: '1234',
          role: role || 'CASHIER'
        }
      });
    }

    return res.status(201).json({
      ...emp,
      name: effectiveName,
      fullName: effectiveName
    });
  } catch (err) {
    console.error('❌ Error creating employee:', err);
    return res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    return res.json({ success: true, id });
  }
});

// 4. Dynamic Categories API
app.get('/api/categories', async (req, res) => {
  try {
    await ensureInitialDbData();
    const categories = await prisma.category.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      orderBy: { name: 'asc' },
    });
    return res.json(categories || []);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });
    const category = await prisma.category.upsert({
      where: { name: name.trim() },
      update: { slug: name.trim().toLowerCase().replace(/\s+/g, '-') },
      create: {
        businessId: DEMO_BUSINESS_ID,
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      },
    });
    console.log(`✅ Category stored in DB: ${category.name} (${category.id})`);
    return res.status(201).json(category);
  } catch (err) {
    console.error('❌ Error saving category:', err);
    return res.status(500).json({ error: 'Failed to save category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: name ? name.trim().toLowerCase().replace(/\s+/g, '-') : undefined,
      },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    return res.json({ success: true, id });
  }
});

// 5. Products / Menu Items API
const getMenuItemsHandler = async (req: any, res: any) => {
  try {
    await ensureInitialDbData();
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    const parsedItems = items.map(item => {
      const attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes || '{}') : (item.attributes || {});
      return {
        ...item,
        showInWebsite: attrs.showInWebsite === true,
        attributes: attrs,
      };
    });
    return res.json(parsedItems);
  } catch (err) {
    return res.json([]);
  }
};

app.get('/api/menu', getMenuItemsHandler);
app.get('/api/menu-items', getMenuItemsHandler);

const createMenuItemHandler = async (req: any, res: any) => {
  const { name, categoryId, price, gst, hsnCode, kitchenSection, dietary, imageUrl, showInWebsite, attributes } = req.body;
  if (!name) return res.status(400).json({ error: 'Item name is required' });

  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    let targetCatId = categoryId;
    if (targetCatId) {
      const existingCat = await prisma.category.findUnique({ where: { id: targetCatId } });
      if (!existingCat) {
        const foundByName = await prisma.category.findFirst({ where: { name: targetCatId } });
        if (foundByName) {
          targetCatId = foundByName.id;
        } else {
          const newCat = await prisma.category.create({
            data: { businessId: DEMO_BUSINESS_ID, name: targetCatId, slug: targetCatId.toLowerCase().replace(/\s+/g, '-') }
          });
          targetCatId = newCat.id;
        }
      }
    } else {
      let defaultCat = await prisma.category.findFirst({ where: { businessId: DEMO_BUSINESS_ID } });
      if (!defaultCat) {
        defaultCat = await prisma.category.create({
          data: { businessId: DEMO_BUSINESS_ID, name: 'General', slug: 'general' }
        });
      }
      targetCatId = defaultCat.id;
    }

    const combinedAttrs = typeof attributes === 'object'
      ? { ...attributes, showInWebsite: showInWebsite === true }
      : { showInWebsite: showInWebsite === true };

    const item = await prisma.menuItem.create({
      data: {
        businessId: DEMO_BUSINESS_ID,
        name: name.trim(),
        categoryId: targetCatId,
        price: parseFloat(price || 0),
        gst: parseFloat(gst || 5),
        hsnCode: hsnCode || '2106',
        kitchenSection: kitchenSection || 'Main Kitchen',
        dietary: dietary || 'VEG',
        imageUrl: imageUrl || '',
        attributes: JSON.stringify(combinedAttrs),
        isAvailable: true,
      },
      include: { category: true }
    });
    console.log(`✅ MenuItem stored in DB: ${item.name} (${item.id})`);
    return res.status(201).json({
      ...item,
      showInWebsite: showInWebsite === true,
      attributes: combinedAttrs
    });
  } catch (err) {
    console.error('❌ Error creating menu item:', err);
    return res.status(500).json({ error: 'Failed to create menu item', details: String(err) });
  }
};

app.post('/api/menu', createMenuItemHandler);
app.post('/api/menu-items', createMenuItemHandler);

app.put('/api/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, price, gst, hsnCode, kitchenSection, dietary, imageUrl, isAvailable, showInWebsite, attributes } = req.body;
  try {
    let targetCatId = categoryId;
    if (targetCatId) {
      const existingCat = await prisma.category.findUnique({ where: { id: targetCatId } });
      if (!existingCat) {
        const foundByName = await prisma.category.findFirst({ where: { name: targetCatId } });
        if (foundByName) targetCatId = foundByName.id;
        else targetCatId = undefined;
      }
    }

    // Fetch existing item to merge attributes
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    let existingAttrs: any = {};
    try {
      if (existing?.attributes) {
        existingAttrs = typeof existing.attributes === 'string' ? JSON.parse(existing.attributes) : existing.attributes;
      }
    } catch (e) {}

    const newAttrs = {
      ...existingAttrs,
      ...(typeof attributes === 'object' ? attributes : {}),
      ...(showInWebsite !== undefined ? { showInWebsite: showInWebsite === true } : {}),
    };

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name: name?.trim(),
        categoryId: targetCatId,
        price: price !== undefined ? parseFloat(price) : undefined,
        gst: gst !== undefined ? parseFloat(gst) : undefined,
        hsnCode,
        kitchenSection,
        dietary,
        imageUrl,
        isAvailable,
        attributes: JSON.stringify(newAttrs),
      },
      include: { category: true }
    });
    console.log(`✅ MenuItem updated in DB: ${updated.name} (${updated.id})`);
    return res.json({
      ...updated,
      showInWebsite: newAttrs.showInWebsite === true,
      attributes: newAttrs
    });
  } catch (err) {
    console.error('❌ Error updating menu item:', err);
    return res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({ where: { id } });
    console.log(`✅ MenuItem deleted from DB: ${id}`);
    return res.json({ success: true, id });
  } catch (err) {
    return res.json({ success: true, id });
  }
});

// 5. Dining Tables API
app.get('/api/tables', async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(tables || []);
  } catch (err) {
    return res.json([]);
  }
});

app.put('/api/tables/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.table.update({
      where: { id },
      data: { status },
    });
    return res.json(updated);
  } catch (err) {
    return res.json({ success: true, id, status });
  }
});

// 6. Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        table: true,
        customer: true,
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.json([]);
  }
});

app.post('/api/orders', async (req, res) => {
  const orderData = req.body;
  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const rawItems = orderData.items || [];
    const validOrderItems: Array<{ menuItemId: string; quantity: number; price: number; discount: number }> = [];

    for (const item of rawItems) {
      let targetMenuItemId = item.menuItemId || item.id;
      let existingItem = targetMenuItemId ? await prisma.menuItem.findUnique({ where: { id: targetMenuItemId } }) : null;

      if (!existingItem && item.name) {
        existingItem = await prisma.menuItem.findFirst({ where: { name: item.name } });
      }

      if (!existingItem) {
        let defCat = await prisma.category.findFirst({ where: { businessId: DEMO_BUSINESS_ID } });
        if (!defCat) {
          defCat = await prisma.category.create({
            data: { businessId: DEMO_BUSINESS_ID, name: 'General', slug: 'general' }
          });
        }
        existingItem = await prisma.menuItem.create({
          data: {
            businessId: DEMO_BUSINESS_ID,
            name: item.name || 'Custom Product',
            categoryId: defCat.id,
            price: parseFloat(item.price || 0),
            gst: parseFloat(item.gst || 5),
            isAvailable: true,
          }
        });
      }

      validOrderItems.push({
        menuItemId: existingItem.id,
        quantity: parseInt(item.quantity || 1),
        price: parseFloat(item.price || 0),
        discount: parseFloat(item.discount || 0),
      });
    }

    let validTableId = orderData.tableId || null;
    if (validTableId) {
      const tableExists = await prisma.table.findUnique({ where: { id: validTableId } });
      if (!tableExists) validTableId = null;
    }

    let validCustomerId = orderData.customerId || null;
    if (validCustomerId) {
      const customerExists = await prisma.customer.findUnique({ where: { id: validCustomerId } });
      if (!customerExists) validCustomerId = null;
    }

    const createdOrder = await prisma.order.create({
      data: {
        businessId: DEMO_BUSINESS_ID,
        orderNumber: orderData.orderNumber || orderData.invoiceNo || `ORD-${Date.now().toString().slice(-6)}`,
        status: orderData.status || 'COMPLETED',
        orderType: orderData.orderType || 'TAX_INVOICE',
        tableId: validTableId,
        customerId: validCustomerId,
        customerNotes: orderData.customerNotes || '',
        subtotal: parseFloat(orderData.subtotal || orderData.total || 0),
        tax: parseFloat(orderData.tax || orderData.totalTax || 0),
        discount: parseFloat(orderData.discount || 0),
        total: parseFloat(orderData.total || orderData.grandTotal || 0),
        paymentMethod: orderData.paymentMethod || 'CASH',
        items: {
          create: validOrderItems,
        },
      },
      include: { items: { include: { menuItem: true } }, table: true, customer: true },
    });

    console.log(`✅ Order stored in DB: ${createdOrder.orderNumber} (${createdOrder.id})`);
    return res.status(201).json(createdOrder);
  } catch (err: any) {
    console.error('❌ Failed to store order in DB:', err);
    return res.status(500).json({ error: 'Failed to save order to database', details: String(err) });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Real Data Dashboard API
app.get('/api/dashboard', async (req, res) => {
  const dateParam = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  
  try {
    const allOrders = await prisma.order.findMany({
      include: { customer: true, items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalCustomers = await prisma.customer.count();

    const trendDays: { date: string; count: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      const dayOrders = allOrders.filter(o => o.createdAt.toISOString().slice(0, 10) === iso && o.status === 'COMPLETED');
      const rev = dayOrders.reduce((sum, o) => sum + o.total, 0);
      trendDays.push({ date: iso, count: dayOrders.length, revenue: rev });
    }

    const dateOrders = allOrders.filter(o => o.createdAt.toISOString().slice(0, 10) === dateParam).map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      time: o.createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customerName: o.customer?.name || 'Walk-in Customer',
      customerMobile: o.customer?.mobile || '',
      orderType: o.orderType || 'TAX_INVOICE',
      paymentMethod: o.paymentMethod || 'CASH',
      itemCount: o.items.length,
      subtotal: o.subtotal,
      tax: o.tax,
      discount: o.discount,
      total: o.total,
      status: o.status,
    }));

    const todayOrders = allOrders.filter(o => o.createdAt.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10));
    const todayCompleted = todayOrders.filter(o => o.status === 'COMPLETED');
    const todayRevenue = todayCompleted.reduce((sum, o) => sum + o.total, 0);
    const todayAvg = todayCompleted.length > 0 ? (todayRevenue / todayCompleted.length).toFixed(2) : '0.00';

    return res.json({
      kpis: {
        todayRevenue: todayRevenue.toFixed(2),
        todayCount: todayOrders.length,
        todayAvgTicket: todayAvg,
        totalCustomers: totalCustomers,
        revenueChange: 0,
      },
      trend: trendDays,
      dateOrders: dateOrders,
    });
  } catch (err) {
    return res.json({
      kpis: { todayRevenue: '0.00', todayCount: 0, todayAvgTicket: '0.00', totalCustomers: 0, revenueChange: 0 },
      trend: [],
      dateOrders: [],
    });
  }
});

// 7. Inventory API
app.get('/api/inventory', async (req, res) => {
  try {
    const raw = await prisma.rawMaterial.findMany({ include: { supplier: true } });
    const items = await prisma.inventoryItem.findMany({ include: { supplier: true } });
    return res.json({ rawMaterials: raw, inventoryItems: items });
  } catch (err) {
    return res.json({ rawMaterials: [], inventoryItems: [] });
  }
});

app.get('/api/inventory/materials', async (req, res) => {
  try {
    const raw = await prisma.rawMaterial.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      include: { supplier: true },
      orderBy: { name: 'asc' }
    });
    return res.json(raw);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/inventory/materials', async (req, res) => {
  const { name, unit, currentStock, minStockLevel, pricePerUnit, supplierId } = req.body;
  if (!name) return res.status(400).json({ error: 'Material name is required' });

  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const item = await prisma.rawMaterial.upsert({
      where: { name: name.trim() },
      update: {
        unit: unit || 'Pcs',
        currentStock: currentStock !== undefined ? parseFloat(currentStock) : undefined,
        minStockLevel: minStockLevel !== undefined ? parseFloat(minStockLevel) : undefined,
        pricePerUnit: pricePerUnit !== undefined ? parseFloat(pricePerUnit) : undefined,
      },
      create: {
        businessId: DEMO_BUSINESS_ID,
        name: name.trim(),
        unit: unit || 'Pcs',
        currentStock: parseFloat(currentStock || 0),
        minStockLevel: parseFloat(minStockLevel || 5),
        pricePerUnit: parseFloat(pricePerUnit || 0),
      }
    });
    console.log(`✅ RawMaterial stored in DB: ${item.name}`);
    return res.status(201).json(item);
  } catch (err) {
    console.error('❌ Failed to store raw material:', err);
    return res.status(500).json({ error: 'Failed to create material' });
  }
});

app.get('/api/inventory/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      orderBy: { name: 'asc' }
    });
    return res.json(suppliers);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/inventory/suppliers', async (req, res) => {
  const { name, contact, phone, email, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Supplier name is required' });

  const effectivePhone = phone || contact;
  if (effectivePhone && !isValidPhone(effectivePhone)) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }

  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const supplier = await prisma.supplier.create({
      data: {
        businessId: DEMO_BUSINESS_ID,
        name: name.trim(),
        contact: contact || phone || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
      }
    });
    console.log(`✅ Supplier stored in DB: ${supplier.name}`);
    return res.status(201).json(supplier);
  } catch (err) {
    console.error('❌ Failed to store supplier:', err);
    return res.status(500).json({ error: 'Failed to create supplier' });
  }
});

app.get('/api/inventory/transactions', async (req, res) => {
  try {
    const txs = await prisma.inventoryTransaction.findMany({
      include: { rawMaterial: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.json(txs);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/inventory/transactions', async (req, res) => {
  const { rawMaterialId, type, quantity, unitPrice, notes } = req.body;
  try {
    const tx = await prisma.inventoryTransaction.create({
      data: {
        rawMaterialId,
        type: type || 'STOCK_IN',
        quantity: parseFloat(quantity || 0),
        unitPrice: parseFloat(unitPrice || 0),
        notes: notes || '',
      }
    });
    return res.status(201).json(tx);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// 8. Customers API
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
    return res.json(customers);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, mobile, email, address, gstNumber } = req.body;
  if (!name || !mobile) return res.status(400).json({ error: 'Customer name and mobile are required' });
  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const created = await prisma.customer.upsert({
      where: { mobile: mobile.trim() },
      update: { name: name.trim(), email: email || null, address: address || null, gstNumber: gstNumber || null },
      create: {
        businessId: DEMO_BUSINESS_ID,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email || null,
        address: address || null,
        gstNumber: gstNumber || null,
      },
    });
    console.log(`✅ Customer stored in DB: ${created.name} (${created.mobile})`);
    return res.status(201).json(created);
  } catch (err) {
    console.error('❌ Failed to create customer:', err);
    return res.status(400).json({ error: 'Failed to create customer', details: String(err) });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    return res.json({ success: true, id });
  }
});

// 9. Promotions API
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({ where: { isActive: true } });
    return res.json(promotions);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/promotions', async (req, res) => {
  const { name, code, type, discountValue, minOrderValue } = req.body;
  if (!name) return res.status(400).json({ error: 'Promotion name is required' });
  try {
    await prisma.business.upsert({
      where: { id: DEMO_BUSINESS_ID },
      update: {},
      create: { id: DEMO_BUSINESS_ID, name: 'My Business', type: 'RETAIL' }
    });

    const promo = await prisma.promotion.create({
      data: {
        businessId: DEMO_BUSINESS_ID,
        name: name.trim(),
        code: code ? code.trim() : `PROMO-${Date.now().toString().slice(-4)}`,
        type: type || 'PERCENTAGE',
        discountValue: parseFloat(discountValue || 0),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        isActive: true,
      }
    });
    console.log(`✅ Promotion stored in DB: ${promo.name}`);
    return res.status(201).json(promo);
  } catch (err) {
    console.error('❌ Error creating promotion:', err);
    return res.status(500).json({ error: 'Failed to create promotion' });
  }
});

app.delete('/api/promotions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.promotion.delete({ where: { id } });
    return res.json({ success: true, id });
  } catch (err) {
    return res.json({ success: true, id });
  }
});

// 11. Business Template Engine API
import { TemplateResolver } from '../src/lib/templates/templateResolver.js';
import { ALL_BUSINESS_TEMPLATES } from '../src/lib/templates/businessTemplates.js';

app.get('/api/templates', (req, res) => {
  const templates = TemplateResolver.getAllTemplates().map(t => ({
    templateId: t.templateId,
    name: t.name,
    description: t.description,
    industryCategory: t.industryCategory,
    icon: t.icon,
    themeColor: t.themeColor,
    defaultTaxRate: t.taxRules?.defaultTaxRate || 18.0,
    modules: t.modules,
    terms: t.terms,
  }));
  res.json(templates);
});

app.get('/api/templates/:type', (req, res) => {
  const { type } = req.params;
  const template = TemplateResolver.getTemplate((type || 'RESTAURANT').toUpperCase() as any);
  res.json(template);
});

app.get('/api/business/template', async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: DEMO_BUSINESS_ID },
      include: { profileSettings: true, moduleConfig: true },
    });

    const businessType = (business?.type || 'RESTAURANT').toUpperCase() as any;
    const baseTemplate = TemplateResolver.getTemplate(businessType);

    // Apply DB Overrides if available
    const overrides: any = {};
    if (business?.profileSettings) {
      overrides.invoiceLayout = {
        ...baseTemplate.invoiceLayout,
        headerTitle: business.profileSettings.businessName || baseTemplate.invoiceLayout.headerTitle,
        termsText: business.profileSettings.termsText || baseTemplate.invoiceLayout.termsText,
        thankYouNote: business.profileSettings.thankYouNote || baseTemplate.invoiceLayout.thankYouNote,
      };
    }
    if (business?.moduleConfig) {
      overrides.modules = {
        ...baseTemplate.modules,
        enableInventory: business.moduleConfig.enableInventory,
        enableCrm: business.moduleConfig.enableCrm,
        enableReports: business.moduleConfig.enableReports,
      };
    }

    const resolved = TemplateResolver.resolveTemplate(businessType, overrides);
    return res.json({ businessType, template: resolved });
  } catch (err) {
    const base = TemplateResolver.getTemplate('RESTAURANT');
    res.json({ businessType: 'RESTAURANT', template: base });
  }
});

app.put('/api/business/template', async (req, res) => {
  const { businessType, overrides } = req.body;
  try {
    if (businessType) {
      await prisma.business.update({
        where: { id: DEMO_BUSINESS_ID },
        data: { type: businessType.toUpperCase() },
      });
    }
    return res.json({ success: true, businessType, message: `Business vertical switched to ${businessType}` });
  } catch (err) {
    return res.json({ success: true, businessType, message: 'Saved in memory' });
  }
});

// ============================================================
// FEATURE 20 – ATTENDANCE MODULE REST APIs
// ============================================================

// ── In-Memory fallback stores (active when DB tables not yet migrated) ──
let memDepartments: any[] = [
  { id: 'd-001', businessId: DEMO_BUSINESS_ID, branchId: null, name: 'Kitchen', code: 'KIT', description: 'Food production & preparation', managerId: null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd-002', businessId: DEMO_BUSINESS_ID, branchId: null, name: 'Front of House', code: 'FOH', description: 'Service staff & cashiers', managerId: null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'd-003', businessId: DEMO_BUSINESS_ID, branchId: null, name: 'Management', code: 'MGT', description: 'Managers and supervisors', managerId: null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let memDesignations: any[] = [
  { id: 'dsg-001', businessId: DEMO_BUSINESS_ID, departmentId: 'd-001', title: 'Executive Chef', grade: 'L4', salaryBand: '40000-60000', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'dsg-002', businessId: DEMO_BUSINESS_ID, departmentId: 'd-002', title: 'Cashier', grade: 'L1', salaryBand: '18000-25000', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'dsg-003', businessId: DEMO_BUSINESS_ID, departmentId: 'd-003', title: 'General Manager', grade: 'L5', salaryBand: '60000-90000', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let memShifts: any[] = [
  { id: 'sh-001', businessId: DEMO_BUSINESS_ID, branchId: null, name: 'Morning Early Shift', code: 'MES', startTime: '06:00', endTime: '14:00', gracePeriodMinutes: 15, breakDurationMins: 30, workingHours: 8, overtimeThresholdMins: 480, isNightShift: false, daysOfWeek: '1,2,3,4,5', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sh-002', businessId: DEMO_BUSINESS_ID, branchId: null, name: 'General Shift', code: 'GEN', startTime: '09:30', endTime: '18:30', gracePeriodMinutes: 15, breakDurationMins: 60, workingHours: 8, overtimeThresholdMins: 480, isNightShift: false, daysOfWeek: '1,2,3,4,5,6', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sh-003', businessId: DEMO_BUSINESS_ID, branchId: null, name: 'Evening Shift', code: 'EVE', startTime: '14:00', endTime: '22:00', gracePeriodMinutes: 15, breakDurationMins: 30, workingHours: 8, overtimeThresholdMins: 480, isNightShift: false, daysOfWeek: '1,2,3,4,5,6', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let memEmployees: any[] = [
  { id: 'emp-001', businessId: DEMO_BUSINESS_ID, branchId: null, departmentId: 'd-003', designationId: 'dsg-003', shiftId: 'sh-002', employeeCode: 'EMP001', firstName: 'Kowsalya', lastName: 'Sundaram', fullName: 'Kowsalya Sundaram', email: 'kowsalya@business.com', phone: '+91 98765 00001', gender: 'FEMALE', employmentType: 'FULL_TIME', status: 'ACTIVE', role: 'ADMIN', baseSalary: 75000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-002', businessId: DEMO_BUSINESS_ID, branchId: null, departmentId: 'd-001', designationId: 'dsg-001', shiftId: 'sh-001', employeeCode: 'EMP002', firstName: 'Rajesh', lastName: 'Kumar', fullName: 'Chef Rajesh Kumar', email: 'rajesh@business.com', phone: '+91 98765 00002', gender: 'MALE', employmentType: 'FULL_TIME', status: 'ACTIVE', role: 'EMPLOYEE', baseSalary: 55000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-003', businessId: DEMO_BUSINESS_ID, branchId: null, departmentId: 'd-002', designationId: 'dsg-002', shiftId: 'sh-001', employeeCode: 'EMP003', firstName: 'Dinesh', lastName: 'Karthik', fullName: 'Dinesh Karthik', email: 'dinesh@business.com', phone: '+91 98765 00003', gender: 'MALE', employmentType: 'FULL_TIME', status: 'ACTIVE', role: 'EMPLOYEE', baseSalary: 22000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let memAttendances: any[] = [];
let memLeaveRequests: any[] = [];

// ── Helpers ─────────────────────────────────────────────────
function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function todayStr() { return new Date().toISOString().slice(0, 10); }

// ─────────────────────────────────────────────────────────────
// A. DEPARTMENT CRUD
// ─────────────────────────────────────────────────────────────
// GET  /api/attendance/departments
app.get('/api/attendance/departments', async (req, res) => {
  try {
    const rows = await (prisma as any).department.findMany({
      where: { businessId: DEMO_BUSINESS_ID },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch {
    return res.json({ success: true, data: memDepartments, total: memDepartments.length });
  }
});

// POST /api/attendance/departments
app.post('/api/attendance/departments', async (req, res) => {
  const { name, code, description, branchId, managerId } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Department name is required.' });
  const record = { id: uid(), businessId: DEMO_BUSINESS_ID, branchId: branchId || null, name, code: code || null, description: description || null, managerId: managerId || null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  try {
    const created = await (prisma as any).department.create({ data: { ...record, branchId: undefined } });
    return res.status(201).json({ success: true, data: created });
  } catch {
    memDepartments.push(record);
    return res.status(201).json({ success: true, data: record });
  }
});

// PUT /api/attendance/departments/:id
app.put('/api/attendance/departments/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = await (prisma as any).department.update({ where: { id }, data: { ...updates, updatedAt: new Date() } });
    return res.json({ success: true, data: updated });
  } catch {
    const idx = memDepartments.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Department not found.' });
    memDepartments[idx] = { ...memDepartments[idx], ...updates, updatedAt: new Date().toISOString() };
    return res.json({ success: true, data: memDepartments[idx] });
  }
});

// DELETE /api/attendance/departments/:id
app.delete('/api/attendance/departments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await (prisma as any).department.update({ where: { id }, data: { isActive: false, updatedAt: new Date() } });
    return res.json({ success: true, message: 'Department deactivated.' });
  } catch {
    memDepartments = memDepartments.filter(d => d.id !== id);
    return res.json({ success: true, message: 'Department removed.' });
  }
});

// ─────────────────────────────────────────────────────────────
// B. DESIGNATION CRUD
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/designations', async (req, res) => {
  try {
    const rows = await (prisma as any).designation.findMany({ where: { businessId: DEMO_BUSINESS_ID }, orderBy: { title: 'asc' } });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch {
    return res.json({ success: true, data: memDesignations, total: memDesignations.length });
  }
});

app.post('/api/attendance/designations', async (req, res) => {
  const { title, grade, salaryBand, departmentId } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Designation title is required.' });
  const record = { id: uid(), businessId: DEMO_BUSINESS_ID, departmentId: departmentId || null, title, grade: grade || null, salaryBand: salaryBand || null, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  try {
    const created = await (prisma as any).designation.create({ data: record });
    return res.status(201).json({ success: true, data: created });
  } catch {
    memDesignations.push(record);
    return res.status(201).json({ success: true, data: record });
  }
});

app.put('/api/attendance/designations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await (prisma as any).designation.update({ where: { id }, data: { ...req.body, updatedAt: new Date() } });
    return res.json({ success: true, data: updated });
  } catch {
    const idx = memDesignations.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Designation not found.' });
    memDesignations[idx] = { ...memDesignations[idx], ...req.body, updatedAt: new Date().toISOString() };
    return res.json({ success: true, data: memDesignations[idx] });
  }
});

app.delete('/api/attendance/designations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await (prisma as any).designation.update({ where: { id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Designation deactivated.' });
  } catch {
    memDesignations = memDesignations.filter(d => d.id !== id);
    return res.json({ success: true, message: 'Designation removed.' });
  }
});

// ─────────────────────────────────────────────────────────────
// C. SHIFT CRUD
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/shifts', async (req, res) => {
  try {
    const rows = await (prisma as any).shift.findMany({ where: { businessId: DEMO_BUSINESS_ID }, orderBy: { name: 'asc' } });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch {
    return res.json({ success: true, data: memShifts, total: memShifts.length });
  }
});

app.post('/api/attendance/shifts', async (req, res) => {
  const { name, code, startTime, endTime, gracePeriodMinutes, breakDurationMins, workingHours, daysOfWeek, isNightShift, branchId } = req.body;
  if (!name || !startTime || !endTime) return res.status(400).json({ success: false, error: 'name, startTime, endTime are required.' });
  const record = { id: uid(), businessId: DEMO_BUSINESS_ID, branchId: branchId || null, name, code: code || null, startTime, endTime, gracePeriodMinutes: gracePeriodMinutes ?? 15, breakDurationMins: breakDurationMins ?? 60, workingHours: workingHours ?? 8.0, overtimeThresholdMins: 480, isNightShift: isNightShift ?? false, daysOfWeek: daysOfWeek || '1,2,3,4,5', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  try {
    const created = await (prisma as any).shift.create({ data: record });
    return res.status(201).json({ success: true, data: created });
  } catch {
    memShifts.push(record);
    return res.status(201).json({ success: true, data: record });
  }
});

app.put('/api/attendance/shifts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await (prisma as any).shift.update({ where: { id }, data: { ...req.body, updatedAt: new Date() } });
    return res.json({ success: true, data: updated });
  } catch {
    const idx = memShifts.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Shift not found.' });
    memShifts[idx] = { ...memShifts[idx], ...req.body, updatedAt: new Date().toISOString() };
    return res.json({ success: true, data: memShifts[idx] });
  }
});

app.delete('/api/attendance/shifts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await (prisma as any).shift.update({ where: { id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Shift deactivated.' });
  } catch {
    memShifts = memShifts.filter(s => s.id !== id);
    return res.json({ success: true, message: 'Shift removed.' });
  }
});

// ─────────────────────────────────────────────────────────────
// D. EMPLOYEE CRUD
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/employees', async (req, res) => {
  const { status, departmentId, search, page = '1', pageSize = '20' } = req.query as any;
  try {
    const where: any = { businessId: DEMO_BUSINESS_ID };
    if (status && status !== 'ALL') where.status = status;
    if (departmentId && departmentId !== 'ALL') where.departmentId = departmentId;
    if (search) where.OR = [{ firstName: { contains: search } }, { lastName: { contains: search } }, { employeeCode: { contains: search } }];
    const [rows, total] = await Promise.all([
      (prisma as any).employee.findMany({ where, skip: (Number(page) - 1) * Number(pageSize), take: Number(pageSize), orderBy: { firstName: 'asc' }, include: { department: true, designation: true, shift: true } }),
      (prisma as any).employee.count({ where }),
    ]);
    return res.json({ success: true, data: rows, total, page: Number(page), pageSize: Number(pageSize) });
  } catch {
    let list = [...memEmployees];
    if (status && status !== 'ALL') list = list.filter(e => e.status === status);
    if (search) { const q = String(search).toLowerCase(); list = list.filter(e => e.fullName.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q)); }
    return res.json({ success: true, data: list, total: list.length, page: 1, pageSize: list.length });
  }
});

app.get('/api/attendance/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const emp = await (prisma as any).employee.findUnique({ where: { id }, include: { department: true, designation: true, shift: true } });
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found.' });
    return res.json({ success: true, data: emp });
  } catch {
    const emp = memEmployees.find(e => e.id === id);
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found.' });
    return res.json({ success: true, data: emp });
  }
});

app.post('/api/attendance/employees', async (req, res) => {
  const { firstName, lastName, email, phone, departmentId, designationId, shiftId, role, employmentType, baseSalary, gender, branchId } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ success: false, error: 'firstName and lastName are required.' });
  const code = `EMP${String(memEmployees.length + 1).padStart(3, '0')}`;
  const record = { id: uid(), businessId: DEMO_BUSINESS_ID, branchId: branchId || null, departmentId: departmentId || null, designationId: designationId || null, shiftId: shiftId || null, employeeCode: code, firstName, lastName, fullName: `${firstName} ${lastName}`, email: email || null, phone: phone || null, gender: gender || 'MALE', employmentType: employmentType || 'FULL_TIME', status: 'ACTIVE', role: role || 'EMPLOYEE', baseSalary: baseSalary || 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  try {
    const created = await (prisma as any).employee.create({ data: record });
    return res.status(201).json({ success: true, data: created });
  } catch {
    memEmployees.push(record);
    return res.status(201).json({ success: true, data: record });
  }
});

app.put('/api/attendance/employees/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.firstName || updates.lastName) {
    const emp = memEmployees.find(e => e.id === id);
    updates.fullName = `${updates.firstName || emp?.firstName || ''} ${updates.lastName || emp?.lastName || ''}`.trim();
  }
  try {
    const updated = await (prisma as any).employee.update({ where: { id }, data: { ...updates, updatedAt: new Date() } });
    return res.json({ success: true, data: updated });
  } catch {
    const idx = memEmployees.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Employee not found.' });
    memEmployees[idx] = { ...memEmployees[idx], ...updates, updatedAt: new Date().toISOString() };
    return res.json({ success: true, data: memEmployees[idx] });
  }
});

app.delete('/api/attendance/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await (prisma as any).employee.update({ where: { id }, data: { status: 'TERMINATED', updatedAt: new Date() } });
    return res.json({ success: true, message: 'Employee terminated.' });
  } catch {
    const idx = memEmployees.findIndex(e => e.id === id);
    if (idx !== -1) memEmployees[idx].status = 'TERMINATED';
    return res.json({ success: true, message: 'Employee status set to TERMINATED.' });
  }
});

// ─────────────────────────────────────────────────────────────
// E. LOCATION VALIDATION (Geofence Check)
// POST /api/attendance/validate-location
// Body: { lat, lon, officeLocationId? }
// Returns: { allowed, distanceM, message }
// ─────────────────────────────────────────────────────────────
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (v: number) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DEMO_OFFICE = { lat: 13.0827, lon: 80.2707, radius: 100 }; // Chennai demo coordinates

app.post('/api/attendance/validate-location', async (req, res) => {
  const { lat, lon, officeLocationId } = req.body;
  if (lat === undefined || lon === undefined) return res.status(400).json({ success: false, error: 'lat and lon are required.' });

  let officeLat = DEMO_OFFICE.lat;
  let officeLon = DEMO_OFFICE.lon;
  let allowedRadius = DEMO_OFFICE.radius;
  let officeName = 'Head Office';

  try {
    if (officeLocationId) {
      const office = await (prisma as any).officeLocation.findUnique({ where: { id: officeLocationId } });
      if (office) { officeLat = office.latitude; officeLon = office.longitude; allowedRadius = office.allowedRadius; officeName = office.officeName; }
    } else {
      const office = await (prisma as any).officeLocation.findFirst({ where: { businessId: DEMO_BUSINESS_ID, isActive: true } });
      if (office) { officeLat = office.latitude; officeLon = office.longitude; allowedRadius = office.allowedRadius; officeName = office.officeName; }
    }
  } catch { /* use demo defaults */ }

  const distanceM = Math.round(haversineDistance(Number(lat), Number(lon), officeLat, officeLon));
  const allowed = distanceM <= allowedRadius;

  return res.json({
    success: true,
    allowed,
    distanceM,
    allowedRadius,
    officeName,
    message: allowed
      ? `You are within ${officeName} (${distanceM}m from office).`
      : `You are outside office premises. You are ${distanceM}m away from ${officeName} (allowed radius: ${allowedRadius}m).`,
  });
});

// ─────────────────────────────────────────────────────────────
// F. PUNCH IN
// POST /api/attendance/punch-in
// Body: { employeeId, lat, lon, accuracy, deviceInfo, browser, ipAddress, officeLocationId? }
// ─────────────────────────────────────────────────────────────
app.post('/api/attendance/punch-in', async (req, res) => {
  const { employeeId, lat, lon, accuracy, deviceInfo, browser, ipAddress, officeLocationId } = req.body;
  if (!employeeId) return res.status(400).json({ success: false, error: 'employeeId is required.' });
  if (lat === undefined || lon === undefined) return res.status(400).json({ success: false, error: 'GPS coordinates (lat, lon) are required.' });

  // Geofence validation
  const distanceM = Math.round(haversineDistance(Number(lat), Number(lon), DEMO_OFFICE.lat, DEMO_OFFICE.lon));
  const withinGeofence = distanceM <= DEMO_OFFICE.radius;

  // Check for existing punch-in today
  const todayDate = todayStr();
  const existing = memAttendances.find(a => a.employeeId === employeeId && a.attendanceDate === todayDate);
  if (existing?.punchInTime) {
    return res.status(409).json({ success: false, error: 'Employee has already punched in today.' });
  }

  const record = {
    id: uid(),
    businessId: DEMO_BUSINESS_ID,
    employeeId,
    attendanceDate: todayDate,
    punchInTime: new Date().toISOString(),
    punchOutTime: null,
    punchInLatitude: Number(lat),
    punchInLongitude: Number(lon),
    status: 'PRESENT',
    grossWorkMinutes: 0,
    breakMinutes: 0,
    netWorkMinutes: 0,
    overtimeMinutes: 0,
    lateMinutes: 0,
    isManualEntry: false,
    punchInDeviceInfo: JSON.stringify({ browser, deviceInfo, ipAddress, accuracy }),
    distanceFromOfficeM: distanceM,
    isWithinGeofence: withinGeofence,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await (prisma as any).attendance.create({
      data: {
        id: record.id, businessId: record.businessId, employeeId, attendanceDate: new Date(todayDate),
        punchInTime: new Date(), status: 'PRESENT', punchInLatitude: Number(lat), punchInLongitude: Number(lon),
        punchInDeviceInfo: record.punchInDeviceInfo,
      }
    });
  } catch { /* store in memory */ }

  memAttendances = memAttendances.filter(a => !(a.employeeId === employeeId && a.attendanceDate === todayDate));
  memAttendances.push(record);

  return res.status(201).json({ success: true, data: record, geofence: { distanceM, withinGeofence, allowedRadius: DEMO_OFFICE.radius } });
});

// ─────────────────────────────────────────────────────────────
// G. PUNCH OUT
// POST /api/attendance/punch-out
// Body: { employeeId, lat, lon, accuracy, deviceInfo, browser, ipAddress }
// ─────────────────────────────────────────────────────────────
app.post('/api/attendance/punch-out', async (req, res) => {
  const { employeeId, lat, lon, accuracy, deviceInfo, browser, ipAddress } = req.body;
  if (!employeeId) return res.status(400).json({ success: false, error: 'employeeId is required.' });

  const todayDate = todayStr();
  const attendance = memAttendances.find(a => a.employeeId === employeeId && a.attendanceDate === todayDate);

  if (!attendance?.punchInTime) {
    return res.status(400).json({ success: false, error: 'No punch-in found for today. Please punch in first.' });
  }
  if (attendance?.punchOutTime) {
    return res.status(409).json({ success: false, error: 'Employee has already punched out today.' });
  }

  const punchInMs = new Date(attendance.punchInTime).getTime();
  const punchOutMs = Date.now();
  const grossWorkMinutes = Math.round((punchOutMs - punchInMs) / 60000);
  const netWorkMinutes = Math.max(0, grossWorkMinutes - (attendance.breakMinutes || 0));
  const standardMinutes = 480; // 8h
  const overtimeMinutes = Math.max(0, netWorkMinutes - standardMinutes);

  attendance.punchOutTime = new Date().toISOString();
  attendance.punchOutLatitude = lat ? Number(lat) : null;
  attendance.punchOutLongitude = lon ? Number(lon) : null;
  attendance.punchOutDeviceInfo = JSON.stringify({ browser, deviceInfo, ipAddress, accuracy });
  attendance.grossWorkMinutes = grossWorkMinutes;
  attendance.netWorkMinutes = netWorkMinutes;
  attendance.overtimeMinutes = overtimeMinutes;
  attendance.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).attendance.updateMany({
      where: { employeeId, attendanceDate: { gte: new Date(`${todayDate}T00:00:00`), lt: new Date(`${todayDate}T23:59:59`) } },
      data: { punchOutTime: new Date(), grossWorkMinutes, netWorkMinutes, overtimeMinutes, punchOutLatitude: lat ? Number(lat) : null, punchOutLongitude: lon ? Number(lon) : null, updatedAt: new Date() }
    });
  } catch { /* updated in memory */ }

  return res.json({
    success: true,
    data: attendance,
    summary: {
      grossWorkMinutes,
      netWorkMinutes,
      overtimeMinutes,
      breakMinutes: attendance.breakMinutes || 0,
      workedHoursFormatted: `${Math.floor(netWorkMinutes / 60)}h ${netWorkMinutes % 60}m`,
    }
  });
});

// ─────────────────────────────────────────────────────────────
// H. TODAY'S ATTENDANCE STATUS
// GET /api/attendance/today?employeeId=xxx
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/today', async (req, res) => {
  const { employeeId } = req.query as any;
  const todayDate = todayStr();

  if (employeeId) {
    const record = memAttendances.find(a => a.employeeId === employeeId && a.attendanceDate === todayDate);
    return res.json({ success: true, data: record || null, date: todayDate });
  }

  const todayAll = memAttendances.filter(a => a.attendanceDate === todayDate);
  return res.json({ success: true, data: todayAll, total: todayAll.length, date: todayDate });
});

// GET /api/attendance?employeeId=&startDate=&endDate=&status=
app.get('/api/attendance', async (req, res) => {
  const { employeeId, startDate, endDate, status } = req.query as any;
  let list = [...memAttendances];
  if (employeeId && employeeId !== 'ALL') list = list.filter(a => a.employeeId === employeeId);
  if (status && status !== 'ALL') list = list.filter(a => a.status === status);
  if (startDate) list = list.filter(a => a.attendanceDate >= startDate);
  if (endDate) list = list.filter(a => a.attendanceDate <= endDate);
  return res.json({ success: true, data: list.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate)), total: list.length });
});

// ─────────────────────────────────────────────────────────────
// I. LEAVE MANAGEMENT
// POST /api/attendance/leave/apply
// GET  /api/attendance/leave?employeeId=&status=
// PUT  /api/attendance/leave/:id/approve
// PUT  /api/attendance/leave/:id/reject
// DELETE /api/attendance/leave/:id
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/leave', async (req, res) => {
  const { employeeId, status } = req.query as any;
  let list = [...memLeaveRequests];
  if (employeeId && employeeId !== 'ALL') list = list.filter(l => l.employeeId === employeeId);
  if (status && status !== 'ALL') list = list.filter(l => l.status === status);
  return res.json({ success: true, data: list.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)), total: list.length });
});

app.post('/api/attendance/leave/apply', async (req, res) => {
  const { employeeId, leaveTypeId, leaveTypeName, startDate, endDate, totalDays, reason, isHalfDay, halfDaySession } = req.body;
  if (!employeeId || !startDate || !endDate) return res.status(400).json({ success: false, error: 'employeeId, startDate, endDate are required.' });

  const record = { id: uid(), businessId: DEMO_BUSINESS_ID, employeeId, leaveTypeId: leaveTypeId || 'lt-cl', leaveTypeName: leaveTypeName || 'Casual Leave', startDate, endDate, totalDays: totalDays || 1, isHalfDay: isHalfDay || false, halfDaySession: halfDaySession || null, reason: reason || null, status: 'PENDING', appliedAt: new Date().toISOString(), approvedBy: null, approvedAt: null, rejectionReason: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

  try {
    await (prisma as any).leaveRequest.create({ data: { ...record, startDate: new Date(startDate), endDate: new Date(endDate), appliedAt: new Date() } });
  } catch { /* memory */ }

  memLeaveRequests.push(record);
  return res.status(201).json({ success: true, data: record, message: 'Leave application submitted successfully.' });
});

// PUT /api/attendance/leave/:id/approve
app.put('/api/attendance/leave/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { approvedBy } = req.body;
  const record = memLeaveRequests.find(l => l.id === id);
  if (!record) return res.status(404).json({ success: false, error: 'Leave request not found.' });
  if (record.status !== 'PENDING') return res.status(400).json({ success: false, error: `Cannot approve a leave that is already ${record.status}.` });

  record.status = 'APPROVED';
  record.approvedBy = approvedBy || 'Manager';
  record.approvedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).leaveRequest.update({ where: { id }, data: { status: 'APPROVED', approvedBy: record.approvedBy, approvedAt: new Date() } });
  } catch { /* memory */ }

  return res.json({ success: true, data: record, message: 'Leave approved successfully.' });
});

// PUT /api/attendance/leave/:id/reject
app.put('/api/attendance/leave/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { rejectedBy, rejectionReason } = req.body;
  const record = memLeaveRequests.find(l => l.id === id);
  if (!record) return res.status(404).json({ success: false, error: 'Leave request not found.' });
  if (record.status !== 'PENDING') return res.status(400).json({ success: false, error: `Cannot reject a leave that is already ${record.status}.` });

  record.status = 'REJECTED';
  record.approvedBy = rejectedBy || 'Manager';
  record.rejectionReason = rejectionReason || 'Operational requirements';
  record.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).leaveRequest.update({ where: { id }, data: { status: 'REJECTED', approvedBy: rejectedBy || 'Manager', rejectionReason: record.rejectionReason } });
  } catch { /* memory */ }

  return res.json({ success: true, data: record, message: 'Leave rejected.' });
});

app.delete('/api/attendance/leave/:id', async (req, res) => {
  const { id } = req.params;
  const record = memLeaveRequests.find(l => l.id === id);
  if (!record) return res.status(404).json({ success: false, error: 'Leave request not found.' });
  if (record.status === 'APPROVED') return res.status(400).json({ success: false, error: 'Cannot cancel an already approved leave. Contact HR.' });
  record.status = 'CANCELLED';
  return res.json({ success: true, message: 'Leave request cancelled.' });
});

// ─────────────────────────────────────────────────────────────
// J. ATTENDANCE REPORTS
// GET /api/attendance/reports/daily?date=YYYY-MM-DD
// GET /api/attendance/reports/monthly?year=2026&month=8&employeeId=
// GET /api/attendance/reports/summary
// ─────────────────────────────────────────────────────────────
app.get('/api/attendance/reports/daily', (req, res) => {
  const date = String(req.query.date || todayStr());
  const records = memAttendances.filter(a => a.attendanceDate === date);
  const empIds = [...new Set(records.map((a: any) => a.employeeId))];
  const summary = {
    date,
    totalEmployees: memEmployees.length,
    present: records.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length,
    absent: memEmployees.length - records.length,
    late: records.filter(a => a.lateMinutes > 0).length,
    onLeave: memLeaveRequests.filter(l => l.status === 'APPROVED' && l.startDate <= date && l.endDate >= date).length,
    totalWorkMinutes: records.reduce((s: number, a: any) => s + (a.netWorkMinutes || 0), 0),
  };
  return res.json({ success: true, summary, records, date });
});

app.get('/api/attendance/reports/monthly', (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  const month = Number(req.query.month || new Date().getMonth() + 1);
  const empId = req.query.employeeId as string;
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  let records = memAttendances.filter(a => a.attendanceDate.startsWith(prefix));
  if (empId && empId !== 'ALL') records = records.filter(a => a.employeeId === empId);
  const workingDays = 26;
  const presentDays = records.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length;
  const totalMinutes = records.reduce((s: number, a: any) => s + (a.netWorkMinutes || 0), 0);
  return res.json({ success: true, year, month, records, summary: { workingDays, presentDays, absentDays: workingDays - presentDays, totalNetWorkMinutes: totalMinutes, attendancePct: workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0 } });
});

app.get('/api/attendance/reports/summary', (_req, res) => {
  const todayDate = todayStr();
  const todayRecords = memAttendances.filter(a => a.attendanceDate === todayDate);
  const activeEmps = memEmployees.filter(e => e.status === 'ACTIVE').length;
  const presentToday = todayRecords.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length;
  const lateToday = todayRecords.filter(a => a.lateMinutes > 0).length;
  const pendingLeaves = memLeaveRequests.filter(l => l.status === 'PENDING').length;
  return res.json({ success: true, summary: { totalActiveEmployees: activeEmps, presentToday, absentToday: activeEmps - presentToday, lateToday, pendingLeaveRequests: pendingLeaves, date: todayDate } });
});

// ─────────────────────────────────────────────────────────────
// K. ATTENDANCE SETTINGS
// GET  /api/attendance/settings
// PUT  /api/attendance/settings
// ─────────────────────────────────────────────────────────────
let memAttendanceSettings: any = { enableGeofence: true, defaultGeofenceRadiusM: 100, allowWfhPunch: true, enableOvertime: true, overtimeMultiplier: 1.5, enableAutoAbsentMark: true, autoAbsentAfterMins: 60, enableMissedPunchAlert: true, missedPunchAlertMins: 30, enableLateAlert: true, enableAbsentAlert: true, enableLeaveNotification: true, weekOffDays: '0,6', workingHoursPerDay: 8.0, gracePeriodMins: 15 };

app.get('/api/attendance/settings', async (_req, res) => {
  try {
    const s = await (prisma as any).attendanceSettings.findFirst({ where: { businessId: DEMO_BUSINESS_ID } });
    if (s) return res.json({ success: true, data: s });
  } catch { /* memory */ }
  return res.json({ success: true, data: memAttendanceSettings });
});

app.put('/api/attendance/settings', async (req, res) => {
  memAttendanceSettings = { ...memAttendanceSettings, ...req.body };
  try {
    await (prisma as any).attendanceSettings.upsert({ where: { businessId: DEMO_BUSINESS_ID }, update: { ...req.body, updatedAt: new Date() }, create: { businessId: DEMO_BUSINESS_ID, ...memAttendanceSettings, updatedAt: new Date() } });
  } catch { /* memory */ }
  return res.json({ success: true, data: memAttendanceSettings, message: 'Attendance settings updated.' });
});

// ─────────────────────────────────────────────────────────────
// END OF FEATURE 20 ATTENDANCE APIs
// ─────────────────────────────────────────────────────────────

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`⚡ Multi-Business Billing Backend API running on http://localhost:${PORT}`);
  });
}

export default app;
