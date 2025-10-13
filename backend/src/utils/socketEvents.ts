import { Server as SocketIOServer } from 'socket.io';

/**
 * Utility functions for emitting real-time events via Socket.IO
 */

export const emitScoreUpdate = (
  io: SocketIOServer,
  eventId: number,
  apparatusId: number,
  performanceId: number,
  data: any
) => {
  // Emit to event room
  io.to(`event:${eventId}`).emit('score:updated', {
    performanceId,
    apparatusId,
    ...data
  });
  
  // Emit to apparatus-specific room
  io.to(`event:${eventId}:apparatus:${apparatusId}`).emit('score:updated', {
    performanceId,
    ...data
  });
};

export const emitLeaderboardUpdate = (
  io: SocketIOServer,
  eventId: number,
  apparatusId: number,
  leaderboard: any[]
) => {
  io.to(`event:${eventId}`).emit('leaderboard:updated', {
    apparatusId,
    leaderboard
  });
  
  io.to(`event:${eventId}:apparatus:${apparatusId}`).emit('leaderboard:updated', {
    leaderboard
  });
};

export const emitPerformanceStatusChange = (
  io: SocketIOServer,
  eventId: number,
  performanceId: number,
  status: string
) => {
  io.to(`event:${eventId}`).emit('performance:status', {
    performanceId,
    status
  });
};

export const emitScoresPublished = (
  io: SocketIOServer,
  eventId: number,
  performanceIds: number[]
) => {
  io.to(`event:${eventId}`).emit('scores:published', {
    performanceIds
  });
};


