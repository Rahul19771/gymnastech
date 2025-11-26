import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import athleteRoutes from './routes/athletes';
import scoringRoutes from './routes/scoring';
import apparatusRoutes from './routes/apparatus';
import configRoutes from './routes/config';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/apparatus', apparatusRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join event room
  socket.on('join:event', (eventId: number) => {
    socket.join(`event:${eventId}`);
    console.log(`Socket ${socket.id} joined event:${eventId}`);
  });

  // Leave event room
  socket.on('leave:event', (eventId: number) => {
    socket.leave(`event:${eventId}`);
    console.log(`Socket ${socket.id} left event:${eventId}`);
  });

  // Join apparatus room
  socket.on('join:apparatus', (eventId: number, apparatusId: number) => {
    socket.join(`event:${eventId}:apparatus:${apparatusId}`);
    console.log(`Socket ${socket.id} joined event:${eventId}:apparatus:${apparatusId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
    🏆 GymnaTech - Professional Gymnastics Scoring Platform
    🚀 Server running on port ${PORT}
    📝 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 API: http://localhost:${PORT}/api
    🔌 WebSocket ready for real-time updates
  `);
});

export default app;

