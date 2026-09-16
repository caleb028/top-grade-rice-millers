'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { MapPin, Phone, Mail, MessageSquare, Clock, ArrowRight, CheckCircle2, AlertCircle, Loader2, ExternalLink, Navigation } from 'lucide-react';

export default function ContactSection() {
  const [company, setCompany] = useState(companyConfig);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiries',
    message: '',
  });

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.company) {
          setCompany((prev) => ({
            ...prev,
            ...data.company,
            contact: { ...prev.contact, ...data.company.contact },
            location: { ...prev.location, ...data.company.location },
          }));
        }
      })
      .catch(() => {});
  }, []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch message.');
      }

      setSuccess(true);
      setForm({ name: '', phone: '', email: '', subject: 'General Inquiries', message: '' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error sending message. Please try again or reach out on WhatsApp.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 md:py-32 bg-[#FCFAF5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 md:mb-20 space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#123D2A]"
          >
            <span className="w-8 h-[1px] bg-[#D4A72C]" />
            <span>Connect With Us</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#123D2A] tracking-tight"
          >
            Mwea Facility <span className="italic font-normal text-[#D4A72C]">& Enquiries</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-[#17211C]/75 font-sans leading-relaxed"
          >
            Whether you require an ex-mill quotation, toll milling scheduling, or directions to our Wang&apos;uru facility, our team is at your disposal.
          </motion.p>
        </div>

        {/* 2 Column Layout: Details & Map + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Contact details + Embedded Map (6 cols) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            
            {/* Contact Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                  <MapPin className="w-4 h-4 text-[#D4A72C]" />
                  <span>Physical Address</span>
                </div>
                <p className="text-xs sm:text-sm text-[#17211C]/80 font-sans">
                  {company.name} <br />
                  {company.location.landmark} <br />
                  {company.location.town}, {company.location.county}, Kenya
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                  <Phone className="w-4 h-4 text-[#D4A72C]" />
                  <span>Direct Calling</span>
                </div>
                <p className="text-xs sm:text-sm text-[#17211C]/80 font-sans">
                  <a href={`tel:${company.contact.phoneRaw}`} className="hover:text-[#D4A72C] transition-colors">
                    {company.contact.phoneDisplay}
                  </a>
                </p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${company.contact.whatsappNumber}?text=${encodeURIComponent('Hello Top Grade Rice Millers, I would like to enquire about your rice products and operations in Mwea.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#25D366] font-medium hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Direct Chat</span>
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                  <Mail className="w-4 h-4 text-[#D4A72C]" />
                  <span>Electronic Mail</span>
                </div>
                <p className="text-xs sm:text-sm text-[#17211C]/80 font-sans">
                  <a href={`mailto:${company.contact.email}`} className="hover:text-[#D4A72C] transition-colors block">
                    {company.contact.email}
                  </a>
                  <a href={`mailto:${company.contact.salesEmail}`} className="hover:text-[#D4A72C] transition-colors block text-black/60 text-xs">
                    {company.contact.salesEmail}
                  </a>
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                  <Clock className="w-4 h-4 text-[#D4A72C]" />
                  <span>Operating Hours</span>
                </div>
                <div className="text-xs text-[#17211C]/80 font-sans space-y-0.5">
                  {company.contact.businessHours.map((bh) => (
                    <div key={bh.days}>
                      <span className="font-medium text-[#123D2A]">{bh.days}:</span> {bh.hours}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Google Maps Interactive Container */}
            <div className="rounded-sm overflow-hidden border border-[#123D2A]/15 shadow-md bg-white">
              {/* Map Header Status Bar */}
              <div className="bg-[#123D2A] text-[#F8F6EF] px-4 py-2.5 flex items-center justify-between text-xs border-b border-[#D4A72C]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <span className="font-semibold text-[#F8F6EF]">Live Google Maps Location</span>
                </div>
                <span className="text-[11px] text-[#D4A72C] font-mono">
                  Mwea, Kirinyaga
                </span>
              </div>

              {/* Live Interactive Google Maps Frame */}
              <div className="h-60 sm:h-72 w-full relative bg-[#123D2A]">
                <iframe
                  title="Top Grade Rice Millers Live Location"
                  src={company.location.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              {/* Map Actions Bar */}
              <div className="p-3 bg-[#FCFAF5] border-t border-[#123D2A]/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-black/60 text-[11px]">
                  <Navigation className="w-3.5 h-3.5 text-[#123D2A]" />
                  <span>Wang&apos;uru Commercial Milling Hub · Mwea</span>
                </div>

                <a
                  href={company.location.googleMapsLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#123D2A] hover:bg-[#184D35] text-[#F8F6EF] px-3.5 py-2 min-h-[38px] rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4A72C]" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form (6 cols) */}
          <div className="lg:col-span-6 bg-white p-5 sm:p-8 md:p-10 rounded-sm border border-[#123D2A]/10 shadow-sm space-y-5 sm:space-y-6">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#123D2A] leading-tight">
                Send a Direct Message
              </h3>
              <p className="text-xs text-black/60 mt-1">
                Inquiries are monitored during official business hours by our Mwea front desk.
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-[#123D2A]/5 border border-[#123D2A]/15 rounded-xs text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#123D2A] mx-auto" />
                <h4 className="font-serif text-lg font-bold text-[#123D2A]">
                  Message Received
                </h4>
                <p className="text-xs text-black/70 max-w-sm mx-auto">
                  Thank you for reaching out to Top Grade Rice Millers. A customer representative will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="text-xs font-semibold text-[#123D2A] underline hover:text-[#D4A72C] py-2 cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grace Wanjiku"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      Phone Contact *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +254 700 000 000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. grace@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                    Inquiry Nature
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors"
                  >
                    <option value="General Inquiries">General Inquiries</option>
                    <option value="Commercial Rice Milling Services">Commercial Rice Milling Services</option>
                    <option value="Wholesale Rice Purchase">Wholesale Rice Purchase</option>
                    <option value="Distribution Partnership">Distribution Partnership</option>
                    <option value="Facility Visit / Inspection">Facility Visit / Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details regarding your requirements or query..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#123D2A] hover:bg-[#184D35] text-[#F8F6EF] py-3.5 min-h-[48px] rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Direct Message</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
