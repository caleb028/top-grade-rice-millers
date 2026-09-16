import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCompanyData } from '@/lib/db';
import { generateProductPdf } from '@/lib/pdf/productPdf';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { sanitizeText, isValidSafeId } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);

  // Rate limiting: 40 product PDF generations per minute per IP
  const rateResult = checkRateLimit(`pdf_product:${clientIp}`, 40, 60 * 1000);
  if (!rateResult.allowed) {
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'PDF generation rate limit reached. Please wait a moment.'
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = sanitizeText(searchParams.get('id'), 64);

    if (!id || !isValidSafeId(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid product ID or slug required.' },
        { status: 400 }
      );
    }

    const products = await getProducts();
    const product = products.find((p) => p.id === id || p.slug === id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product record not found.' },
        { status: 404 }
      );
    }

    const company = await getCompanyData();
    const pdfBytes = await generateProductPdf(product, company);

    const safeSlug = product.slug.replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `Top-Grade-Rice-Millers-Product-${safeSlug}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Product PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate product brochure PDF.' },
      { status: 500 }
    );
  }
}
