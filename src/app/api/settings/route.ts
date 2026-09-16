import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings, updateAdminSettings, verifyAdminCredentials } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { sanitizeText, isValidEmail } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/settings',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const settings = await getAdminSettings();
    return NextResponse.json({
      success: true,
      settings: {
        adminEmail: settings.adminEmail,
        adminName: settings.adminName,
        websiteStatus: settings.websiteStatus,
        quoteNotifications: settings.quoteNotifications,
        contactNotifications: settings.contactNotifications,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve administrative settings.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/settings',
      method: 'PUT',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      adminEmail,
      adminName,
      websiteStatus,
      quoteNotifications,
      contactNotifications,
      currentPassword,
      newPassword,
    } = body;

    const currentSettings = await getAdminSettings();

    // If password change is requested, verify currentPassword
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to set a new password.' },
          { status: 400 }
        );
      }
      const isCurrentValid = await verifyAdminCredentials(
        currentSettings.adminEmail,
        currentPassword
      );
      if (!isCurrentValid) {
        logSecurityEvent('LOGIN_FAILURE', {
          ip: getClientIp(req),
          email: currentSettings.adminEmail,
          reason: 'Password change attempt with invalid current password',
        });
        return NextResponse.json(
          { success: false, message: 'Incorrect current password.' },
          { status: 401 }
        );
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
      logSecurityEvent('PASSWORD_CHANGE', {
        ip: getClientIp(req),
        email: currentSettings.adminEmail,
      });
    }

    const updates: Parameters<typeof updateAdminSettings>[0] = {};
    if (adminEmail && isValidEmail(adminEmail)) {
      updates.adminEmail = String(adminEmail).trim().toLowerCase();
    }
    if (adminName) {
      updates.adminName = sanitizeText(adminName, 80);
    }
    if (websiteStatus === 'Live' || websiteStatus === 'Maintenance') {
      updates.websiteStatus = websiteStatus;
    }
    if (quoteNotifications !== undefined) {
      updates.quoteNotifications = Boolean(quoteNotifications);
    }
    if (contactNotifications !== undefined) {
      updates.contactNotifications = Boolean(contactNotifications);
    }
    if (newPassword) {
      // Handled and hashed by updateAdminSettings
      updates.passwordHash = newPassword;
    }

    const updated = await updateAdminSettings(updates);

    logSecurityEvent('SETTINGS_UPDATE', {
      ip: getClientIp(req),
      scope: 'ADMIN_SETTINGS',
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully.',
      settings: {
        adminEmail: updated.adminEmail,
        adminName: updated.adminName,
        websiteStatus: updated.websiteStatus,
        quoteNotifications: updated.quoteNotifications,
        contactNotifications: updated.contactNotifications,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update administrative settings.' },
      { status: 500 }
    );
  }
}
