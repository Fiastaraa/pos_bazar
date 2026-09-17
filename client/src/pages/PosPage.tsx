import React, { useState, useEffect } from 'react';
import { Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Product, Category, CartItem, Order } from '../types';
import { productService, orderService } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { CartPanel } from '../components/CartPanel';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';

interface PosPageProps {
  onCartChange?: (count: number) => void;
}

export const PosPage: React.FC<PosPageProps> = ({ onCartChange }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Load products
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const prodRes = await productService.getAll();
      setProducts(prodRes);
    } catch (err: any) {
      console.error(err);
      setError(
        'Belum terhubung ke server backend atau database. Pastikan backend aktif di port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update parent cart badge
  useEffect(() => {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    onCartChange?.(totalCount);
  }, [cart, onCartChange]);

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  // Update cart item quantity
  const handleUpdateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const qty = Math.min(newQty, item.product.stock);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  // Remove single item
  const handleRemoveItem = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const handleClearCart = () => {
    setCart([]);
    setCustomerName('');
    setNotes('');
  };

  // Submit Order to backend
  const handleSubmitOrder = async (paymentData: {
    paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
    cashTendered?: number;
  }) => {
    const payload = {
      paymentMethod: paymentData.paymentMethod,
      cashTendered: paymentData.cashTendered,
      customerName: customerName.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      })),
    };

    const newOrder = await orderService.create(payload);

    // Refresh products to get updated stock
    await fetchData();

    // Open receipt modal & close payment modal
    setIsCheckoutOpen(false);
    setCompletedOrder(newOrder);
  };

  // Reset after completed order
  const handleNewTransaction = () => {
    setCompletedOrder(null);
    handleClearCart();
  };

  // Filtered products
  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Alert Error jika server belum terkoneksi */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Info Koneksi Backend:</p>
            <p className="text-xs text-amber-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-amber-200/80 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Main Cashier Layout: Left (Catalog) + Right (Cart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Catalog (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Bar: Live Search */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk bazar (misal: Tas rajut, Es teh, Dimsum)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl whitespace-nowrap">
              {filteredProducts.length} Produk
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl border border-slate-200 p-4 h-52 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-28 bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mt-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mt-1"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <h4 className="font-semibold text-slate-700 text-base">Menu Tidak Ditemukan</h4>
              <p className="text-xs text-slate-400 mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    cartQuantity={inCart ? inCart.quantity : 0}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Cart Panel (4 cols) */}
        <div className="lg:col-span-4 sticky top-20 h-[calc(100vh-6rem)]">
          <CartPanel
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            customerName={customerName}
            setCustomerName={setCustomerName}
            notes={notes}
            setNotes={setNotes}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        customerName={customerName}
        notes={notes}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Digital Receipt Modal */}
      <ReceiptModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onNewTransaction={handleNewTransaction}
      />
    </div>
  );
};
