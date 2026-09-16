import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProduct, updateProduct, deleteProduct } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { sanitizeText, isValidSafeId } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await requireAdminSession(req);
    // If not admin, only return active products
    const onlyActive = session ? searchParams.get('active') === 'true' : true;
    const products = await getProducts(onlyActive);
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/products',
      method: 'POST',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const name = sanitizeText(body.name, 100);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid product name.' },
        { status: 400 }
      );
    }

    const category = sanitizeText(body.category || 'Milled Rice', 60);
    const shortDescription = sanitizeText(body.shortDescription || '', 300);
    const fullDescription = sanitizeText(body.fullDescription || shortDescription, 2000);
    const image = typeof body.image === 'string' ? body.image.trim() : '';

    const created = await saveProduct({
      name,
      slug: body.slug ? sanitizeText(body.slug, 100) : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category,
      shortDescription,
      fullDescription,
      image: image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85',
      sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes.map((s: unknown) => sanitizeText(s, 30)) : ['25 kg', '50 kg'],
      grainType: sanitizeText(body.grainType || 'Whole Grain Milled Rice', 100),
      purity: sanitizeText(body.purity || 'Grade 1 Certified', 100),
      moisture: sanitizeText(body.moisture || '< 13.5%', 30),
      brokenRatio: sanitizeText(body.brokenRatio || '< 5%', 30),
      aroma: sanitizeText(body.aroma || 'Natural Fresh Grain', 100),
      origin: sanitizeText(body.origin || 'Mwea, Kirinyaga County, Kenya', 150),
      idealFor: Array.isArray(body.idealFor) ? body.idealFor.map((i: unknown) => sanitizeText(i, 80)) : ['Wholesale & Retail supply'],
      wholesaleAvailable: body.wholesaleAvailable !== undefined ? Boolean(body.wholesaleAvailable) : true,
      featured: Boolean(body.featured),
      active: body.active !== undefined ? Boolean(body.active) : true,
    });

    logSecurityEvent('PRODUCT_MUTATION', {
      ip: getClientIp(req),
      action: 'CREATE',
      id: created.id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Product successfully added to catalogue.',
      product: created,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/products',
      method: 'PUT',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const id = sanitizeText(body.id, 64);

    if (!id || !isValidSafeId(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid product ID is required for update.' },
        { status: 400 }
      );
    }

    const updates = { ...body };
    delete updates.id;

    if (updates.name) updates.name = sanitizeText(updates.name, 100);
    if (updates.category) updates.category = sanitizeText(updates.category, 60);
    if (updates.shortDescription) updates.shortDescription = sanitizeText(updates.shortDescription, 300);
    if (updates.fullDescription) updates.fullDescription = sanitizeText(updates.fullDescription, 2000);

    const updated = await updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Product record not found.' },
        { status: 404 }
      );
    }

    logSecurityEvent('PRODUCT_MUTATION', {
      ip: getClientIp(req),
      action: 'UPDATE',
      id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Product successfully updated.',
      product: updated,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/products',
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
        { success: false, message: 'Valid product ID is required for deletion.' },
        { status: 400 }
      );
    }

    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Product not found or already deleted.' },
        { status: 404 }
      );
    }

    logSecurityEvent('PRODUCT_MUTATION', {
      ip: getClientIp(req),
      action: 'DELETE',
      id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Product permanently removed from catalogue.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
