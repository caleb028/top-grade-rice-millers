import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { companyConfig } from '@/data/companyConfig';
import { MapPin, Phone, Mail, MessageSquare, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B2519] text-[#F8F6EF] border-t border-[#D4A72C]/20 pt-12 sm:pt-16 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 sm:pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Origin (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#D4A72C] bg-white shrink-0 shadow-lg ring-2 ring-[#D4A72C]/20">
                <Image
                  src="/logo.jpg"
                  alt="Top Grade Rice Millers Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#F8F6EF] block leading-tight">
                  TOP GRADE RICE MILLERS
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4A72C] block font-semibold">
                  Home of Pure Pishori
                </span>
              </div>
            </div>
            
            <p className="text-[#D4A72C] font-serif italic text-sm sm:text-base">
              {companyConfig.tagline}
            </p>
            
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-md font-sans">
              Dedicated to high-integrity rice milling, strict destoning, and reliable wholesale distribution directly from Mwea, Kirinyaga County — the agricultural heart of Kenya.
            </p>

            <div className="pt-1 sm:pt-2 flex items-center gap-2 text-xs text-white/60">
              <MapPin className="w-4 h-4 text-[#D4A72C] shrink-0" />
              <span>Wang&apos;uru Commercial Corridor, Mwea, Kenya</span>
            </div>
          </div>

          {/* Column 2: Navigation & Traceability (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4A72C] font-semibold">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm font-sans text-white/80">
              <li>
                <Link href="/#about" className="hover:text-[#D4A72C] transition-colors">
                  About Our Mill
                </Link>
              </li>
              <li>
                <Link href="/#products" className="hover:text-[#D4A72C] transition-colors">
                  Our Rice Varieties
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#D4A72C] transition-colors">
                  Commercial Milling Services
                </Link>
              </li>
              <li>
                <Link href="/#wholesale" className="hover:text-[#D4A72C] transition-colors">
                  Wholesale & Bulk Supply
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[#D4A72C] transition-colors">
                  Contact & Location
                </Link>
              </li>
              <li>
                <a
                  href="/api/pdf/company"
                  download="Top-Grade-Rice-Millers-Company-Profile.pdf"
                  className="inline-flex items-center gap-1 text-[#D4A72C] hover:text-[#E5BC4A] transition-colors font-medium text-xs pt-1"
                >
                  <span>Company Profile (PDF)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Commercial Enquiries (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4A72C] font-semibold">
              Direct Contact
            </h3>
            <div className="space-y-3 text-sm text-white/80">
              <div>
                <span className="block text-xs text-white/50 mb-0.5">Telephone</span>
                <a
                  href={`tel:${companyConfig.contact.phoneRaw}`}
                  className="hover:text-[#D4A72C] font-medium transition-colors"
                >
                  {companyConfig.contact.phoneDisplay}
                </a>
              </div>

              <div>
                <span className="block text-xs text-white/50 mb-0.5">Wholesale Enquiries</span>
                <a
                  href={`mailto:${companyConfig.contact.salesEmail}`}
                  className="hover:text-[#D4A72C] font-medium transition-colors"
                >
                  {companyConfig.contact.salesEmail}
                </a>
              </div>

              <div>
                <span className="block text-xs text-white/50 mb-1">Direct WhatsApp</span>
                <a
                  href={companyConfig.getWhatsAppLink('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#25D366]/80 transition-colors font-medium text-xs border border-white/10 px-3 py-2.5 min-h-[44px] rounded-sm bg-white/5 active:scale-[0.99]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Top Grade Team</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-1 text-xs text-white/60">
                <span className="text-white/40 block">Operational Hours:</span>
                Mon – Fri: 7:30 AM – 5:30 PM | Sat: 8:00 AM – 2:00 PM
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div>
            &copy; {currentYear} {companyConfig.name}. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-white/40">
            <span>Mwea, Kirinyaga County, Kenya</span>
            <span>·</span>
            <Link href="/admin" className="hover:text-[#D4A72C] transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
