import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  
  connect() {
    if (this.socket?.connected) return this.socket;
    
    const token = localStorage.getItem('auth_token');
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  joinEvent(eventId: number) {
    this.socket?.emit('join:event', eventId);
  }
  
  leaveEvent(eventId: number) {
    this.socket?.emit('leave:event', eventId);
  }
  
  joinApparatus(eventId: number, apparatusId: number) {
    this.socket?.emit('join:apparatus', eventId, apparatusId);
  }
  
  onScoreUpdate(callback: (data: any) => void) {
    this.socket?.on('score:updated', callback);
  }
  
  onLeaderboardUpdate(callback: (data: any) => void) {
    this.socket?.on('leaderboard:updated', callback);
  }
  
  onPerformanceStatus(callback: (data: any) => void) {
    this.socket?.on('performance:status', callback);
  }
  
  onScoresPublished(callback: (data: any) => void) {
    this.socket?.on('scores:published', callback);
  }
  
  offScoreUpdate(callback: (data: any) => void) {
    this.socket?.off('score:updated', callback);
  }
  
  offLeaderboardUpdate(callback: (data: any) => void) {
    this.socket?.off('leaderboard:updated', callback);
  }
  
  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();


