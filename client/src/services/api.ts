import axios from 'axios';
import { Product, Category, Order, DailySummary } from '../types';
import { offlineStorage } from './offlineStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  async getAll(categoryId?: number): Promise<Product[]> {
    try {
      const res = await api.get('/products', {
        params: categoryId ? { categoryId } : undefined,
      });
      if (Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      return offlineStorage.getProducts();
    } catch {
      return offlineStorage.getProducts();
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await api.get('/products/categories');
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async create(data: Partial<Product>): Promise<Product> {
    try {
      const res = await api.post('/products', data);
      return res.data.data;
    } catch {
      return offlineStorage.createProduct(data);
    }
  },

  async update(id: number, data: Partial<Product>): Promise<Product> {
    try {
      const res = await api.put(`/products/${id}`, data);
      return res.data.data;
    } catch {
      return offlineStorage.updateProduct(id, data);
    }
  },

  async updateStock(id: number, stock: number): Promise<Product> {
    try {
      const res = await api.patch(`/products/${id}/stock`, { stock });
      return res.data.data;
    } catch {
      return offlineStorage.updateStock(id, stock);
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch {
      offlineStorage.deleteProduct(id);
    }
  },
};

export const uploadService = {
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data?.url) return res.data.url;
    } catch {
      // Fallback base64 langsung di browser
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    try {
      const res = await api.get('/orders', { params: { limit } });
      if (Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      return offlineStorage.getOrders(limit);
    } catch {
      return offlineStorage.getOrders(limit);
    }
  },

  async getById(id: number): Promise<Order> {
    try {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    } catch {
      const found = offlineStorage.getOrders().find((o) => o.id === id);
      if (!found) throw new Error('Pesanan tidak ditemukan');
      return found;
    }
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    try {
      const res = await api.post('/orders', payload);
      return res.data.data;
    } catch {
      return offlineStorage.createOrder(payload);
    }
  },
};

export const summaryService = {
  async getDailySummary(): Promise<DailySummary> {
    try {
      const res = await api.get('/summary/daily');
      if (res.data?.data) return res.data.data;
      return offlineStorage.getDailySummary();
    } catch {
      return offlineStorage.getDailySummary();
    }
  },

  async downloadExcel(): Promise<void> {
    try {
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
    } catch {
      offlineStorage.downloadCSV();
    }
  },
};

export default api;
