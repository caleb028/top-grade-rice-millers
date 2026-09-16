'use client';

import React, { useState } from 'react';
import Preloader from '@/components/layout/Preloader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import AboutSection from '@/components/home/AboutSection';
import ProductShowcase from '@/components/home/ProductShowcase';
import QualitySection from '@/components/home/QualitySection';
import MillingServices from '@/components/home/MillingServices';
import WholesaleSection from '@/components/home/WholesaleSection';
import ContactSection from '@/components/home/ContactSection';
import QuoteModal from '@/components/home/QuoteModal';
import { Product, QuoteRequestType } from '@/types';

export default function HomePage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<Product | null>(null);
  const [initialRequestType, setInitialRequestType] = useState<QuoteRequestType>('retail');

  const handleOpenQuote = (product?: Product, reqType?: QuoteRequestType) => {
    if (product) {
      setSelectedProductForQuote(product);
      setInitialRequestType(reqType || 'retail');
    } else {
      setSelectedProductForQuote(null);
      setInitialRequestType(reqType || 'retail');
    }
    setIsQuoteModalOpen(true);
  };

  return (
    <>
      {/* Luxury Initial Preloader (<1.2s) */}
      <Preloader />

      {/* Main Corporate Header & Navigation */}
      <Navbar onOpenQuoteModal={() => handleOpenQuote(undefined, 'retail')} />

      <main className="min-h-screen">
        {/* 1. Cinematic First Impression */}
        <Hero onOpenQuoteModal={() => handleOpenQuote(undefined, 'retail')} />

        {/* 2. Rooted in Mwea: Agricultural Heritage & Facility Foundations */}
        <AboutSection />

        {/* 3. Our Rice: Milled Selections Catalogue */}
        <ProductShowcase onRequestQuote={(prod) => handleOpenQuote(prod, 'retail')} />

        {/* 4. Milling Discipline, Standards & 5-Stage Grain Lifecycle */}
        <QualitySection />

        {/* 5. Professional Commercial Milling Services */}
        <MillingServices onOpenQuoteModal={() => handleOpenQuote(undefined, 'milling')} />

        {/* 6. Wholesale & Institutional Bulk Supply */}
        <WholesaleSection onOpenQuoteModal={() => handleOpenQuote(undefined, 'wholesale')} />

        {/* 7. Physical Presence, Live Google Maps & Direct Communications */}
        <ContactSection />
      </main>

      {/* Architectural Corporate Footer */}
      <Footer />

      {/* Universal Quote Request Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        preSelectedProduct={selectedProductForQuote}
        initialRequestType={initialRequestType}
      />
    </>
  );
}
