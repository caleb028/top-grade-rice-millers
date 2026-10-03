'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { companyConfig } from '@/data/companyConfig';
import { Phone, Mail, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Heritage & Mill', href: '#about' },
    { name: 'Milling Pipeline', href: '#services' },
    { name: 'Grain Atelier', href: '#products' },
    { name: 'Quality Standards', href: '#quality' },
    { name: 'Contact Ahero', href: '#contact' },
  ];

  return (
    <footer className="bg-fir-dark text-white border-t border-fir/40 pt-16 pb-10 relative overflow-hidden">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#C5E86C_1px,transparent_1px),linear-gradient(to_bottom,#C5E86C_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Company Brand & Description (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-sulu/60 bg-white p-1 shrink-0 shadow-xl">
                <Image
                  src="/logo.png"
                  alt="Ahero Top Grade Rice Millers"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white block leading-tight">
                  Ahero Top Grade
                </span>
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-sulu block font-semibold">
                  Rice Millers · Kisumu County
                </span>
              </div>
            </div>

            <p className="text-white/70 text-xs sm:text-sm font-sans leading-relaxed max-w-sm">
              Industrial grain destoning, commercial hulling, and calibrated distribution serving farmers, wholesale grain traders, and institutional kitchens throughout Kenya.
            </p>

            <div className="pt-2 flex items-center gap-2 text-sulu text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-acid-mint" />
              <span>Registered Industrial Rice Processing Mill</span>
            </div>
          </div>

          {/* Quick Navigation Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-sulu font-semibold block">
              Architectural Index
            </span>
            <ul className="space-y-2 text-xs font-mono text-white/80">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-sulu transition-colors duration-200 block py-0.5"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/admin/quotes"
                  className="inline-flex items-center gap-1.5 text-sulu hover:text-white transition-colors py-0.5 font-bold uppercase text-[11px]"
                >
                  <span>Admin Master Console</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-sulu font-semibold block">
              Facility Direct
            </span>
            <div className="space-y-3 text-xs font-sans text-white/80">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sulu shrink-0" />
                <a
                  href={`tel:${companyConfig.contact.phoneDisplay}`}
                  className="hover:text-sulu transition-colors font-mono font-medium text-sm"
                >
                  {companyConfig.contact.phoneDisplay}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sulu shrink-0" />
                <a
                  href={`mailto:${companyConfig.contact.email}`}
                  className="hover:text-sulu transition-colors font-mono text-xs break-all"
                >
                  {companyConfig.contact.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <MapPin className="w-4 h-4 text-sulu shrink-0" />
                <span className="text-white/70">
                  Ahero Commercial Center, Kisumu County, Kenya
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Minimal Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4 font-mono">
          <p>
            &copy; {currentYear} Ahero Top Grade Rice Millers. All rights reserved.
          </p>
          <p className="text-[11px] text-white/40">
            Sulu & Deep Fir Architecture · Kisumu, Kenya
          </p>
        </div>

      </div>
    </footer>
  );
}
