import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { z } from 'zod';

const createOrderSchema = z.object({
  paymentMethod: z.enum(['CASH', 'QRIS', 'TRANSFER'], {
    errorMap: () => ({ message: 'Metode pembayaran harus CASH, QRIS, atau TRANSFER' }),
  }),
  cashTendered: z.number().nonnegative().optional(),
  customerName: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive('ID produk tidak valid'),
        quantity: z.number().int().positive('Jumlah minimal 1'),
      })
    )
    .min(1, 'Keranjang belanja tidak boleh kosong'),
});

export const orderController = {
  // GET /api/orders
  async getAll(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const orders = await orderService.getAll(limit);
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/orders/:id
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const order = await orderService.getById(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
      }
      return res.json({ success: true, data: order });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/orders (Checkout POS)
  async create(req: Request, res: Response) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(validated);
      return res.status(201).json({
        success: true,
        data: order,
        message: 'Transaksi berhasil diselesaikan',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      // Error validasi stok dari service
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};
