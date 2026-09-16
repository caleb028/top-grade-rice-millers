'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { companyConfig } from '@/data/companyConfig';
import { X, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, MessageSquare, FileDown, Loader2 } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: (product: Product) => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onRequestQuote,
}: ProductModalProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!product) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/pdf/product?id=${encodeURIComponent(product.id)}`);
      if (!res.ok) throw new Error('Failed to download product spec sheet');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Top-Grade-Rice-Millers-${product.slug || 'product'}-spec-sheet.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download spec sheet error:', err);
      alert('Could not download product specification sheet. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 lg:p-8">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B2519]/80 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto bg-[#FCFAF5] rounded-sm shadow-2xl border border-[#D4A72C]/30 text-[#17211C] z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-10 h-10 sm:w-8 sm:h-8 rounded-sm bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>

          {/* Modal Header Media */}
          <div className="relative h-48 xs:h-56 sm:h-72 w-full overflow-hidden bg-[#123D2A]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover filter brightness-[0.9] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FCFAF5] via-transparent to-black/30" />
            
            <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
              <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4A72C] bg-[#123D2A]/90 px-2.5 py-1 rounded-xs mb-1.5 sm:mb-2 border border-[#D4A72C]/20">
                {product.category}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#123D2A] leading-tight">
                {product.name}
              </h3>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            
            {/* Full description */}
            <p className="text-xs sm:text-sm md:text-base text-[#17211C]/85 font-sans leading-relaxed">
              {product.fullDescription}
            </p>

            {/* Technical Specifications Grid */}
            <div className="border-t border-b border-[#123D2A]/10 py-4 sm:py-5">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#123D2A] mb-3 sm:mb-4">
                Verified Grain Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs">
                <div className="bg-[#F8F6EF] p-2.5 sm:p-3 rounded-xs border border-[#123D2A]/5">
                  <span className="text-black/50 block mb-0.5 text-[11px]">Grain Profile</span>
                  <span className="font-semibold text-[#123D2A] text-xs sm:text-sm">{product.grainType}</span>
                </div>
                <div className="bg-[#F8F6EF] p-2.5 sm:p-3 rounded-xs border border-[#123D2A]/5">
                  <span className="text-black/50 block mb-0.5 text-[11px]">Purity Level</span>
                  <span className="font-semibold text-[#123D2A] text-xs sm:text-sm">{product.purity}</span>
                </div>
                <div className="bg-[#F8F6EF] p-2.5 sm:p-3 rounded-xs border border-[#123D2A]/5">
                  <span className="text-black/50 block mb-0.5 text-[11px]">Moisture Max</span>
                  <span className="font-semibold text-[#123D2A] text-xs sm:text-sm">{product.moisture}</span>
                </div>
                <div className="bg-[#F8F6EF] p-2.5 sm:p-3 rounded-xs border border-[#123D2A]/5">
                  <span className="text-black/50 block mb-0.5 text-[11px]">Kernel Integrity</span>
                  <span className="font-semibold text-[#123D2A] text-xs sm:text-sm">{product.brokenRatio}</span>
                </div>
                <div className="bg-[#F8F6EF] p-2.5 sm:p-3 rounded-xs border border-[#123D2A]/5">
                  <span className="text-black/50 block mb-0.5 text-[11px]">Aroma Profile</span>
                  <span className="font-semibold text-[#123D2A] text-xs sm:text-sm">{product.aroma}</span>
                </div>
                <div className="bg-[#F8F6EF] p-2.5 sm:p-3 rounded-xs border border-[#123D2A]/5">
                  <span className="text-black/50 block mb-0.5 text-[11px]">Geographic Origin</span>
                  <span className="font-semibold text-[#123D2A] text-xs sm:text-sm">Mwea, Kenya</span>
                </div>
              </div>
            </div>

            {/* Packaging Sizes */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#123D2A] mb-2.5">
                Standard Bagging & Sizes
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="px-2.5 sm:px-3 py-1 bg-[#123D2A]/5 text-[#123D2A] border border-[#123D2A]/15 text-xs font-medium rounded-xs"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Applications */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#123D2A] mb-2.5">
                Ideal Applications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#17211C]/80">
                {product.idealFor.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#123D2A] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#123D2A]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="text-xs text-black/60">
                <span className="font-semibold text-[#123D2A]">Wholesale Availability:</span>{' '}
                {product.wholesaleAvailable ? 'In stock for commercial order' : 'Seasonal'}
              </div>

              <div className="flex flex-col xs:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-medium text-[#123D2A] border border-[#123D2A]/20 hover:border-[#D4A72C] bg-white rounded-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  title="Download Official Product Specification Sheet (PDF)"
                >
                  {downloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-[#D4A72C]" />
                  )}
                  <span>Spec Sheet (PDF)</span>
                </button>

                <a
                  href={companyConfig.getWhatsAppLink('product', product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-medium text-[#123D2A] border border-[#123D2A]/20 hover:border-[#25D366] bg-white rounded-xs transition-colors active:scale-[0.99]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestQuote(product);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-5 py-2.5 min-h-[44px] rounded-xs text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-[0.99]"
                >
                  <span>Request Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
