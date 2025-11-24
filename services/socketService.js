const { Server } = require('socket.io');
const { SOCKET_CLIENT_ORIGIN } = require('../config/env');
const { getFirebaseAdmin } = require('./firebaseAdmin');

let ioInstance;

const buildCorsOrigins = () => {
  if (!SOCKET_CLIENT_ORIGIN) {
    return ['*'];
  }
  return SOCKET_CLIENT_ORIGIN.split(',').map((origin) => origin.trim());
};

const initSocket = (server) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin: buildCorsOrigins(),
      credentials: true
    }
  });

  ioInstance.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const headerToken = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : undefined;

      const token = socket.handshake.auth?.token || headerToken;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const firebaseAdmin = getFirebaseAdmin();
      if (!firebaseAdmin) {
        console.warn('⚠️  Firebase admin not configured; skipping socket auth.');
        return next();
      }

      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      socket.user = decodedToken;
      socket.join(decodedToken.uid);
      return next();
    } catch (error) {
      return next(error);
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const emitSocketEvent = (eventName, payload, roomId) => {
  if (!ioInstance) {
    return;
  }

  if (roomId) {
    ioInstance.to(roomId).emit(eventName, payload);
    return;
  }

  ioInstance.emit(eventName, payload);
};

const getIO = () => ioInstance;

module.exports = {
  initSocket,
  emitSocketEvent,
  getIO
};

