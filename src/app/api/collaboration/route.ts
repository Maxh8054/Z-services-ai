import { NextRequest, NextResponse } from 'next/server';

// Gerar ID único simples
function generateId(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Interface para sessões
interface SessionUser {
  id: string;
  joinedAt: number;
  lastSeen: number;
}

interface SessionUpdate {
  userId: string;
  type: 'full' | 'field';
  data?: any;
  field?: string;
  value?: any;
  timestamp: number;
}

interface Session {
  id: string;
  createdAt: number;
  data: any;
  users: Map<string, SessionUser>;
  updates: SessionUpdate[];
  lastUpdated: number;
}

// Armazenamento temporário de sessões (em memória)
// NOTA: Em produção no Render, usar banco de dados (Prisma com SQLite/PostgreSQL)
// pois a memória é perdida em cold starts
const sessionsStore = new Map<string, Session>();

// Limpar sessões antigas (mais de 24 horas)
function cleanOldSessions() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas

  sessionsStore.forEach((session, id) => {
    if (now - session.createdAt > maxAge) {
      sessionsStore.delete(id);
    }
  });
}

// Limpar usuários inativos (mais de 5 minutos)
function cleanInactiveUsers(session: Session) {
  const now = Date.now();
  const maxInactive = 5 * 60 * 1000; // 5 minutos

  session.users.forEach((user, id) => {
    if (now - user.lastSeen > maxInactive) {
      session.users.delete(id);
    }
  });
}

// Limpar atualizações antigas (mais de 5 minutos)
function cleanOldUpdates(session: Session) {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutos

  session.updates = session.updates.filter(u => now - u.timestamp < maxAge);
}

export async function POST(request: NextRequest) {
  try {
    // Limpar sessões antigas periodicamente
    cleanOldSessions();

    const body = await request.json();
    const { action, sessionId, userId, data, type, field, value, timestamp, lastUpdate, initialData } = body;

    switch (action) {
      case 'create': {
        // Criar nova sessão
        const newSessionId = generateId(8);
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
          ? `https://${process.env.NEXTAUTH_URL || process.env.VERCEL_URL}` 
          : '';
        const shareLink = `${baseUrl}/report/${newSessionId}`;

        const newSession: Session = {
          id: newSessionId,
          createdAt: Date.now(),
          data: data || null,
          users: new Map(),
          updates: [],
          lastUpdated: Date.now(),
        };

        sessionsStore.set(newSessionId, newSession);

        console.log(`[Collaboration] Created session ${newSessionId}, total sessions: ${sessionsStore.size}`);

        return NextResponse.json({
          success: true,
          sessionId: newSessionId,
          shareLink,
        });
      }

      case 'join': {
        // Entrar na sessão
        const session = sessionsStore.get(sessionId);

        if (!session) {
          return NextResponse.json({
            success: false,
            error: 'Session not found',
          }, { status: 404 });
        }

        // Adicionar usuário
        session.users.set(userId, {
          id: userId,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        });

        // Se tem dados iniciais, atualizar
        if (initialData) {
          session.data = initialData;
          session.lastUpdated = Date.now();
        }

        return NextResponse.json({
          success: true,
          sessionId: session.id,
          data: session.data,
          userCount: session.users.size,
        });
      }

      case 'leave': {
        // Sair da sessão
        const session = sessionsStore.get(sessionId);

        if (session && userId) {
          session.users.delete(userId);
        }

        return NextResponse.json({
          success: true,
        });
      }

      case 'poll': {
        // Polling para atualizações
        const session = sessionsStore.get(sessionId);

        if (!session) {
          return NextResponse.json({
            success: false,
            error: 'Session not found',
          }, { status: 404 });
        }

        // Atualizar lastSeen do usuário
        if (userId && session.users.has(userId)) {
          const user = session.users.get(userId)!;
          user.lastSeen = Date.now();
        }

        // Limpar usuários e atualizações antigas
        cleanInactiveUsers(session);
        cleanOldUpdates(session);

        // Filtrar atualizações desde o último timestamp
        const newUpdates = session.updates.filter(u => u.timestamp > (lastUpdate || 0));

        return NextResponse.json({
          success: true,
          updates: newUpdates,
          userCount: session.users.size,
          timestamp: Date.now(),
        });
      }

      case 'update': {
        // Enviar atualização
        const session = sessionsStore.get(sessionId);

        if (!session) {
          return NextResponse.json({
            success: false,
            error: 'Session not found',
          }, { status: 404 });
        }

        const update: SessionUpdate = {
          userId,
          type: type || 'full',
          timestamp: timestamp || Date.now(),
        };

        if (type === 'field') {
          update.field = field;
          update.value = value;
        } else {
          update.data = data;
          // Atualizar dados da sessão
          session.data = data;
        }

        session.updates.push(update);
        session.lastUpdated = Date.now();

        // Limpar atualizações antigas
        cleanOldUpdates(session);

        return NextResponse.json({
          success: true,
        });
      }

      case 'get': {
        // Obter dados da sessão
        const session = sessionsStore.get(sessionId);

        console.log(`[Collaboration] Get session ${sessionId}, found: ${!!session}, total sessions: ${sessionsStore.size}`);

        if (!session) {
          return NextResponse.json({
            success: false,
            error: 'Session not found',
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: session.data,
          userCount: session.users.size,
          sessionId: session.id,
        });
      }

      case 'delete': {
        // Deletar sessão
        sessionsStore.delete(sessionId);

        return NextResponse.json({
          success: true,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Collaboration API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'Session ID required',
    }, { status: 400 });
  }

  const session = sessionsStore.get(sessionId);

  if (!session) {
    return NextResponse.json({
      success: false,
      exists: false,
    });
  }

  return NextResponse.json({
    success: true,
    exists: true,
    createdAt: session.createdAt,
    lastUpdated: session.lastUpdated,
    userCount: session.users.size,
  });
}
