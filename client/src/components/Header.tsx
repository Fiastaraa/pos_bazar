import React, { useState, useEffect } from 'react';
import { ShoppingBag, UtensilsCrossed, BarChart3, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'pos' | 'products' | 'summary';
  setActiveTab: (tab: 'pos' | 'products' | 'summary') => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, cartCount }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Bazar Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">KASIR BAZAR</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Stand Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Sistem POS Cepat & Humanis</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl space-x-1">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pos'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Kasir</span>
              {cartCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu & Stok</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Laporan Omset</span>
            </button>
          </nav>

          {/* Clock Widget */}
          <div className="hidden md:flex items-center space-x-2 text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
