import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isHistoryAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

const secret = process.env.NEXTAUTH_SECRET || 'development-secret-key-z-services-ai-2024';

// POST - Import reports from JSON
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret });
    
    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can import
    if (!isHistoryAdmin(token.email as string)) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { reports, replaceDuplicates = false } = body;

    if (!reports || !Array.isArray(reports)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    let updated = 0;

    for (const report of reports) {
      // Check if report already exists
      const existing = await db.reportHistory.findUnique({
        where: { id: report.id },
      });

      if (existing) {
        if (replaceDuplicates) {
          // Update existing report
          try {
            await db.reportHistory.update({
              where: { id: report.id },
              data: {
                userId: report.userId,
                userName: report.userName,
                reportType: report.reportType,
                tag: report.tag,
                cliente: report.cliente || null,
                descricao: report.descricao,
                conclusao: report.conclusao,
                executantes: report.executantes,
                machineDown: report.machineDown || false,
                data: report.data || '{}',
                finalizedAt: new Date(report.finalizedAt),
              },
            });
            updated++;
          } catch (e) {
            console.error('Failed to update report:', report.id, e);
            skipped++;
          }
        } else {
          // Skip duplicate
          skipped++;
        }
        continue;
      }

      try {
        await db.reportHistory.create({
          data: {
            id: report.id,
            userId: report.userId,
            userName: report.userName,
            reportType: report.reportType,
            tag: report.tag,
            cliente: report.cliente || null,
            descricao: report.descricao,
            conclusao: report.conclusao,
            executantes: report.executantes,
            machineDown: report.machineDown || false,
            data: report.data || '{}',
            finalizedAt: new Date(report.finalizedAt),
          },
        });
        imported++;
      } catch (e) {
        console.error('Failed to import report:', report.id, e);
        skipped++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      imported,
      updated,
      skipped,
      total: reports.length 
    });
  } catch (error) {
    console.error('[History Import API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
