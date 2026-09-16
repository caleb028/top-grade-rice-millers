import { NextRequest, NextResponse } from 'next/server';
import { getBatchRecord } from '@/lib/db';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { sanitizeText, isValidSafeId } from '@/lib/validation';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ batch: string }> }
) {
  const clientIp = getClientIp(req);

  // Rate limit trace queries: 60 per minute per IP
  const rateResult = checkRateLimit(`trace:${clientIp}`, 60, 60 * 1000);
  if (!rateResult.allowed) {
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'Trace verification rate limit reached. Please wait.'
    );
  }

  try {
    const { batch } = await params;
    const cleanBatch = sanitizeText(batch, 40);

    if (!cleanBatch || !isValidSafeId(cleanBatch)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid batch identifier format.',
        },
        { status: 400 }
      );
    }

    const record = await getBatchRecord(cleanBatch);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: `Batch code "${cleanBatch}" was not found in the verified Mwea milling registry.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, batch: record });
  } catch (error) {
    console.error('Trace error:', error);
    return NextResponse.json(
      { success: false, message: 'Error querying batch registry.' },
      { status: 500 }
    );
  }
}
