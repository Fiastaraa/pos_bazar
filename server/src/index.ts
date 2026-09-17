import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import summaryRoutes from './routes/summaryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import path from 'path';
import uploadRoutes from './routes/uploadRoutes';

// Middlewares
app.use(cors());
app.use(express.json());

// Serve folder uploads sebagai file statis
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Bazar POS API aktif & siap melayani!' });
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

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Bazar POS Server berjalan di: http://localhost:${PORT}`);
});
