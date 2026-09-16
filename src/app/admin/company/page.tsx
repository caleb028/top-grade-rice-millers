'use client';

import React, { useEffect, useState } from 'react';
import { CompanyInfo } from '@/types';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Phone,
  MapPin,
  Clock,
  FileText,
  FileDown,
} from 'lucide-react';

export default function AdminCompanyPage() {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'location' | 'hours'>('profile');

  const handleDownloadCompanyPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/pdf/company');
      if (!res.ok) throw new Error('Failed to generate corporate profile PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Top-Grade-Rice-Millers-Company-Profile.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setToastMessage('Downloaded Official Company Profile PDF.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Download company PDF error:', err);
      setErrorMsg('Could not download company profile PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/company');
      const data = await res.json();
      if (data.success) {
        setCompany(data.company);
      }
    } catch (e) {
      console.error('Failed to load company info:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save company information.');
      }

      setToastMessage('Company information updated successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error occurred.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !company) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-xs text-black/50 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A72C]" />
        <span>Loading company configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#123D2A] text-white px-4 py-3 rounded-sm shadow-xl border border-[#D4A72C]/40 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#D4A72C] shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#123D2A]/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Company Information
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Maintain verified corporate identity, Mwea physical location, and contact channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDownloadCompanyPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#123D2A]/20 bg-white hover:bg-[#FCFAF5] text-[#123D2A] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Download Official Company Profile PDF Brochure"
          >
            {downloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A72C]" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-[#D4A72C]" />
            )}
            <span>Download Profile PDF</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 w-full sm:w-auto shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D4A72C]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-black/10 bg-white rounded-t-sm overflow-x-auto no-scrollbar flex-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[44px] text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-[#123D2A] text-[#123D2A] font-bold bg-[#FCFAF5]'
              : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#71856F]" />
          <span>Brand & Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[44px] text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'contact'
              ? 'border-[#123D2A] text-[#123D2A] font-bold bg-[#FCFAF5]'
              : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Phone className="w-4 h-4 text-[#71856F]" />
          <span>Contact Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[44px] text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'location'
              ? 'border-[#123D2A] text-[#123D2A] font-bold bg-[#FCFAF5]'
              : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#71856F]" />
          <span>Location & Maps</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hours')}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[44px] text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'hours'
              ? 'border-[#123D2A] text-[#123D2A] font-bold bg-[#FCFAF5]'
              : 'border-transparent text-black/60 hover:text-black'
          }`}
        >
          <Clock className="w-4 h-4 text-[#71856F]" />
          <span>Business Hours</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-4 sm:p-6 rounded-b-sm border border-t-0 border-[#123D2A]/10 shadow-2xs">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-3xl text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">Company Name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-medium focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">Official Tagline</label>
                <input
                  type="text"
                  value={company.tagline}
                  onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] block uppercase">Subheadline (Hero)</label>
              <textarea
                rows={2}
                value={company.subheadline}
                onChange={(e) => setCompany({ ...company, subheadline: e.target.value })}
                className="w-full p-3 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] block uppercase">About Narrative Summary</label>
              <textarea
                rows={3}
                value={company.aboutText.summary}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    aboutText: { ...company.aboutText, summary: e.target.value },
                  })
                }
                className="w-full p-3 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] block uppercase">Mission Statement</label>
              <textarea
                rows={2}
                value={company.aboutText.mission}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    aboutText: { ...company.aboutText, mission: e.target.value },
                  })
                }
                className="w-full p-3 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-4 max-w-3xl text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">Phone (Display)</label>
                <input
                  type="text"
                  value={company.contact.phoneDisplay}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      contact: { ...company.contact, phoneDisplay: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">WhatsApp Number (E.164 without +)</label>
                <input
                  type="text"
                  value={company.contact.whatsappNumber}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      contact: { ...company.contact, whatsappNumber: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">General Inquiries Email</label>
                <input
                  type="email"
                  value={company.contact.email}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      contact: { ...company.contact, email: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">Wholesale Procurement Email</label>
                <input
                  type="email"
                  value={company.contact.salesEmail}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      contact: { ...company.contact, salesEmail: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] block uppercase">Physical Facility Landmark & Highway Corridor</label>
              <input
                type="text"
                value={company.location.landmark}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    location: { ...company.location, landmark: e.target.value },
                  })
                }
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
              />
            </div>
          </div>
        )}

        {/* Location & Maps Tab */}
        {activeTab === 'location' && (
          <div className="space-y-4 max-w-3xl text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">Town / Center</label>
                <input
                  type="text"
                  value={company.location.town}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      location: { ...company.location, town: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">County</label>
                <input
                  type="text"
                  value={company.location.county}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      location: { ...company.location, county: e.target.value },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">GPS Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={company.location.coordinates.lat}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      location: {
                        ...company.location,
                        coordinates: {
                          ...company.location.coordinates,
                          lat: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono focus:border-[#123D2A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#123D2A] block uppercase">GPS Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={company.location.coordinates.lng}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      location: {
                        ...company.location,
                        coordinates: {
                          ...company.location.coordinates,
                          lng: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono focus:border-[#123D2A] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] block uppercase">Google Maps Embed URL</label>
              <input
                type="text"
                value={company.location.googleMapsEmbedUrl}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    location: { ...company.location, googleMapsEmbedUrl: e.target.value },
                  })
                }
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono text-[11px] focus:border-[#123D2A] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] block uppercase">Google Maps Direct Navigation Link</label>
              <input
                type="text"
                value={company.location.googleMapsLiveUrl}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    location: { ...company.location, googleMapsLiveUrl: e.target.value },
                  })
                }
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono text-[11px] focus:border-[#123D2A] outline-none"
              />
            </div>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-4 max-w-2xl text-xs">
            <p className="text-black/60 mb-2">
              Operational intake and commercial dispatch operating hours displayed in the website footer and contact sections:
            </p>

            <div className="space-y-3">
              {company.contact.businessHours.map((shift, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FCFAF5] border border-black/10 rounded-xs">
                  <div>
                    <label className="font-medium text-black/60 block mb-1">Days Range</label>
                    <input
                      type="text"
                      value={shift.days}
                      onChange={(e) => {
                        const updated = [...company.contact.businessHours];
                        updated[idx].days = e.target.value;
                        setCompany({
                          ...company,
                          contact: { ...company.contact, businessHours: updated },
                        });
                      }}
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-black/60 block mb-1">Hours / Status</label>
                    <input
                      type="text"
                      value={shift.hours}
                      onChange={(e) => {
                        const updated = [...company.contact.businessHours];
                        updated[idx].hours = e.target.value;
                        setCompany({
                          ...company,
                          contact: { ...company.contact, businessHours: updated },
                        });
                      }}
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-black/15 rounded-xs font-medium text-[#123D2A] focus:border-[#123D2A] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
