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
} from 'lucide-react';
import { QuoteRequest, ContactMessage } from '@/types';

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, quotesRes, messagesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/quotes'),
        fetch('/api/contact'),
      ]);

      const [statsData, quotesData, messagesData] = await Promise.all([
        statsRes.json(),
        quotesRes.json(),
        messagesRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (quotesData.success) setRecentQuotes((quotesData.quotes || []).slice(0, 5));
      if (messagesData.success) setRecentMessages((messagesData.messages || []).slice(0, 5));
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium rounded-xs">
            Pending
          </span>
        );
      case 'Contacted':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-medium rounded-xs">
            Contacted
          </span>
        );
      case 'Quoted':
        return (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-medium rounded-xs">
            Quoted
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 text-[10px] font-medium rounded-xs">
            Completed
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
    <div className="space-y-8">
      {/* Top Header & Refresh */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5"
      >
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Dashboard
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Manage your Top Grade Rice Millers website from one place.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#123D2A]/15 text-xs font-medium rounded-xs hover:bg-[#F8F6EF] text-[#123D2A] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4A72C]' : ''}`} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* 4 Summary Cards (Compact, max 4) */}
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
            <span>Manage products</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* Quote Requests */}
        <Link
          href="/admin/quotes"
          className="group bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs hover:border-[#D4A72C]/40 hover:shadow-xs transition-all"
        >
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
          className="group bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs hover:border-[#D4A72C]/40 hover:shadow-xs transition-all"
        >
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
            <span>View messages</span>
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
        </div>
      </motion.div>

      {/* Two Column Layout: Recent Quotes & Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Quotes */}
        <div className="bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#123D2A]" />
                <h3 className="font-serif text-base font-bold text-[#123D2A]">
                  Recent Quote Requests
                </h3>
              </div>
              <Link
                href="/admin/quotes"
                className="text-xs font-medium text-[#123D2A] hover:text-[#D4A72C] flex items-center gap-1 transition-colors"
              >
                <span>View All Quotes</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-black/5">
              {recentQuotes.length > 0 ? (
                recentQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 hover:bg-[#FCFAF5] transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-black">{q.name}</span>
                        {q.company && (
                          <span className="text-[11px] text-black/50">• {q.company}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-black/60">
                        {q.productName} — <span className="font-medium text-[#123D2A]">{q.quantityBags} bags</span>
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-black/40 font-mono">
                        <span>{q.referenceNumber}</span>
                        <span>•</span>
                        <span>{new Date(q.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>

                    <div>{getStatusBadge(q.status)}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-black/40">
                  {loading ? 'Loading recent quotes...' : 'No quote requests recorded yet.'}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#FCFAF5] border-t border-black/5 text-right">
            <Link
              href="/admin/quotes"
              className="text-xs font-medium text-[#123D2A] hover:text-[#D4A72C] inline-flex items-center gap-1"
            >
              <span>Manage all inquiries</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Contact Messages */}
        <div className="bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#123D2A]" />
                <h3 className="font-serif text-base font-bold text-[#123D2A]">
                  Recent Messages
                </h3>
              </div>
              <Link
                href="/admin/messages"
                className="text-xs font-medium text-[#123D2A] hover:text-[#D4A72C] flex items-center gap-1 transition-colors"
              >
                <span>View All Messages</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-black/5">
              {recentMessages.length > 0 ? (
                recentMessages.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 hover:bg-[#FCFAF5] transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-black truncate">{m.name}</span>
                        {m.status === 'New' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C]" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[#123D2A] truncate">
                        {m.subject}
                      </p>
                      <p className="text-[11px] text-black/60 truncate max-w-sm">
                        {m.message}
                      </p>
                      <p className="text-[10px] text-black/40 font-mono">
                        {new Date(m.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-xs border ${
                          m.status === 'New'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-black/40">
                  {loading ? 'Loading recent messages...' : 'No contact messages recorded yet.'}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#FCFAF5] border-t border-black/5 text-right">
            <Link
              href="/admin/messages"
              className="text-xs font-medium text-[#123D2A] hover:text-[#D4A72C] inline-flex items-center gap-1"
            >
              <span>Go to message inbox</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
