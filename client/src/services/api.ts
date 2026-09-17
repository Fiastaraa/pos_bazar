import axios from 'axios';
import { Product, Category, Order, DailySummary } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  async getAll(categoryId?: number): Promise<Product[]> {
    const res = await api.get('/products', {
      params: categoryId ? { categoryId } : undefined,
    });
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get('/products/categories');
    return res.data.data;
  },

  async create(data: Partial<Product>): Promise<Product> {
    const res = await api.post('/products', data);
    return res.data.data;
  },

  async update(id: number, data: Partial<Product>): Promise<Product> {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },

  async updateStock(id: number, stock: number): Promise<Product> {
    const res = await api.patch(`/products/${id}/stock`, { stock });
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.url;
  },
};

export interface CreateOrderPayload {
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashTendered?: number;
  customerName?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export const orderService = {
  async getAll(limit = 50): Promise<Order[]> {
    const res = await api.get('/orders', { params: { limit } });
    return res.data.data;
  },

  async getById(id: number): Promise<Order> {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post('/orders', payload);
    return res.data.data;
  },
};

export const summaryService = {
  async getDailySummary(): Promise<DailySummary> {
    const res = await api.get('/summary/daily');
    return res.data.data;
  },

  async downloadExcel(): Promise<void> {
    const res = await api.get('/summary/export-excel', {
      responseType: 'blob',
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan-Penjualan-Bazar-${dateStr}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
