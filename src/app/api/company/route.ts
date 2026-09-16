import { NextRequest, NextResponse } from 'next/server';
import { getCompanyData, updateCompanyData } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET() {
  try {
    const company = await getCompanyData();
    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error('Error fetching company data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve company profile.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/company',
      method: 'PUT',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const updates = await req.json();
    const updated = await updateCompanyData(updates);

    logSecurityEvent('SETTINGS_UPDATE', {
      ip: getClientIp(req),
      scope: 'COMPANY_INFO',
      adminEmail: session.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Company information updated successfully.',
      company: updated,
    });
  } catch (error) {
    console.error('Error updating company data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update company data.' },
      { status: 500 }
    );
  }
}
