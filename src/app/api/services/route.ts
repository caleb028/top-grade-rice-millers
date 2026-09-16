import { NextRequest, NextResponse } from 'next/server';
import { getServices, saveService, updateService, deleteService } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { sanitizeText, isValidSafeId } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await requireAdminSession(req);
    const onlyActive = session ? searchParams.get('active') === 'true' : true;
    const services = await getServices(onlyActive);
    return NextResponse.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve services.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/services',
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
        { success: false, message: 'Service name is required.' },
        { status: 400 }
      );
    }

    const created = await saveService({
      name,
      tagline: sanitizeText(body.tagline || '', 120),
      description: sanitizeText(body.description || '', 1000),
      iconName: sanitizeText(body.iconName || 'ShieldCheck', 40),
      keyCapability: sanitizeText(body.keyCapability || '', 150),
      number: sanitizeText(body.number || '', 10),
      active: body.active !== undefined ? Boolean(body.active) : true,
    });

    logSecurityEvent('SERVICE_MUTATION', {
      ip: getClientIp(req),
      action: 'CREATE',
      id: created.id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Service successfully created.',
      service: created,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/services',
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
        { success: false, message: 'Valid service ID is required for update.' },
        { status: 400 }
      );
    }

    const updates = { ...body };
    delete updates.id;

    if (updates.name) updates.name = sanitizeText(updates.name, 100);
    if (updates.tagline) updates.tagline = sanitizeText(updates.tagline, 120);
    if (updates.description) updates.description = sanitizeText(updates.description, 1000);

    const updated = await updateService(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Service record not found.' },
        { status: 404 }
      );
    }

    logSecurityEvent('SERVICE_MUTATION', {
      ip: getClientIp(req),
      action: 'UPDATE',
      id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Service successfully updated.',
      service: updated,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/services',
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
        { success: false, message: 'Valid service ID is required for deletion.' },
        { status: 400 }
      );
    }

    const deleted = await deleteService(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Service not found or already deleted.' },
        { status: 404 }
      );
    }

    logSecurityEvent('SERVICE_MUTATION', {
      ip: getClientIp(req),
      action: 'DELETE',
      id,
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Service permanently deleted.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service.' },
      { status: 500 }
    );
  }
}
