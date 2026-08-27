import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Settings, LogOut, Receipt, Package,
  Boxes, BarChart3, ChevronLeft, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Store, Layers, Sparkles, ClipboardList, ShieldAlert
} from 'lucide-react';

import { cn } from '../lib/utils';
import NotificationCenter from '../components/notifications/NotificationCenter';

export default function DashboardLayout() {
  const { user, logout, businessProfile } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const brandTitle = businessProfile.businessName || "My Business";
  const brandTagline = businessProfile.tagline || "Universal Billing System";

  // Role-Based Access Helper
  const isRouteAllowedForRole = (role: string, href: string): boolean => {
    if (!role || role === 'ADMIN') return true;

    if (role === 'MANAGER') {
      return href !== '/dashboard/settings' && href !== '/dashboard/employees';
    }

    if (role === 'CASHIER') {
      return href === '/dashboard/billing' || href === '/dashboard/customers' || href === '/dashboard/attendance' || href === '/dashboard';
    }

    if (role === 'KITCHEN_STAFF') {
      return href === '/dashboard/items' || href === '/dashboard/attendance' || href === '/dashboard';
    }

    if (role === 'STAFF') {
      return href === '/dashboard/attendance' || href === '/dashboard/billing' || href === '/dashboard';
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
      name: 'Categories & Items',
      href: '/dashboard/items',
      icon: Layers,
    },
    {
      name: 'Inventory',
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
          "bg-[#0F0F10] border-r border-[#1F1F21] flex flex-col hidden md:flex transition-all duration-300 ease-in-out relative z-20 flex-shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-[#1F1F21] bg-[#0F0F10] transition-all px-4 justify-between")}>
          <div className="flex items-center truncate">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E2B755] to-[#99732B] rounded-xl flex items-center justify-center text-[#0A0A0B] font-bold text-xl flex-shrink-0 shadow-lg shadow-[#C5A059]/20 border border-[#C5A059]/30">
              {brandTitle.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate">
                <h1 className="font-serif font-bold text-sm tracking-tight text-white truncate">
                  {brandTitle}
                </h1>
                <span className="text-[10px] text-[#C5A059] font-medium tracking-wider uppercase truncate block">
                  {brandTagline}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A1C] transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 text-[#C5A059]" /> : <ChevronLeft className="w-5 h-5" />}
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
                      ? 'bg-[#1A1A1C] text-[#C5A059] border-l-2 border-[#C5A059] shadow-sm'
                      : 'text-gray-400 hover:bg-[#1A1A1C] hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isCollapsed ? '' : 'mr-3',
                      isActive ? 'text-[#C5A059]' : 'text-gray-400 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && (
                    <span className="truncate font-semibold">{item.name}</span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1A1A1C] text-white text-xs font-bold rounded-lg shadow-xl border border-[#2D2D30] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="p-3 border-t border-[#1F1F21] space-y-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center w-full px-3 py-2 text-xs font-bold text-gray-400 rounded-xl hover:bg-[#1A1A1C] hover:text-[#C5A059] transition-colors mb-1",
              isCollapsed ? "justify-center" : "justify-between"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {!isCollapsed && <span className="uppercase tracking-wider text-[10px]">Sidebar View</span>}
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-[#C5A059]" /> : <PanelLeftClose className="w-4 h-4 text-gray-400" />}
          </button>

          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors",
              isCollapsed ? "justify-center" : "justify-start"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5 flex-shrink-0 text-gray-400 hover:text-red-400", isCollapsed ? "" : "mr-3")} />
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
            {/* Quick POS Shortcut */}
            {location.pathname !== '/billing' && (
              <Link
                to="/billing"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20 transition-all"
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
