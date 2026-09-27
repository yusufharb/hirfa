import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import winston from 'winston';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { initDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './socket/socket.handler';

// Route Imports
import authRoutes from './routes/auth.routes';
import servicesRoutes from './routes/services.routes';
import bookingsRoutes from './routes/bookings.routes';
import craftsmenRoutes from './routes/craftsmen.routes';
import usersRoutes from './routes/users.routes';
import paymentsRoutes from './routes/payments.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Winston Logger Setup
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Socket.io Setup
export const io = new SocketIOServer(server, {
  cors: { origin: '*' },
});
setupSocketHandlers(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/craftsmen', craftsmenRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Initialize Database & Start Server
initDB().then(() => {
  server.listen(PORT, () => {
    logger.info(\`Server running on port \${PORT}\`);
    console.log(\`Server running on port \${PORT}\`);
  });
}).catch((err) => {
  console.error('Failed to start server due to DB initialization error', err);
});
