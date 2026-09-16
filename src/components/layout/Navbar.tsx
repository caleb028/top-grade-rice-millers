'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { Menu, X, ArrowUpRight, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onOpenQuoteModal?: () => void;
}

export default function Navbar({ onOpenQuoteModal }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Our Rice', href: '/#products' },
    { name: 'Milling Services', href: '/#services' },
    { name: 'Wholesale', href: '/#wholesale' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#123D2A]/95 backdrop-blur-md py-2.5 sm:py-3 shadow-lg border-b border-[#D4A72C]/15'
            : 'bg-gradient-to-b from-[#0B2519]/90 via-[#0B2519]/50 to-transparent py-3 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          {/* Brand Logo & Editorial Title */}
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none min-w-0 shrink">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 sm:border-3 border-[#D4A72C] bg-white shadow-2xl shrink-0 p-0.5 group-hover:scale-105 transition-transform ring-2 ring-[#D4A72C]/30">
              <Image
                src="/logo.jpg"
                alt="Top Grade Rice Millers Logo"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base sm:text-2xl md:text-3xl font-bold tracking-tight text-[#F8F6EF] leading-tight group-hover:text-[#D4A72C] transition-colors whitespace-nowrap">
                Top Grade
              </span>
              <span className="text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-wider text-[#D4A72C] font-sans font-semibold mt-0.5 truncate">
                Home of Pure Pishori
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium tracking-wide text-[#F8F6EF]/90 hover:text-[#D4A72C] transition-colors duration-200 group py-1"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#D4A72C] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Action & WhatsApp quick link */}
          <div className="hidden lg:flex items-center space-x-4 shrink-0">
            <a
              href={companyConfig.getWhatsAppLink('general')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Direct WhatsApp Contact"
              className="text-xs font-sans text-[#F8F6EF]/80 hover:text-[#D4A72C] flex items-center gap-1.5 transition-colors border border-white/10 rounded-sm px-2.5 py-1.5 hover:border-[#D4A72C]/40 min-h-[38px]"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            {onOpenQuoteModal ? (
              <button
                onClick={onOpenQuoteModal}
                className="inline-flex items-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-4 py-2 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] min-h-[38px] cursor-pointer"
              >
                <span>Request a Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/#wholesale"
                className="inline-flex items-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-4 py-2 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] min-h-[38px]"
              >
                <span>Request a Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile Actions: Touch-friendly Quote & Hamburger Trigger */}
          <div className="flex items-center lg:hidden space-x-2 shrink-0">
            {onOpenQuoteModal && (
              <button
                onClick={onOpenQuoteModal}
                className="min-h-[44px] min-w-[44px] px-3 py-2 bg-[#D4A72C] text-[#123D2A] rounded-sm text-[11px] font-bold tracking-wide uppercase active:scale-95 transition-transform flex items-center justify-center cursor-pointer shadow-sm"
                aria-label="Request a Quote"
              >
                Quote
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="min-w-[44px] min-h-[44px] p-2.5 text-[#F8F6EF] hover:text-[#D4A72C] focus:outline-none rounded-sm bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation with Framer Motion & Safe Area */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#123D2A] text-[#F8F6EF] p-5 sm:p-6 pt-safe flex flex-col justify-between shadow-2xl border-l border-[#D4A72C]/30 z-10 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6 pt-2">
                {/* Drawer Header with Close Button */}
                <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4A72C] bg-white shadow-lg shrink-0">
                      <Image
                        src="/logo.jpg"
                        alt="Top Grade Rice Millers Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-serif text-base font-bold tracking-tight text-[#F8F6EF] block leading-tight whitespace-nowrap">
                        Top Grade
                      </span>
                      <p className="text-[10px] uppercase tracking-wider text-[#D4A72C] font-semibold mt-0.5 truncate">
                        Home of Pure Pishori
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="min-w-[40px] min-h-[40px] rounded-sm bg-white/10 text-white hover:text-[#D4A72C] flex items-center justify-center shrink-0 cursor-pointer ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-base font-medium py-3 px-2 border-b border-white/5 text-[#F8F6EF] hover:text-[#D4A72C] hover:bg-white/5 rounded-xs transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-3 pt-6 pb-safe border-t border-white/10">
                {onOpenQuoteModal ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenQuoteModal();
                    }}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] py-3 rounded-xs font-bold text-xs tracking-wider uppercase cursor-pointer transition-colors shadow-md"
                  >
                    <span>Request a Quote</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href="/#wholesale"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] py-3 rounded-xs font-bold text-xs tracking-wider uppercase transition-colors shadow-md"
                  >
                    <span>Request a Quote</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}

                <a
                  href={companyConfig.getWhatsAppLink('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-[#F8F6EF] py-3 rounded-xs text-xs font-semibold hover:border-[#25D366] transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>Chat on WhatsApp</span>
                </a>

                <div className="text-center text-[11px] text-white/50 pt-1">
                  Wang&apos;uru, Mwea · Kirinyaga County, Kenya
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
