'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { ArrowUpRight, CheckCircle2, MessageSquare, Building2, Store, UtensilsCrossed } from 'lucide-react';

interface WholesaleSectionProps {
  onOpenQuoteModal: () => void;
}

export default function WholesaleSection({ onOpenQuoteModal }: WholesaleSectionProps) {
  return (
    <section id="wholesale" className="relative py-16 sm:py-24 md:py-32 bg-[#0B2519] text-[#F8F6EF] overflow-hidden">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=2000&q=80"
          alt="Top Grade Rice Millers Wholesale Storage"
          fill
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.35] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2519] via-[#0B2519]/80 to-[#0B2519]/90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Commercial Proposition (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4A72C]"
            >
              <span className="w-8 h-[1px] bg-[#D4A72C]" />
              <span>Commercial & Institutional Procurement</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F8F6EF] leading-tight"
            >
              Need Rice <span className="italic font-normal text-[#D4A72C]">in Bulk?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white/80 font-sans max-w-xl leading-relaxed"
            >
              Talk to our team about wholesale, institutional and commercial supply. We supply supermarket chains, distributors, school feeding programs, and hospitality groups with disciplined scheduling and verified grain grades.
            </motion.p>

            {/* Customer Types Grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2 text-xs"
            >
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xs">
                <Store className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <span>Supermarkets & Retailers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xs">
                <Building2 className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <span>Grain Wholesalers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xs">
                <UtensilsCrossed className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <span>Hotels & Caterers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <span>Schools & Hospitals</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <span>Regional Distributors</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#D4A72C] shrink-0" />
                <span>Food Manufacturers</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-7 py-3.5 min-h-[44px] rounded-sm text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] group cursor-pointer"
              >
                <span>Request Wholesale Quote</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <a
                href={companyConfig.getWhatsAppLink('quote')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 min-h-[44px] rounded-sm text-xs sm:text-sm font-medium transition-colors active:scale-[0.99]"
              >
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                <span>Instant WhatsApp Enquiry</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Commercial Assurance Card (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 bg-[#123D2A]/90 border border-[#D4A72C]/30 p-5 sm:p-8 rounded-sm space-y-4 sm:space-y-5 backdrop-blur-md"
          >
            <div className="border-b border-white/10 pb-3 sm:pb-4">
              <span className="text-xs uppercase tracking-widest text-[#D4A72C] font-semibold">
                Procurement Commitments
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F6EF] mt-1">
                Direct Mill Supply Terms
              </h3>
            </div>

            <ul className="space-y-3 sm:space-y-3.5 text-xs sm:text-sm text-white/80 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mt-2 shrink-0" />
                <span><strong>Flexible Packaging:</strong> Dispatched in 25kg, 50kg, or bespoke retail baled bags (1kg, 2kg, 5kg).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mt-2 shrink-0" />
                <span><strong>Purity & Weight Verification:</strong> Electronically verified net weight before loading at our Wang&apos;uru facility.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mt-2 shrink-0" />
                <span><strong>Nationwide Logistics:</strong> Ex-mill pickup in Mwea or structured dispatch to Nairobi, Kiambu, Nakuru, Mombasa, and regional hubs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C] mt-2 shrink-0" />
                <span><strong>Direct Mill Pricing:</strong> Eliminating unneeded intermediary markups for bulk institutional contracts.</span>
              </li>
            </ul>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <span>Standard Order Minimum: 10 Bags</span>
              <span className="text-[#D4A72C]">Ex-Mill Mwea</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
