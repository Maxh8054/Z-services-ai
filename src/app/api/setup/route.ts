import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { PREDEFINED_USERS } from '@/lib/auth';

// GET - Verificar usuários no banco
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST - Popular banco com usuários pré-definidos
export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();
    
    // Segurança simples
    if (secret !== 'z-services-setup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let created = 0;
    let existing = 0;

    for (const user of PREDEFINED_USERS) {
      const existingUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            password: hashedPassword,
          },
        });
        created++;
      } else {
        existing++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Setup completo: ${created} usuários criados, ${existing} já existiam`,
      created,
      existing,
    });
  } catch (error) {
    console.error('Error setting up users:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
