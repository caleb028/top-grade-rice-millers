'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { farmProcessSteps } from '@/data/companyConfig';
import { Sprout, Cog, CheckCircle2, Package, Truck } from 'lucide-react';

const icons = [Sprout, Cog, CheckCircle2, Package, Truck];

export default function FarmToTable() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#FCFAF5] relative overflow-hidden border-b border-[#123D2A]/10">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4A72C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-24 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#123D2A]"
          >
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
            <span>Operational Integrity</span>
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-[#123D2A] tracking-tight"
          >
            From Farm <span className="italic font-normal text-[#D4A72C]">To Table</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs sm:text-base text-[#17211C]/70 font-sans"
          >
            A disciplined, multi-tier milling lifecycle ensuring that every grain leaving our Mwea facility meets uncompromising food-grade standards.
          </motion.p>
        </div>

        {/* Process Steps (Responsive Grid / Stepper) */}
        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-14 left-[8%] right-[8%] h-[1.5px] bg-[#123D2A]/15 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 relative z-10">
            {farmProcessSteps.map((step, idx) => {
              const Icon = icons[idx] || CheckCircle2;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 28, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="corporate-card rounded-sm p-5 sm:p-6 flex flex-col justify-between group hover:border-[#D4A72C] transition-all bg-white relative"
                >
                  <div>
                    {/* Top indicator & Step number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-sm bg-[#123D2A] group-hover:bg-[#D4A72C] transition-colors flex items-center justify-center text-[#F8F6EF] group-hover:text-[#123D2A] shadow-sm">
                        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="font-serif text-xl font-bold text-[#D4A72C] tracking-tight">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#123D2A] tracking-tight uppercase mb-1">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs font-semibold text-[#71856F] uppercase tracking-wider mb-3">
                      {step.subtitle}
                    </p>

                    <p className="text-xs sm:text-sm text-[#17211C]/75 font-sans leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-black/5">
                    <span className="inline-block text-[11px] font-medium text-[#123D2A] bg-[#F8F6EF] px-2 py-1 rounded-xs border border-[#123D2A]/10">
                      {step.highlight}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
