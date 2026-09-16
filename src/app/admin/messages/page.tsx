'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ContactMessage } from '@/types';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Eye,
  Calendar,
  Play,
  Pause,
  Radio,
} from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Live polling state
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const initialLoadDoneRef = useRef(false);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());

  // Modal / Detail state
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMessages = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success) {
        const fetched: ContactMessage[] = data.messages || [];

        // Detect new messages in background
        if (isBackground && initialLoadDoneRef.current && knownMessageIdsRef.current.size > 0) {
          const brandNew = fetched.filter((m) => !knownMessageIdsRef.current.has(m.id));
          if (brandNew.length > 0) {
            const first = brandNew[0];
            setToastMessage(`🔔 New message from ${first.name}: "${first.subject}"`);
            setTimeout(() => setToastMessage(null), 5000);

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('tgrm_stats_refresh'));
            }
          }
        }

        knownMessageIdsRef.current = new Set(fetched.map((m) => m.id));
        setMessages(fetched);

        // Keep active message modal in sync
        if (activeMessage) {
          const updatedActive = fetched.find((m) => m.id === activeMessage.id);
          if (updatedActive) {
            setActiveMessage(updatedActive);
          }
        }

        setLastSyncTime(new Date());
        initialLoadDoneRef.current = true;
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMessages(false);

    const interval = setInterval(() => {
      if (isLiveActive && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchMessages(true);
      }
    }, 4500);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isLiveActive) {
        fetchMessages(true);
      }
    };

    const handleExternalRefresh = () => {
      fetchMessages(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('tgrm_stats_refresh', handleExternalRefresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('tgrm_stats_refresh', handleExternalRefresh);
    };
  }, [isLiveActive, activeMessage?.id]);

  useEffect(() => {
    if (activeMessage || messageToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeMessage, messageToDelete]);

  const getWhatsAppReplyUrl = (m: ContactMessage) => {
    if (!m.phone) return '#';
    const digitsOnly = m.phone.replace(/\D/g, '');
    const cleanPhone = digitsOnly.startsWith('0')
      ? '254' + digitsOnly.slice(1)
      : digitsOnly.startsWith('254')
      ? digitsOnly
      : digitsOnly;
    const body = `Hello ${m.name}, thank you for contacting Top Grade Rice Millers regarding "${m.subject}". How can we assist you today?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`;
  };

  const getEmailReplyUrl = (m: ContactMessage) => {
    if (!m.email) return '#';
    const subject = `Top Grade Rice Millers — Re: ${m.subject}`;
    const body = `Dear ${m.name},\n\nThank you for reaching out to Top Grade Rice Millers regarding "${m.subject}".\n\n\n\nKind regards,\nTop Grade Rice Millers\nWang'uru Commercial Corridor, Mwea, Kirinyaga County, Kenya\n`;
    return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleUpdateStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
        if (activeMessage?.id === id) {
          setActiveMessage({ ...activeMessage, status });
        }
        setToastMessage(`Message marked as ${status}.`);
        setTimeout(() => setToastMessage(null), 3000);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tgrm_stats_refresh'));
        }
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contact?id=${encodeURIComponent(messageToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete message.');
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      if (activeMessage?.id === messageToDelete.id) {
        setActiveMessage(null);
      }
      setMessageToDelete(null);
      setToastMessage('Message permanently removed.');
      setTimeout(() => setToastMessage(null), 3000);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tgrm_stats_refresh'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed.';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#123D2A] text-white px-4 py-3 rounded-sm shadow-xl border border-[#D4A72C]/40 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#D4A72C] shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
              Contact Messages
            </h1>
            {isLiveActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 tracking-wider uppercase shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>Live Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-800 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Live Paused</span>
              </span>
            )}
          </div>
          <p className="text-xs text-black/60 mt-1">
            Inbound public communications submitted through the contact section. ({messages.length} total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto text-xs">
          <span className="text-[11px] text-black/50 font-mono hidden md:inline">
            Synced: {lastSyncTime.toLocaleTimeString('en-GB')}
          </span>

          <button
            type="button"
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium rounded-xs transition-colors cursor-pointer ${
              isLiveActive
                ? 'bg-white border-[#123D2A]/15 text-[#123D2A] hover:bg-black/5'
                : 'bg-[#123D2A] border-[#123D2A] text-white hover:bg-[#184D35]'
            }`}
            title={isLiveActive ? 'Pause real-time background updates' : 'Resume real-time background updates'}
          >
            {isLiveActive ? <Pause className="w-3.5 h-3.5 text-black/60" /> : <Play className="w-3.5 h-3.5 text-[#D4A72C]" />}
            <span>{isLiveActive ? 'Pause Live' : 'Resume Live'}</span>
          </button>

          <button
            onClick={() => fetchMessages(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#123D2A]/15 text-xs font-medium rounded-xs hover:bg-[#F8F6EF] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4A72C]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-sm border border-[#123D2A]/10 shadow-2xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-black/40" />
          <input
            type="text"
            placeholder="Search by sender name, email, subject or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xs bg-[#FCFAF5] border border-black/10 focus:border-[#D4A72C] outline-none"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xs bg-[#FCFAF5] border border-black/10 focus:border-[#D4A72C] outline-none"
          >
            <option value="All">All Inquiries</option>
            <option value="New">Unread (New)</option>
            <option value="Read">Read</option>
            <option value="Replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Mobile Stacked Card View (phones & small screens) */}
      <div className="block md:hidden space-y-3">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((m) => (
            <div
              key={m.id}
              className={`bg-white p-4 rounded-sm border shadow-2xs space-y-2.5 text-xs transition-colors ${
                m.status === 'New' ? 'border-[#D4A72C]/40 bg-[#FCFAF5]' : 'border-[#123D2A]/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-black/5 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {m.status === 'New' && (
                    <span className="w-2 h-2 rounded-full bg-[#D4A72C] shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-black block text-sm truncate">{m.name}</span>
                    <span className="text-[11px] text-black/50 block truncate">{m.email}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-xs border shrink-0 ${
                    m.status === 'New'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : m.status === 'Replied'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div>
                <span className="font-medium text-[#123D2A] block">{m.subject}</span>
                <p className="text-black/70 text-[11px] line-clamp-2 mt-0.5">{m.message}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[10px] text-black/40 font-mono">
                <span>{new Date(m.createdAt).toLocaleDateString('en-GB')}</span>

                <div className="flex items-center gap-1.5">
                  {m.phone && (
                    <a
                      href={getWhatsAppReplyUrl(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpdateStatus(m.id, 'Replied')}
                      className="p-1.5 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xs border border-[#25D366]/30 cursor-pointer"
                      title="Reply on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {m.email && (
                    <a
                      href={getEmailReplyUrl(m)}
                      onClick={() => handleUpdateStatus(m.id, 'Replied')}
                      className="p-1.5 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[#123D2A] bg-black/5 hover:bg-black/10 rounded-xs border border-black/10 cursor-pointer"
                      title="Reply via Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMessage(m);
                      if (m.status === 'New') {
                        handleUpdateStatus(m.id, 'Read');
                      }
                    }}
                    className="inline-flex items-center gap-1 py-1.5 px-3 min-h-[36px] bg-[#123D2A] text-white rounded-xs font-medium text-xs hover:bg-[#184D35] cursor-pointer active:scale-[0.99]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageToDelete(m)}
                    className="p-1.5 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xs border border-red-200 cursor-pointer active:scale-[0.99]"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-sm border border-[#123D2A]/10 text-center text-black/50 text-xs">
            {loading ? 'Loading message inbox...' : 'No messages match your query.'}
          </div>
        )}
      </div>

      {/* Desktop Messages Table */}
      <div className="hidden md:block bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#123D2A] text-[#F8F6EF] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Message Preview</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-[#FCFAF5] transition-colors ${
                      m.status === 'New' ? 'bg-[#D4A72C]/5 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {m.status === 'New' && (
                          <span className="w-2 h-2 rounded-full bg-[#D4A72C] shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold text-black block">{m.name}</span>
                          <span className="text-[11px] text-black/50 block">{m.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-[#123D2A]">
                      {m.subject}
                    </td>

                    <td className="py-3 px-4 text-black/70 max-w-xs truncate">
                      {m.message}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-xs border ${
                          m.status === 'New'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : m.status === 'Replied'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-black/50 text-[11px] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {m.phone && (
                          <a
                            href={getWhatsAppReplyUrl(m)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleUpdateStatus(m.id, 'Replied')}
                            className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-xs transition-colors cursor-pointer"
                            title="Reply on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={getEmailReplyUrl(m)}
                            onClick={() => handleUpdateStatus(m.id, 'Replied')}
                            className="p-1.5 text-black/60 hover:text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                            title="Reply via Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setActiveMessage(m);
                            if (m.status === 'New') {
                              handleUpdateStatus(m.id, 'Read');
                            }
                          }}
                          className="p-1.5 text-black/60 hover:text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                          title="Open Message"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMessageToDelete(m)}
                          className="p-1.5 text-black/60 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-black/50">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                        <span>Loading message inbox...</span>
                      </div>
                    ) : (
                      'No messages match your query.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#123D2A]/20 rounded-sm max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-serif text-lg font-bold text-[#123D2A]">
                Inquiry from {activeMessage.name}
              </h3>
              <button
                onClick={() => setActiveMessage(null)}
                className="p-1 text-black/40 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FCFAF5] rounded-xs border border-black/10">
                <div>
                  <span className="text-black/50 text-[10px] block uppercase font-semibold">Phone</span>
                  {activeMessage.phone ? (
                    <a href={`tel:${activeMessage.phone}`} className="font-medium text-[#123D2A] hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#71856F]" />
                      <span>{activeMessage.phone}</span>
                    </a>
                  ) : (
                    <span className="text-black/40">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="text-black/50 text-[10px] block uppercase font-semibold">Email</span>
                  {activeMessage.email ? (
                    <a href={`mailto:${activeMessage.email}`} className="font-medium text-[#123D2A] hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#71856F]" />
                      <span>{activeMessage.email}</span>
                    </a>
                  ) : (
                    <span className="text-black/40">Not provided</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-black/50 text-[10px] block uppercase font-semibold">Subject</span>
                <p className="font-semibold text-sm text-[#123D2A] mt-0.5">{activeMessage.subject}</p>
              </div>

              <div>
                <span className="text-black/50 text-[10px] block uppercase font-semibold">Full Message</span>
                <div className="p-3 bg-[#FCFAF5] border border-black/10 rounded-xs mt-1 text-black/80 leading-relaxed whitespace-pre-wrap">
                  {activeMessage.message}
                </div>
              </div>

              {/* Direct Response Options */}
              <div className="p-3 bg-[#FCFAF5] rounded-xs border border-[#123D2A]/15 space-y-2">
                <span className="text-[10px] font-bold text-[#123D2A] uppercase tracking-wider block">
                  Quick Reply & Communication
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeMessage.phone && (
                    <a
                      href={getWhatsAppReplyUrl(activeMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUpdateStatus(activeMessage.id, 'Replied')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xs text-xs transition-colors shadow-2xs cursor-pointer active:scale-[0.99]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  )}

                  {activeMessage.phone && (
                    <a
                      href={`tel:${activeMessage.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#123D2A]/20 text-[#123D2A] hover:bg-[#123D2A]/5 font-medium rounded-xs text-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#123D2A]" />
                      <span>Call {activeMessage.phone}</span>
                    </a>
                  )}

                  {activeMessage.email && (
                    <a
                      href={getEmailReplyUrl(activeMessage)}
                      onClick={() => handleUpdateStatus(activeMessage.id, 'Replied')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#123D2A] hover:bg-[#184D35] text-[#F8F6EF] font-medium rounded-xs text-xs transition-colors shadow-2xs cursor-pointer active:scale-[0.99]"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#D4A72C]" />
                      <span>Reply via Email</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-black/50 text-[11px]">Mark as:</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeMessage.id, 'Replied')}
                    className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xs text-[11px] font-medium hover:bg-blue-100 cursor-pointer"
                  >
                    Replied
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeMessage.id, 'New')}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xs text-[11px] font-medium hover:bg-gray-200 cursor-pointer"
                  >
                    Unread
                  </button>
                </div>

                <span className="text-[10px] text-black/40 font-mono">
                  {new Date(activeMessage.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setMessageToDelete(activeMessage)}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Message</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="px-4 py-1.5 text-xs bg-[#123D2A] text-white rounded-xs font-medium hover:bg-[#184D35] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-red-200 rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#123D2A]">
                  Delete Message?
                </h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Permanently delete inquiry from <strong className="text-black">{messageToDelete.name}</strong> ({messageToDelete.subject})? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMessage}
                disabled={actionLoading}
                className="px-4 py-1.5 text-xs bg-red-600 text-white font-semibold rounded-xs hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
