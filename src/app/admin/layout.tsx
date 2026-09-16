'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Wrench,
  Images,
  Building2,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  Loader2,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'pendingQuotes' | 'unreadMessages';
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
];

const contentNav: NavItem[] = [
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Quote Requests', href: '/admin/quotes', icon: FileText, badgeKey: 'pendingQuotes' },
  { label: 'Contact Messages', href: '/admin/messages', icon: MessageSquare, badgeKey: 'unreadMessages' },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Gallery', href: '/admin/gallery', icon: Images },
  { label: 'Company Information', href: '/admin/company', icon: Building2 },
];

const systemNav: NavItem[] = [
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<{ pendingQuotes?: number; unreadMessages?: number }>({});
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);

  // If on login page, skip layout & auth check
  const isLoginPage = pathname === '/admin/login';

  const checkAuthAndStats = async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();

      if (!authData.authenticated) {
        router.push('/admin/login');
        return;
      }

      setAdminUser(authData.user);

      // Fetch badge stats
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setStats({
          pendingQuotes: statsData.stats.pendingQuotes,
          unreadMessages: statsData.stats.unreadMessages,
        });
      }
    } catch (e) {
      console.error('Session check failed:', e);
      router.push('/admin/login');
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    if (!isLoginPage) {
      checkAuthAndStats();
    } else {
      setAuthChecked(true);
    }
  }, [pathname, isLoginPage]);

  useEffect(() => {
    if (isLoginPage) return;

    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        if (!statsRes.ok) return;
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setStats({
            pendingQuotes: statsData.stats.pendingQuotes,
            unreadMessages: statsData.stats.unreadMessages,
          });
        }
      } catch {
        // quiet catch
      }
    };

    const handleRefresh = () => {
      fetchStats();
    };

    // Polling heartbeat every 5s when page visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchStats();
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchStats();
      }
    };

    window.addEventListener('tgrm_stats_refresh', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tgrm_stats_refresh', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoginPage]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  // Close mobile drawer on route change & manage body scroll-lock
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F8F6EF] flex flex-col items-center justify-center text-[#123D2A] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4A72C]" />
        <p className="text-xs uppercase tracking-widest font-semibold">Verifying Secure Access...</p>
      </div>
    );
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/products')) return 'Products Management';
    if (pathname.startsWith('/admin/quotes')) return 'Quote Requests';
    if (pathname.startsWith('/admin/messages')) return 'Contact Messages';
    if (pathname.startsWith('/admin/services')) return 'Milling Services';
    if (pathname.startsWith('/admin/gallery')) return 'Gallery Management';
    if (pathname.startsWith('/admin/company')) return 'Company Information';
    if (pathname.startsWith('/admin/settings')) return 'Settings';
    return 'Admin';
  };

  const renderNavGroup = (items: NavItem[]) => (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const badgeCount = item.badgeKey ? stats[item.badgeKey] : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center justify-between px-3 py-2 text-xs rounded-xs transition-all duration-150 ${
              isActive
                ? 'bg-[#123D2A]/10 text-[#123D2A] font-semibold shadow-2xs'
                : 'text-black/70 hover:bg-black/5 hover:text-[#123D2A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Subtle gold indicator on active */}
              {isActive ? (
                <span className="w-1 h-3.5 bg-[#D4A72C] rounded-full" />
              ) : (
                <span className="w-1 h-3.5 bg-transparent" />
              )}
              <Icon
                className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                  isActive ? 'text-[#123D2A]' : 'text-black/50 group-hover:text-[#123D2A]'
                }`}
              />
              <span>{item.label}</span>
            </div>

            {badgeCount !== undefined && badgeCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#D4A72C] text-[#123D2A] text-[10px] font-bold rounded-full font-mono">
                {badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#17211C] flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white border-b border-[#123D2A]/10 px-3 sm:px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-1 text-black/70 hover:text-[#123D2A] hover:bg-black/5 rounded-xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Current Page Title */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden sm:inline text-[11px] text-black/40 font-mono">/admin</span>
              <h2 className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#123D2A] leading-tight truncate">
                {getPageTitle()}
              </h2>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#123D2A] hover:text-[#D4A72C] font-semibold uppercase tracking-wider transition-colors px-2.5 py-1.5 rounded-xs hover:bg-[#123D2A]/5"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Notification bell */}
          <div className="relative">
            <Link
              href="/admin/quotes"
              title="Recent Inquiries"
              className="p-1.5 text-black/60 hover:text-[#123D2A] hover:bg-black/5 rounded-xs flex items-center justify-center transition-colors"
            >
              <Bell className="w-4 h-4" />
              {stats.pendingQuotes ? (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4A72C] rounded-full ring-2 ring-white" />
              ) : null}
            </Link>
          </div>

          <div className="h-4 w-[1px] bg-black/10 hidden sm:block" />

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-7 h-7 rounded-full bg-[#123D2A] text-white flex items-center justify-center text-[11px] font-serif font-bold ring-1 ring-[#D4A72C]/50">
              TG
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#123D2A] leading-none">
                {adminUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-black/50 leading-none mt-1 truncate max-w-[140px]">
                {adminUser?.email || 'admin@topgradericemillers.co.ke'}
              </p>
            </div>
            <Link
              href="/admin/settings"
              title="Admin Settings"
              className="p-1 text-black/40 hover:text-[#123D2A]"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Compact Sidebar (240px) */}
        <aside className="hidden md:flex flex-col w-60 bg-white border-r border-[#123D2A]/10 justify-between shrink-0 select-none">
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Branding with Official Logo */}
            <div className="px-2 pt-1 pb-3 border-b border-black/5">
              <Link href="/admin" className="flex items-center gap-2.5 group">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#D4A72C] bg-white shrink-0 shadow-2xs">
                  <Image
                    src="/logo.jpg"
                    alt="Top Grade Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-serif text-xs font-bold tracking-tight text-[#123D2A] group-hover:text-[#D4A72C] transition-colors block leading-tight">
                    TOP GRADE ADMIN
                  </span>
                  <span className="text-[9.5px] text-[#D4A72C] font-semibold block leading-tight truncate">
                    Home of Pure Pishori
                  </span>
                  <span className="text-[8px] text-black/40 uppercase tracking-widest block font-medium">
                    Website Management
                  </span>
                </div>
              </Link>
            </div>

            {/* MAIN section */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                Main
              </p>
              {renderNavGroup(mainNav)}
            </div>

            {/* CONTENT section */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                Content
              </p>
              {renderNavGroup(contentNav)}
            </div>

            {/* SYSTEM section */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                System
              </p>
              {renderNavGroup(systemNav)}
            </div>
          </div>

          {/* Bottom Sidebar Action Buttons */}
          <div className="p-3 border-t border-[#123D2A]/10 bg-[#FCFAF5] space-y-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-xs text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>View Public Website</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-700 hover:bg-red-50 rounded-xs transition-colors font-medium text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-4">
              <div className="space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4A72C] bg-white shrink-0 shadow-2xs">
                      <Image
                        src="/logo.jpg"
                        alt="Top Grade Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-serif text-xs font-bold text-[#123D2A] block leading-tight">
                        TOP GRADE ADMIN
                      </span>
                      <span className="text-[9px] text-[#D4A72C] font-semibold block leading-tight">
                        Home of Pure Pishori
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-black/50 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Main
                  </p>
                  {renderNavGroup(mainNav)}
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Content
                  </p>
                  {renderNavGroup(contentNav)}
                </div>

                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    System
                  </p>
                  {renderNavGroup(systemNav)}
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 space-y-1">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#123D2A] hover:bg-[#123D2A]/5 rounded-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>View Public Website</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xs font-medium text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Workspace Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-full">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
