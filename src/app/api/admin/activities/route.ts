import { NextRequest, NextResponse } from 'next/server';
import { getLiveActivities, getAdminDashboardStats } from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/securityLogger';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    logSecurityEvent('UNAUTHORIZED_ACCESS', {
      ip: getClientIp(req),
      path: '/api/admin/activities',
      method: 'GET',
    });
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Administrator session required.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const [activities, stats] = await Promise.all([
      getLiveActivities(limit),
      getAdminDashboardStats(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      activities,
      stats,
    });
  } catch (error) {
    console.error('Activities error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve live administrative activities.' },
      { status: 500 }
    );
  }
}
