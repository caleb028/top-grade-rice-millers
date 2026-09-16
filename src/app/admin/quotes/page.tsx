'use client';

import React, { useEffect, useState } from 'react';
import { QuoteRequest, QuoteRequestType } from '@/types';
import {
  Download,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  Eye,
  FileText,
  MapPin,
  Calendar,
  Layers,
  Building,
  Cog,
  ShoppingBag,
  Truck,
  HelpCircle,
} from 'lucide-react';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState<'all' | QuoteRequestType>('all');
  const [statusFilter, setStatusFilter] = useState('All');

  // Deletion modal state
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Detail modal state
  const [activeQuoteModal, setActiveQuoteModal] = useState<QuoteRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPdf = async (q: QuoteRequest) => {
    setDownloadingId(q.id);
    try {
      const res = await fetch(`/api/pdf/quote?id=${encodeURIComponent(q.id)}`);
      if (!res.ok) {
        throw new Error('Failed to generate PDF document');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Top-Grade-Rice-Millers-Quote-Request-${q.referenceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setToastMessage(`Official PDF for ${q.referenceNumber} downloaded.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating PDF';
      alert(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes');
      const data = await res.json();
      if (data.success) {
        setQuotes(data.quotes || []);
      }
    } catch (e) {
      console.error('Failed to load quotes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (activeQuoteModal || quoteToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeQuoteModal, quoteToDelete]);

  const handleStatusChange = async (id: string, newStatus: QuoteRequest['status']) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
        );
        if (activeQuoteModal && activeQuoteModal.id === id) {
          setActiveQuoteModal({ ...activeQuoteModal, status: newStatus });
        }
        setToastMessage(`Status updated to ${newStatus}`);
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to update quote status.');
      }
    } catch (e) {
      console.error('Error changing status:', e);
      alert('Network error when updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/quotes?id=${encodeURIComponent(quoteToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete quote request.');
      }

      setQuotes((prev) => prev.filter((q) => q.id !== quoteToDelete.id));
      if (activeQuoteModal?.id === quoteToDelete.id) {
        setActiveQuoteModal(null);
      }
      setToastMessage(`Quote ${quoteToDelete.referenceNumber} has been permanently deleted.`);
      setTimeout(() => setToastMessage(null), 3500);
      setQuoteToDelete(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during deletion.';
      setDeleteError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getEffectiveType = (q: QuoteRequest): QuoteRequestType => {
    return q.requestType || 'wholesale';
  };

  // Counts for pills
  const counts = {
    all: quotes.length,
    retail: quotes.filter((q) => getEffectiveType(q) === 'retail').length,
    wholesale: quotes.filter((q) => getEffectiveType(q) === 'wholesale').length,
    business: quotes.filter((q) => getEffectiveType(q) === 'business').length,
    milling: quotes.filter((q) => getEffectiveType(q) === 'milling').length,
    other: quotes.filter((q) => getEffectiveType(q) === 'other').length,
  };

  const filteredQuotes = quotes.filter((q) => {
    const qType = getEffectiveType(q);
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      q.name.toLowerCase().includes(search) ||
      (q.company && q.company.toLowerCase().includes(search)) ||
      (q.organization && q.organization.toLowerCase().includes(search)) ||
      q.referenceNumber.toLowerCase().includes(search) ||
      (q.productName && q.productName.toLowerCase().includes(search)) ||
      (q.deliveryLocation && q.deliveryLocation.toLowerCase().includes(search)) ||
      (q.subject && q.subject.toLowerCase().includes(search));

    const matchesType = requestTypeFilter === 'all' || qType === requestTypeFilter;
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const exportCSV = () => {
    if (!filteredQuotes.length) return;
    const headers = [
      'Reference',
      'Date',
      'Request Type',
      'Name',
      'Organization/Company',
      'Phone',
      'Email',
      'Customer Segment',
      'Product / Service',
      'Quantity',
      'Unit',
      'Bag Size',
      'Location',
      'Status',
    ];

    const rows = filteredQuotes.map((q) => [
      q.referenceNumber,
      q.createdAt,
      getEffectiveType(q).toUpperCase(),
      `"${q.name}"`,
      `"${q.organization || q.company || ''}"`,
      `"${q.phone}"`,
      `"${q.email || ''}"`,
      `"${q.customerType || ''}"`,
      `"${q.productName || q.millingDetails?.riceType || q.subject || ''}"`,
      q.quantity || q.quantityBags || '',
      `"${q.unit || 'Bags'}"`,
      `"${q.bagSize || ''}"`,
      `"${q.deliveryLocation}"`,
      q.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TGM_Quotes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTypeBadge = (type: QuoteRequestType) => {
    switch (type) {
      case 'retail':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold rounded-xs">
            <ShoppingBag className="w-3 h-3" />
            <span>Retail</span>
          </span>
        );
      case 'wholesale':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold rounded-xs">
            <Truck className="w-3 h-3" />
            <span>Wholesale</span>
          </span>
        );
      case 'business':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold rounded-xs">
            <Building className="w-3 h-3" />
            <span>Institution</span>
          </span>
        );
      case 'milling':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold rounded-xs">
            <Cog className="w-3 h-3" />
            <span>Milling</span>
          </span>
        );
      case 'other':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-800 border border-stone-200 text-[10px] font-semibold rounded-xs">
            <HelpCircle className="w-3 h-3" />
            <span>Enquiry</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 text-[10px] font-semibold rounded-xs">
            {type}
          </span>
        );
    }
  };

  const renderStatusBadge = (status: QuoteRequest['status']) => {
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
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium rounded-xs">
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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Quote Requests & Inquiries
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Universal quotation queue: Retail, Wholesale, Business supply, and Rice Milling requests. ({quotes.length} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchQuotes}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#123D2A]/15 text-xs font-medium rounded-xs hover:bg-[#F8F6EF] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4A72C]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={!filteredQuotes.length}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#123D2A] hover:bg-[#184D35] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Request Type Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {[
          { id: 'all' as const, label: 'All Requests', count: counts.all },
          { id: 'retail' as const, label: 'Retail / Personal', count: counts.retail },
          { id: 'wholesale' as const, label: 'Wholesale / Bulk', count: counts.wholesale },
          { id: 'business' as const, label: 'Business / Institution', count: counts.business },
          { id: 'milling' as const, label: 'Milling Service', count: counts.milling },
          { id: 'other' as const, label: 'Other Enquiries', count: counts.other },
        ].map((tab) => {
          const isSelected = requestTypeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRequestTypeFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#123D2A] text-white border-[#123D2A] shadow-xs'
                  : 'bg-white text-black/70 border-black/15 hover:border-[#123D2A] hover:bg-[#FCFAF5]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-black/60'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-sm border border-[#123D2A]/10 shadow-2xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-black/40" />
          <input
            type="text"
            placeholder="Search by customer name, organization, ref #, product, location..."
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
            <option value="All">All Workflow Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Quoted">Quoted</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden space-y-3">
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((q) => {
            const effType = getEffectiveType(q);
            return (
              <div
                key={q.id}
                className="bg-white p-4 rounded-sm border border-[#123D2A]/10 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#123D2A] text-sm">
                      {q.referenceNumber}
                    </span>
                    {renderTypeBadge(effType)}
                  </div>
                  {renderStatusBadge(q.status)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-black text-sm">{q.name}</span>
                    <span className="text-[10px] text-black/40 font-mono">
                      {new Date(q.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  {(q.organization || q.company) && (
                    <p className="text-black/60 text-[11px] font-medium">{q.organization || q.company}</p>
                  )}
                  <p className="text-[#123D2A] font-medium pt-1">
                    {q.productName || q.millingDetails?.riceType || q.subject || 'Quotation Request'}
                    {q.quantity || q.quantityBags ? (
                      <span className="font-bold text-black">
                        {' '}— {q.quantity || q.quantityBags} {q.unit || 'bags'}
                        {q.bagSize ? ` (${q.bagSize})` : ''}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-black/50 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#71856F]" />
                    <span>{q.deliveryLocation || [q.town, q.county].filter(Boolean).join(', ') || 'Mwea'}</span>
                  </p>
                </div>

                {/* Action Buttons for Mobile */}
                <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                  <button
                    type="button"
                    disabled={downloadingId === q.id}
                    onClick={() => handleDownloadPdf(q)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 min-h-[40px] bg-[#FCFAF5] border border-[#123D2A]/15 text-[#123D2A] rounded-xs font-medium text-xs hover:bg-[#123D2A]/5 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    title="Download PDF"
                  >
                    {downloadingId === q.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-[#D4A72C]" />
                    )}
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveQuoteModal(q)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 min-h-[40px] bg-[#123D2A] text-white rounded-xs font-medium text-xs hover:bg-[#184D35] cursor-pointer active:scale-[0.99]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setQuoteToDelete(q);
                    }}
                    className="p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xs border border-red-200 cursor-pointer active:scale-[0.99]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-sm border border-[#123D2A]/10 text-center text-black/50 text-xs">
            {loading ? 'Loading quote records...' : 'No quote requests match your query.'}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#123D2A] text-[#F8F6EF] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product / Service</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((q) => {
                  const effType = getEffectiveType(q);
                  return (
                    <tr key={q.id} className="hover:bg-[#FCFAF5] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#123D2A]">
                        {q.referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        {renderTypeBadge(effType)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-black block">{q.name}</span>
                        {(q.organization || q.company) && (
                          <span className="text-black/50 text-[11px] block">{q.organization || q.company}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#123D2A] max-w-[200px] truncate">
                        {q.productName || q.millingDetails?.riceType || q.subject || 'Quotation Request'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-black">
                        {q.quantity || q.quantityBags ? (
                          <>
                            {q.quantity || q.quantityBags} {q.unit || 'bags'}{' '}
                            {q.bagSize ? <span className="text-black/50 text-[11px]">({q.bagSize})</span> : null}
                          </>
                        ) : (
                          <span className="text-black/40 text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-black/70 max-w-[150px] truncate">
                        {q.deliveryLocation || [q.town, q.county].filter(Boolean).join(', ') || 'Mwea'}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(q.status)}
                      </td>
                      <td className="py-3 px-4 text-black/50 text-[11px]">
                        {new Date(q.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={downloadingId === q.id}
                            onClick={() => handleDownloadPdf(q)}
                            className="p-1.5 text-black/60 hover:text-[#D4A72C] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                            title="Download Official PDF"
                          >
                            {downloadingId === q.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-[#D4A72C]" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveQuoteModal(q)}
                            className="p-1.5 text-black/60 hover:text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setQuoteToDelete(q);
                            }}
                            className="p-1.5 text-black/60 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-black/50">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                        <span>Loading quote records...</span>
                      </div>
                    ) : (
                      'No quote requests match your query.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {activeQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#123D2A]/20 rounded-sm max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2.5">
                <div>
                  <span className="font-mono text-xs font-bold text-[#D4A72C] block">
                    {activeQuoteModal.referenceNumber}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#123D2A]">
                    {getEffectiveType(activeQuoteModal) === 'wholesale'
                      ? 'Wholesale Quote Details'
                      : getEffectiveType(activeQuoteModal) === 'milling'
                      ? 'Rice Milling Request Details'
                      : getEffectiveType(activeQuoteModal) === 'business'
                      ? 'Institutional Quote Details'
                      : getEffectiveType(activeQuoteModal) === 'other'
                      ? 'Customer Enquiry Details'
                      : 'Retail Quote Details'}
                  </h3>
                </div>
                {renderTypeBadge(getEffectiveType(activeQuoteModal))}
              </div>
              <button
                onClick={() => setActiveQuoteModal(null)}
                aria-label="Close details modal"
                className="p-1.5 text-black/40 hover:text-black rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Status Workflow Selector */}
            <div className="p-3 bg-[#FCFAF5] border border-black/10 rounded-xs flex items-center justify-between">
              <span className="text-xs font-semibold text-[#123D2A] uppercase tracking-wider">
                Workflow Status:
              </span>
              <div className="flex items-center gap-1.5">
                {(['Pending', 'Contacted', 'Quoted', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    disabled={updatingStatus}
                    onClick={() => handleStatusChange(activeQuoteModal.id, st)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-xs border transition-colors cursor-pointer ${
                      activeQuoteModal.status === st
                        ? 'bg-[#123D2A] text-white border-[#123D2A]'
                        : 'bg-white text-black/70 border-black/15 hover:border-[#123D2A]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Inquiry Details Grid */}
            <div className="space-y-4 text-xs">
              {/* Customer Information Group */}
              <div className="border border-black/10 p-3.5 rounded-xs space-y-2 bg-[#FCFAF5]/50">
                <span className="text-[10px] uppercase font-bold text-[#123D2A] tracking-wider block border-b border-black/5 pb-1">
                  Customer Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-black/50 block text-[10px] uppercase font-semibold">Contact Person</span>
                    <span className="font-bold text-black text-sm block">{activeQuoteModal.name}</span>
                  </div>

                  {(activeQuoteModal.organization || activeQuoteModal.company) && (
                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Organization / Business</span>
                      <span className="font-semibold text-black block">
                        {activeQuoteModal.organization || activeQuoteModal.company}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-black/50 block text-[10px] uppercase font-semibold">Telephone</span>
                    <a
                      href={`tel:${activeQuoteModal.phone}`}
                      className="font-medium text-[#123D2A] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#71856F]" />
                      <span>{activeQuoteModal.phone}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-black/50 block text-[10px] uppercase font-semibold">Email Address</span>
                    {activeQuoteModal.email ? (
                      <a
                        href={`mailto:${activeQuoteModal.email}`}
                        className="font-medium text-[#123D2A] hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#71856F]" />
                        <span>{activeQuoteModal.email}</span>
                      </a>
                    ) : (
                      <span className="text-black/40 italic">Not provided (Optional)</span>
                    )}
                  </div>

                  {activeQuoteModal.customerType && (
                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Customer Segment</span>
                      <span className="text-black font-medium">{activeQuoteModal.customerType}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirement / Product Specifications Group */}
              <div className="border border-black/10 p-3.5 rounded-xs space-y-2 bg-[#FCFAF5]/50">
                <span className="text-[10px] uppercase font-bold text-[#123D2A] tracking-wider block border-b border-black/5 pb-1">
                  Request Specifications
                </span>

                {getEffectiveType(activeQuoteModal) === 'milling' ? (
                  /* Milling details */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Rice / Paddy Type</span>
                      <span className="font-semibold text-[#123D2A] block">
                        {activeQuoteModal.millingDetails?.riceType || activeQuoteModal.productName || 'Paddy Pishori'}
                      </span>
                    </div>

                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Estimated Volume</span>
                      <span className="font-bold text-black block">
                        {activeQuoteModal.quantity || activeQuoteModal.quantityBags} {activeQuoteModal.unit || 'bags'}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Milling Requirements</span>
                      <p className="text-black/80 font-medium">
                        {activeQuoteModal.millingDetails?.requirements || 'Standard sorting & grading'}
                      </p>
                    </div>

                    {activeQuoteModal.millingDetails?.preferredDate && (
                      <div>
                        <span className="text-black/50 block text-[10px] uppercase font-semibold">Preferred Date</span>
                        <span className="text-black font-medium">
                          {activeQuoteModal.millingDetails.preferredDate}
                        </span>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Paddy Location / Source Depot</span>
                      <span className="font-medium text-black/80 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#71856F]" />
                        <span>{activeQuoteModal.deliveryLocation}</span>
                      </span>
                    </div>
                  </div>
                ) : getEffectiveType(activeQuoteModal) === 'other' ? (
                  /* Other enquiry */
                  <div className="space-y-3 pt-1">
                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Subject</span>
                      <span className="font-bold text-[#123D2A] text-sm block">
                        {activeQuoteModal.subject || activeQuoteModal.productName || 'General Inquiry'}
                      </span>
                    </div>

                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Message</span>
                      <p className="text-black/80 p-3 bg-white rounded-xs border border-black/10 italic">
                        {activeQuoteModal.message}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Retail / Wholesale / Business */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Requested Product</span>
                      <span className="font-semibold text-[#123D2A] block">
                        {activeQuoteModal.productName || 'Top Grade Pishori Rice'}
                      </span>
                    </div>

                    <div>
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Quantity & Unit</span>
                      <span className="font-bold text-black block">
                        {activeQuoteModal.quantity || activeQuoteModal.quantityBags} {activeQuoteModal.unit || 'bags'}
                        {activeQuoteModal.bagSize ? ` (${activeQuoteModal.bagSize})` : ''}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-black/50 block text-[10px] uppercase font-semibold">Delivery Destination</span>
                      <span className="font-medium text-black/80 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#71856F]" />
                        <span>{activeQuoteModal.deliveryLocation}</span>
                      </span>
                    </div>

                    {activeQuoteModal.message && (
                      <div className="sm:col-span-2">
                        <span className="text-black/50 block text-[10px] uppercase font-semibold">Customer Notes / Frequency</span>
                        <p className="text-black/80 p-2.5 bg-white rounded-xs border border-black/10 italic">
                          {activeQuoteModal.message}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-black/40 flex items-center gap-2 pt-2 border-t border-black/5">
                  <Calendar className="w-3 h-3" />
                  <span>Submitted on {new Date(activeQuoteModal.createdAt).toLocaleString('en-GB')}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  setQuoteToDelete(activeQuoteModal);
                }}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Quote Permanently</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={downloadingId === activeQuoteModal.id}
                  onClick={() => handleDownloadPdf(activeQuoteModal)}
                  className="px-3.5 py-1.5 text-xs bg-white border border-[#123D2A]/30 text-[#123D2A] hover:bg-[#123D2A]/5 font-semibold rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {downloadingId === activeQuoteModal.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-[#D4A72C]" />
                      <span>Download Official PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveQuoteModal(null)}
                  className="px-4 py-1.5 text-xs bg-[#123D2A] text-white font-medium rounded-xs hover:bg-[#184D35] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-red-200 rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#123D2A]">
                  Permanently Delete Quotation?
                </h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  This action will totally and permanently remove quote{' '}
                  <strong className="text-black font-mono">{quoteToDelete.referenceNumber}</strong>{' '}
                  submitted by <strong className="text-black">{quoteToDelete.name}</strong> from the persistent database.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setQuoteToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs text-black/70 hover:text-black hover:bg-black/5 rounded-xs transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs bg-red-600 text-white font-semibold rounded-xs hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Totally</span>
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
