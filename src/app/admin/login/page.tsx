'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@topgradericemillers.co.ke');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials.');
      }

      // Successfully logged in
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to authenticate.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] flex flex-col justify-center items-center p-4 sm:p-6 text-[#17211C]">
      {/* Back to public website */}
      <div className="w-full max-w-md mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-[#123D2A] hover:text-[#D4A72C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-sm border border-[#123D2A]/15 shadow-xl overflow-hidden">
        {/* Card Top Header */}
        <div className="bg-[#123D2A] p-6 sm:p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 left-0 h-1 bg-[#D4A72C]" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D4A72C] bg-white mb-3 shadow-md mx-auto">
            <Image
              src="/logo.jpg"
              alt="Top Grade Rice Millers"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>

          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
            TOP GRADE ADMIN
          </h1>
          <p className="text-xs text-[#D4A72C] font-semibold mt-1">
            Home of Pure Pishori
          </p>
          <p className="text-[10px] text-white/60 uppercase tracking-widest mt-0.5">
            Website Management Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-5 sm:p-8 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@topgradericemillers.co.ke"
                className="w-full min-h-[44px] pl-10 pr-3 py-2.5 text-xs bg-[#FCFAF5] border border-[#123D2A]/15 rounded-xs focus:border-[#D4A72C] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[44px] pl-10 pr-3 py-2.5 text-xs bg-[#FCFAF5] border border-[#123D2A]/15 rounded-xs focus:border-[#D4A72C] focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 bg-[#123D2A] hover:bg-[#184D35] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Access Administration</span>
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-black/50">
              Default credentials: <code className="text-[#123D2A] bg-black/5 px-1 py-0.5 rounded-xs font-mono">admin@topgradericemillers.co.ke</code> / <code className="text-[#123D2A] bg-black/5 px-1 py-0.5 rounded-xs font-mono">topgrade2026</code>
            </p>
          </div>
        </form>
      </div>

      <p className="mt-6 text-[11px] text-black/40 text-center">
        Top Grade Rice Millers • Wang&apos;uru, Mwea, Kirinyaga County, Kenya
      </p>
    </div>
  );
}
