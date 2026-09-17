'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { companyConfig } from '@/data/companyConfig';
import { MapPin, Phone, Mail, MessageSquare, Clock, ArrowRight, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, ExternalLink, Navigation } from 'lucide-react';

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

  const [lastSubmitted, setLastSubmitted] = useState<{ name: string; subject: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const hasPhone = form.phone.trim().length > 0;
    const hasEmail = form.email.trim().length > 0;

    if (!hasPhone && !hasEmail) {
      setError('Please provide at least one contact method (phone number or email) so our team can reach you.');
      setLoading(false);
      return;
    }

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

      setLastSubmitted({ name: form.name, subject: form.subject });
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

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#123D2A]">
                  <Mail className="w-4 h-4 text-[#D4A72C]" />
                  <span>Official Email</span>
                </div>
                <div className="text-xs sm:text-sm font-sans space-y-1">
                  <a
                    href={`mailto:${company.contact.email}?subject=${encodeURIComponent('Enquiry — Top Grade Rice Millers')}`}
                    className="inline-flex items-center gap-2 text-[#123D2A] hover:text-[#D4A72C] font-semibold break-all transition-colors group"
                    title="Click to compose an email"
                  >
                    <span className="underline decoration-[#D4A72C]/50 underline-offset-2">{company.contact.email}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D4A72C] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <p className="text-[11px] text-black/50">
                    Direct inquiries & official correspondence (tap to write)
                  </p>
                </div>
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
              <div className="p-6 sm:p-8 bg-[#123D2A]/5 border border-[#123D2A]/15 rounded-xs text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#123D2A] text-[#D4A72C] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-[#123D2A]">
                    Message Successfully Dispatched
                  </h4>
                  <p className="text-xs text-black/75 max-w-sm mx-auto leading-relaxed">
                    Thank you{lastSubmitted?.name ? `, ${lastSubmitted.name}` : ''}! Your message regarding <strong className="text-[#123D2A]">{lastSubmitted?.subject || 'your enquiry'}</strong> has been received by our Mwea front desk.
                  </p>
                  <p className="text-[11px] text-black/50">
                    We review and reply to all inquiries during official facility hours.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/${company.contact.whatsappNumber}?text=${encodeURIComponent(
                      `Hello Top Grade Rice Millers, I just sent a message through your website regarding "${lastSubmitted?.subject || 'Enquiry'}". My name is ${lastSubmitted?.name || 'Customer'}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 min-h-[42px] rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Follow up on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setLastSubmitted(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] text-xs font-semibold text-[#123D2A] hover:bg-[#123D2A]/10 rounded-xs transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
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
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712 345 678 or +254..."
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors"
                    />
                    <span className="text-[10px] text-black/45 block mt-1">
                      Kenyan mobile or international
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. grace@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors"
                    />
                    <span className="text-[10px] text-black/45 block mt-1">
                      Corporate or personal inbox
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#FCFAF5] border border-[#123D2A]/10 rounded-xs text-[11px] text-[#123D2A]/75 flex items-center gap-2">
                  <span className="text-[#D4A72C] font-bold">ℹ</span>
                  <span>Provide either a phone number or email address so we can reply to your query.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                    Inquiry Nature
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-[#FCFAF5] border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none transition-colors cursor-pointer"
                  >
                    <option value="General Inquiries">General Inquiries</option>
                    <option value="Commercial Rice Milling Services">Commercial Rice Milling Services</option>
                    <option value="Wholesale Rice Purchase">Wholesale Rice Purchase</option>
                    <option value="Self Pick-up at Mill Inquiry">Self Pick-up at Mill Inquiry</option>
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

                {/* Instant WhatsApp alternative divider & button */}
                <div className="pt-2 border-t border-[#123D2A]/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-black/50">
                    <span>Need an immediate response?</span>
                    <span className="text-[#25D366] font-medium">Official WhatsApp</span>
                  </div>
                  <a
                    href={`https://wa.me/${company.contact.whatsappNumber}?text=${encodeURIComponent(
                      form.name
                        ? `Hello Top Grade Rice Millers, my name is ${form.name}. I would like to enquire about ${form.subject}.`
                        : `Hello Top Grade Rice Millers, I would like to enquire about ${form.subject}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 min-h-[42px] rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs active:scale-[0.99]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat Directly on WhatsApp</span>
                  </a>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
