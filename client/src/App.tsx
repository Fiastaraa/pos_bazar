import React, { useState } from 'react';
import { Header } from './components/Header';
import { PosPage } from './pages/PosPage';
import { ProductsPage } from './pages/ProductsPage';
import { SummaryPage } from './pages/SummaryPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'summary'>('pos');
  const [cartCount, setCartCount] = useState<number>(0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'pos' && <PosPage onCartChange={setCartCount} />}
        {activeTab === 'products' && <ProductsPage />}
        {activeTab === 'summary' && <SummaryPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
        <p>© 2026 Kasir Stand Bazar — Dibuat Sederhana & Ramah Pengguna</p>
      </footer>
    </div>
  );
}

export default App;
