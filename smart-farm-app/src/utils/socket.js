import { io } from 'socket.io-client';

let socket = null;

export function connectSocket({ baseUrl, user }) {
  if (socket) return socket;
  if (!user?.id) return null;

  socket = io(baseUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    query: {
      userId: String(user.id),
      display_name: user.name || user.display_name || '',
      role: user.role || 'buyer'
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
