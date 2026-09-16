import { NextRequest, NextResponse } from 'next/server';
import { getCompanyData, getProducts, getServices } from '@/lib/db';
import { generateCompanyProfilePdf } from '@/lib/pdf/companyProfilePdf';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limit company PDF generation: 40 requests per minute per IP
  const rateResult = checkRateLimit(`pdf_company:${clientIp}`, 40, 60 * 1000);
  if (!rateResult.allowed) {
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'PDF generation rate limit reached. Please wait a moment.'
    );
  }

  try {
    const [company, products, services] = await Promise.all([
      getCompanyData(),
      getProducts(),
      getServices(),
    ]);

    const pdfBytes = await generateCompanyProfilePdf(company, products, services);
    const filename = 'Top-Grade-Rice-Millers-Company-Profile.pdf';

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Company Profile PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate company profile PDF.' },
      { status: 500 }
    );
  }
}
