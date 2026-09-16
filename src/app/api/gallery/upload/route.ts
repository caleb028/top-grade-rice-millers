import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { requireAdminSession } from '@/lib/auth';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit';
import { logSecurityEvent } from '@/lib/securityLogger';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates binary file signatures (magic bytes) to prevent executable/disguised file uploads.
 */
function detectVerifiedImageType(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return 'webp';
  }

  return null;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Enforce Server-Side Admin Authentication
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: clientIp,
      path: '/api/gallery/upload',
      method: 'POST',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  // 2. Rate Limiting: 10 uploads per 10 minutes per IP
  const rateResult = checkRateLimit(`upload:${clientIp}`, 10, 10 * 60 * 1000);
  if (!rateResult.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: clientIp,
      endpoint: '/api/gallery/upload',
    });
    return rateLimitResponse(
      rateResult.retryAfterSeconds,
      'Upload limit reached. Please wait before uploading more images.'
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided for upload.' },
        { status: 400 }
      );
    }

    // 3. File Size Limit
    if (file.size > MAX_FILE_SIZE) {
      logSecurityEvent('FILE_UPLOAD_BLOCKED', {
        ip: clientIp,
        reason: 'File size exceeds 5MB',
        size: file.size,
      });
      return NextResponse.json(
        { success: false, message: 'File exceeds 5MB maximum permitted size.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Binary Magic Byte Verification
    const verifiedExt = detectVerifiedImageType(buffer);
    if (!verifiedExt) {
      logSecurityEvent('FILE_UPLOAD_BLOCKED', {
        ip: clientIp,
        reason: 'Invalid magic bytes/signature',
        claimedType: file.type,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            'Invalid file format. Only genuine JPEG, PNG, or WEBP image files are accepted.',
        },
        { status: 400 }
      );
    }

    // 5. Secure File Storage with Generated Unpredictable Name
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const safeFileName = `tgrm_${Date.now()}_${randomSuffix}.${verifiedExt}`;
    const filePath = path.join(UPLOADS_DIR, safeFileName);

    // Write file safely
    fs.writeFileSync(filePath, buffer);

    logSecurityEvent('FILE_UPLOAD', {
      ip: clientIp,
      filename: safeFileName,
      size: file.size,
      adminEmail: session.email,
    });

    const publicUrl = `/uploads/${safeFileName}`;

    return NextResponse.json({
      success: true,
      message: 'Image securely validated and stored.',
      url: publicUrl,
      fileName: safeFileName,
      size: file.size,
    });
  } catch (error) {
    console.error('Error in /api/gallery/upload:', error);
    return NextResponse.json(
      { success: false, message: 'File processing error.' },
      { status: 500 }
    );
  }
}
