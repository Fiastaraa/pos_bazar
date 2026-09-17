import { Product, Order, DailySummary, OrderItem } from '../types';
import { calculateAdminFeePerUnit } from './adminFee';

const PRODUCTS_KEY = 'bazar_pos_products';
const ORDERS_KEY = 'bazar_pos_orders';

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Es Teh Manis Jumbo',
    price: 5000,
    costPrice: 500,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Kopi Susu Gula Aren',
    price: 18000,
    costPrice: 1000,
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Lemon Tea Squash',
    price: 12000,
    costPrice: 1000,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Nasi Rice Bowl Ayam Teriyaki',
    price: 25000,
    costPrice: 1500,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Dimsum Ayam Mentai (4 pcs)',
    price: 22000,
    costPrice: 1500,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'Kripik Singkong Gurih',
    price: 30000,
    costPrice: 1500,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
  },
];

export const offlineStorage = {
  getProducts(): Product[] {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialProducts;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  createProduct(data: Partial<Product>): Product {
    const products = this.getProducts();
    const newPrice = Math.round(Number(data.price) || 0);
    const newProduct: Product = {
      id: Date.now(),
      name: (data.name || 'Menu Baru').trim(),
      price: newPrice,
      costPrice: calculateAdminFeePerUnit(newPrice),
      stock: Math.max(0, Number(data.stock) || 0),
      imageUrl: data.imageUrl,
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id: number, data: Partial<Product>): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Produk tidak ditemukan');

    const updatedPrice = data.price !== undefined ? Math.round(Number(data.price)) : products[idx].price;
    products[idx] = {
      ...products[idx],
      ...data,
      price: updatedPrice,
      costPrice: calculateAdminFeePerUnit(updatedPrice),
    };
    this.saveProducts(products);
    return products[idx];
  },

  updateStock(id: number, stock: number): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Produk tidak ditemukan');

    products[idx].stock = Math.max(0, stock);
    this.saveProducts(products);
    return products[idx];
  },

  deleteProduct(id: number): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(products);
  },

  getOrders(limit = 50): Order[] {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    try {
      const orders: Order[] = JSON.parse(raw);
      return orders.slice(0, limit);
    } catch {
      return [];
    }
  },

  createOrder(payload: {
    paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
    cashTendered?: number;
    customerName?: string;
    notes?: string;
    items: { productId: number; quantity: number }[];
  }): Order {
    const products = this.getProducts();
    let subtotalAmount = 0;
    let adminFee = 0;
    const orderItems: OrderItem[] = [];

    for (const item of payload.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      if (prod.stock < item.quantity) {
        throw new Error(`Stok untuk "${prod.name}" tidak mencukupi.`);
      }

      // Kurangi stok
      prod.stock -= item.quantity;

      const pPrice = Math.round(prod.price);
      const itemSubtotal = pPrice * item.quantity;
      const unitAdmin = calculateAdminFeePerUnit(pPrice);

      subtotalAmount += itemSubtotal;
      adminFee += unitAdmin * item.quantity;

      orderItems.push({
        id: Math.floor(Math.random() * 100000),
        orderId: 0,
        productId: prod.id,
        product: { id: prod.id, name: prod.name },
        quantity: item.quantity,
        price: pPrice,
        subtotal: itemSubtotal,
      });
    }

    this.saveProducts(products);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BZR-${dateStr}-${randomSuffix}`;
    const totalAmount = subtotalAmount; // Tagihan pembeli murni harga produk

    const newOrder: Order = {
      id: Date.now(),
      orderNumber,
      subtotal: subtotalAmount,
      adminFee,
      totalAmount,
      paymentMethod: payload.paymentMethod,
      cashTendered: payload.cashTendered || totalAmount,
      changeAmount: Math.max(0, (payload.cashTendered || totalAmount) - totalAmount),
      customerName: payload.customerName || undefined,
      notes: payload.notes || undefined,
      items: orderItems,
      createdAt: now.toISOString(),
    };

    const existingOrders = this.getOrders(500);
    existingOrders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(existingOrders));

    return newOrder;
  },

  getDailySummary(): DailySummary {
    const orders = this.getOrders(500);
    const products = this.getProducts();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSubtotal = orders.reduce((sum, o) => sum + (o.subtotal || o.totalAmount), 0);
    const totalAdminFee = orders.reduce((sum, o) => sum + (o.adminFee || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment breakdown
    const pMap: Record<string, { count: number; amount: number }> = {};
    for (const o of orders) {
      if (!pMap[o.paymentMethod]) {
        pMap[o.paymentMethod] = { count: 0, amount: 0 };
      }
      pMap[o.paymentMethod].count += 1;
      pMap[o.paymentMethod].amount += o.totalAmount;
    }
    const paymentBreakdown = Object.keys(pMap).map((method) => ({
      method,
      count: pMap[method].count,
      amount: pMap[method].amount,
    }));

    // Best sellers
    const soldMap: Record<number, { qty: number; revenue: number; name: string }> = {};
    for (const o of orders) {
      for (const it of o.items) {
        if (!soldMap[it.productId]) {
          soldMap[it.productId] = { qty: 0, revenue: 0, name: it.product.name };
        }
        soldMap[it.productId].qty += it.quantity;
        soldMap[it.productId].revenue += it.subtotal;
      }
    }
    const bestSellers = Object.keys(soldMap)
      .map((idStr) => {
        const id = Number(idStr);
        return {
          productId: id,
          name: soldMap[id].name,
          quantitySold: soldMap[id].qty,
          totalRevenue: soldMap[id].revenue,
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    const lowStockProducts = products
      .filter((p) => p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, stock: p.stock }));

    return {
      totalRevenue,
      totalSubtotal,
      totalAdminFee,
      totalOrders,
      averageOrderValue,
      paymentBreakdown,
      bestSellers,
      lowStockProducts,
    };
  },

  downloadCSV(): void {
    const orders = this.getOrders(500);
    const dateStr = new Date().toISOString().slice(0, 10);
    let csv = '\uFEFFNo. Transaksi,Waktu,Pelanggan,Metode Bayar,Total Omset (Rp),Cas Koperasi (Rp),Bersih Stan (Rp),Menu Dipesan\n';

    for (const o of orders) {
      const itemsStr = o.items.map((i) => `${i.product.name} (x${i.quantity})`).join('; ');
      const cleanCustomer = (o.customerName || 'Umum').replace(/,/g, ' ');
      const cleanItems = itemsStr.replace(/,/g, ' ');
      const bersih = o.totalAmount - (o.adminFee || 0);
      csv += `${o.orderNumber},${new Date(o.createdAt).toLocaleString('id-ID')},${cleanCustomer},${o.paymentMethod},${o.totalAmount},${o.adminFee || 0},${bersih},"${cleanItems}"\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan-Penjualan-Bazar-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
