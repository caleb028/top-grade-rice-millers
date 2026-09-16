'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { companyConfig, farmProcessSteps } from '@/data/companyConfig';
import { ShieldCheck, CheckCircle2, Sliders, PackageCheck, Sprout, Cog, Package, Truck, ArrowRight } from 'lucide-react';

const pillarIcons = [ShieldCheck, Sliders, CheckCircle2, PackageCheck];
const stepIcons = [Sprout, Cog, CheckCircle2, Package, Truck];

export default function QualitySection() {
  return (
    <section id="quality" className="py-16 sm:py-24 md:py-32 bg-[#FCFAF5] relative overflow-hidden border-b border-[#123D2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#123D2A]"
          >
            <span className="w-6 h-[1px] bg-[#D4A72C]" />
            <span>Milling Discipline & Standards</span>
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

        {/* 4 Quality Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-16 sm:mb-20">
          {companyConfig.qualityPillars.map((pillar, idx) => {
            const Icon = pillarIcons[idx] || ShieldCheck;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white p-6 sm:p-7 rounded-sm border border-[#123D2A]/10 relative group hover:border-[#D4A72C] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-sm bg-[#123D2A] text-[#D4A72C] flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#D4A72C] group-hover:text-[#123D2A] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="font-serif text-lg font-bold text-[#123D2A] mb-1 leading-tight">
                  {pillar.title}
                </h3>
                
                <p className="text-xs font-semibold text-[#71856F] uppercase tracking-wider mb-2.5">
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

        {/* 5-Stage Grain Lifecycle Stepper */}
        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-sm border border-[#123D2A]/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-[#123D2A]/10 mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4A72C] block">
                Operational Integrity
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#123D2A]">
                The 5-Stage Grain Lifecycle
              </h3>
            </div>
            <p className="text-xs text-[#17211C]/65 max-w-sm">
              Continuous food-grade quality oversight from Mwea irrigation paddy to bagged customer delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {farmProcessSteps.map((step, idx) => {
              const Icon = stepIcons[idx] || CheckCircle2;
              return (
                <div
                  key={step.step}
                  className="p-4 rounded-xs bg-[#FCFAF5] border border-[#123D2A]/10 flex flex-col justify-between space-y-3 group hover:border-[#D4A72C] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xs bg-[#123D2A] text-[#D4A72C] flex items-center justify-center group-hover:bg-[#D4A72C] group-hover:text-[#123D2A] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-base font-bold text-[#D4A72C]">
                        {step.step}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#123D2A] uppercase">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-[#71856F] font-semibold uppercase tracking-wider">
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[#17211C]/75 font-sans leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#123D2A]/10 text-[10px] text-[#123D2A] font-medium">
                    ✓ {step.highlight}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
