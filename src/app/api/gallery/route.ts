import { NextRequest, NextResponse } from 'next/server';
import { getGallery, saveGalleryImage, deleteGalleryImage } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { sanitizeText, isValidSafeId } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET() {
  try {
    const gallery = await getGallery();
    return NextResponse.json({ success: true, count: gallery.length, gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve gallery images.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/gallery',
      method: 'POST',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const url = typeof body.url === 'string' ? body.url.trim() : '';

    if (!url || (!url.startsWith('/') && !url.startsWith('https://'))) {
      return NextResponse.json(
        { success: false, message: 'Valid image URL is required (must start with / or https://).' },
        { status: 400 }
      );
    }

    const title = sanitizeText(body.title || 'Top Grade Rice Facility', 120);
    const alt = sanitizeText(body.alt || title, 150);
    const category = sanitizeText(body.category || 'Rice', 50);

    const saved = await saveGalleryImage({
      url,
      title,
      alt,
      category,
      featured: Boolean(body.featured),
    });

    return NextResponse.json({
      success: true,
      message: 'Image added to gallery.',
      image: saved,
    });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save gallery entry.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/gallery',
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
        { success: false, message: 'Valid image ID is required for deletion.' },
        { status: 400 }
      );
    }

    const deleted = await deleteGalleryImage(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Image record not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery image permanently removed.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete gallery image.' },
      { status: 500 }
    );
  }
}
