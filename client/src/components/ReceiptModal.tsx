import React from 'react';
import { CheckCircle2, Printer, PlusCircle, X } from 'lucide-react';
import { Order } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  onNewTransaction,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Success Header */}
        <div className="bg-emerald-600 p-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-white">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg">Transaksi Berhasil!</h3>
          <p className="text-xs text-emerald-100">Pesanan telah dicatat di sistem</p>
        </div>

        {/* Receipt Paper Area */}
        <div id="printable-receipt" className="p-6 bg-slate-50/50 flex-1 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Header Info */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="font-bold text-sm text-slate-800 uppercase tracking-wide">
              STAND BAZAR RESMI
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">Struk Bukti Pembayaran</div>
            <div className="text-slate-500 text-[10px] mt-1">{formattedDate}</div>
            <div className="font-semibold text-slate-700 text-[11px] mt-1">
              No: {order.orderNumber}
            </div>
            {order.customerName && (
              <div className="text-slate-600 text-[11px] mt-0.5">
                Plg: {order.customerName}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-slate-700">
                <div className="flex-1 pr-2">
                  <div>{item.product.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="font-semibold text-slate-800">
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1.5 pt-1 text-slate-700">
            {order.adminFee && order.adminFee > 0 ? (
              <>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Subtotal Produk</span>
                  <span>
                    Rp {(order.subtotal || order.totalAmount).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-amber-700 text-[11px]">
                  <span>Potongan Cas Koperasi (Stan)</span>
                  <span>-Rp {order.adminFee.toLocaleString('id-ID')}</span>
                </div>
              </>
            ) : null}

            <div className="flex justify-between text-slate-800 font-bold text-sm pt-1 border-t border-dashed border-slate-300">
              <span>TOTAL</span>
              <span className="text-emerald-700">
                Rp {order.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Metode Bayar</span>
              <span className="font-semibold text-slate-700">{order.paymentMethod}</span>
            </div>

            {order.paymentMethod === 'CASH' && (
              <>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Uang Diterima</span>
                  <span>Rp {(order.cashTendered || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-semibold text-xs pt-1 border-t border-slate-200">
                  <span>Kembalian</span>
                  <span className="text-emerald-600 font-bold">
                    Rp {(order.changeAmount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            )}

            {order.notes && (
              <div className="pt-2 text-[11px] text-slate-500 italic">
                Catatan: "{order.notes}"
              </div>
            )}
          </div>

          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
            Terima kasih telah berbelanja di stand kami! 🙏
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={onNewTransaction}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
