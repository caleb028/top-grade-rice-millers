'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Bell,
  ExternalLink,
  MapPin,
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
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setLoading(true);
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
        setActivities(activitiesData.activities || []);
        if (activitiesData.stats) {
          setStats(activitiesData.stats);
        }
      }

      if (quotesData.success) {
        setRecentQuotes((quotesData.quotes || []).slice(0, 5));
      }
      if (messagesData.success) {
        setRecentMessages((messagesData.messages || []).slice(0, 5));
      }

      setLastSyncTime(new Date());
    } catch (e) {
      console.error('Failed to sync dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleExternalRefresh = () => {
      fetchDashboardData();
    };

    window.addEventListener('tgrm_stats_refresh', handleExternalRefresh);

    return () => {
      window.removeEventListener('tgrm_stats_refresh', handleExternalRefresh);
    };
  }, []);

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
      {/* Top Header & Refresh Control */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5"
      >
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Dashboard
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Administrative operations center for Top Grade Rice Millers. All quotes and messages are stored persistently.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto text-xs">
          <span className="text-[11px] text-black/50 font-mono hidden sm:inline">
            Updated: {lastSyncTime.toLocaleTimeString('en-GB')}
          </span>

          <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#123D2A]/15 text-xs font-medium rounded-xs hover:bg-[#F8F6EF] text-[#123D2A] transition-colors cursor-pointer"
            title="Refresh dashboard records"
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
                  Recent Activity Stream
                </h3>
              </div>
              <span className="text-[11px] text-black/50 font-mono">
                Persistent Activity Log
              </span>
            </div>

            <div className="divide-y divide-black/5">
              {activities.length > 0 ? (
                activities.map((act) => {
                  return (
                    <Link
                      key={act.id}
                      href={act.link}
                      className="p-4 block hover:bg-[#FCFAF5] transition-colors text-xs relative"
                    >
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
                  <p>{loading ? 'Loading activity log...' : 'No activities recorded yet. Submitted quotes and messages will appear here.'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#FCFAF5] border-t border-black/5 flex items-center justify-between text-xs text-black/60">
            <span className="text-[11px]">Persistent Records • Auto-saved</span>
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
