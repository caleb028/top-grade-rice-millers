'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  FileText,
  MessageSquare,
  Wrench,
  ArrowRight,
  Plus,
  Upload,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  Activity,
  Radio,
  Play,
  Pause,
  Bell,
  ExternalLink,
  X,
  MapPin,
  Sparkles,
  Store,
  Truck,
} from 'lucide-react';
import { QuoteRequest, ContactMessage, LiveActivityItem } from '@/types';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalQuotes: number;
  pendingQuotes: number;
  totalMessages: number;
  unreadMessages: number;
  totalServices: number;
  activeServices: number;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 8) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return dateStr;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<LiveActivityItem[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());
  const [liveToast, setLiveToast] = useState<{ id: string; title: string; subtitle: string; link: string } | null>(null);

  const initialLoadDoneRef = useRef(false);
  const latestActivityIdRef = useRef<string | null>(null);

  const fetchDashboardData = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const [activitiesRes, quotesRes, messagesRes] = await Promise.all([
        fetch('/api/admin/activities?limit=15', { cache: 'no-store' }),
        fetch('/api/quotes', { cache: 'no-store' }),
        fetch('/api/contact', { cache: 'no-store' }),
      ]);

      const [activitiesData, quotesData, messagesData] = await Promise.all([
        activitiesRes.json(),
        quotesRes.json(),
        messagesRes.json(),
      ]);

      if (activitiesData.success) {
        const fetchedActivities: LiveActivityItem[] = activitiesData.activities || [];
        setActivities(fetchedActivities);
        if (activitiesData.stats) {
          setStats(activitiesData.stats);
        }

        // Detect new real-time items if this is a background live poll
        if (fetchedActivities.length > 0) {
          const newest = fetchedActivities[0];
          if (initialLoadDoneRef.current && latestActivityIdRef.current && newest.id !== latestActivityIdRef.current) {
            // A genuine real-world activity arrived live!
            setNewActivityIds((prev) => new Set([...prev, newest.id]));
            setLiveToast({
              id: newest.id,
              title: newest.type === 'quote' ? `🔔 New Quote Received: ${newest.sender}` : `🔔 New Direct Message from ${newest.sender}`,
              subtitle: newest.details,
              link: newest.link,
            });

            // Auto-hide toast after 7s
            setTimeout(() => {
              setLiveToast((current) => (current?.id === newest.id ? null : current));
            }, 7000);

            // Also dispatch global sync event for sidebar badges
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('tgrm_stats_refresh'));
            }
          }
          latestActivityIdRef.current = newest.id;
        }
      }

      if (quotesData.success) {
        setRecentQuotes((quotesData.quotes || []).slice(0, 5));
      }
      if (messagesData.success) {
        setRecentMessages((messagesData.messages || []).slice(0, 5));
      }

      setLastSyncTime(new Date());
      initialLoadDoneRef.current = true;
    } catch (e) {
      console.error('Failed to sync live dashboard data:', e);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  // Initial fetch and real-time polling heartbeat
  useEffect(() => {
    fetchDashboardData(false);

    // Poll every 4.5 seconds when tab is active and live is enabled
    const pollInterval = setInterval(() => {
      if (isLiveActive && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchDashboardData(true);
      }
    }, 4500);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isLiveActive) {
        fetchDashboardData(true);
      }
    };

    const handleExternalRefresh = () => {
      fetchDashboardData(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('tgrm_stats_refresh', handleExternalRefresh);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('tgrm_stats_refresh', handleExternalRefresh);
    };
  }, [isLiveActive]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'New':
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium rounded-xs">
            {status}
          </span>
        );
      case 'Contacted':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium rounded-xs">
            Contacted
          </span>
        );
      case 'Quoted':
      case 'Replied':
        return (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-medium rounded-xs">
            {status}
          </span>
        );
      case 'Completed':
      case 'Read':
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium rounded-xs">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 text-[10px] font-medium rounded-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      {/* Real-Time Live Floating Alert Toast */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#123D2A] text-white p-4 rounded-sm shadow-2xl border-2 border-[#D4A72C] flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#D4A72C] text-[#123D2A] flex items-center justify-center shrink-0 mt-0.5">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-xs font-bold text-[#F8F6EF]">
                {liveToast.title}
              </h4>
              <p className="text-[11px] text-white/80 line-clamp-2 mt-0.5">
                {liveToast.subtitle}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={liveToast.link}
                  onClick={() => setLiveToast(null)}
                  className="text-[11px] font-semibold text-[#D4A72C] hover:underline flex items-center gap-1"
                >
                  <span>Open Now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setLiveToast(null)}
                  className="text-[11px] text-white/50 hover:text-white cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveToast(null)}
              className="text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Live Stream Controls */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
              Dashboard
            </h1>
            {isLiveActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 tracking-wider uppercase shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>Live Real-Time Feed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-800 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Live Feed Paused</span>
              </span>
            )}
          </div>
          <p className="text-xs text-black/60 mt-1">
            Real-time operations center for Top Grade Rice Millers. Inbound requests appear automatically without refreshing.
          </p>
        </div>

        {/* Live Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto text-xs">
          <span className="text-[11px] text-black/50 font-mono hidden sm:inline">
            Synced: {lastSyncTime.toLocaleTimeString('en-GB')}
          </span>

          <button
            type="button"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border text-xs font-medium transition-colors cursor-pointer ${
              isLiveActive
                ? 'bg-white border-[#123D2A]/15 text-[#123D2A] hover:bg-black/5'
                : 'bg-[#123D2A] border-[#123D2A] text-white hover:bg-[#184D35]'
            }`}
            title={isLiveActive ? 'Pause real-time background updates' : 'Resume real-time background updates'}
          >
            {isLiveActive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-black/60" />
                <span>Pause Live</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>Resume Live</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => fetchDashboardData(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#123D2A]/15 text-xs font-medium rounded-xs hover:bg-[#F8F6EF] text-[#123D2A] transition-colors cursor-pointer"
            title="Force immediate refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4A72C]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* 4 Summary Cards (Real-time Counters) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* Products */}
        <Link
          href="/admin/products"
          className="group bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs hover:border-[#D4A72C]/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-xs bg-[#123D2A]/5 flex items-center justify-center text-[#123D2A] group-hover:bg-[#123D2A] group-hover:text-[#D4A72C] transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#123D2A] font-mono">
              {stats ? stats.activeProducts : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-black/40 truncate">
              ({stats ? stats.totalProducts : '—'} total)
            </span>
          </div>
          <p className="text-[10px] text-black/50 mt-1 flex items-center gap-1">
            <span>Manage catalogue</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Quote Requests */}
        <Link
          href="/admin/quotes"
          className="group bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs hover:border-[#D4A72C]/40 hover:shadow-xs transition-all relative overflow-hidden"
        >
          {stats && stats.pendingQuotes > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-xs" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Pending Quotes
            </span>
            <div className="w-8 h-8 rounded-xs bg-amber-50 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#123D2A] font-mono">
              {stats ? stats.pendingQuotes : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-black/40 truncate">
              ({stats ? stats.totalQuotes : '—'} total)
            </span>
          </div>
          <p className="text-[10px] text-black/50 mt-1 flex items-center gap-1">
            <span>Review inquiries</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Contact Messages */}
        <Link
          href="/admin/messages"
          className="group bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs hover:border-[#D4A72C]/40 hover:shadow-xs transition-all relative overflow-hidden"
        >
          {stats && stats.unreadMessages > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-bl-xs animate-pulse" />
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Unread Messages
            </span>
            <div className="w-8 h-8 rounded-xs bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#123D2A] font-mono">
              {stats ? stats.unreadMessages : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-black/40 truncate">
              ({stats ? stats.totalMessages : '—'} total)
            </span>
          </div>
          <p className="text-[10px] text-black/50 mt-1 flex items-center gap-1">
            <span>Open inbox</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Services */}
        <Link
          href="/admin/services"
          className="group bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs hover:border-[#D4A72C]/40 hover:shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Active Services
            </span>
            <div className="w-8 h-8 rounded-xs bg-[#123D2A]/5 flex items-center justify-center text-[#123D2A] group-hover:bg-[#123D2A] group-hover:text-[#D4A72C] transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#123D2A] font-mono">
              {stats ? stats.activeServices : '—'}
            </span>
            <span className="text-[10px] sm:text-[11px] text-black/40 truncate">
              ({stats ? stats.totalServices : '—'} total)
            </span>
          </div>
          <p className="text-[10px] text-black/50 mt-1 flex items-center gap-1">
            <span>Manage services</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>
      </motion.div>

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="bg-white p-3.5 sm:p-4 rounded-sm border border-[#123D2A]/10 shadow-2xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D4A72C]" />
          <span className="text-xs font-semibold text-[#123D2A] uppercase tracking-wider">
            Quick Actions
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-[#123D2A] text-white text-xs font-medium rounded-xs hover:bg-[#184D35] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/services"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-white border border-[#123D2A]/20 text-[#123D2A] text-xs font-medium rounded-xs hover:bg-[#F8F6EF] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service</span>
          </Link>

          <Link
            href="/admin/gallery"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-white border border-[#123D2A]/20 text-[#123D2A] text-xs font-medium rounded-xs hover:bg-[#F8F6EF] transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>Upload Image</span>
          </Link>

          <Link
            href="/admin/quotes"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-white border border-[#123D2A]/20 text-[#123D2A] text-xs font-medium rounded-xs hover:bg-[#F8F6EF] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Quotes</span>
          </Link>

          <Link
            href="/admin/messages"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[38px] bg-white border border-[#123D2A]/20 text-[#123D2A] text-xs font-medium rounded-xs hover:bg-[#F8F6EF] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>View Messages</span>
          </Link>
        </div>
      </motion.div>

      {/* Main Grid: Live Activity Stream (Left) + Recent Direct Quotes & Messages (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Live Activity Stream (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-black/5 flex items-center justify-between bg-[#FCFAF5]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#123D2A]" />
                <h3 className="font-serif text-base font-bold text-[#123D2A]">
                  Live Activity Stream
                </h3>
                {isLiveActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live real-time feed is active" />
                )}
              </div>
              <span className="text-[11px] text-black/50 font-mono">
                Real-time updates
              </span>
            </div>

            <div className="divide-y divide-black/5">
              {activities.length > 0 ? (
                activities.map((act) => {
                  const isNewInSession = newActivityIds.has(act.id);
                  return (
                    <Link
                      key={act.id}
                      href={act.link}
                      className={`p-4 block hover:bg-[#FCFAF5] transition-colors text-xs relative ${
                        isNewInSession ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {isNewInSession && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-[#D4A72C] bg-[#D4A72C]/10 px-1.5 py-0.5 rounded-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>NEW LIVE</span>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xs flex items-center justify-center shrink-0 ${
                          act.type === 'quote' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {act.type === 'quote' ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black text-sm">{act.sender}</span>
                            {act.fulfillmentType && (
                              <span className={`px-1.5 py-0.2 text-[9px] font-medium rounded-xs ${
                                act.fulfillmentType === 'pickup' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {act.fulfillmentType === 'pickup' ? '🏬 Pick-up' : '🚚 Delivery'}
                              </span>
                            )}
                          </div>

                          <p className="font-medium text-[#123D2A] mt-0.5 truncate">
                            {act.title}
                          </p>

                          <p className="text-[11px] text-black/60 truncate mt-0.5">
                            {act.details}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-black/45 font-mono">
                            <span>{formatRelativeTime(act.timestamp)}</span>
                            <span>•</span>
                            <span>{new Date(act.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                            {act.reference && (
                              <>
                                <span>•</span>
                                <span className="text-black/60">{act.reference}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 pt-0.5">
                          {getStatusBadge(act.status)}
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-12 text-center text-xs text-black/40 space-y-2">
                  <Clock className="w-6 h-6 text-black/20 mx-auto" />
                  <p>{loading ? 'Connecting to live feed...' : 'No activities yet. Real customer quotes and messages will appear here live.'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#FCFAF5] border-t border-black/5 flex items-center justify-between text-xs text-black/60">
            <span className="text-[11px]">Real-time live monitoring active</span>
            <div className="flex items-center gap-3">
              <Link href="/admin/quotes" className="text-[#123D2A] hover:text-[#D4A72C] font-medium">
                Quotes →
              </Link>
              <Link href="/admin/messages" className="text-[#123D2A] hover:text-[#D4A72C] font-medium">
                Messages →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Quotes & Messages Stack (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recent Quote Requests */}
          <div className="bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#123D2A]" />
                <h3 className="font-serif text-sm font-bold text-[#123D2A]">
                  Latest Quotes
                </h3>
              </div>
              <Link
                href="/admin/quotes"
                className="text-[11px] font-medium text-[#123D2A] hover:text-[#D4A72C] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-black/5">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((q) => (
                  <Link
                    key={q.id}
                    href="/admin/quotes"
                    className="p-3.5 hover:bg-[#FCFAF5] transition-colors flex items-center justify-between gap-3 text-xs block"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-black truncate">{q.name}</span>
                        {q.fulfillmentType === 'pickup' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded-xs font-semibold">
                            Pick-up
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-black/65 truncate">
                        {q.productName} ({q.quantityBags} bags)
                      </p>
                      <p className="text-[10px] text-black/40 font-mono">
                        {formatRelativeTime(q.createdAt)} · {q.referenceNumber}
                      </p>
                    </div>

                    <div className="shrink-0">{getStatusBadge(q.status)}</div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-black/40">
                  {loading ? 'Checking quotes...' : 'No quotes recorded.'}
                </div>
              )}
            </div>
          </div>

          {/* Recent Direct Messages */}
          <div className="bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#123D2A]" />
                <h3 className="font-serif text-sm font-bold text-[#123D2A]">
                  Latest Messages
                </h3>
              </div>
              <Link
                href="/admin/messages"
                className="text-[11px] font-medium text-[#123D2A] hover:text-[#D4A72C] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-black/5">
              {recentMessages.length > 0 ? (
                recentMessages.map((m) => (
                  <Link
                    key={m.id}
                    href="/admin/messages"
                    className="p-3.5 hover:bg-[#FCFAF5] transition-colors flex items-center justify-between gap-3 text-xs block"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-black truncate">{m.name}</span>
                        {m.status === 'New' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C]" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[#123D2A] truncate">
                        {m.subject}
                      </p>
                      <p className="text-[10px] text-black/40 font-mono">
                        {formatRelativeTime(m.createdAt)}
                      </p>
                    </div>

                    <div className="shrink-0">{getStatusBadge(m.status)}</div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-black/40">
                  {loading ? 'Checking messages...' : 'No messages recorded.'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
