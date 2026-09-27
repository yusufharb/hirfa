import { Server, Socket } from 'socket.io';
import { logger } from '../server';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(\`New socket connection: \${socket.id}\`);

    socket.on('join_craftsman', (craftsmanId: string) => {
      socket.join(\`craftsman_\${craftsmanId}\`);
      logger.info(\`Craftsman \${craftsmanId} joined room\`);
    });

    socket.on('join_booking', (bookingId: string) => {
      socket.join(\`booking_\${bookingId}\`);
      logger.info(\`Socket \${socket.id} joined booking room \${bookingId}\`);
    });

    socket.on('craftsman_location_update', (data: { bookingId: string, lat: number, lng: number }) => {
      io.to(\`booking_\${data.bookingId}\`).emit('craftsman_location_update', { lat: data.lat, lng: data.lng });
    });

    socket.on('disconnect', () => {
      logger.info(\`Socket disconnected: \${socket.id}\`);
    });
  });
};
