'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { MapPin, Droplets, Mountain, Award, FileDown } from 'lucide-react';

export default function AboutSection() {
  const [company, setCompany] = useState(companyConfig);

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.company) {
          setCompany((prev) => ({
            ...prev,
            ...data.company,
            aboutText: { ...prev.aboutText, ...data.company.aboutText },
            location: { ...prev.location, ...data.company.location },
          }));
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section id="about" className="py-16 sm:py-24 md:py-32 bg-[#F8F6EF] relative overflow-hidden border-b border-[#123D2A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Story + Image Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Photographic Collage (6 cols) */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Primary Large Image */}
              <div className="relative h-72 sm:h-80 md:h-96 w-full rounded-sm overflow-hidden shadow-xl border border-[#123D2A]/10">
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
                  alt="Mwea Paddy Fields Kirinyaga County"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase tracking-widest text-[#D4A72C] font-semibold">
                    The Mwea Ecosystem
                  </span>
                  <p className="font-serif text-xs sm:text-sm italic">
                    Mount Kenya glacial runoff irrigating the Kirinyaga volcanic basin.
                  </p>
                </div>
              </div>

              {/* Overlapping Secondary Card (responsive placement on mobile) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-3 sm:mt-0 sm:absolute sm:-bottom-8 sm:-right-6 w-full sm:w-64 bg-[#123D2A] text-[#F8F6EF] p-4 sm:p-5 rounded-sm shadow-lg sm:shadow-2xl border border-[#D4A72C]/30 z-10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#D4A72C]/20 flex items-center justify-center text-[#D4A72C] shrink-0">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#D4A72C] font-bold block">
                      Origin Verified
                    </span>
                    <span className="font-serif text-xs font-semibold text-[#F8F6EF]">
                      Kirinyaga County
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                  Naturally aromatic soil profiles and regulated river irrigation unique to central Kenya.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Narrative Story (6 cols) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#123D2A]"
            >
              <span className="w-8 h-[1px] bg-[#D4A72C]" />
              <span>Company Foundations</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#123D2A] tracking-tight leading-tight"
            >
              Rooted in <span className="italic font-normal text-[#D4A72C]">Mwea</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-base sm:text-lg text-[#17211C] leading-relaxed"
            >
              {company.aboutText.lead}: {company.aboutText.summary}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xs sm:text-sm md:text-base text-[#17211C]/75 font-sans leading-relaxed"
            >
              {company.aboutText.detail}
            </motion.p>

            {/* Mission & Quality commitment blocks */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-3.5 sm:space-y-4 pt-2 border-t border-[#123D2A]/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#123D2A]/10 text-[#123D2A] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold font-serif">M</span>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                    Our Mission
                  </h4>
                  <p className="text-xs sm:text-sm text-[#17211C]/75 font-sans mt-0.5">
                    {company.aboutText.mission}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#123D2A]/10 text-[#123D2A] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold font-serif">Q</span>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                    Milling Discipline
                  </h4>
                  <p className="text-xs sm:text-sm text-[#17211C]/75 font-sans mt-0.5">
                    {company.aboutText.millingCommitment}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Download Corporate Profile Document */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <a
                href="/api/pdf/company"
                download="Top-Grade-Rice-Millers-Company-Profile.pdf"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-[#F8F6EF] text-xs font-semibold uppercase tracking-wider rounded-xs transition-all shadow-md group cursor-pointer active:scale-[0.99]"
                title="Download Official Company Profile (PDF)"
              >
                <FileDown className="w-4 h-4 text-[#D4A72C] group-hover:scale-110 transition-transform" />
                <span>Download Official Profile (PDF)</span>
              </a>
              <span className="text-xs text-black/55 italic text-center sm:text-left">
                Official 2-page institutional overview & milling specs
              </span>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
