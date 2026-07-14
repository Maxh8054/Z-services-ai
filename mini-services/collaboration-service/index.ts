import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3005;

// Armazenamento em memória das sessões
// Em produção, isso seria um banco de dados (Redis, MongoDB, etc.)
interface SessionData {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  data: any;
  users: Set<string>;
}

const sessions = new Map<string, SessionData>();

// Limpar sessões inativas a cada 30 minutos
setInterval(() => {
  const now = new Date();
  const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 horas
  
  sessions.forEach((session, id) => {
    if (now.getTime() - session.lastActivity.getTime() > maxInactiveTime) {
      sessions.delete(id);
      console.log(`Session ${id} expired and removed`);
    }
  });
}, 30 * 60 * 1000);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://z-services.ai'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  let currentSession: string | null = null;
  let currentUserId: string | null = null;

  console.log(`Client connected: ${socket.id}`);

  // Entrar em uma sessão
  socket.on('join-session', (data: { sessionId: string; userId: string; initialData?: any }) => {
    const { sessionId, userId, initialData } = data;
    
    // Criar sessão se não existir
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        createdAt: new Date(),
        lastActivity: new Date(),
        data: initialData || null,
        users: new Set(),
      });
      console.log(`Session ${sessionId} created`);
    }

    const session = sessions.get(sessionId)!;
    session.users.add(userId);
    session.lastActivity = new Date();

    currentSession = sessionId;
    currentUserId = userId;

    // Entrar na sala da sessão
    socket.join(sessionId);

    // Enviar dados atuais para o novo usuário
    socket.emit('session-joined', {
      sessionId,
      data: session.data,
      userCount: session.users.size,
    });

    // Notificar outros usuários
    socket.to(sessionId).emit('user-joined', {
      userId,
      userCount: session.users.size,
    });

    console.log(`User ${userId} joined session ${sessionId}. Users: ${session.users.size}`);
  });

  // Atualizar dados da sessão
  socket.on('update-data', (data: { sessionId: string; userId: string; updates: any; timestamp: number }) => {
    const { sessionId, userId, updates, timestamp } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Atualizar dados (merge profundo)
    session.data = {
      ...session.data,
      ...updates,
      _lastUpdatedBy: userId,
      _lastUpdated: timestamp,
    };
    session.lastActivity = new Date();

    // Broadcast para todos os outros usuários na sessão
    socket.to(sessionId).emit('data-updated', {
      updates,
      userId,
      timestamp,
    });

    console.log(`Data updated in session ${sessionId} by ${userId}`);
  });

  // Atualização parcial (para campos específicos)
  socket.on('update-field', (data: { sessionId: string; userId: string; field: string; value: any; timestamp: number }) => {
    const { sessionId, userId, field, value, timestamp } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Atualizar campo específico
    if (session.data) {
      session.data[field] = value;
      session.data._lastUpdatedBy = userId;
      session.data._lastUpdated = timestamp;
    }
    session.lastActivity = new Date();

    // Broadcast para outros usuários
    socket.to(sessionId).emit('field-updated', {
      field,
      value,
      userId,
      timestamp,
    });
  });

  // Ping/Heartbeat para manter conexão ativa
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Obter status da sessão
  socket.on('get-session-status', (sessionId: string) => {
    const session = sessions.get(sessionId);
    if (session) {
      socket.emit('session-status', {
        exists: true,
        userCount: session.users.size,
        lastActivity: session.lastActivity,
      });
    } else {
      socket.emit('session-status', { exists: false });
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    if (currentSession && currentUserId) {
      const session = sessions.get(currentSession);
      if (session) {
        session.users.delete(currentUserId);
        
        // Notificar outros usuários
        socket.to(currentSession).emit('user-left', {
          userId: currentUserId,
          userCount: session.users.size,
        });

        console.log(`User ${currentUserId} left session ${currentSession}. Users: ${session.users.size}`);
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Sair da sessão explicitamente
  socket.on('leave-session', (data: { sessionId: string; userId: string }) => {
    const { sessionId, userId } = data;
    const session = sessions.get(sessionId);

    if (session) {
      session.users.delete(userId);
      socket.leave(sessionId);
      
      socket.to(sessionId).emit('user-left', {
        userId,
        userCount: session.users.size,
      });
    }

    currentSession = null;
    currentUserId = null;
  });
});

httpServer.listen(PORT, () => {
  console.log(`Collaboration WebSocket service running on port ${PORT}`);
});
