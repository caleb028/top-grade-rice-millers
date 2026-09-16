'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, ArrowRight, QrCode } from 'lucide-react';

export default function TraceLookup() {
  const [batchCode, setBatchCode] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCode.trim()) {
      router.push(`/trace/${encodeURIComponent(batchCode.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="bg-[#123D2A] text-[#F8F6EF] p-6 sm:p-8 rounded-sm border border-[#D4A72C]/30 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-sm bg-[#D4A72C]/20 border border-[#D4A72C]/40 flex items-center justify-center text-[#D4A72C]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4A72C] font-semibold block">
            Quality Verification
          </span>
          <h4 className="font-serif text-lg font-bold text-[#F8F6EF]">
            Batch Traceability Portal
          </h4>
        </div>
      </div>

      <p className="text-xs text-white/75 leading-relaxed font-sans mb-4">
        Every commercial shipment is assigned a verified milling lot code. Enter your sack lot number to audit the Mwea harvest block, moisture analysis, and milling inspection date.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. TGM-2026-PIS-01"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xs bg-white/10 border border-white/20 text-[#F8F6EF] placeholder-white/40 focus:border-[#D4A72C] focus:bg-white/15 outline-none font-mono uppercase"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 bg-[#D4A72C] hover:bg-[#E5BC4A] text-[#123D2A] px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Verify Lot</span>
        </button>
      </form>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-white/50">
        <span>Sample test lots:</span>
        <button
          type="button"
          onClick={() => setBatchCode('TGM-2026-PIS-01')}
          className="text-[#D4A72C] underline hover:text-[#E5BC4A] font-mono"
        >
          TGM-2026-PIS-01
        </button>
        <span>·</span>
        <button
          type="button"
          onClick={() => setBatchCode('TGM-2026-SLG-02')}
          className="text-[#D4A72C] underline hover:text-[#E5BC4A] font-mono"
        >
          TGM-2026-SLG-02
        </button>
      </div>
    </div>
  );
}
