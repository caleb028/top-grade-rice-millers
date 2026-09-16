'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep total loader duration under 1.2 seconds for speed & elegance
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[9999] bg-[#0B2519] flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Subtle vignette background */}
          <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none" />

          <div className="relative flex flex-col items-center px-6 text-center">
            {/* Polished Logo Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 sm:border-3 border-[#D4A72C] bg-white shadow-2xl mb-3 sm:mb-4 ring-2 sm:ring-4 ring-[#D4A72C]/20"
            >
              <Image
                src="/logo.jpg"
                alt="Top Grade Rice Millers"
                fill
                priority
                className="object-cover"
              />
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="mb-3"
            >
              <span className="font-serif text-2xl md:text-3xl text-[#F8F6EF] tracking-widest font-semibold block">
                TOP GRADE
              </span>
            </motion.div>

            {/* Subtle Expanding Gold Line */}
            <div className="relative w-28 h-[2px] bg-white/10 overflow-hidden rounded-full mb-3">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.9, ease: 'easeInOut', repeat: 0 }}
                className="w-full h-full bg-gradient-to-r from-transparent via-[#D4A72C] to-transparent"
              />
            </div>

            {/* Origin statement */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-[11px] tracking-[0.25em] uppercase text-[#D4A72C] font-sans font-medium"
            >
              Mwea, Kenya
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
