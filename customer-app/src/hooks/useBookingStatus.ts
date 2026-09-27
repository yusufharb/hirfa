import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../constants/api';

export function useBookingStatus(bookingId: string) {
  const [status, setStatus] = useState<string>('searching');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const newSocket = io(API_CONFIG.SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('join_booking', bookingId);

    newSocket.on('status_update', (data: { status: string }) => {
      setStatus(data.status);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [bookingId]);

  return { status };
}