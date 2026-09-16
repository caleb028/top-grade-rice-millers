'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { Product } from '@/types';

const COMMON_SIZES = ['1 kg', '2 kg', '5 kg', '10 kg', '25 kg', '50 kg', '1-Tonne Pallet'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal editor state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Aromatic Premium Rice',
    shortDescription: '',
    fullDescription: '',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85',
    sizes: ['25 kg', '50 kg'],
    grainType: 'Slender Long Grain Aromatic',
    purity: 'Grade 1 Pure Grain',
    moisture: '< 13.0%',
    brokenRatio: '< 5% Broken',
    aroma: 'Natural High Pishori Aroma',
    origin: 'Mwea Irrigation Scheme, Kirinyaga County, Kenya',
    wholesaleAvailable: true,
    featured: false,
    active: true,
  });

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownloadPdf = async (prod: Product) => {
    setDownloadingPdfId(prod.id);
    try {
      const res = await fetch(`/api/pdf/product?id=${encodeURIComponent(prod.id)}`);
      if (!res.ok) throw new Error('Failed to generate product PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Top-Grade-Rice-Millers-${prod.slug || 'product'}-spec.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setToastMessage(`Downloaded ${prod.name} PDF brochure.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Download PDF error:', err);
      setErrorMsg('Could not download product PDF specification.');
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isModalOpen || productToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, productToDelete]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Aromatic Premium Rice',
      shortDescription: '',
      fullDescription: '',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85',
      sizes: ['25 kg', '50 kg'],
      grainType: 'Slender Long Grain Aromatic',
      purity: 'Grade 1 Pure Grain',
      moisture: '< 13.0%',
      brokenRatio: '< 5% Broken',
      aroma: 'Natural High Pishori Aroma',
      origin: 'Mwea Irrigation Scheme, Kirinyaga County, Kenya',
      wholesaleAvailable: true,
      featured: false,
      active: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const toggleSize = (size: string) => {
    const currentSizes = formData.sizes || [];
    if (currentSizes.includes(size)) {
      setFormData({ ...formData, sizes: currentSizes.filter((s) => s !== size) });
    } else {
      setFormData({ ...formData, sizes: [...currentSizes, size] });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setActionLoading(true);

    try {
      const isEdit = Boolean(editingProduct?.id);
      const url = '/api/products';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...formData, id: editingProduct!.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save product');
      }

      setIsModalOpen(false);
      setToastMessage(isEdit ? 'Product updated successfully.' : 'Product added to catalogue.');
      setTimeout(() => setToastMessage(null), 4000);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (prod: Product) => {
    try {
      const newActive = !prod.active;
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prod.id, active: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, active: newActive } : p))
        );
        setToastMessage(`Product ${newActive ? 'activated' : 'deactivated'}.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      console.error('Failed to toggle status:', e);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(productToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete product.');
      }

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
      setToastMessage('Product permanently deleted from catalogue.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting product.';
      setErrorMsg(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Products Management
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Manage the rice varieties and milling grades displayed on the public website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123D2A] hover:bg-[#184D35] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D4A72C]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-sm border border-[#123D2A]/10 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-black/40 ml-1" />
        <input
          type="text"
          placeholder="Search products by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Mobile Stacked Card View (phones & small screens) */}
      <div className="block md:hidden space-y-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-sm border border-[#123D2A]/10 shadow-2xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-xs overflow-hidden bg-[#123D2A] shrink-0 border border-black/10">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-sm text-[#123D2A] truncate">
                        {p.name}
                      </span>
                      {p.featured && (
                        <span className="inline-flex items-center gap-0.5 text-[#D4A72C] text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-[#123D2A]/5 text-[#123D2A] border border-[#123D2A]/10 rounded-xs text-[10px] font-medium mt-0.5">
                      {p.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(p)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-medium border cursor-pointer shrink-0 ${
                    p.active !== false
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                  title="Toggle website visibility"
                >
                  {p.active !== false ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-gray-500" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-black/70 line-clamp-2">
                {p.shortDescription}
              </p>

              <div className="flex flex-wrap gap-1">
                {p.sizes.map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 bg-[#F8F6EF] text-black/80 border border-black/10 rounded-2xs text-[10px] font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Action Buttons for Mobile */}
              <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  disabled={downloadingPdfId === p.id}
                  onClick={() => handleDownloadPdf(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2.5 min-h-[40px] bg-[#FCFAF5] border border-[#123D2A]/15 text-[#123D2A] rounded-xs font-medium text-xs hover:bg-[#123D2A]/5 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  title="Download Spec Sheet"
                >
                  {downloadingPdfId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-[#D4A72C]" />
                  )}
                  <span>PDF Spec</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEditModal(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 min-h-[40px] bg-[#123D2A] text-white rounded-xs font-medium text-xs hover:bg-[#184D35] cursor-pointer active:scale-[0.99]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductToDelete(p)}
                  className="p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xs border border-red-200 cursor-pointer active:scale-[0.99]"
                  title="Delete Product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-sm border border-[#123D2A]/10 text-center text-black/50 text-xs">
            {loading ? 'Loading product catalogue...' : 'No products found matching your search.'}
          </div>
        )}
      </div>

      {/* Products Desktop Table */}
      <div className="hidden md:block bg-white rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#123D2A] text-[#F8F6EF] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pack Sizes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FCFAF5] transition-colors">
                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xs overflow-hidden bg-[#123D2A] shrink-0 border border-black/10">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-sm text-[#123D2A] block truncate max-w-xs">
                            {p.name}
                          </span>
                          <p className="text-[11px] text-black/60 line-clamp-1 max-w-sm">
                            {p.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-[#123D2A]/5 text-[#123D2A] border border-[#123D2A]/10 rounded-xs text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>

                    {/* Sizes */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 bg-[#F8F6EF] text-black/80 border border-black/10 rounded-2xs text-[10px] font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Active Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-medium border cursor-pointer ${
                          p.active !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                        title="Click to toggle visibility on website"
                      >
                        {p.active !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="py-3 px-4">
                      {p.featured ? (
                        <span className="inline-flex items-center gap-1 text-[#D4A72C] text-[11px] font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-black/30 text-[11px]">No</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownloadPdf(p)}
                          disabled={downloadingPdfId === p.id}
                          className="p-1.5 text-black/60 hover:text-[#D4A72C] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                          title="Download Official PDF Specification"
                        >
                          {downloadingPdfId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-black/60 hover:text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-black/60 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-black/50 text-xs">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                        <span>Loading product catalogue...</span>
                      </div>
                    ) : (
                      'No products found matching your search.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#123D2A]/20 rounded-sm max-w-2xl w-full max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-serif text-lg font-bold text-[#123D2A]">
                {editingProduct ? 'Edit Product' : 'Add New Rice Variety'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-black/40 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mwea Pure Pishori (Grade 1)"
                    className="w-full p-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#D4A72C] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Aromatic Premium Rice"
                    className="w-full p-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#D4A72C] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                  Short Description (Cards) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Concise summary for public catalogue cards..."
                  className="w-full p-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#D4A72C] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                  Full Technical Description (Modal)
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDescription || ''}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Detailed specifications, cooking qualities, and heritage..."
                  className="w-full p-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#D4A72C] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://... or /uploads/..."
                  className="w-full p-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#D4A72C] outline-none"
                />
              </div>

              {/* Sizes Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                  Available Packaging Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SIZES.map((size) => {
                    const isSelected = (formData.sizes || []).includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-2.5 py-1 rounded-xs border text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#123D2A] text-white border-[#123D2A]'
                            : 'bg-white text-black/70 border-black/20 hover:border-[#123D2A]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="font-medium text-black/70 block mb-1">Grain Type</label>
                  <input
                    type="text"
                    value={formData.grainType || ''}
                    onChange={(e) => setFormData({ ...formData, grainType: e.target.value })}
                    className="w-full p-1.5 bg-[#FCFAF5] border border-black/15 rounded-xs text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-medium text-black/70 block mb-1">Purity</label>
                  <input
                    type="text"
                    value={formData.purity || ''}
                    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                    className="w-full p-1.5 bg-[#FCFAF5] border border-black/15 rounded-xs text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-medium text-black/70 block mb-1">Broken Ratio</label>
                  <input
                    type="text"
                    value={formData.brokenRatio || ''}
                    onChange={(e) => setFormData({ ...formData, brokenRatio: e.target.value })}
                    className="w-full p-1.5 bg-[#FCFAF5] border border-black/15 rounded-xs text-[11px]"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="pt-2 flex flex-wrap items-center gap-6 border-t border-black/10">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded-xs text-[#123D2A] focus:ring-[#D4A72C]"
                  />
                  <span className="font-semibold text-[#123D2A]">Active (Visible on public site)</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.featured)}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded-xs text-[#123D2A] focus:ring-[#D4A72C]"
                  />
                  <span className="font-semibold text-[#123D2A]">Featured Selection</span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-black/10">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(editingProduct)}
                    disabled={downloadingPdfId === editingProduct.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#123D2A]/20 bg-white hover:bg-[#FCFAF5] text-[#123D2A] text-xs font-semibold rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Download Official PDF Specification Brochure"
                  >
                    {downloadingPdfId === editingProduct.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5 text-[#D4A72C]" />
                    )}
                    <span>Download PDF Brochure</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-[#123D2A] hover:bg-[#184D35] text-white font-semibold rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-red-200 rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#123D2A]">
                  Delete Product Variety?
                </h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-black">{productToDelete.name}</strong> from the catalogue?
                  This product will immediately stop appearing on the public website.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={actionLoading}
                className="px-3.5 py-1.5 text-xs text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
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
                    <span>Yes, Delete Permanently</span>
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
