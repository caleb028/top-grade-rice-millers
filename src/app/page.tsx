'use client';

import React, { useState } from 'react';
import Preloader from '@/components/layout/Preloader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import IntroSection from '@/components/home/IntroSection';
import FarmToTable from '@/components/home/FarmToTable';
import ProductShowcase from '@/components/home/ProductShowcase';
import MillingServices from '@/components/home/MillingServices';
import WholesaleSection from '@/components/home/WholesaleSection';
import QualitySection from '@/components/home/QualitySection';
import AboutSection from '@/components/home/AboutSection';
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
        {/* Cinematic First Impression */}
        <Hero onOpenQuoteModal={() => handleOpenQuote(undefined, 'retail')} />

        {/* Introduction: Where Great Rice Begins */}
        <IntroSection />

        {/* From Farm to Table: 5-Stage Operational Journey */}
        <FarmToTable />

        {/* Our Rice: Milled Selections */}
        <ProductShowcase onRequestQuote={(prod) => handleOpenQuote(prod, 'retail')} />

        {/* Professional Milling Services */}
        <MillingServices onOpenQuoteModal={() => handleOpenQuote(undefined, 'milling')} />

        {/* Wholesale & Institutional Bulk Supply */}
        <WholesaleSection onOpenQuoteModal={() => handleOpenQuote(undefined, 'wholesale')} />

        {/* Quality You Can See. Quality You Can Trust. */}
        <QualitySection />

        {/* Rooted in Mwea: Agricultural Heritage & Mission */}
        <AboutSection />

        {/* Physical Presence, Google Maps & Direct Messages */}
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
