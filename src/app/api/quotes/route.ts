import { NextRequest, NextResponse } from 'next/server';
import { saveQuote, getQuotes, deleteQuote, updateQuoteStatus } from '@/lib/db';
import { QuoteRequest } from '@/types';
import { requireAdminSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import {
  sanitizeText,
  isValidEmail,
  isValidPhone,
  isValidSafeId,
  clampNumber,
} from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';

const VALID_STATUSES: QuoteRequest['status'][] = [
  'Pending',
  'Contacted',
  'Quoted',
  'Completed',
];

const VALID_REQUEST_TYPES = ['retail', 'wholesale', 'business', 'milling', 'other'] as const;

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit: 10 quote submissions per hour (3,600,000 ms) per IP
  const rateKey = `quotes_post:${clientIp}`;
  const rateResult = checkRateLimit(rateKey, 10, 60 * 60 * 1000);
  if (!rateResult.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: clientIp,
      endpoint: '/api/quotes',
    });
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'Submission rate limit reached. Please wait before submitting another quote request.'
    );
  }

  try {
    const body = await req.json();

    // Honeypot spam defense
    if (body.website_trap || body.address_confirm) {
      return NextResponse.json({
        success: true,
        message: 'Quotation request registered.',
      });
    }

    const rawType = body.requestType ? String(body.requestType).toLowerCase().trim() : 'wholesale';
    const requestType = (VALID_REQUEST_TYPES as readonly string[]).includes(rawType)
      ? (rawType as (typeof VALID_REQUEST_TYPES)[number])
      : 'wholesale';

    const name = sanitizeText(body.name, 100);
    const phone = sanitizeText(body.phone, 25);
    const emailRaw = body.email ? sanitizeText(body.email, 100).toLowerCase().trim() : '';
    const company = body.company ? sanitizeText(body.company, 120) : undefined;
    const organization = body.organization ? sanitizeText(body.organization, 120) : undefined;
    const county = body.county ? sanitizeText(body.county, 60) : undefined;
    const town = body.town ? sanitizeText(body.town, 80) : undefined;
    const deliveryLocation = sanitizeText(
      body.deliveryLocation || [town, county].filter(Boolean).join(', ') || 'Mwea / On-site',
      150
    );
    const message = body.message ? sanitizeText(body.message, 1000) : undefined;
    const subject = body.subject ? sanitizeText(body.subject, 150) : undefined;

    // Contact person / Name validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid full name or contact person.' },
        { status: 400 }
      );
    }

    // Phone validation
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid phone contact number.' },
        { status: 400 }
      );
    }

    // Email validation (optional, but if provided, must be valid)
    if (emailRaw && !isValidEmail(emailRaw)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address or leave it empty.' },
        { status: 400 }
      );
    }

    // Type-specific field extraction & validation
    let productId = sanitizeText(body.productId || '', 64);
    let productName = sanitizeText(body.productName || body.productId || '', 100);
    let quantity = clampNumber(body.quantity || body.quantityBags, 1, 100000, 1);
    let unit = sanitizeText(body.unit || 'Bags', 30);
    let bagSize = body.bagSize ? sanitizeText(body.bagSize, 30) : undefined;
    let customerType = body.customerType ? sanitizeText(body.customerType, 50) : 'Customer';
    let millingDetails: QuoteRequest['millingDetails'] = undefined;

    if (requestType === 'retail') {
      if (!productId) {
        return NextResponse.json(
          { success: false, message: 'Please select a product for your quotation request.' },
          { status: 400 }
        );
      }
      if (!deliveryLocation || deliveryLocation === 'Mwea / On-site' && !county && !town) {
        return NextResponse.json(
          { success: false, message: 'Please provide your County or Town for delivery estimation.' },
          { status: 400 }
        );
      }
      customerType = customerType || 'Personal / Household';
    } else if (requestType === 'wholesale') {
      if (!productId) {
        return NextResponse.json(
          { success: false, message: 'Please select a wholesale product.' },
          { status: 400 }
        );
      }
      bagSize = bagSize || '50 kg';
      customerType = customerType || 'Wholesaler';
    } else if (requestType === 'business') {
      if (!organization && !company) {
        return NextResponse.json(
          { success: false, message: 'Please specify your Organization or Business name.' },
          { status: 400 }
        );
      }
      if (!productId) {
        return NextResponse.json(
          { success: false, message: 'Please select a product for your institutional request.' },
          { status: 400 }
        );
      }
      customerType = customerType || 'Business / Institution';
    } else if (requestType === 'milling') {
      const riceType = body.millingDetails?.riceType || body.riceType;
      const requirements = body.millingDetails?.requirements || body.millingRequirements;
      const preferredDate = body.millingDetails?.preferredDate || body.preferredDate;

      if (!riceType) {
        return NextResponse.json(
          { success: false, message: 'Please specify the rice variety or paddy type for milling.' },
          { status: 400 }
        );
      }
      if (!requirements) {
        return NextResponse.json(
          { success: false, message: 'Please specify your milling or processing requirements.' },
          { status: 400 }
        );
      }

      millingDetails = {
        riceType: sanitizeText(riceType, 80),
        requirements: sanitizeText(requirements, 500),
        preferredDate: preferredDate ? sanitizeText(preferredDate, 40) : undefined,
      };

      productName = `Milling Service: ${millingDetails.riceType}`;
      customerType = customerType || 'Milling Client';
    } else if (requestType === 'other') {
      if (!subject || subject.length < 3) {
        return NextResponse.json(
          { success: false, message: 'Please provide a subject for your enquiry.' },
          { status: 400 }
        );
      }
      if (!message || message.length < 5) {
        return NextResponse.json(
          { success: false, message: 'Please provide your enquiry message details.' },
          { status: 400 }
        );
      }
      productName = `General Enquiry: ${subject}`;
      customerType = customerType || 'General Enquiry';
    }

    const cleanQuote = await saveQuote({
      requestType,
      name,
      company: company || organization,
      organization: organization || company,
      phone,
      email: emailRaw || undefined,
      customerType,
      productId: productId || undefined,
      productName,
      quantityBags: quantity,
      quantity,
      unit,
      bagSize,
      deliveryLocation,
      county,
      town,
      millingDetails,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'Your request has been successfully registered.',
      quote: cleanQuote,
    });
  } catch (error) {
    console.error('Error in /api/quotes POST:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record quote request. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/quotes',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const quotes = await getQuotes();
    return NextResponse.json({ success: true, count: quotes.length, quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve quotation records.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/quotes',
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
    const status = body.status as QuoteRequest['status'];

    if (!id || !isValidSafeId(id) || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid quote ID or target status.' },
        { status: 400 }
      );
    }

    const updated = await updateQuoteStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Quote record not found.' },
        { status: 404 }
      );
    }

    logSecurityEvent('QUOTE_STATUS_UPDATE', {
      ip: getClientIp(req),
      id,
      status,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: `Quote status updated to ${status}.`,
      quote: updated,
    });
  } catch (error) {
    console.error('Error in PATCH /api/quotes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update quote status.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/quotes',
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
        { success: false, message: 'Valid quote ID required for deletion.' },
        { status: 400 }
      );
    }

    const deleted = await deleteQuote(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Quote record not found or already deleted.' },
        { status: 404 }
      );
    }

    logSecurityEvent('QUOTE_DELETE', {
      ip: getClientIp(req),
      id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Quote record permanently deleted from database.',
      id,
    });
  } catch (error) {
    console.error('Error in DELETE /api/quotes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete quote.' },
      { status: 500 }
    );
  }
}
