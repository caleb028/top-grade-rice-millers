import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBatchRecord } from '@/lib/db';
import { companyConfig } from '@/data/companyConfig';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, CheckCircle2, MapPin, Calendar, Award, ArrowLeft, Download, Printer } from 'lucide-react';

interface TracePageProps {
  params: Promise<{ batch: string }>;
}

export default async function TracePage({ params }: TracePageProps) {
  const { batch } = await params;
  const record = await getBatchRecord(batch);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F6EF] pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#123D2A] hover:text-[#D4A72C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Top Grade Rice Millers</span>
            </Link>
          </div>

          {record ? (
            /* Certificate of Milling Analysis */
            <div className="bg-white rounded-sm shadow-xl border border-[#123D2A]/15 overflow-hidden">
              
              {/* Header Banner */}
              <div className="bg-[#123D2A] text-[#F8F6EF] p-4 sm:p-6 sm:p-8 border-b border-[#D4A72C]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4A72C] font-semibold">
                      Authentic Milling Certificate
                    </span>
                  </div>
                  <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                    Batch Traceability Audit
                  </h1>
                  <p className="text-xs text-white/70 font-mono mt-1">
                    Lot Identifier: {record.batchNumber}
                  </p>
                </div>

                <div className="bg-white/10 border border-[#D4A72C]/40 px-3.5 py-2 rounded-xs text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#D4A72C] block font-medium">
                    Purity Status
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-white">
                    Verified Genuine
                  </span>
                </div>
              </div>

              {/* Certificate Content Grid */}
              <div className="p-4 sm:p-8 sm:p-10 space-y-6 sm:space-y-8">
                
                {/* Product Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-b border-black/5 pb-6 sm:pb-8">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-black/50 block mb-1">
                      Milled Product Variety
                    </span>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#123D2A]">
                      {record.productName}
                    </h2>
                    <span className="inline-block text-xs font-medium text-[#71856F] bg-[#71856F]/10 px-2 py-0.5 rounded-xs mt-2 border border-[#71856F]/20">
                      Grade: {record.grade}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-black/50 block mb-1">
                      Milling Facility
                    </span>
                    <p className="text-sm font-medium text-[#123D2A]">
                      {record.millingFacility}
                    </p>
                    <p className="text-xs text-black/60 mt-1">
                      Wang&apos;uru Hub, Mwea · Kirinyaga County, Kenya
                    </p>
                  </div>
                </div>

                {/* Technical Milling Specifications */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#123D2A] mb-3 sm:mb-4">
                    Laboratory & Mechanical Quality Parameters
                  </h3>
                  
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
                    <div className="bg-[#FCFAF5] p-3 sm:p-4 rounded-xs border border-[#123D2A]/10">
                      <span className="text-black/50 block mb-1">Milling Date</span>
                      <span className="font-semibold text-[#123D2A] text-sm block">
                        {record.millingDate}
                      </span>
                      <span className="text-[10px] text-black/40">Ex-Mill Inspection</span>
                    </div>

                    <div className="bg-[#FCFAF5] p-3 sm:p-4 rounded-xs border border-[#123D2A]/10">
                      <span className="text-black/50 block mb-1">Moisture Level</span>
                      <span className="font-semibold text-[#123D2A] text-sm block">
                        {record.moistureContent}
                      </span>
                      <span className="text-[10px] text-[#25D366] font-medium">Within target range</span>
                    </div>

                    <div className="bg-[#FCFAF5] p-3 sm:p-4 rounded-xs border border-[#123D2A]/10">
                      <span className="text-black/50 block mb-1">Purity Grade</span>
                      <span className="font-semibold text-[#123D2A] text-sm block">
                        {record.purityGrade}
                      </span>
                      <span className="text-[10px] text-black/40">Optical Sortex Clean</span>
                    </div>

                    <div className="bg-[#FCFAF5] p-3 sm:p-4 rounded-xs border border-[#123D2A]/10">
                      <span className="text-black/50 block mb-1">Packaging Format</span>
                      <span className="font-semibold text-[#123D2A] text-sm block">
                        {record.packType}
                      </span>
                      <span className="text-[10px] text-black/40">Aroma Sealed</span>
                    </div>
                  </div>
                </div>

                {/* Agricultural Origin Details */}
                <div className="bg-[#F8F6EF] p-6 rounded-xs border border-[#123D2A]/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123D2A]">
                    <MapPin className="w-4 h-4 text-[#D4A72C]" />
                    <span>Agronomic Provenance</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-black/50 block">Harvest Basin:</span>
                      <span className="font-medium text-[#123D2A]">{record.originLocation}</span>
                    </div>
                    <div>
                      <span className="text-black/50 block">Irrigation Scheme Block:</span>
                      <span className="font-medium text-[#123D2A]">{record.schemeBlock}</span>
                    </div>
                    <div>
                      <span className="text-black/50 block">Cropping Season:</span>
                      <span className="font-medium text-[#123D2A]">{record.harvestSeason}</span>
                    </div>
                    <div>
                      <span className="text-black/50 block">Water Source:</span>
                      <span className="font-medium text-[#123D2A]">Mount Kenya River System (Thiba / Nyamindi)</span>
                    </div>
                  </div>
                </div>

                {/* Quality Notes & Sign-off */}
                <div className="border-t border-black/5 pt-6 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-black/50 block">
                    Quality Assurance Inspector Notes
                  </span>
                  <p className="text-xs text-[#17211C]/80 italic">
                    &ldquo;{record.qualityNotes}&rdquo;
                  </p>
                  <p className="text-[11px] font-semibold text-[#123D2A] pt-1">
                    Certified by: {record.verifiedBy}
                  </p>
                </div>

                {/* Footer disclaimer */}
                <div className="pt-4 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-black/40 gap-4">
                  <span>
                    Top Grade Rice Millers Traceability Engine · Verified Mwea Origin
                  </span>
                  <span>
                    Generated for Lot: {record.batchNumber}
                  </span>
                </div>

              </div>
            </div>
          ) : (
            /* Lot not found state */
            <div className="bg-white p-10 rounded-sm shadow-md border border-red-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#123D2A]">
                Batch Number Not Found
              </h2>
              <p className="text-xs sm:text-sm text-black/70 max-w-md mx-auto font-sans">
                The identifier &ldquo;<span className="font-mono font-bold text-red-600">{batch}</span>&rdquo; is not logged in our registered Mwea milling records. Please inspect the code printed on the sack or contact our dispatch team.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#123D2A] text-white px-5 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-wider"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
