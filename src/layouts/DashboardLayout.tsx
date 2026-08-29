import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Settings, LogOut, Receipt, Package,
  Boxes, BarChart3, ChevronLeft, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Store, Layers, Sparkles, ClipboardList, ShieldAlert, Palette
} from 'lucide-react';

import { cn } from '../lib/utils';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { ThemeEngine } from '../lib/theme/themeEngine';

export default function DashboardLayout() {
  const { user, logout, businessProfile } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const [, setThemeVersion] = useState(0);

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
    if (!role || role === 'ADMIN') return true;

    // Check custom applicationAccess permissions if set for the employee
    const appAccess = user?.applicationAccess;
    if (appAccess) {
      if (appAccess.includes('Full Access') || appAccess.includes('ALL_MODULES')) {
        return true;
      }

      const routeMenuMap: Record<string, string> = {
        '/dashboard': 'Dashboard',
        '/dashboard/billing': 'Billing POS',
        '/dashboard/items': 'Categories & Items',
        '/dashboard/menu': 'Categories & Items',
        '/dashboard/inventory': 'Inventory',
        '/dashboard/reports': 'Sales Reports',
        '/dashboard/employees': 'Employee Details',
        '/dashboard/attendance': 'Staff Attendance',
        '/dashboard/customers': 'Customers',
        '/dashboard/settings': 'Settings',
      };

      const menuItem = routeMenuMap[href];
      if (menuItem) {
        const allowedItems = appAccess.split(',').map(s => s.trim());
        if (allowedItems.includes(menuItem)) {
          return true;
        }
      }
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
  ];

  const navigation = allNavigation.filter(item => isRouteAllowedForRole(user.role, item.href));
  const isCurrentRouteAllowed = isRouteAllowedForRole(user.role, location.pathname);

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans overflow-hidden">
      {/* Collapsible Sidebar */}
      <aside
        className={cn(
          "bg-theme-surface border-r border-theme-secondary/20 flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-20 flex-shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-theme-secondary/20 bg-theme-surface transition-all px-4 justify-between")}>
          <div className="flex items-center truncate">
            <div className="w-10 h-10 btn-theme-secondary rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg border border-white/20">
              {brandTitle.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <h1 className="font-serif font-bold text-sm tracking-tight text-theme-primary truncate">
                  {brandTitle}
                </h1>
                <span className="text-[10px] text-theme-accent font-medium tracking-wider uppercase truncate block">
                  {brandTagline}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg nav-item-hover transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 text-theme-accent" /> : <ChevronLeft className="w-5 h-5" />}
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
                      ? 'border-l-4 shadow-sm font-bold bg-theme-secondary/20 text-theme-accent border-theme-secondary'
                      : 'nav-item-hover opacity-85 hover:opacity-100'
                  )}
                  style={isActive ? {
                    borderColor: 'var(--theme-btn-secondary)',
                    backgroundColor: 'rgba(var(--theme-btn-secondary-rgb, 197, 160, 89), 0.18)'
                  } : {}}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isCollapsed ? '' : 'mr-3',
                      isActive ? 'text-theme-accent' : 'opacity-80 group-hover:opacity-100'
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && (
                    <span className="truncate font-semibold">{item.name}</span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-theme-surface text-theme-primary text-xs font-bold rounded-lg shadow-xl border border-theme-secondary/30 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="p-3 border-t border-theme-secondary/20 space-y-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center w-full px-3 py-2 text-xs font-bold rounded-xl nav-item-hover transition-colors mb-1",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isCollapsed && <span className="uppercase tracking-wider text-[10px] opacity-75">Sidebar View</span>}
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-theme-accent" /> : <PanelLeftClose className="w-4 h-4 opacity-75" />}
          </button>

          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-colors",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5 flex-shrink-0 text-red-400 hover:text-red-300", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </aside>


      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0F0F10] border-b border-[#1F1F21] flex items-center justify-between px-6 lg:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Header Logo */}
            <div className="flex items-center md:hidden">
              <div className="w-8 h-8 bg-[#C5A059] rounded-lg flex items-center justify-center text-[#0A0A0B] font-bold text-lg mr-3">
                {brandTitle.charAt(0).toUpperCase()}
              </div>
              <h1 className="font-serif font-bold text-base tracking-tight text-white truncate max-w-[150px]">{brandTitle}</h1>
            </div>

            {/* Desktop Sidebar Toggle in Top Bar */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center gap-2 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1A1A1C] border border-[#1F1F21] transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#C5A059]" /> : <PanelLeftClose className="w-4 h-4" />}
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">
                {brandTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Theme Customizer Button */}
            <Link
              to="/dashboard/settings"
              state={{ tab: 'theme' }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1C] hover:bg-[#252528] text-gray-300 hover:text-white border border-[#2D2D30] text-xs font-bold rounded-xl transition-all"
              title="Change Application Theme & Color Palette"
            >
              <Palette className="w-4 h-4 text-theme-secondary" />
              <span className="hidden md:inline">Theme</span>
            </Link>

            {/* Quick POS Shortcut */}
            {location.pathname !== '/dashboard/billing' && location.pathname !== '/billing' && (
              <Link
                to="/dashboard/billing"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 btn-theme-secondary font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                <Receipt className="w-4 h-4" />
                <span>Open POS</span>
              </Link>
            )}

            {/* Notification Center */}
            <NotificationCenter />

            {/* User Badge */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1A1A1C] rounded-xl border border-[#1F1F21]">
              <div className="w-7 h-7 rounded-full bg-[#C5A059] flex items-center justify-center text-xs font-bold text-[#0A0A0B] shadow-md">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col pr-1">
                <span className="text-xs font-bold text-white leading-none">{user.username}</span>
                <span className="text-[10px] text-gray-500 uppercase mt-0.5">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={cn("flex-1 bg-[#0A0A0B]", location.pathname === '/billing' ? "p-2 lg:p-3 overflow-hidden flex flex-col h-[calc(100vh-64px)]" : "p-3 sm:p-5 lg:p-8 overflow-y-auto")}>
          <div className={cn("w-full h-full flex flex-col flex-1 min-w-0", location.pathname === '/billing' ? "overflow-hidden" : "mx-auto max-w-7xl")}>
            {isCurrentRouteAllowed ? (
              <Outlet />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#131315] border border-[#2D2D30] rounded-2xl shadow-2xl space-y-4 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h2 className="text-xl font-bold text-white font-serif">Access Restricted ({user.role})</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your assigned role <span className="font-mono text-[#C5A059] font-bold">{user.role}</span> does not have permission to access <span className="font-mono text-white">{location.pathname}</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to={navigation[0]?.href || '/dashboard/billing'}
                    className="px-5 py-2.5 bg-[#C5A059] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20 hover:bg-[#b08d4a] transition-all inline-flex items-center gap-2"
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
