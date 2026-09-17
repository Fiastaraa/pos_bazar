import { Request, Response } from 'express';
import { productService } from '../services/productService';
import { z } from 'zod';

// Skema validasi menggunakan Zod
const createProductSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  price: z.number().positive('Harga harus lebih dari 0'),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative('Stok tidak boleh negatif').default(100),
  imageUrl: z.string().optional().or(z.literal('')),
});

const updateProductSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').optional(),
  price: z.number().positive('Harga harus lebih dari 0').optional(),
  costPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative('Stok tidak boleh negatif').optional(),
  imageUrl: z.string().optional().or(z.literal('')),
});

const updateStockSchema = z.object({
  stock: z.number().int().nonnegative('Stok tidak boleh negatif'),
});

export const productController = {
  // GET /api/products
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAll();
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/products/categories
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getCategories();
      return res.json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/products/:id
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const product = await productService.getById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/products
  async create(req: Request, res: Response) {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await productService.create(validated);
      return res.status(201).json({ success: true, data: product, message: 'Produk berhasil ditambahkan' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // PUT /api/products/:id
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
      }
      const existing = await productService.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }
      const validated = updateProductSchema.parse(req.body);
      const product = await productService.update(id, validated);
      return res.json({ success: true, data: product, message: 'Produk berhasil diperbarui' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // PATCH /api/products/:id/stock
  async updateStock(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
      }
      const validated = updateStockSchema.parse(req.body);
      const product = await productService.updateStock(id, validated.stock);
      return res.json({ success: true, data: product, message: 'Stok berhasil diperbarui' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0].message });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // DELETE /api/products/:id
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID produk tidak valid' });
      }
      const existing = await productService.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }
      await productService.delete(id);
      return res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },
};
