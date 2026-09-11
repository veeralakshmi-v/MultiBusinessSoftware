import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Settings, LogOut, Receipt, Package,
  Boxes, BarChart3, ChevronLeft, ChevronRight, Menu, X, Globe,
  PanelLeftClose, PanelLeftOpen, Store, Layers, Sparkles, ClipboardList, ShieldAlert, Palette, ShieldCheck, Crown
} from 'lucide-react';

import { cn } from '../lib/utils';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { ThemeEngine } from '../lib/theme/themeEngine';

export default function DashboardLayout() {
  const { user, logout, businessProfile, isSuperAdmin, activeTenant } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [, setThemeVersion] = useState(0);

  // Auto-close mobile menu on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleThemeChange = () => {
      ThemeEngine.applyTheme(ThemeEngine.getThemeConfig());
      setThemeVersion(v => v + 1);
    };
    handleThemeChange();
    window.addEventListener('theme_changed', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('theme_changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);



  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const brandTitle = businessProfile.businessName || "My Business";
  const brandTagline = businessProfile.tagline || "Universal Billing System";

  // Role-Based Access Helper
  const isRouteAllowedForRole = (role: string, href: string): boolean => {
    if (!role || role === 'ADMIN' || role === 'SUPER_ADMIN' || user?.username === 'superadmin' || user?.username === 'admin') return true;

    // Check custom applicationAccess permissions if set for the employee
    const appAccess = user?.applicationAccess;
    if (appAccess && appAccess.trim().length > 0) {
      if (appAccess.includes('Full Access') || appAccess.includes('ALL_MODULES') || appAccess.includes('All Modules') || appAccess.includes('Super Admin')) {
        return true;
      }
      if (appAccess.includes('No Access')) {
        return href === '/dashboard';
      }

      const routeMenuMap: Record<string, string[]> = {
        '/dashboard': ['Dashboard'],
        '/dashboard/billing': ['Billing POS', 'POS'],
        '/dashboard/items': ['Categories & Items', 'Products & Inventory', 'Catalog', 'Menu'],
        '/dashboard/menu': ['Categories & Items', 'Products & Inventory', 'Catalog', 'Menu'],
        '/dashboard/inventory': ['Inventory', 'Products & Inventory', 'Categories & Items'],
        '/dashboard/reports': ['Sales Reports', 'Reports'],
        '/dashboard/employees': ['Employee Details', 'Staff'],
        '/dashboard/attendance': ['Staff Attendance', 'Attendance'],
        '/dashboard/customers': ['Customers', 'CRM'],
        '/dashboard/settings': ['Settings'],
        '/dashboard/website': ['My Website'],
      };

      const allowedItems = appAccess.split(',').map(s => s.trim().toLowerCase());
      const mappedNames = routeMenuMap[href] || [];
      const isAllowed = mappedNames.some(name => allowedItems.includes(name.toLowerCase()));

      // STRICT: When custom applicationAccess permissions are configured, ONLY allow explicitly selected modules.
      // Do NOT fall through to generic role defaults (like MANAGER allowing all routes).
      return isAllowed;
    }

    if (role === 'MANAGER') {
      return href !== '/dashboard/settings' && href !== '/dashboard/employees';
    }

    if (role === 'CASHIER') {
      return href === '/dashboard/billing' || href === '/dashboard/customers' || href === '/dashboard/attendance' || href === '/dashboard';
    }

    if (role === 'STAFF') {
      return href === '/dashboard/attendance' || href === '/dashboard';
    }

    return true;
  };


  // Streamlined, universal navigation for all businesses
  const allNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Billing POS',
      href: '/dashboard/billing',
      icon: Receipt,
    },
    {
      name: 'Products & Inventory',
      href: '/dashboard/inventory',
      icon: Boxes,
    },
    {
      name: 'Sales Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
    },
    {
      name: 'Employee Details',
      href: '/dashboard/employees',
      icon: Users,
    },
    {
      name: 'Staff Attendance',
      href: '/dashboard/attendance',
      icon: ClipboardList,
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      name: 'My Website',
      href: '/dashboard/website',
      icon: Globe,
    },
  ];

  const navigation = allNavigation.filter(item => isRouteAllowedForRole(user.role, item.href));
  const isCurrentRouteAllowed = isRouteAllowedForRole(user.role, location.pathname);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-hidden">
      {/* Collapsible Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-20 flex-shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-gray-200 bg-white transition-all px-4 justify-between")}>
          <div className="flex items-center truncate">
            <div className="w-10 h-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
              {brandTitle.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <h1 className="font-serif font-bold text-sm tracking-tight text-gray-900 truncate">
                  {brandTitle}
                </h1>
                <span className="text-[10px] text-[#2563EB] font-bold tracking-wider uppercase truncate block">
                  {brandTagline}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 text-[#2563EB]" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3 no-scrollbar">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href)) ||
                (item.href === '/dashboard/items' && location.pathname === '/dashboard/menu');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    'flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-150 relative group',
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive
                      ? 'border-l-4 shadow-xs font-bold bg-blue-50 text-[#2563EB] border-[#2563EB]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isCollapsed ? '' : 'mr-3',
                      isActive ? 'text-[#2563EB]' : 'text-gray-400 group-hover:text-gray-700'
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && (
                    <span className="truncate font-semibold">{item.name}</span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-lg shadow-xl border border-gray-200 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Super Admin Control Center Link (if Super Admin role) */}
            {isSuperAdmin && (
              <Link
                to="/super-admin"
                title={isCollapsed ? "Super Admin Portal" : undefined}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all duration-150 relative group mt-3',
                  isCollapsed ? "justify-center" : "justify-start",
                  'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-900 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-300'
                )}
              >
                <ShieldCheck className={cn('h-5 w-5 flex-shrink-0 text-amber-600', isCollapsed ? '' : 'mr-3')} />
                {!isCollapsed && <span className="truncate">Super Admin</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Super Admin Portal
                  </div>
                )}
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          {activeTenant && !isCollapsed && (
            <div className="px-3 py-2 mb-1 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div className="truncate">
                <p className="text-[10px] uppercase font-bold text-gray-400">Current Plan</p>
                <p className="text-xs font-bold text-gray-800">{activeTenant.subscription?.plan || 'GROWTH'}</p>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md bg-emerald-100 text-emerald-800">
                {activeTenant.subscription?.status || activeTenant.status || 'ACTIVE'}
              </span>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center w-full px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors mb-1",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isCollapsed && <span className="uppercase tracking-wider text-[10px]">Sidebar View</span>}
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" /> : <PanelLeftClose className="w-4 h-4 opacity-75" />}
          </button>

          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-red-50 text-red-600 transition-colors",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5 flex-shrink-0 text-red-500", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Hamburger Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-72 h-full border-r border-gray-200 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-[#2563EB] text-white rounded-xl flex items-center justify-center font-bold text-lg mr-3 shadow-sm">
                    {brandTitle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-sm text-gray-900 tracking-tight">{brandTitle}</h2>
                    <span className="text-[10px] text-[#2563EB] font-bold block uppercase">{brandTagline}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href)) ||
                    (item.href === '/dashboard/items' && location.pathname === '/dashboard/menu');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center px-3.5 py-3 text-xs font-bold rounded-xl transition-all',
                        isActive
                          ? 'bg-blue-50 text-[#2563EB] border-l-4 border-[#2563EB]'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 mr-3', isActive ? 'text-[#2563EB]' : 'text-gray-400')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">{user.username}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{user.role}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="flex items-center justify-center w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors gap-2"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span>Logout Account</span>
              </button>
            </div>
          </div>

          {/* Backdrop Click */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-5 lg:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
            {/* Mobile Hamburger & Logo */}
            <div className="flex items-center md:hidden min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 bg-gray-100 border border-gray-200 mr-2 flex-shrink-0"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-[#2563EB]" />
              </button>
              <div className="w-8 h-8 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-bold text-lg mr-2 flex-shrink-0">
                {brandTitle.charAt(0).toUpperCase()}
              </div>
              <h1 className="font-serif font-bold text-xs sm:text-sm tracking-tight text-gray-900 truncate max-w-[90px] xs:max-w-[140px] sm:max-w-xs">{brandTitle}</h1>
            </div>

            {/* Desktop Sidebar Toggle in Top Bar */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center gap-2 p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#2563EB]" /> : <PanelLeftClose className="w-4 h-4" />}
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 truncate max-w-xs">
                {brandTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Quick Super Admin Button (if Super Admin role) */}
            {isSuperAdmin && (
              <Link
                to="/super-admin"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                title="Super Admin SaaS Control Center"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Super Admin</span>
              </Link>
            )}

            {/* Quick Theme Customizer Button */}
            <Link
              to="/dashboard/settings?tab=theme"
              state={{ tab: 'theme' }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 text-xs font-bold rounded-xl transition-all"
              title="Change Application Theme & Color Palette"
            >
              <Palette className="w-4 h-4 text-[#2563EB]" />
              <span className="hidden sm:inline">Theme</span>
            </Link>

            {/* Quick Open Website Button */}
            <Link
              to="/website"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 text-xs font-bold rounded-xl transition-all"
              title="Open Live Public Website / Storefront"
            >
              <Globe className="w-4 h-4 text-[#2563EB]" />
              <span className="hidden sm:inline">Open Website</span>
            </Link>

            {/* Quick POS Shortcut */}
            {isRouteAllowedForRole(user.role, '/dashboard/billing') && location.pathname !== '/dashboard/billing' && location.pathname !== '/billing' && (
              <Link
                to="/dashboard/billing"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Open POS</span>
              </Link>
            )}

            {/* Notification Center */}
            <NotificationCenter />

            {/* User Badge */}
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 bg-gray-100 rounded-xl border border-gray-200">
              <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white shadow-xs flex-shrink-0">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col pr-1">
                <span className="text-xs font-bold text-gray-900 leading-none">{user.username}</span>
                <span className="text-[10px] text-gray-500 uppercase mt-0.5">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={cn("flex-1 bg-[#F8FAFC]", location.pathname === '/billing' ? "p-1.5 sm:p-3 overflow-hidden flex flex-col h-[calc(100vh-64px)]" : "p-2.5 sm:p-5 lg:p-8 overflow-y-auto")}>
          <div className={cn("w-full h-full flex flex-col flex-1 min-w-0", location.pathname === '/billing' ? "overflow-hidden" : "mx-auto max-w-7xl")}>
            {isCurrentRouteAllowed ? (
              <Outlet />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-gray-200 rounded-2xl shadow-xl space-y-4 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h2 className="text-xl font-bold text-gray-900 font-serif">Access Restricted ({user.role})</h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your assigned role <span className="font-mono text-[#2563EB] font-bold">{user.role}</span> does not have permission to access <span className="font-mono text-gray-900">{location.pathname}</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to={navigation[0]?.href || '/dashboard/billing'}
                    className="px-5 py-2.5 bg-[#2563EB] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1D4ED8] transition-all inline-flex items-center gap-2"
                  >
                    <span>Go to Authorized Section</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

