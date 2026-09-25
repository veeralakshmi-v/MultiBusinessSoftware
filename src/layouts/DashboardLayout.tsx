import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Settings, LogOut, Receipt, Package,
  Boxes, BarChart3, ChevronLeft, ChevronRight, Menu, X, Globe,
  PanelLeftClose, PanelLeftOpen, Store, Layers, Sparkles, ClipboardList, ShieldAlert, Palette, ShieldCheck, Crown, UserCircle
} from 'lucide-react';

import { cn } from '../lib/utils';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { ThemeEngine } from '../lib/theme/themeEngine';
import { TenantEngine } from '../lib/tenant/tenantEngine';
import { isRouteAllowed } from '../App';

export default function DashboardLayout() {
  const { user: authUser, logout, businessProfile, activeTenant, tenants } = useAuth();
  const location = useLocation();

  const user = useMemo(() => {
    if (authUser) return authUser;
    try {
      const emp = JSON.parse(localStorage.getItem('employee_session') || '{}');
      if (emp && emp.id) {
        return {
          id: emp.id,
          name: emp.name,
          fullName: emp.name,
          username: emp.username || emp.phone,
          role: emp.role || 'STAFF',
          businessId: emp.businessId || localStorage.getItem('businessId') || '',
          applicationAccess: emp.applicationAccess || 'Full Access (All Modules & POS)',
        };
      }
    } catch { }
    return { id: '', username: '', role: 'STAFF' };
  }, [authUser]);

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
    const handleThemeChange = (e?: Event) => {
      if (e && e.type === 'storage') {
        const se = e as StorageEvent;
        if (se.key && !se.key.includes('theme')) return;
      }
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

  if (!user || (!user.id && !user.username)) {
    return <Navigate to="/login" replace />;
  }

  const allTenants = tenants && tenants.length > 0 ? tenants : TenantEngine.getTenants();
  const effectiveTenant = activeTenant || TenantEngine.getTenantById(user?.businessId || localStorage.getItem('businessId') || '') || (allTenants.length > 0 ? allTenants[0] : null);
  const brandTitle = effectiveTenant?.businessName || (businessProfile.businessName !== 'My Business' ? businessProfile.businessName : (effectiveTenant?.businessName || "My Business"));
  const brandTagline = (effectiveTenant ? `${effectiveTenant.businessType} Management POS` : null) || businessProfile.tagline || "Universal Billing System";

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

  const navigation = allNavigation.filter(item => isRouteAllowed(user, item.href));
  const isCurrentRouteAllowed = isRouteAllowed(user, location.pathname);

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-bg-primary)',
        color: 'var(--theme-text-primary)',
        fontFamily: 'var(--theme-font, inherit)'
      }}
    >
      {/* Collapsible Sidebar */}
      <aside
        className={cn(
          "flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-20 flex-shrink-0 border-r",
          isCollapsed ? "w-20" : "w-64"
        )}
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'var(--theme-border-tint)'
        }}
      >
        {/* Brand Header */}
        <div
          className={cn("h-20 flex items-center border-b transition-all px-4 justify-between")}
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border-tint)'
          }}
        >
          <div className="flex items-center truncate">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                color: 'var(--theme-btn-text)'
              }}
            >
              {brandTitle.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <h1
                  className="font-bold text-sm tracking-tight truncate"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {brandTitle}
                </h1>
                <span
                  className="text-[10px] font-bold tracking-wider uppercase truncate block"
                  style={{ color: 'var(--theme-text-accent)' }}
                >
                  {brandTagline}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" style={{ color: 'var(--theme-text-accent)' }} /> : <ChevronLeft className="w-5 h-5" />}
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
                      ? 'border-l-4 shadow-xs font-bold'
                      : 'opacity-80 hover:opacity-100 hover:bg-black/5'
                  )}
                  style={isActive ? {
                    backgroundColor: 'rgba(var(--theme-btn-secondary-rgb, 37, 99, 235), 0.12)',
                    color: 'var(--theme-text-accent)',
                    borderLeftColor: 'var(--theme-btn-secondary)'
                  } : {
                    color: 'var(--theme-text-primary)'
                  }}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isCollapsed ? '' : 'mr-3'
                    )}
                    style={{
                      color: isActive ? 'var(--theme-text-accent)' : 'inherit',
                      opacity: isActive ? 1 : 0.65
                    }}
                    aria-hidden="true"
                  />
                  {!isCollapsed && (
                    <span className="truncate font-semibold">{item.name}</span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div
                      className="absolute left-full ml-3 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xl border whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                      style={{
                        backgroundColor: 'var(--theme-bg-surface)',
                        color: 'var(--theme-text-primary)',
                        borderColor: 'var(--theme-border-tint)'
                      }}
                    >
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div
          className="p-3 border-t space-y-1"
          style={{ borderColor: 'var(--theme-border-tint)' }}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center w-full px-3 py-2 text-xs font-bold opacity-75 hover:opacity-100 hover:bg-black/5 rounded-xl transition-colors mb-1 cursor-pointer",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isCollapsed && <span className="uppercase tracking-wider text-[10px]">Sidebar View</span>}
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" style={{ color: 'var(--theme-text-accent)' }} /> : <PanelLeftClose className="w-4 h-4 opacity-75" />}
          </button>

          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer",
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
          <div
            className="w-72 h-full border-r p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left"
            style={{
              backgroundColor: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border-tint)',
              color: 'var(--theme-text-primary)'
            }}
          >
            {/* Drawer Header */}
            <div>
              <div
                className="flex items-center justify-between border-b pb-4 mb-4"
                style={{ borderColor: 'var(--theme-border-tint)' }}
              >
                <div className="flex items-center">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg mr-3 shadow-sm"
                    style={{
                      backgroundColor: 'var(--theme-btn-secondary)',
                      color: 'var(--theme-btn-text)'
                    }}
                  >
                    {brandTitle.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm tracking-tight">{brandTitle}</h2>
                    <span
                      className="text-[10px] font-bold block uppercase"
                      style={{ color: 'var(--theme-text-accent)' }}
                    >
                      {brandTagline}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5"
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
                          ? 'border-l-4 shadow-xs font-bold'
                          : 'opacity-80 hover:opacity-100 hover:bg-black/5'
                      )}
                      style={isActive ? {
                        backgroundColor: 'rgba(var(--theme-btn-secondary-rgb, 37, 99, 235), 0.12)',
                        color: 'var(--theme-text-accent)',
                        borderLeftColor: 'var(--theme-btn-secondary)'
                      } : {
                        color: 'var(--theme-text-primary)'
                      }}
                    >
                      <Icon className={cn('h-4 w-4 mr-3')} style={{ color: isActive ? 'var(--theme-text-accent)' : 'inherit' }} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div
              className="border-t pt-4 space-y-3"
              style={{ borderColor: 'var(--theme-border-tint)' }}
            >
              <div
                className="flex items-center justify-between p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--theme-bg-primary)',
                  borderColor: 'var(--theme-border-tint)'
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                    style={{
                      backgroundColor: 'var(--theme-btn-secondary)',
                      color: 'var(--theme-btn-text)'
                    }}
                  >
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{user.username}</div>
                    <div className="text-[10px] opacity-70 uppercase">{user.role}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="flex items-center justify-center w-full px-3 py-2.5 text-xs font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors gap-2 cursor-pointer"
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
        <header
          className="h-16 border-b flex items-center justify-between px-3 sm:px-5 lg:px-8 z-30 flex-shrink-0 gap-3 relative overflow-visible flex-nowrap"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border-tint)',
            color: 'var(--theme-text-primary)'
          }}
        >
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Mobile Hamburger & Logo */}
            <div className="flex items-center md:hidden flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl opacity-80 hover:opacity-100 bg-black/5 border mr-2 flex-shrink-0"
                style={{ borderColor: 'var(--theme-border-tint)' }}
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" style={{ color: 'var(--theme-text-accent)' }} />
              </button>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg mr-2 flex-shrink-0"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-btn-text)'
                }}
              >
                {brandTitle.charAt(0).toUpperCase()}
              </div>
              <h1 className="font-bold text-xs sm:text-sm tracking-tight truncate max-w-[90px] xs:max-w-[140px] sm:max-w-xs">{brandTitle}</h1>
            </div>

            {/* Desktop Sidebar Toggle in Top Bar */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center gap-2 p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 border transition-all cursor-pointer flex-shrink-0"
              style={{ borderColor: 'var(--theme-border-tint)' }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" style={{ color: 'var(--theme-text-accent)' }} /> : <PanelLeftClose className="w-4 h-4" />}
              <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-medium opacity-70 truncate max-w-xs">
                {brandTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 ml-auto">
            {/* Quick Theme Customizer Button */}
            <Link
              to="/dashboard/settings?tab=theme"
              state={{ tab: 'theme' }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border text-xs font-bold rounded-xl transition-all shadow-xs flex-shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-tint)',
                color: 'var(--theme-text-primary)'
              }}
              title="Change Application Theme & Color Palette"
            >
              <Palette className="w-4 h-4" style={{ color: 'var(--theme-text-accent)' }} />
              <span className="hidden sm:inline">Theme</span>
            </Link>

            {/* Quick Open Website Button */}
            {(() => {
              const currentStoreSlug = (
                activeTenant?.businessName ||
                businessProfile.businessName ||
                'apex-enterprise'
              ).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'apex-enterprise';

              return (
                <Link
                  to={`/${currentStoreSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border text-xs font-bold rounded-xl transition-all shadow-xs"
                  style={{
                    backgroundColor: 'var(--theme-bg-primary)',
                    borderColor: 'var(--theme-border-tint)',
                    color: 'var(--theme-text-primary)'
                  }}
                  title="Open Live Public Website / Storefront"
                >
                  <Globe className="w-4 h-4" style={{ color: 'var(--theme-text-accent)' }} />
                  <span className="hidden sm:inline">Open Website</span>
                </Link>
              );
            })()}


            {/* Quick POS Shortcut */}
            {isRouteAllowed(user, '/dashboard/billing') && location.pathname !== '/dashboard/billing' && location.pathname !== '/billing' && (
              <Link
                to="/dashboard/billing"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 font-bold text-xs rounded-xl shadow-md transition-all hover:brightness-110"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-btn-text)'
                }}
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Open POS</span>
              </Link>
            )}

            {/* Notification Center */}
            <NotificationCenter />

            {/* User Badge */}
            {(() => {
              const isEmp = user.role !== 'ADMIN' && user.username !== 'admin';
              const nameToShow = isEmp ? ((user as any).name || (user as any).fullName || user.username) : (effectiveTenant?.ownerName || (user as any).fullName || user.username);
              const subToShow = isEmp ? `${user.role} · Staff` : (effectiveTenant?.adminUsername ? `@${effectiveTenant.adminUsername} • ${user.role}` : user.role);
              const initials = (nameToShow || user.username).substring(0, 2).toUpperCase();

              return (
                <div
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--theme-bg-primary)',
                    borderColor: 'var(--theme-border-tint)'
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--theme-btn-secondary)',
                      color: 'var(--theme-btn-text)'
                    }}
                  >
                    {initials}
                  </div>
                  <div className="hidden sm:flex flex-col pr-1 text-left">
                    <span className="text-xs font-bold leading-none">
                      {nameToShow}
                    </span>
                    <span className="text-[10px] opacity-70 uppercase mt-0.5">
                      {subToShow}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </header>

        <main
          className={cn("flex-1 transition-colors", location.pathname === '/billing' ? "p-1.5 sm:p-3 overflow-hidden flex flex-col h-[calc(100vh-64px)]" : "p-2.5 sm:p-5 lg:p-8 overflow-y-auto")}
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            color: 'var(--theme-text-primary)'
          }}
        >
          <div className={cn("w-full h-full flex flex-col flex-1 min-w-0", location.pathname === '/billing' ? "overflow-hidden" : "mx-auto max-w-7xl")}>
            {isCurrentRouteAllowed ? (
              <Outlet />
            ) : (
              <div
                className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-2xl shadow-xl space-y-4 my-auto"
                style={{
                  backgroundColor: 'var(--theme-bg-surface)',
                  borderColor: 'var(--theme-border-tint)'
                }}
              >
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h2 className="text-xl font-bold">Access Restricted ({user.role})</h2>
                  <p className="text-xs opacity-75 leading-relaxed">
                    Your assigned role <span className="font-mono font-bold" style={{ color: 'var(--theme-text-accent)' }}>{user.role}</span> does not have permission to access <span className="font-mono">{location.pathname}</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to={navigation[0]?.href || '/dashboard/billing'}
                    className="px-5 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--theme-btn-secondary)',
                      color: 'var(--theme-btn-text)'
                    }}
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

