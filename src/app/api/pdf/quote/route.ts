import { NextRequest, NextResponse } from 'next/server';
import { getQuotes, getCompanyData } from '@/lib/db';
import { generateQuotePdf } from '@/lib/pdf/quotePdf';
import { requireAdminSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { sanitizeText, isValidSafeId } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Authorization check with HMAC token verification
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: clientIp,
      path: '/api/pdf/quote',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  // 2. Rate limit PDF generation: 30 requests per minute per IP
  const rateResult = checkRateLimit(`pdf_quote:${clientIp}`, 30, 60 * 1000);
  if (!rateResult.allowed) {
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'PDF generation rate limit reached. Please wait a moment.'
    );
  }

  try {
    // 3. Fetch quote with sanitized reference ID
    const { searchParams } = new URL(req.url);
    const id = sanitizeText(searchParams.get('id'), 64);

    if (!id || !isValidSafeId(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid quote ID or reference code is required.' },
        { status: 400 }
      );
    }

    const quotes = await getQuotes();
    const quote = quotes.find((q) => q.id === id || q.referenceNumber === id);

    if (!quote) {
      return NextResponse.json(
        { success: false, message: 'Quotation record not found.' },
        { status: 404 }
      );
    }

    const company = await getCompanyData();
    const pdfBytes = await generateQuotePdf(quote, company);

    const safeRef = quote.referenceNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `Top-Grade-Rice-Millers-Quote-Request-${safeRef}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating quote PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate quotation PDF document.' },
      { status: 500 }
    );
  }
}
