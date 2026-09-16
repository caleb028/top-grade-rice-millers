'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, QuoteRequest, QuoteRequestType, FulfillmentType } from '@/types';
import { productsList, companyConfig } from '@/data/companyConfig';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Truck,
  Building2,
  Cog,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Calendar,
  Store,
} from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProduct?: Product | null;
  initialRequestType?: QuoteRequestType;
}

const KENYAN_COUNTIES = [
  'Kirinyaga',
  'Nairobi',
  'Kiambu',
  'Machakos',
  'Nakuru',
  'Mombasa',
  'Kisumu',
  'Nyeri',
  'Embu',
  'Murang\'a',
  'Meru',
  'Kajiado',
  'Uasin Gishu',
  'Kilifi',
  'Laikipia',
  'Other County',
];

export default function QuoteModal({
  isOpen,
  onClose,
  preSelectedProduct,
  initialRequestType = 'retail',
}: QuoteModalProps) {
  const [requestType, setRequestType] = useState<QuoteRequestType>(initialRequestType);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [organization, setOrganization] = useState('');
  const [products, setProducts] = useState<Product[]>(productsList);
  const [customerType, setCustomerType] = useState('Personal / Household');
  const [productId, setProductId] = useState(productsList[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('Bags');
  const [bagSize, setBagSize] = useState('50 kg');
  const [county, setCounty] = useState('Kirinyaga');
  const [town, setTown] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');

  useEffect(() => {
    fetch('/api/products?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [message, setMessage] = useState('');

  // Milling-specific fields
  const [riceType, setRiceType] = useState('Pure Mwea Pishori (Paddy)');
  const [millingRequirements, setMillingRequirements] = useState(
    'De-husking, Acoustic Color Sorting & Grade 1 Separation'
  );
  const [preferredDate, setPreferredDate] = useState('');

  // Other enquiry fields
  const [subject, setSubject] = useState('');

  // Status & states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);

  // Sync initial request type and pre-selected product
  useEffect(() => {
    if (initialRequestType) {
      setRequestType(initialRequestType);
    }
  }, [initialRequestType, isOpen]);

  useEffect(() => {
    if (preSelectedProduct) {
      setProductId(preSelectedProduct.id);
      if (preSelectedProduct.sizes && preSelectedProduct.sizes.length > 0) {
        setBagSize(preSelectedProduct.sizes[preSelectedProduct.sizes.length - 1]);
      }
    }
  }, [preSelectedProduct]);

  // Adjust defaults when requestType changes
  useEffect(() => {
    if (requestType === 'retail') {
      setCustomerType('Personal / Household');
      setUnit('Bags');
      setQuantity(5);
    } else if (requestType === 'wholesale') {
      setCustomerType('Wholesaler / Grain Trader');
      setUnit('Bags');
      setBagSize('50 kg');
      setQuantity(50);
    } else if (requestType === 'business') {
      setCustomerType('Hotel / Hospitality');
      setUnit('Bags');
      setQuantity(20);
    } else if (requestType === 'milling') {
      setCustomerType('Milling Client');
      setUnit('Bags');
      setQuantity(50);
    } else if (requestType === 'other') {
      setCustomerType('General Enquiry');
    }
  }, [requestType]);

  // Handle ESC and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const selectedProduct = productsList.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isPickup = fulfillmentType === 'pickup' && requestType !== 'other';
    let completeDeliveryLocation: string;
    if (isPickup) {
      completeDeliveryLocation = `Self Pick-up at Mill (Wang'uru Highway Corridor, Mwea)${pickupDate.trim() ? ` · Est. Collection: ${pickupDate.trim()}` : ''}${pickupNotes.trim() ? ` · Vehicle: ${pickupNotes.trim()}` : ''}`;
    } else {
      const fullLocation = [town.trim(), county.trim()].filter(Boolean).join(', ') || 'Mwea Mill Hub';
      completeDeliveryLocation = deliveryDetails.trim()
        ? `${fullLocation} (${deliveryDetails.trim()})`
        : fullLocation;
    }

    const payload: Record<string, unknown> = {
      requestType,
      fulfillmentType: requestType === 'other' ? 'delivery' : fulfillmentType,
      pickupDate: isPickup ? pickupDate.trim() || undefined : undefined,
      pickupNotes: isPickup ? pickupNotes.trim() || undefined : undefined,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      county: isPickup ? 'Kirinyaga' : county.trim(),
      town: isPickup ? "Wang'uru" : town.trim(),
      deliveryLocation: completeDeliveryLocation,
      customerType,
      message: message.trim() || undefined,
    };

    if (requestType === 'retail') {
      payload.productId = productId;
      payload.productName = selectedProduct?.name || productId;
      payload.quantity = Number(quantity) || 1;
      payload.unit = unit;
      payload.bagSize = bagSize;
    } else if (requestType === 'wholesale') {
      payload.company = company.trim() || undefined;
      payload.productId = productId;
      payload.productName = selectedProduct?.name || productId;
      payload.quantity = Number(quantity) || 10;
      payload.quantityBags = Number(quantity) || 10;
      payload.unit = unit;
      payload.bagSize = bagSize;
    } else if (requestType === 'business') {
      payload.organization = organization.trim() || company.trim();
      payload.company = organization.trim() || company.trim();
      payload.productId = productId;
      payload.productName = selectedProduct?.name || productId;
      payload.quantity = Number(quantity) || 1;
      payload.unit = unit;
      payload.bagSize = bagSize;
    } else if (requestType === 'milling') {
      payload.riceType = riceType;
      payload.quantity = Number(quantity) || 1;
      payload.unit = unit;
      payload.millingDetails = {
        riceType: riceType.trim(),
        requirements: millingRequirements.trim(),
        preferredDate: preferredDate.trim() || undefined,
      };
      payload.productName = `Milling Service (${riceType})`;
    } else if (requestType === 'other') {
      payload.subject = subject.trim();
      payload.message = message.trim();
      payload.productName = `General Enquiry: ${subject.trim()}`;
    }

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to register quotation request.');
      }

      setSubmittedQuote(data.quote);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again or reach out directly on WhatsApp.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Header and title copy
  const getHeaderCopy = () => {
    if (requestType === 'wholesale') {
      return {
        badge: 'Direct Commercial Wholesale',
        title: 'Request a Wholesale Quote',
        subtitle: 'Tell us about your bulk requirements and our team will review your request.',
        btnText: 'SUBMIT WHOLESALE QUOTE REQUEST',
      };
    }
    if (requestType === 'milling') {
      return {
        badge: 'Factory Processing & Hulling',
        title: 'Request Rice Milling Service',
        subtitle: 'Tell us about your paddy processing specifications and our team will review your request.',
        btnText: 'SUBMIT MILLING REQUEST',
      };
    }
    if (requestType === 'other') {
      return {
        badge: 'General & Custom Inquiries',
        title: 'General Enquiry',
        subtitle: 'Tell us what you need and our team will get in touch promptly.',
        btnText: 'SEND ENQUIRY',
      };
    }
    return {
      badge: 'Direct Mill Quotation',
      title: 'Request a Quote',
      subtitle: 'Tell us what you need and our team will review your request.',
      btnText: 'SUBMIT QUOTE REQUEST',
    };
  };

  const headerInfo = getHeaderCopy();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B2519]/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto bg-[#FCFAF5] rounded-sm shadow-2xl border border-[#D4A72C]/40 text-[#17211C] z-10 p-4 sm:p-7 md:p-8"
        >
          {/* Accessible, Non-Clipped Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quote request modal"
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 min-w-[44px] min-h-[44px] rounded-sm bg-black/5 hover:bg-black/15 text-black/70 hover:text-black flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4A72C] z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {submittedQuote ? (
            /* Success Confirmation State */
            <div className="text-center py-6 sm:py-8 space-y-5">
              <div className="w-14 h-14 bg-[#123D2A] text-[#D4A72C] rounded-full mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4A72C]">
                  Request Received
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
                  Request Successfully Submitted
                </h3>
                <p className="text-xs sm:text-sm text-black/70 max-w-md mx-auto">
                  Your request has been successfully submitted to{' '}
                  <strong className="text-[#123D2A]">Top Grade Rice Millers</strong>. Our team in Mwea will review your details.
                </p>
              </div>

              {/* Reference Box */}
              <div className="bg-[#123D2A]/5 border border-[#123D2A]/15 p-4 rounded-xs max-w-md mx-auto text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-black/10 pb-2">
                  <span className="text-black/50 font-medium uppercase text-[10px] tracking-wider">Reference Code:</span>
                  <span className="font-mono font-bold text-sm text-[#123D2A] bg-white px-2 py-0.5 rounded-xs border border-[#123D2A]/15">
                    {submittedQuote.referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Customer Name:</span>
                  <span className="font-semibold text-[#123D2A]">{submittedQuote.name}</span>
                </div>
                {submittedQuote.company && (
                  <div className="flex justify-between">
                    <span className="text-black/50">Organization:</span>
                    <span className="font-medium text-[#123D2A]">{submittedQuote.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-black/50">Subject / Product:</span>
                  <span className="font-medium text-[#123D2A] text-right max-w-[240px] truncate">
                    {submittedQuote.productName}
                  </span>
                </div>
                {submittedQuote.quantity && (
                  <div className="flex justify-between">
                    <span className="text-black/50">Quantity:</span>
                    <span className="font-medium text-[#123D2A]">
                      {submittedQuote.quantity} {submittedQuote.unit || 'Bags'} {submittedQuote.bagSize ? `(${submittedQuote.bagSize})` : ''}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-black/50">Fulfillment:</span>
                  <span className="font-medium text-[#123D2A] text-right">
                    {submittedQuote.fulfillmentType === 'pickup' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#123D2A]">
                        <Store className="w-3.5 h-3.5 text-[#D4A72C]" />
                        <span>Self Pick-up at Mill (Wang&apos;uru, Mwea)</span>
                      </span>
                    ) : (
                      submittedQuote.deliveryLocation
                    )}
                  </span>
                </div>
                {submittedQuote.pickupDate && (
                  <div className="flex justify-between">
                    <span className="text-black/50">Pick-up Target:</span>
                    <span className="font-semibold text-[#123D2A]">{submittedQuote.pickupDate}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={companyConfig.getWhatsAppLink(
                    'quote',
                    `${submittedQuote.requestType?.toUpperCase() || 'QUOTE'} [${submittedQuote.fulfillmentType === 'pickup' ? 'SELF PICK-UP' : 'DELIVERY'}]: ${submittedQuote.productName} (Ref: ${submittedQuote.referenceNumber}) for ${submittedQuote.name}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-3 min-h-[44px] rounded-xs text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
                >
                  <span>Notify via WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-[#123D2A] text-white rounded-xs text-xs font-semibold uppercase tracking-wider hover:bg-[#184D35] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Main Form Workflow */
            <div className="space-y-5">
              {/* Header */}
              <div className="pr-12">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#D4A72C]">
                  {headerInfo.badge}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A] leading-tight mt-0.5">
                  {headerInfo.title}
                </h3>
                <p className="text-xs text-black/65 mt-1 leading-relaxed">
                  {headerInfo.subtitle}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Request Type Selector */}
              <div className="space-y-2 pt-1 border-t border-[#123D2A]/10">
                <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider">
                  What are you enquiring about? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[
                    { id: 'retail' as const, label: 'Retail / Personal', icon: ShoppingBag, desc: 'Household & retail bags' },
                    { id: 'wholesale' as const, label: 'Wholesale / Bulk', icon: Truck, desc: 'Commercial distribution' },
                    { id: 'business' as const, label: 'Business / Institution', icon: Building2, desc: 'Schools, hotels, caterers' },
                    { id: 'milling' as const, label: 'Milling Service', icon: Cog, desc: 'Paddy hulling & sorting' },
                    { id: 'other' as const, label: 'Other Enquiry', icon: HelpCircle, desc: 'General & custom queries' },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = requestType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setRequestType(tab.id);
                          setError(null);
                        }}
                        className={`p-2.5 rounded-xs border text-left flex flex-col justify-between transition-all min-h-[64px] cursor-pointer ${
                          isSelected
                            ? 'bg-[#123D2A] text-white border-[#123D2A] shadow-xs'
                            : 'bg-white text-[#17211C] border-[#123D2A]/15 hover:border-[#D4A72C]/60 hover:bg-[#123D2A]/5'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D4A72C]' : 'text-[#123D2A]'}`} />
                          <div
                            className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#D4A72C] bg-[#D4A72C]' : 'border-black/30'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#123D2A]" />}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold leading-tight line-clamp-2">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Form based on requestType */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* 1. Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      {requestType === 'business' ? 'Contact Person *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel Kariuki"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] focus:ring-1 focus:ring-[#D4A72C] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +254 712 345 678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] focus:ring-1 focus:ring-[#D4A72C] outline-none"
                      />
                    </div>
                  </div>

                  {/* Business / Organization Name */}
                  {(requestType === 'wholesale' || requestType === 'business') && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                        {requestType === 'business' ? 'Organization / Business Name *' : 'Company / Business (Optional)'}
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                        <input
                          type="text"
                          required={requestType === 'business'}
                          placeholder={
                            requestType === 'business'
                              ? 'e.g. Alliance High School / Serena Hotel'
                              : 'e.g. Highlands Grain Distributors'
                          }
                          value={requestType === 'business' ? organization : company}
                          onChange={(e) => {
                            if (requestType === 'business') setOrganization(e.target.value);
                            else setCompany(e.target.value);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] focus:ring-1 focus:ring-[#D4A72C] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Customer Segment / Category for Business or Wholesale */}
                  {(requestType === 'business' || requestType === 'wholesale') && (
                    <div>
                      <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                        Sector / Category
                      </label>
                      <select
                        value={customerType}
                        onChange={(e) => setCustomerType(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                      >
                        {requestType === 'business' ? (
                          <>
                            <option value="Hotel / Hospitality">Hotel / Hospitality</option>
                            <option value="Restaurant / Caterer">Restaurant / Caterer</option>
                            <option value="School / Institution">School / College / Institution</option>
                            <option value="Hospital / Clinic">Hospital / Clinic</option>
                            <option value="Retail Shop / Supermarket">Retail Shop / Supermarket</option>
                            <option value="Other Business">Other Business</option>
                          </>
                        ) : (
                          <>
                            <option value="Wholesaler / Grain Trader">Wholesaler / Grain Trader</option>
                            <option value="Supermarket / Retail Chain">Supermarket / Retail Chain</option>
                            <option value="Regional Distributor">Regional Distributor</option>
                            <option value="Exporter">Exporter</option>
                            <option value="Other Wholesale">Other Wholesale Entity</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Email (Optional across all) */}
                  <div className={requestType === 'retail' || requestType === 'milling' || requestType === 'other' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      Email Address <span className="text-black/40 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="e.g. info@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] focus:ring-1 focus:ring-[#D4A72C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Product & Quantity (Retail, Wholesale, Business) */}
                {(requestType === 'retail' || requestType === 'wholesale' || requestType === 'business') && (
                  <div className="pt-2 border-t border-[#123D2A]/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Product selection */}
                      <div>
                        <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                          Product *
                        </label>
                        <select
                          value={productId}
                          onChange={(e) => {
                            setProductId(e.target.value);
                            const p = products.find((item) => item.id === e.target.value);
                            if (p?.sizes && p.sizes.length > 0) {
                              setBagSize(p.sizes[p.sizes.length - 1]);
                            }
                          }}
                          className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                        >
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity & Unit */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={50000}
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                            Unit
                          </label>
                          <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                          >
                            <option value="Bags">Bags</option>
                            <option value="Kg">Kilograms (Kg)</option>
                            <option value="Packs">Retail Packs / Bales</option>
                            <option value="Tonnes">Tonnes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pack / Bag Size (Conditional) */}
                    <div>
                      <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                        Pack / Bag Size Preference
                      </label>
                      <select
                        value={bagSize}
                        onChange={(e) => setBagSize(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                      >
                        {selectedProduct?.sizes ? (
                          selectedProduct.sizes.map((s) => (
                            <option key={s} value={s}>
                              {s} {s.includes('50') ? '(Standard Wholesale Sack)' : ''}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="50 kg">50 kg Sack</option>
                            <option value="25 kg">25 kg Sack</option>
                            <option value="10 kg">10 kg Bag</option>
                            <option value="5 kg">5 kg Bale</option>
                            <option value="2 kg">2 kg Bale</option>
                            <option value="1 kg">1 kg Bale</option>
                          </>
                        )}
                        <option value="Bulk Pallet">Bulk 1-Tonne Pallet</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. Milling Service Specific Fields */}
                {requestType === 'milling' && (
                  <div className="pt-2 border-t border-[#123D2A]/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                          Rice Type / Paddy Variety *
                        </label>
                        <select
                          value={riceType}
                          onChange={(e) => setRiceType(e.target.value)}
                          className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                        >
                          <option value="Pure Mwea Pishori (Paddy)">Pure Mwea Pishori (Paddy)</option>
                          <option value="Komboka Paddy">Komboka Paddy</option>
                          <option value="Sindano / Conventional Paddy">Sindano / Conventional Paddy</option>
                          <option value="Basmati 370 Paddy">Basmati 370 Paddy</option>
                          <option value="Other Paddy Variety">Other Paddy Variety</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                          Estimated Volume *
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min={1}
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-2/3 px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                          />
                          <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-1/3 px-2 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                          >
                            <option value="Bags">Bags</option>
                            <option value="Tonnes">Tonnes</option>
                            <option value="Kg">Kg</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                          Milling Requirements *
                        </label>
                        <select
                          value={millingRequirements}
                          onChange={(e) => setMillingRequirements(e.target.value)}
                          className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                        >
                          <option value="De-husking, Acoustic Color Sorting & Grade 1 Separation">
                            Complete: De-husking + Color Sorting + Grade Separation
                          </option>
                          <option value="Commercial Toll Milling & Grade Classification">
                            Commercial Toll Milling & Grading
                          </option>
                          <option value="Color Sorting & Foreign Material Rejection Only">
                            Acoustic Optical Color Sorting Only
                          </option>
                          <option value="Contract Packaging & Precision Sack Bagging">
                            Contract Packaging & Woven Sack Bagging
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                          Preferred Milling Date <span className="text-black/40 font-normal lowercase">(optional)</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                          <input
                            type="text"
                            placeholder="e.g. Next week / 25th Sept"
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Other Enquiry Specific Fields */}
                {requestType === 'other' && (
                  <div className="pt-2 border-t border-[#123D2A]/10 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Custom Rice Packaging / Bulk Export Query"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                        Your Message *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe your inquiry or questions for our team in Mwea..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Fulfillment & Location Section (Retail, Wholesale, Business, Milling) */}
                {requestType !== 'other' && (
                  <div className="pt-2 border-t border-[#123D2A]/10 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1.5">
                        Fulfillment & Collection Preference *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setFulfillmentType('delivery')}
                          className={`flex items-center gap-3 p-3 rounded-xs border text-left transition-all min-h-[52px] cursor-pointer ${
                            fulfillmentType === 'delivery'
                              ? 'border-[#123D2A] bg-[#123D2A]/5 text-[#123D2A] font-semibold ring-1 ring-[#123D2A]'
                              : 'border-[#123D2A]/20 hover:border-[#123D2A]/40 text-black/70 bg-white'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              fulfillmentType === 'delivery' ? 'bg-[#123D2A] text-[#F8F6EF]' : 'bg-black/5 text-black/60'
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight">Delivery to My Location</p>
                            <p className="text-[10px] text-black/60 mt-0.5">Dispatched to your county & town depot</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFulfillmentType('pickup')}
                          className={`flex items-center gap-3 p-3 rounded-xs border text-left transition-all min-h-[52px] cursor-pointer ${
                            fulfillmentType === 'pickup'
                              ? 'border-[#D4A72C] bg-[#D4A72C]/10 text-[#123D2A] font-semibold ring-1 ring-[#D4A72C]'
                              : 'border-[#123D2A]/20 hover:border-[#123D2A]/40 text-black/70 bg-white'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              fulfillmentType === 'pickup' ? 'bg-[#D4A72C] text-[#123D2A]' : 'bg-black/5 text-black/60'
                            }`}
                          >
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold leading-tight">Self Pick-up at Mill (Mwea)</p>
                            <p className="text-[10px] text-black/60 mt-0.5">Buyer visits mill in Wang&apos;uru directly (No delivery fee)</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Conditional: Self Pick-up Card */}
                    {fulfillmentType === 'pickup' ? (
                      <div className="bg-[#123D2A]/5 border border-[#D4A72C]/50 rounded-xs p-3.5 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#D4A72C] shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-bold text-[#123D2A]">Collection Point: Top Grade Rice Millers</p>
                            <p className="text-black/75 mt-0.5">
                              Wang&apos;uru Commercial Hub & Highway Corridor, Mwea, Kirinyaga County, Kenya
                            </p>
                            <p className="text-[11px] text-[#123D2A] font-semibold mt-1">
                              Operating Hours: <span className="text-black/70 font-normal">Mon–Fri: 7:30 AM – 5:30 PM · Sat: 8:00 AM – 2:00 PM</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#123D2A]/15">
                          <div>
                            <label className="block text-[11px] text-black/70 font-semibold mb-1">
                              Planned Pick-up Date / Timeline <span className="text-black/40 font-normal lowercase">(optional)</span>
                            </label>
                            <div className="relative">
                              <Calendar className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                              <input
                                type="text"
                                placeholder="e.g. Tomorrow afternoon / This Saturday"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-black/70 font-semibold mb-1">
                              Vehicle / Transport Means <span className="text-black/40 font-normal lowercase">(optional)</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Personal car / Pickup / Probox / Canter"
                              value={pickupNotes}
                              onChange={(e) => setPickupNotes(e.target.value)}
                              className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Conditional: Delivery Destination Form */
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider">
                          {requestType === 'milling' ? 'Paddy Source Location / Depot *' : 'Delivery Destination *'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-[11px] text-black/60 font-medium mb-1">
                              County *
                            </label>
                            <div className="relative">
                              <MapPin className="w-4 h-4 text-black/40 absolute left-3 top-3" />
                              <select
                                value={county}
                                onChange={(e) => setCounty(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                              >
                                {KENYAN_COUNTIES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-black/60 font-medium mb-1">
                              Town / Area / Center *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Wang'uru, Thika Road, Westlands"
                              value={town}
                              onChange={(e) => setTown(e.target.value)}
                              className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-black/60 font-medium mb-1">
                              Specific Landmark or Delivery Address <span className="text-black/40 font-normal lowercase">(optional)</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Commercial Store Depot near Wang'uru Flyover, or street/estate"
                              value={deliveryDetails}
                              onChange={(e) => setDeliveryDetails(e.target.value)}
                              className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Special Specifications / Message (Retail, Wholesale, Business) */}
                {requestType !== 'other' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#123D2A] uppercase tracking-wider mb-1">
                      Additional Requirements / Frequency <span className="text-black/40 font-normal lowercase">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify recurring weekly/monthly supply, offloading timelines, or packaging notes..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xs bg-white border border-[#123D2A]/20 focus:border-[#D4A72C] outline-none resize-none"
                    />
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#123D2A] hover:bg-[#184D35] text-[#F8F6EF] py-3.5 min-h-[48px] rounded-xs text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <span>{headerInfo.btnText}</span>
                        <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

