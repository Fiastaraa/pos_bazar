import { prisma } from '../lib/prisma';

export const summaryService = {
  // Ringkasan metrik performa penjualan stand bazar
  async getDailySummary() {
    // 1. Ambil agregat total transaksi dan omset
    const totalAggregation = await prisma.order.aggregate({
      _count: { id: true },
      _sum: {
        totalAmount: true,
        subtotal: true,
        adminFee: true,
      },
    });

    const totalOrders = totalAggregation._count.id || 0;
    const totalRevenue = totalAggregation._sum.totalAmount || 0;
    const totalSubtotal = totalAggregation._sum.subtotal || totalRevenue;
    const totalAdminFee = totalAggregation._sum.adminFee || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Breakdown metode pembayaran (CASH, QRIS, TRANSFER)
    const paymentBreakdown = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    // 3. Top 5 Produk Terlaris (Berdasarkan jumlah kuantitas yang terjual)
    const topItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Perkaya data top items dengan nama produk & kategori
    const topProductIds = topItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const bestSellers = topItems.map((item) => ({
      productId: item.productId,
      name: productMap.get(item.productId)?.name || 'Produk Tidak Dikenal',
      quantitySold: item._sum.quantity || 0,
      totalRevenue: item._sum.subtotal || 0,
    }));

    // 4. Produk dengan stok menipis (Warning restock untuk kasir bazar, stok <= 10)
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 10 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: 'asc' },
      take: 5,
    });

    return {
      totalRevenue,
      totalSubtotal,
      totalAdminFee,
      totalOrders,
      averageOrderValue,
      paymentBreakdown: paymentBreakdown.map((p) => ({
        method: p.paymentMethod,
        count: p._count.id,
        amount: p._sum.totalAmount || 0,
      })),
      bestSellers,
      lowStockProducts,
    };
  },
};
