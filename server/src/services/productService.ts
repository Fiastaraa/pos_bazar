import { prisma } from '../lib/prisma';

export interface CreateProductInput {
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  imageUrl?: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  imageUrl?: string;
}

export const productService = {
  // Ambil semua produk bazar
  async getAll() {
    return prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  },

  // Kompatibilitas jika endpoint kategori dipanggil
  async getCategories() {
    return [];
  },

  // Ambil detail produk berdasarkan ID
  async getById(id: number) {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  // Tambah produk baru untuk stan bazar
  async create(data: CreateProductInput) {
    return prisma.product.create({
      data: {
        ...data,
        price: Math.round(data.price),
        costPrice: data.costPrice ? Math.round(data.costPrice) : undefined,
      },
    });
  },

  // Update informasi produk
  async update(id: number, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? Math.round(data.price) : undefined,
        costPrice: data.costPrice !== undefined ? Math.round(data.costPrice) : undefined,
      },
    });
  },

  // Update cepat stok produk (berguna saat restock di tengah bazar)
  async updateStock(id: number, stock: number) {
    return prisma.product.update({
      where: { id },
      data: { stock },
    });
  },

  // Hapus menu jika belum pernah ditransaksikan
  async delete(id: number) {
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });
    if (orderCount > 0) {
      throw new Error(
        'Produk ini memiliki riwayat transaksi, tidak dapat dihapus untuk menjaga keakuratan laporan omset.'
      );
    }
    return prisma.product.delete({
      where: { id },
    });
  },
};
