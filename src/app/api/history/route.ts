import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isHistoryAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

// Secret for JWT token - must match the one in auth.ts
const secret = process.env.NEXTAUTH_SECRET || 'development-secret-key-z-services-ai-2024';

// GET - List all finalized reports (admin sees all, users see their own)
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret,
      cookieName: 'next-auth.session-token',
    });
    
    if (!token?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Please login again',
        reports: [],
        monthlyStats: {},
        userStats: {},
        totalReports: 0
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // If admin requests stats for dashboard/ranking
    if (action === 'stats' && isHistoryAdmin(token.email as string)) {
      const reports = await db.reportHistory.findMany({
        orderBy: { finalizedAt: 'desc' },
      });

      // Calculate monthly stats
      const monthlyStats: Record<string, number> = {};
      const userStats: Record<string, { name: string; count: number }> = {};
      
      reports.forEach(report => {
        const date = new Date(report.finalizedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
        
        if (!userStats[report.userId]) {
          userStats[report.userId] = { name: report.userName, count: 0 };
        }
        userStats[report.userId].count++;
      });

      return NextResponse.json({
        reports,
        monthlyStats,
        userStats,
        totalReports: reports.length,
      });
    }

    // Regular user sees only their own reports
    const reports = await db.reportHistory.findMany({
      where: { userId: token.id as string },
      orderBy: { finalizedAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('[History API GET] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: String(error),
      reports: [],
      monthlyStats: {},
      userStats: {},
      totalReports: 0
    }, { status: 500 });
  }
}

// POST - Finalize a report
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret,
      cookieName: 'next-auth.session-token',
    });
    
    if (!token?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please login again' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      reportType, 
      tag, 
      cliente, 
      descricao, 
      conclusao, 
      executantes, 
      machineDown,
      data 
    } = body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!tag) missingFields.push('TAG');
    if (!descricao) missingFields.push('Descrição');
    if (!conclusao) missingFields.push('Conclusão');
    if (!executantes) missingFields.push('Nomes dos Executantes');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        missingFields 
      }, { status: 400 });
    }

    if (!reportType || !data) {
      return NextResponse.json({ error: 'Missing report type or data' }, { status: 400 });
    }

    // Check if report with same tag, description AND conclusion already exists (within last 24 hours)
    // Only consider duplicate if TAG + Descrição + Conclusão are ALL the same
    const existingReport = await db.reportHistory.findFirst({
      where: {
        userId: token.id as string,
        tag: tag,
        descricao: descricao,
        conclusao: conclusao,
        reportType: reportType,
        finalizedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (existingReport) {
      return NextResponse.json({ 
        error: 'Report already finalized',
        message: 'Você já finalizou um relatório idêntico (mesma TAG, Descrição e Conclusão) nas últimas 24 horas.' 
      }, { status: 400 });
    }

    // Get user name from token or predefined users
    let userName = token.name as string;
    if (!userName) {
      userName = token.email as string;
    }

    const report = await db.reportHistory.create({
      data: {
        userId: token.id as string,
        userName: userName,
        reportType,
        tag,
        cliente: cliente || null,
        descricao,
        conclusao,
        executantes,
        machineDown: machineDown || false,
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('[History API POST] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: String(error) 
    }, { status: 500 });
  }
}

// DELETE - Delete a report (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret,
      cookieName: 'next-auth.session-token',
    });
    
    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing report ID' }, { status: 400 });
    }

    // Only admins can delete reports
    if (!isHistoryAdmin(token.email as string)) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    await db.reportHistory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[History API DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
