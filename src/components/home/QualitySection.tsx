'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { ShieldCheck, CheckCircle2, Sliders, PackageCheck } from 'lucide-react';

const icons = [ShieldCheck, Sliders, CheckCircle2, PackageCheck];

export default function QualitySection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#FCFAF5] relative overflow-hidden border-b border-[#123D2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Large Editorial Typography */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 md:mb-24 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#123D2A]"
          >
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
            <span>Milling Discipline</span>
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#123D2A] tracking-tight leading-[1.08]"
          >
            Quality You Can See. <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#D4A72C]">Quality You Can Trust.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-[#17211C]/70 font-sans max-w-2xl mx-auto px-2"
          >
            Our processing line is calibrated to eliminate stones, discoloured kernels, and excess moisture before any sack is sealed.
          </motion.p>
        </div>

        {/* Quality Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {companyConfig.qualityPillars.map((pillar, idx) => {
            const Icon = icons[idx] || ShieldCheck;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="bg-white p-6 sm:p-8 rounded-sm border border-[#123D2A]/10 relative group hover:border-[#D4A72C] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-sm bg-[#123D2A] text-[#D4A72C] flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-[#D4A72C] group-hover:text-[#123D2A] transition-colors">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#123D2A] mb-1 leading-tight">
                  {pillar.title}
                </h3>
                
                <p className="text-xs font-semibold text-[#71856F] uppercase tracking-wider mb-3">
                  {pillar.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-[#17211C]/75 font-sans leading-relaxed">
                  {pillar.description}
                </p>

                <div className="absolute top-4 right-4 text-xs font-serif text-[#D4A72C]/40 group-hover:text-[#D4A72C] font-bold">
                  0{idx + 1}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
