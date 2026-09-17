import { prisma } from '../lib/prisma';

export interface CreateOrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashTendered?: number;
  customerName?: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export const orderService = {
  // Ambil daftar riwayat transaksi kasir (terbaru di atas)
  async getAll(limit = 50) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  },

  // Ambil detail satu transaksi (untuk cetak struk)
  async getById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  // Proses transaksi checkout POS Bazar dengan atomic transaction
  async createOrder(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new Error('Keranjang belanja tidak boleh kosong.');
    }

    // Menggunakan Prisma Transaction:
    // Menjamin bahwa validasi stok, pengurangan stok, dan pencatatan order terjadi secara atomik.
    // Jika ada satu langkah yang gagal (misal stok kurang), semua perubahan dibatalkan (rollback).
    return prisma.$transaction(async (tx) => {
      // 1. Ambil data produk terkait untuk validasi harga dan stok aktual
      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotalAmount = 0;
      let adminFee = 0;
      const orderItemsData = [];

      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok untuk "${product.name}" tidak mencukupi. Sisa stok: ${product.stock}, diminta: ${item.quantity}.`
          );
        }

        const roundedPrice = Math.round(product.price);
        const subtotal = roundedPrice * item.quantity;
        subtotalAmount += subtotal;

        // Aturan biaya wajib/admin koperasi: Rp 500 per barang per kelipatan Rp 10.000
        // 1rb - 10rb = 500, 11rb - 20rb = 1.000, 21rb - 30rb = 1.500, dst.
        const adminPerUnit = roundedPrice > 0 ? Math.ceil(roundedPrice / 10000) * 500 : 0;
        adminFee += item.quantity * adminPerUnit;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: roundedPrice,
          subtotal,
        });

        // 2. Kurangi stok produk
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Total akhir yang dibayar pembeli adalah harga produk murni (biaya admin koperasi dipotong dari produk)
      const totalAmount = subtotalAmount;

      // 3. Validasi pembayaran tunai & hitung kembalian
      let changeAmount = 0;
      if (input.paymentMethod === 'CASH') {
        const tendered = input.cashTendered || 0;
        if (tendered < totalAmount) {
          throw new Error(
            `Uang yang dibayarkan (Rp ${tendered.toLocaleString('id-ID')}) kurang dari total belanja (Rp ${totalAmount.toLocaleString('id-ID')}).`
          );
        }
        changeAmount = tendered - totalAmount;
      } else {
        // Untuk QRIS atau Transfer, uang pas
        input.cashTendered = totalAmount;
        changeAmount = 0;
      }

      // 4. Buat nomor transaksi unik (misal: BZR-20260916-1234)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `BZR-${dateStr}-${randomSuffix}`;

      // 5. Simpan Order dan OrderItem
      const order = await tx.order.create({
        data: {
          orderNumber,
          subtotal: subtotalAmount,
          adminFee,
          totalAmount,
          paymentMethod: input.paymentMethod,
          cashTendered: input.cashTendered,
          changeAmount,
          customerName: input.customerName || null,
          notes: input.notes || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      return order;
    });
  },
};
