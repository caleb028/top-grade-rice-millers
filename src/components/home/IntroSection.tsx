'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function IntroSection() {
  return (
    <section className="relative py-14 sm:py-20 md:py-28 bg-[#F8F6EF] overflow-hidden border-b border-[#123D2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Large Playfair Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-3 sm:space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#123D2A]">
              <span className="w-8 h-[1px] bg-[#D4A72C]" />
              <span>The Mwea Heritage</span>
            </div>
            
            <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#123D2A] font-bold leading-[1.12] sm:leading-[1.08] tracking-tight">
              Where Great <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#D4A72C]">Rice Begins</span>
            </h2>
          </motion.div>

          {/* Right Column: Short impactful introduction */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-4 sm:space-y-6 lg:border-l lg:border-[#123D2A]/15 lg:pl-12"
          >
            <p className="font-serif text-base sm:text-xl text-[#17211C] leading-relaxed">
              {companyConfig.aboutText.summary}
            </p>

            <p className="text-xs sm:text-base text-[#17211C]/75 leading-relaxed font-sans">
              Fed by the pure, perennial waters of Mount Kenya and nurtured by the fertile soils of Kirinyaga, Mwea produces Africa&apos;s most fragrant rice. At Top Grade Rice Millers, we honor this crop with rigorous milling standards and state-of-the-art destoning.
            </p>

            <div className="pt-1 sm:pt-2">
              <a
                href="#about"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#123D2A] hover:text-[#D4A72C] transition-colors py-2 group"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-4 h-4 text-[#D4A72C] group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
