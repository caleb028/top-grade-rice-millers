import { NextRequest, NextResponse } from 'next/server';
import { getCompanyData } from '@/lib/db';
import { generateSitePresentationPdf } from '@/lib/pdf/sitePresentationPdf';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit presentation PDF generation: 30 requests per minute per IP
  const rateResult = checkRateLimit(`pdf_presentation:${clientIp}`, 30, 60 * 1000);
  if (!rateResult.allowed) {
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'PDF generation rate limit reached. Please wait a moment.'
    );
  }

  try {
    const company = await getCompanyData();
    const pdfBytes = await generateSitePresentationPdf(company);
    const filename = 'Ahero-Top-Grade-Rice-Millers-Platform-Presentation.pdf';

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating Site Presentation PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate platform presentation PDF.' },
      { status: 500 }
    );
  }
}
