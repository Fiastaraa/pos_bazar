import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, User, StickyNote, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import { calculateAdminFeePerUnit } from '../services/adminFee';

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onOpenCheckout: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  customerName,
  setCustomerName,
  notes,
  setNotes,
  onOpenCheckout,
}) => {
  const subtotalProducts = cart.reduce((acc, item) => acc + Math.round(item.product.price) * item.quantity, 0);
  const adminFee = cart.reduce(
    (acc, item) => acc + item.quantity * calculateAdminFeePerUnit(item.product.price),
    0
  );
  // Total tagihan pembeli adalah harga produk murni (cas wajib dipotong dari stan, bukan ditambahkan ke pembeli)
  const totalAmount = subtotalProducts;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Pesanan Kasir</h2>
            <p className="text-xs text-slate-500">{totalItems} item dipilih</p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <p className="font-semibold text-slate-600 text-sm">Keranjang masih kosong</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Sentuh menu di sebelah kiri untuk menambahkan pesanan pembeli
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const price = Math.round(item.product.price);
            const hasAdminFee = price <= 10000;
            return (
              <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs text-slate-500">
                      Rp {price.toLocaleString('id-ID')}
                    </span>
                    {hasAdminFee && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                        +admin 500/unit
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    Subtotal: Rp {(price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-rose-600 active:scale-90 transition-all"
                  title="Kurangi"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-6 text-center text-sm font-bold text-slate-800">
                  {item.quantity}
                </span>

                <button
                  disabled={item.quantity >= item.product.stock}
                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all ${
                    item.quantity >= item.product.stock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white shadow-sm text-slate-600 hover:text-emerald-600'
                  }`}
                  title="Tambah"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>

      {/* Cart Form Inputs (Customer Name & Notes) */}
      {cart.length > 0 && (
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-2.5">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Nama Pelanggan (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <StickyNote className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Catatan (misal: tanpa es, bungkus)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Bottom Summary & Action */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Subtotal Produk:</span>
          <span className="font-semibold text-slate-800">
            Rp {subtotalProducts.toLocaleString('id-ID')}
          </span>
        </div>

        {adminFee > 0 && (
          <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/70">
            <div>
              <span className="font-semibold">Potongan Cas Wajib:</span>
              <span className="block text-[10px] text-amber-600 font-normal">
                Dipotong dari stan (Bersih: Rp {(subtotalProducts - adminFee).toLocaleString('id-ID')})
              </span>
            </div>
            <span className="font-bold text-amber-900">-Rp {adminFee.toLocaleString('id-ID')}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
          <span className="text-sm text-slate-700 font-bold">Total Tagihan:</span>
          <span className="text-xl font-extrabold text-slate-900">
            Rp {totalAmount.toLocaleString('id-ID')}
          </span>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={onOpenCheckout}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md mt-1 ${
            cart.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-emerald-200'
          }`}
        >
          <span>Bayar Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
