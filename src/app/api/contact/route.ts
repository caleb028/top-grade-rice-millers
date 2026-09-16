import { NextRequest, NextResponse } from 'next/server';
import {
  saveContactMessage,
  getContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from '@/lib/db';
import { ContactMessage } from '@/types';
import { requireAdminSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import {
  sanitizeText,
  isValidEmail,
  isValidPhone,
  isValidSafeId,
} from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';

const VALID_STATUSES: ContactMessage['status'][] = ['New', 'Read', 'Replied'];

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit: 10 contact messages per hour per IP
  const rateKey = `contact_post:${clientIp}`;
  const rateResult = checkRateLimit(rateKey, 10, 60 * 60 * 1000);
  if (!rateResult.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: clientIp,
      endpoint: '/api/contact',
    });
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'Message rate limit reached. Please wait before submitting another inquiry.'
    );
  }

  try {
    const body = await req.json();

    // Honeypot spam defense
    if (body.website_trap || body.address_confirm) {
      return NextResponse.json({
        success: true,
        message: 'Message received.',
      });
    }

    const name = sanitizeText(body.name, 100);
    const phone = body.phone ? sanitizeText(body.phone, 25) : '';
    const email = body.email ? sanitizeText(body.email, 100).toLowerCase() : '';
    const subject = body.subject ? sanitizeText(body.subject, 120) : 'General Inquiry';
    const message = sanitizeText(body.message, 2000);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, message: 'Please provide either a phone number or email address.' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid phone number.' },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Message content is too short (at least 5 characters).' },
        { status: 400 }
      );
    }

    const saved = await saveContactMessage({
      name,
      phone,
      email,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been received by Top Grade Rice Millers.',
      messageId: saved.id,
    });
  } catch (error) {
    console.error('Error in /api/contact:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record message.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/contact',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const messages = await getContactMessages();
    return NextResponse.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve messages.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/contact',
      method: 'PATCH',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = sanitizeText(body.id, 64);
    const status = body.status as ContactMessage['status'];

    if (!id || !isValidSafeId(id) || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Valid message ID and status are required.' },
        { status: 400 }
      );
    }

    const updated = await updateContactStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Message record not found.' },
        { status: 404 }
      );
    }

    logSecurityEvent('MESSAGE_STATUS_UPDATE', {
      ip: getClientIp(req),
      id,
      status,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: `Message status updated to ${status}.`,
      contact: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/contact:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update message status.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/contact',
      method: 'DELETE',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = sanitizeText(searchParams.get('id'), 64);

    if (!id || !isValidSafeId(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid message ID is required for deletion.' },
        { status: 400 }
      );
    }

    const deleted = await deleteContactMessage(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Message record not found or already deleted.' },
        { status: 404 }
      );
    }

    logSecurityEvent('MESSAGE_DELETE', {
      ip: getClientIp(req),
      id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Message permanently removed from database.',
      id,
    });
  } catch (error) {
    console.error('Error in DELETE /api/contact:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete message.' },
      { status: 500 }
    );
  }
}
