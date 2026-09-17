export interface Category {
  id: number;
  name: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  subtotal?: number;
  adminFee?: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
  cashTendered?: number;
  changeAmount?: number;
  customerName?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface BestSeller {
  productId: number;
  name: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  amount: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
}

export interface DailySummary {
  totalRevenue: number;
  totalSubtotal?: number;
  totalAdminFee?: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentBreakdown: PaymentBreakdown[];
  bestSellers: BestSeller[];
  lowStockProducts: LowStockProduct[];
}
