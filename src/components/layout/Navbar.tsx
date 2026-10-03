'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { Menu, X, Phone, ArrowUpRight, Sparkles, Radio } from 'lucide-react';

interface NavbarProps {
  onOpenQuoteModal?: () => void;
}

export default function Navbar({ onOpenQuoteModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Heritage', href: '#about', num: '01' },
    { name: 'Milling Engine', href: '#services', num: '02' },
    { name: 'Grain Atelier', href: '#atelier', num: '03' },
    { name: 'Specifications', href: '#quality', num: '04' },
    { name: 'Contact', href: '#contact', num: '05' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out px-3 sm:px-6 lg:px-8 ${
          isScrolled ? 'pt-3' : 'pt-5 sm:pt-6'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto rounded-full transition-all duration-500 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
            isScrolled
              ? 'bg-fir-dark/95 backdrop-blur-xl border-sulu/30 shadow-2xl ring-1 ring-white/5'
              : 'bg-fir/80 backdrop-blur-md border-white/10 shadow-lg'
          }`}
        >
          {/* Brand Monogram & Corporate Title */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none shrink-0"
            aria-label="Ahero Top Grade Rice Millers"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-sulu/80 bg-white p-0.5 shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/logo.png"
                alt="Ahero Top Grade Rice Millers"
                fill
                priority
                sizes="(max-width: 640px) 56px, 64px"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-sulu transition-colors leading-none">
                  AHERO
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sulu font-bold">
                  ATG
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/60 font-sans font-medium mt-0.5">
                Top Grade Millers
              </span>
            </div>
          </Link>

          {/* Live Mill Facility Status Pill (Architectural Telemetry) */}
          <div className="hidden xl:flex items-center gap-2 bg-black/40 border border-sulu/30 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-white/90">
            <span className="w-2 h-2 rounded-full bg-acid-mint animate-ping" />
            <span className="text-sulu font-semibold">Ahero Facility:</span>
            <span>Intake & Milling Active</span>
          </div>

          {/* Desktop Architectural Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-xs font-medium tracking-wide text-white/85 hover:text-sulu transition-colors duration-200 group py-1 flex items-center gap-1.5"
              >
                <span className="text-[9px] font-mono text-sulu/60 group-hover:text-sulu transition-colors">
                  {link.num}
                </span>
                <span>{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-sulu transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Cluster: Quote Generator & Telephone Direct */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            <a
              href={`tel:${companyConfig.contact.phoneDisplay}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/85 hover:text-sulu px-3 py-2 rounded-full border border-white/10 hover:border-sulu/50 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-sulu" />
              <span className="hidden sm:inline font-mono text-[11px]">{companyConfig.contact.phoneDisplay}</span>
            </a>

            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-2 bg-sulu hover:bg-sulu-light text-fir px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
              >
                <span>Request Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Actions: Touch Call & Hamburger */}
          <div className="flex items-center lg:hidden space-x-2 shrink-0">
            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="px-3.5 py-1.5 bg-sulu text-fir rounded-full text-[11px] font-bold uppercase tracking-wide active:scale-95 transition-transform shadow-xs"
              >
                Quote
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 text-white hover:text-sulu rounded-full bg-white/10 border border-white/15 flex items-center justify-center cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Height Architectural Command Overlay on Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] lg:hidden bg-fir-dark/98 backdrop-blur-2xl flex flex-col justify-between p-6 pt-safe pb-safe"
          >
            {/* Top Bar inside Drawer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-sulu bg-white p-0.5">
                  <Image
                    src="/logo.png"
                    alt="Ahero Top Grade Rice Millers"
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="font-serif text-base font-bold text-white block">
                    Ahero Top Grade
                  </span>
                  <span className="text-[10px] uppercase font-mono text-sulu tracking-wider">
                    Commercial Millers
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white hover:text-sulu rounded-full bg-white/10 border border-white/15"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Navigation */}
            <nav className="my-auto py-6 space-y-3">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 border-b border-white/5 text-white hover:text-sulu transition-colors"
                  >
                    <span className="font-serif text-2xl font-medium">{link.name}</span>
                    <span className="font-mono text-xs text-sulu/70">{link.num}</span>
                  </a>
                </motion.div>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <a
                href={`tel:${companyConfig.contact.phoneDisplay}`}
                className="w-full flex items-center justify-center gap-2 bg-sulu text-fir py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call Dispatch: {companyConfig.contact.phoneDisplay}</span>
              </a>

              {onOpenQuoteModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuoteModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-sulu/40 bg-white/5 text-white py-3 rounded-full font-medium text-xs uppercase tracking-wider"
                >
                  <span>Launch Quote Configurator</span>
                  <ArrowUpRight className="w-4 h-4 text-sulu" />
                </button>
              )}

              <div className="text-center text-[10px] font-mono text-white/40 pt-1">
                Ahero, Kisumu County, Kenya · 0721306332
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
