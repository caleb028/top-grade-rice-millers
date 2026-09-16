import { NextRequest, NextResponse } from 'next/server';
import { getAdminDashboardStats } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/admin/stats',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const stats = await getAdminDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve administrative statistics.' },
      { status: 500 }
    );
  }
}
