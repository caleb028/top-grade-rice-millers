'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { GalleryImage } from '@/types';
import {
  Images,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  Plus,
  FileImage,
} from 'lucide-react';

const CATEGORIES = ['All', 'Rice', 'Milling', 'Mwea', 'Facilities', 'Team', 'Packaging'];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Rice');
  const [uploadFeatured, setUploadFeatured] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete modal state
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) {
        setImages(data.gallery || []);
      }
    } catch (e) {
      console.error('Failed to load gallery:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (isUploadModalOpen || imageToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isUploadModalOpen, imageToDelete]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setFilePreview(URL.createObjectURL(file));
      if (!uploadTitle) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadTitle(nameWithoutExt);
        setUploadAlt(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      // 1. Upload file binary
      const formData = new FormData();
      formData.append('file', uploadFile);

      const uploadRes = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Image upload failed.');
      }

      // 2. Save metadata to gallery
      const metaRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploadData.url,
          title: uploadTitle.trim() || uploadFile.name,
          alt: uploadAlt.trim() || uploadTitle.trim(),
          category: uploadCategory,
          featured: uploadFeatured,
        }),
      });
      const metaData = await metaRes.json();

      if (!metaRes.ok || !metaData.success) {
        throw new Error(metaData.message || 'Failed to save image metadata.');
      }

      // Reset and refresh
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setFilePreview(null);
      setUploadTitle('');
      setUploadAlt('');
      setToastMessage('Image uploaded and added to gallery.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading image.';
      setUploadError(msg);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(imageToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete image.');
      }

      setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      setImageToDelete(null);
      setToastMessage('Image removed from gallery.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed.';
      alert(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredImages = images.filter((img) =>
    selectedCategory === 'All' ? true : img.category === selectedCategory
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Gallery Management
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Manage high-resolution photographs used across the Top Grade digital platform. ({images.length} items)
          </p>
        </div>

        <button
          onClick={() => {
            setUploadError(null);
            setIsUploadModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer w-full sm:w-auto shrink-0"
        >
          <Upload className="w-4 h-4 text-[#D4A72C]" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-2.5 sm:p-3 rounded-sm border border-[#123D2A]/10 shadow-2xs overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
        <span className="shrink-0 text-xs font-semibold text-[#123D2A] mr-1 uppercase tracking-wider">
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 min-h-[36px] rounded-xs text-xs font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap flex items-center justify-center ${
              selectedCategory === cat
                ? 'bg-[#123D2A] text-white'
                : 'bg-[#FCFAF5] text-black/70 hover:bg-[#123D2A]/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-sm border border-[#123D2A]/15 overflow-hidden shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 w-full bg-[#123D2A] overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.alt || img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#123D2A]/90 text-[#D4A72C] text-[10px] font-semibold uppercase px-2 py-0.5 rounded-2xs border border-[#D4A72C]/30">
                      {img.category}
                    </span>
                  </div>

                  {img.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-amber-400/90 text-[#123D2A] text-[10px] font-bold px-1.5 py-0.5 rounded-2xs flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="font-semibold text-xs text-[#123D2A] truncate">
                    {img.title}
                  </h4>
                  <p className="text-[11px] text-black/60 truncate">
                    {img.alt || 'No alt text set'}
                  </p>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center justify-between border-t border-black/5 mt-2">
                <span className="text-[10px] text-black/40 font-mono">
                  {new Date(img.createdAt).toLocaleDateString('en-GB')}
                </span>
                <button
                  onClick={() => setImageToDelete(img)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center text-black/50 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                  title="Delete image"
                  aria-label="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-sm border border-black/10 text-black/50 text-xs">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                <span>Loading gallery photographs...</span>
              </div>
            ) : (
              'No photographs found in this category.'
            )}
          </div>
        )}
      </div>

      {/* Real Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#123D2A]/20 rounded-sm max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#123D2A]">
                Upload Website Photography
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-black/40 hover:text-black cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* Drop/Select Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#123D2A]/30 hover:border-[#D4A72C] rounded-sm p-4 sm:p-6 text-center cursor-pointer bg-[#FCFAF5] transition-colors min-h-[100px] flex items-center justify-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {filePreview ? (
                  <div className="space-y-2 w-full">
                    <div className="relative h-36 w-full rounded-xs overflow-hidden mx-auto">
                      <Image
                        src={filePreview}
                        alt="Upload preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-[#123D2A]">
                      Click to choose a different image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <FileImage className="w-8 h-8 text-[#123D2A]/40" />
                    <div>
                      <p className="font-semibold text-xs text-[#123D2A]">
                        Click to select an image from your device
                      </p>
                      <p className="text-[10px] text-black/50 mt-0.5">
                        JPG, PNG, or WEBP (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-[#123D2A] block mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Mwea Rice Basin Irrigation Channel"
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#123D2A] block mb-1">Alt Text (Accessibility) *</label>
                <input
                  type="text"
                  required
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Descriptive text for accessibility and search engines..."
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#123D2A] block mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-2 sm:pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={uploadFeatured}
                      onChange={(e) => setUploadFeatured(e.target.checked)}
                      className="w-4 h-4 rounded-xs text-[#123D2A] focus:ring-[#123D2A]"
                    />
                    <span className="font-semibold text-[#123D2A]">Featured Image</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 min-h-[44px] text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !uploadFile}
                  className="px-5 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                      <span>Uploading File...</span>
                    </>
                  ) : (
                    <span>Save to Gallery</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-red-200 rounded-sm max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#123D2A]">
                  Delete Photograph?
                </h3>
                <p className="text-xs text-black/70 leading-relaxed">
                  Permanently remove <strong className="text-black">{imageToDelete.title}</strong> from website gallery?
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2 min-h-[44px] text-xs text-black/70 hover:bg-black/5 rounded-xs font-medium cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={deleteLoading}
                className="px-4 py-2 min-h-[44px] text-xs bg-red-600 text-white font-semibold rounded-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleteLoading ? (
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
