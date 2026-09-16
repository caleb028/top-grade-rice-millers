'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Lock,
  Globe,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  LogOut,
} from 'lucide-react';

interface SettingsData {
  adminEmail: string;
  adminName: string;
  websiteStatus: 'Live' | 'Maintenance';
  quoteNotifications: boolean;
  contactNotifications: boolean;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: settings.adminEmail,
          adminName: settings.adminName,
          websiteStatus: settings.websiteStatus,
          quoteNotifications: settings.quoteNotifications,
          contactNotifications: settings.contactNotifications,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update settings.');
      }

      setToastMessage('Settings saved successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating settings.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password.');
      }

      setPasswordSuccess('Administrator password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  if (loading || !settings) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-xs text-black/50 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4A72C]" />
        <span>Loading administrator settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
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

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#123D2A]/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123D2A]">
            Settings
          </h1>
          <p className="text-xs text-black/60 mt-1">
            Manage administrative profile, system alerts, website status and security credentials.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {passwordSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{passwordSuccess}</span>
        </div>
      )}

      {/* Account & Profile Form */}
      <div className="bg-white p-4 sm:p-6 rounded-sm border border-[#123D2A]/10 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-black/5">
          <User className="w-4 h-4 text-[#123D2A]" />
          <h3 className="font-serif text-base font-bold text-[#123D2A]">
            Administrator Profile & General
          </h3>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                Admin Name
              </label>
              <input
                type="text"
                required
                value={settings.adminName}
                onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                Admin Email (Login)
              </label>
              <input
                type="email"
                required
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs font-mono focus:border-[#123D2A] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Website Status */}
            <div className="space-y-2">
              <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                Website Operating Status
              </label>
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer min-h-[38px]">
                  <input
                    type="radio"
                    name="status"
                    checked={settings.websiteStatus === 'Live'}
                    onChange={() => setSettings({ ...settings, websiteStatus: 'Live' })}
                    className="w-4 h-4 text-[#123D2A] focus:ring-[#123D2A]"
                  />
                  <span className="font-medium text-emerald-800">Live & Operating</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer min-h-[38px]">
                  <input
                    type="radio"
                    name="status"
                    checked={settings.websiteStatus === 'Maintenance'}
                    onChange={() => setSettings({ ...settings, websiteStatus: 'Maintenance' })}
                    className="w-4 h-4 text-[#123D2A] focus:ring-[#123D2A]"
                  />
                  <span className="font-medium text-amber-800">Maintenance Notice</span>
                </label>
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-2">
              <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                Notification Alerts
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer min-h-[38px]">
                  <input
                    type="checkbox"
                    checked={settings.quoteNotifications}
                    onChange={(e) =>
                      setSettings({ ...settings, quoteNotifications: e.target.checked })
                    }
                    className="w-4 h-4 rounded-xs text-[#123D2A] focus:ring-[#123D2A]"
                  />
                  <span>Alert on new wholesale quote requests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer min-h-[38px]">
                  <input
                    type="checkbox"
                    checked={settings.contactNotifications}
                    onChange={(e) =>
                      setSettings({ ...settings, contactNotifications: e.target.checked })
                    }
                    className="w-4 h-4 rounded-xs text-[#123D2A] focus:ring-[#123D2A]"
                  />
                  <span>Alert on new contact inquiries</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white font-semibold uppercase tracking-wider rounded-xs text-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              <Save className="w-4 h-4 text-[#D4A72C]" />
              <span>Save General Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-white p-4 sm:p-6 rounded-sm border border-[#123D2A]/10 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-black/5">
          <Lock className="w-4 h-4 text-[#123D2A]" />
          <h3 className="font-serif text-base font-bold text-[#123D2A]">
            Change Administrator Password
          </h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-lg">
          <div className="space-y-1">
            <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#123D2A] uppercase tracking-wider block">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full min-h-[44px] px-3 py-2 bg-[#FCFAF5] border border-black/15 rounded-xs focus:border-[#123D2A] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#123D2A] hover:bg-[#184D35] text-white font-semibold uppercase tracking-wider rounded-xs text-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Lock className="w-4 h-4 text-[#D4A72C]" />
            <span>Update Password</span>
          </button>
        </form>
      </div>

      {/* Session Information */}
      <div className="bg-white p-4 sm:p-5 rounded-sm border border-[#123D2A]/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-[#123D2A] block">Active Administrator Session</span>
          <span className="text-black/50 text-[11px] block">
            Last settings update: {new Date(settings.updatedAt).toLocaleString('en-GB')}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 rounded-xs font-medium text-xs transition-colors cursor-pointer w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );
}
