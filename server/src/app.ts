import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import summaryRoutes from './routes/summaryRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

export const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve folder uploads sebagai file statis jika ada
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Bazar POS API aktif & siap melayani!',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
  });
});

export default app;
