'use client';

import React, { useEffect, useState } from 'react';
import { MillingService } from '@/types';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Layers,
  Sliders,
  PackageCheck,
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'ShieldCheck', label: 'Shield & Check (Cleaning)' },
  { name: 'Layers', label: 'Layers (Husking)' },
  { name: 'Sliders', label: 'Sliders (Grading)' },
  { name: 'Eye', label: 'Eye (Optical Sorting)' },
  { name: 'PackageCheck', label: 'Package & Check (Bagging)' },
  { name: 'Wrench', label: 'Wrench (Milling Service)' },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<MillingService[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MillingService | null>(null);
  const [formData, setFormData] = useState<Partial<MillingService>>({
    number: '',
    name: '',
    tagline: '',
    description: '',
    iconName: 'ShieldCheck',
    keyCapability: '',
    active: true,
  });

  // Deletion Modal
  const [serviceToDelete, setServiceToDelete] = useState<MillingService | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (e) {
      console.error('Failed to load services:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (isModalOpen || serviceToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, serviceToDelete]);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      number: String(services.length + 1).padStart(2, '0'),
      name: '',
      tagline: '',
      description: '',
      iconName: 'ShieldCheck',
      keyCapability: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (srv: MillingService) => {
    setEditingService(srv);
    setFormData({ ...srv });
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const isEdit = Boolean(editingService?.id);
      const url = '/api/services';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...formData, id: editingService!.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save service.');
      }

      setIsModalOpen(false);
      setToastMessage(isEdit ? 'Service updated successfully.' : 'Service created.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchServices();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error occurred.';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (srv: MillingService) => {
    try {
      const newActive = !srv.active;
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: srv.id, active: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === srv.id ? { ...s, active: newActive } : s))
        );
        setToastMessage(`Service ${newActive ? 'activated' : 'deactivated'}.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      console.error('Failed to toggle active:', e);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(serviceToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete service.');
      }

      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      setServiceToDelete(null);
      setToastMessage('Service permanently deleted.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed.';
      alert(msg);
    } finally {
      setActionLoading(false);
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Milling Services Management
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Configure the industrial milling processes presented on the public website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D4A72C]" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`bg-white rounded-sm border p-4 sm:p-5 shadow-2xs flex flex-col justify-between transition-all ${
              srv.active ? 'border-[#123D2A]/15' : 'border-black/10 opacity-75 bg-[#FCFAF5]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#D4A72C]">
                  {srv.number || '—'}
                </span>
                <button
                  onClick={() => handleToggleActive(srv)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[36px] rounded-xs text-[11px] font-medium border cursor-pointer ${
                    srv.active
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                  title="Toggle website visibility"
                >
                  {srv.active ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#123D2A] leading-snug">
                  {srv.name}
                </h3>
                {srv.tagline && (
                  <p className="text-[11px] font-medium text-[#71856F] mt-0.5">
                    {srv.tagline}
                  </p>
                )}
              </div>

              <p className="text-xs text-black/75 leading-relaxed">
                {srv.description}
              </p>

              {srv.keyCapability && (
                <div className="bg-[#FAF7F0] p-2.5 rounded-xs border border-black/5 text-[11px] text-[#123D2A] flex items-start gap-1.5">
                  <span className="font-bold text-[#D4A72C] shrink-0">✦</span>
                  <span className="italic">{srv.keyCapability}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/5">
              <span className="text-[10px] text-black/40 uppercase font-mono">
                Icon: {srv.iconName || 'ShieldCheck'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(srv)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-black/60 hover:text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                  title="Edit Service"
                  aria-label="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setServiceToDelete(srv)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-black/60 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                  title="Delete Service"
                  aria-label="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#123D2A]/20 rounded-sm max-w-lg w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#123D2A]">
                {editingService ? 'Edit Milling Service' : 'Add New Milling Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-black/40 hover:text-black cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#123D2A] block mb-1">Step #</label>
                  <input
                    type="text"
                    value={formData.number || ''}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="01"
                    className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#123D2A] block mb-1">Service Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Precision Destoning"
                    className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#123D2A] block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. High-throughput debris removal"
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#123D2A] block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain machinery, operational process, and standards..."
                  className="w-full p-3 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-[#123D2A] block mb-1">Key Capability / Guarantee</label>
                <input
                  type="text"
                  value={formData.keyCapability || ''}
                  onChange={(e) => setFormData({ ...formData, keyCapability: e.target.value })}
                  placeholder="e.g. Zero stones guarantee through density separation."
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#123D2A] block mb-1">Icon Representation</label>
                  <select
                    value={formData.iconName || 'ShieldCheck'}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-2 sm:pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded-xs text-[#123D2A] focus:ring-[#123D2A]"
                    />
                    <span className="font-semibold text-[#123D2A]">Active (Visible on public site)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 min-h-[44px] text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Service</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-red-200 rounded-sm max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#123D2A]">
                  Delete Milling Service?
                </h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Permanently delete <strong className="text-black">{serviceToDelete.name}</strong> from milling capabilities?
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                disabled={actionLoading}
                className="px-4 py-2 min-h-[44px] text-xs text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteService}
                disabled={actionLoading}
                className="px-4 py-2 min-h-[44px] text-xs bg-red-600 text-white font-semibold rounded-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
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
