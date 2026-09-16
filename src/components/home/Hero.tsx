'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { ArrowDown, ArrowUpRight, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  onOpenQuoteModal: () => void;
}

const heroSlides = [
  {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85',
    title: 'Mwea Paddy Basins',
    caption: 'Mount Kenya irrigated rice fields in Kirinyaga County',
  },
  {
    url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=2400&q=85',
    title: 'Golden Grain Harvest',
    caption: 'Sun-ripened aromatic rice panicles at peak maturity',
  },
  {
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2400&q=85',
    title: 'Paddy Harvesting',
    caption: 'Field collection and intake handling for precision milling',
  },
  {
    url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=2400&q=85',
    title: 'Modern Milling Lines',
    caption: 'Calibrated dehusking, destoning, and optical grading machinery',
  },
  {
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=2400&q=85',
    title: 'Premium Milled Pishori',
    caption: 'Pristine stone-free whole-kernel aromatic rice',
  },
];

export default function Hero({ onOpenQuoteModal }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slow, cinematic slideshow timer (6.5 seconds per slide)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0B2519]">
      {/* Cinematic Slow Slideshow Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[currentSlide].url}
              alt={heroSlides[currentSlide].title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center filter brightness-[0.72] contrast-[1.12]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Film Vignette & Multi-Stage Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2519] via-[#0B2519]/70 to-[#0B2519]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0B2519]/35 to-[#0B2519]/90 pointer-events-none" />
        
        {/* Subtle Film Grain Texture */}
        <div className="absolute inset-0 film-grain opacity-25 pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-32 pb-14 sm:pb-24 flex flex-col items-center">
        
        {/* Origin / Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 border border-[#D4A72C]/40 bg-[#123D2A]/70 backdrop-blur-md px-3.5 py-1.5 rounded-sm mb-4 sm:mb-6 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A72C]" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[#D4A72C] font-sans font-semibold">
            Mwea · Kirinyaga County · Kenya
          </span>
        </motion.div>

        {/* Company Name / Display Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 w-full px-1"
        >
          <h1 className="font-serif text-[clamp(2.45rem,10.8vw,3.6rem)] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#F8F6EF] uppercase leading-[0.93] sm:leading-[0.95] break-words">
            <span className="block">TOP GRADE</span>
            <span className="block text-[#F8F6EF]/95 font-semibold">RICE MILLERS</span>
          </h1>
        </motion.div>

        {/* Tagline & Official Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }}
          className="font-serif italic text-lg xs:text-xl sm:text-2xl md:text-3xl text-[#D4A72C] font-normal tracking-wide max-w-3xl mx-auto mb-4 sm:mb-6"
        >
          Home of Pure Pishori
        </motion.p>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="text-xs sm:text-base md:text-lg text-[#F8F6EF]/85 max-w-2xl mx-auto font-sans leading-relaxed mb-8 sm:mb-10 px-2"
        >
          Premium Kenyan rice proudly milled and processed from the heart of Mwea, serving households, businesses and institutions across Kenya.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none px-2 sm:px-0"
        >
          {/* Primary Action */}
          <button
            onClick={onOpenQuoteModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-7 py-3.5 rounded-sm text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-md active:scale-[0.98] min-h-[44px] cursor-pointer group"
          >
            <span>Request a Quote</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Explore Our Rice CTA */}
          <a
            href="#products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#123D2A]/80 text-[#F8F6EF] border border-[#D4A72C]/50 hover:border-[#D4A72C] hover:bg-[#184D35] px-7 py-3.5 rounded-sm text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-md min-h-[44px] group"
          >
            <span>Explore Our Rice</span>
            <ArrowDown className="w-4 h-4 text-[#D4A72C] group-hover:translate-y-0.5 transition-transform" />
          </a>

          {/* WhatsApp Direct CTA */}
          <a
            href={companyConfig.getWhatsAppLink('general')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white/95 border border-white/20 px-5 py-3.5 rounded-sm text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
        </motion.div>
      </div>

      {/* Slide Navigation & Context Information (Bottom Left on medium+ screens) */}
      <div className="hidden md:flex absolute bottom-8 left-8 z-20 items-center gap-4 bg-[#123D2A]/70 backdrop-blur-md px-4 py-2 rounded-sm border border-white/10 text-white text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="p-1.5 rounded-xs hover:bg-white/10 text-[#D4A72C] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="p-1.5 rounded-xs hover:bg-white/10 text-[#D4A72C] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="h-4 w-[1px] bg-white/20" />

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#D4A72C] uppercase tracking-wider">
            {heroSlides[currentSlide].title}
          </span>
          <span className="text-[10px] text-white/60">
            {currentSlide + 1} / {heroSlides.length} · {heroSlides[currentSlide].caption}
          </span>
        </div>
      </div>

      {/* Slide Progress Dots (Bottom Right) */}
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20 flex items-center gap-1.5 sm:gap-2">
        {heroSlides.map((slide, idx) => (
          <button
            key={slide.title}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
            className={`transition-all duration-500 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-6 sm:w-8 h-1.5 bg-[#D4A72C]'
                : 'w-2 h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator with elegant animated vertical line (hidden on short viewports to prevent collisions) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 z-20 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#F8F6EF]/60 font-sans font-medium">
          Scroll to Explore
        </span>
        <div className="w-[1.5px] h-8 bg-white/15 relative overflow-hidden rounded-full">
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full bg-[#D4A72C]"
          />
        </div>
      </motion.div>
    </section>
  );
}
