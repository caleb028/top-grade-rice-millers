'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { millingServicesList, companyConfig } from '@/data/companyConfig';
import { MillingService } from '@/types';
import { ShieldCheck, Layers, Sliders, Eye, PackageCheck, MessageSquare, Wrench } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Layers,
  Sliders,
  Eye,
  PackageCheck,
  Wrench,
};

interface MillingServicesProps {
  onOpenQuoteModal?: () => void;
}

export default function MillingServices({ onOpenQuoteModal }: MillingServicesProps) {
  const [services, setServices] = useState<MillingService[]>(millingServicesList);

  useEffect(() => {
    fetch('/api/services?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section id="services" className="py-16 sm:py-24 md:py-32 bg-[#123D2A] text-[#F8F6EF] relative overflow-hidden border-b border-[#D4A72C]/20">
      {/* Authentic Milling Line Photography Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80"
          alt="Modern Rice Milling Facility"
          fill
          sizes="100vw"
          className="object-cover object-center filter grayscale brightness-[0.25] contrast-[1.25] opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#123D2A] via-[#123D2A]/90 to-[#123D2A]" />
      </div>

      {/* Background vignette & texture */}
      <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none" />
      <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4A72C]"
          >
            <span className="w-8 h-[1px] bg-[#D4A72C]" />
            <span>Facility Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#F8F6EF] tracking-tight"
          >
            Professional <span className="italic font-normal text-[#D4A72C]">Milling Services</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-white/75 font-sans leading-relaxed"
          >
            Modern mechanical processing designed to maximize whole-grain recovery, eliminate foreign stones, and uphold uniform food-grade standards for commercial paddy growers, distributors, and retailers.
          </motion.p>
        </div>

        {/* Milling Services with Gold Accent Hover */}
        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {services.map((service, idx) => {
            const Icon = iconMap[service.iconName] || ShieldCheck;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="py-6 sm:py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center group relative cursor-pointer"
              >
                {/* Thin gold accent line on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D4A72C] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Number & Icon (4 cols on desktop) */}
                <div className="md:col-span-4 flex items-center gap-3.5 sm:gap-4">
                  <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#D4A72C]/50 group-hover:text-[#D4A72C] transition-colors shrink-0">
                    {service.number}
                  </span>
                  <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 group-hover:border-[#D4A72C]/40 group-hover:bg-[#D4A72C]/10 flex items-center justify-center text-[#D4A72C] transition-all shrink-0">
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#F8F6EF] group-hover:text-[#D4A72C] transition-colors leading-tight">
                      {service.name}
                    </h3>
                    <span className="text-[11px] text-white/50 block">
                      {service.tagline}
                    </span>
                  </div>
                </div>

                {/* Explanation (6 cols) */}
                <div className="md:col-span-6">
                  <p className="text-xs sm:text-sm text-white/75 font-sans leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Capability Highlight (2 cols) */}
                <div className="md:col-span-2 text-left">
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[#D4A72C] bg-[#D4A72C]/10 px-2 py-1 rounded-xs border border-[#D4A72C]/20">
                    Industrial Standard
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Service CTA Footer */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 pt-4 sm:pt-6">
          <p className="text-xs sm:text-sm text-white/60 text-center sm:text-left">
            Need toll milling, commercial batch processing, or contract bagging in Mwea?
          </p>
          <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3">
            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="inline-flex items-center justify-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-6 py-3 min-h-[44px] rounded-sm text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <span>Request Milling Quote</span>
              </button>
            )}
            <a
              href={companyConfig.getWhatsAppLink('milling')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white px-5 py-3 min-h-[44px] rounded-sm text-xs font-semibold tracking-wider uppercase transition-all active:scale-[0.99]"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Milling Desk</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
