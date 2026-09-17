import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Flame,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { DailySummary, Order } from '../types';
import { summaryService, orderService } from '../services/api';

export const SummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, ordersRes] = await Promise.all([
        summaryService.getDailySummary(),
        orderService.getAll(15),
      ]);
      setSummary(sumRes);
      setRecentOrders(ordersRes);
    } catch (err) {
      console.error('Gagal memuat laporan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await summaryService.downloadExcel();
    } catch (err: any) {
      console.error('Gagal unduh excel:', err);
      alert(
        'Gagal mengunduh file Excel. Pastikan server backend sedang aktif dan terhubung ke database.'
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ringkasan & Analitik Penjualan Bazar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Data metrik omset, performa produk, dan distribusi pembayaran secara real-time
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center space-x-2 shadow-sm shadow-emerald-200 transition-all disabled:opacity-50"
            title="Download file Excel dengan 3 sheet analisis terstruktur"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'Menyiapkan...' : 'Tarik Data Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Penerimaan Kasir
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              Rp {(summary?.totalRevenue || 0).toLocaleString('id-ID')}
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5 text-[10.5px] text-slate-500 font-medium mt-0.5">
              <span>Bersih Stan: Rp {((summary?.totalRevenue || 0) - (summary?.totalAdminFee || 0)).toLocaleString('id-ID')}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Cas Koperasi: Rp {(summary?.totalAdminFee || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Volume Transaksi
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {summary?.totalOrders || 0} Pembeli
            </div>
            <span className="text-[10px] text-blue-600 font-medium">Struk terbit</span>
          </div>
        </div>

        {/* AOV / Average Basket Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Rata-rata Belanja (AOV)
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              Rp {Math.round(summary?.averageOrderValue || 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Per pelanggan</span>
          </div>
        </div>

        {/* Top Product Hero */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menu Terlaris
            </span>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {summary?.bestSellers[0]?.name || '-'}
            </div>
            <span className="text-[10px] text-rose-600 font-medium">
              {summary?.bestSellers[0]?.quantitySold || 0} porsi terjual
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Top Sellers & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Best Sellers (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Top 5 Menu Paling Laris</h3>
            </div>
            <span className="text-[11px] text-slate-400">Berdasarkan kuantitas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Nama Menu</th>
                  <th className="py-2.5 px-3 text-center">Terjual</th>
                  <th className="py-2.5 px-3 text-right">Kontribusi Omset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!summary?.bestSellers || summary.bestSellers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Belum ada penjualan.
                    </td>
                  </tr>
                ) : (
                  summary.bestSellers.map((item, idx) => (
                    <tr key={item.productId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {item.quantitySold} porsi
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">
                        Rp {item.totalRevenue.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Breakdown & Low Stock (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Method Share */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Metode Pembayaran</h3>
            </div>

            <div className="space-y-3">
              {summary?.paymentBreakdown.map((item) => {
                const totalRev = summary.totalRevenue || 1;
                const percentage = Math.round((item.amount / totalRev) * 100);
                return (
                  <div key={item.method} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.method === 'CASH' ? 'Uang Tunai' : item.method}</span>
                      <span>
                        Rp {item.amount.toLocaleString('id-ID')} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.method === 'CASH'
                            ? 'bg-emerald-500'
                            : item.method === 'QRIS'
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400">{item.count} transaksi</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Stock Warning */}
          {summary?.lowStockProducts && summary.lowStockProducts.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <h4 className="font-bold text-xs">Peringatan Stok Menipis</h4>
              </div>
              <p className="text-[11px] text-amber-700">
                Menu berikut memiliki sisa stok di bawah 10 unit di stand bazar:
              </p>
              <div className="flex flex-wrap gap-2">
                {summary.lowStockProducts.map((p) => (
                  <span
                    key={p.id}
                    className="bg-white border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs"
                  >
                    {p.name}: <span className="text-rose-600">{p.stock} tersisa</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Transaksi Terbaru</h3>
          </div>
          <span className="text-xs text-slate-400">15 Transaksi Terakhir</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Menu Dipesan</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ord.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      {ord.customerName ? (
                        <span className="font-medium text-slate-800">{ord.customerName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Umum</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {ord.items.map((i) => `${i.product.name} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      <div>Rp {ord.totalAmount.toLocaleString('id-ID')}</div>
                      {ord.adminFee != null && ord.adminFee > 0 && (
                        <div className="text-[10px] text-amber-600 font-normal">
                          (cas: Rp {ord.adminFee.toLocaleString('id-ID')})
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
