import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  cartQuantity?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  cartQuantity = 0,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const remainingAvailable = product.stock - cartQuantity;

  return (
    <div
      onClick={() => {
        if (!isOutOfStock && remainingAvailable > 0) {
          onAddToCart(product);
        }
      }}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isOutOfStock || remainingAvailable <= 0
          ? 'opacity-60 cursor-not-allowed border-slate-200'
          : 'cursor-pointer hover:shadow-md hover:border-emerald-400 active:scale-[0.98] border-slate-200/80'
      }`}
    >
      {/* Product Image / Illustration */}
      <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600 font-bold text-2xl">
            {product.name.charAt(0)}
          </div>
        )}



        {/* Quantity in Cart indicator */}
        {cartQuantity > 0 && (
          <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            {cartQuantity}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-emerald-600 font-extrabold text-base">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            {/* Stock indicator */}
            <div className="flex items-center space-x-1 mt-0.5">
              {isOutOfStock ? (
                <span className="text-[11px] font-medium text-rose-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-0.5 inline" /> Habis
                </span>
              ) : isLowStock ? (
                <span className="text-[11px] font-medium text-amber-600">
                  Sisa {product.stock}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Stok: {product.stock}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={isOutOfStock || remainingAvailable <= 0}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock || remainingAvailable <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white shadow-sm'
            }`}
            title="Tambah ke keranjang"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
