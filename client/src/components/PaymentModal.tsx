import React, { useState } from 'react';
import { X, Banknote, QrCode, CreditCard, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { calculateAdminFeePerUnit } from '../services/adminFee';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  customerName: string;
  notes: string;
  onSubmitOrder: (payload: {
    paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
    cashTendered?: number;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  customerName,
  notes,
  onSubmitOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const subtotalProducts = cart.reduce(
    (acc, item) => acc + Math.round(item.product.price) * item.quantity,
    0
  );
  const adminFee = cart.reduce(
    (acc, item) => acc + item.quantity * calculateAdminFeePerUnit(item.product.price),
    0
  );
  // Pembeli membayar harga produk murni
  const totalAmount = subtotalProducts;

  // Pilihan uang pecahan cepat (standar kasir rupiah di Indonesia)
  const quickCashOptions = [
    { label: 'Uang Pas', value: totalAmount },
    { label: 'Rp 10.000', value: 10000 },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
  ];

  const changeAmount = cashTendered > 0 ? cashTendered - totalAmount : 0;
  const isCashInsufficient = paymentMethod === 'CASH' && cashTendered < totalAmount;

  const handlePay = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      if (paymentMethod === 'CASH' && cashTendered < totalAmount) {
        setErrorMessage('Nominal uang tunai yang diserahkan masih kurang.');
        setLoading(false);
        return;
      }

      await onSubmitOrder({
        paymentMethod,
        cashTendered: paymentMethod === 'CASH' ? cashTendered : totalAmount,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Pembayaran Kasir Bazar</h3>
            <p className="text-xs text-slate-500">Pilih metode & selesaikan transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Total Tagihan Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-inner flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">TOTAL PEMBAYARAN</span>
              <div className="text-3xl font-extrabold tracking-tight mt-1 text-emerald-400">
                Rp {totalAmount.toLocaleString('id-ID')}
              </div>
              {customerName && (
                <div className="text-xs text-slate-300 mt-1">Pembeli: {customerName}</div>
              )}
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>{cart.length} Jenis Produk</div>
              {adminFee > 0 && (
                <div className="text-amber-300 font-medium text-[11px] bg-white/10 px-2 py-0.5 rounded-md">
                  Potongan Cas Stan: Rp {adminFee.toLocaleString('id-ID')}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('CASH');
                  setCashTendered(totalAmount);
                }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Uang Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span className="text-xs">QRIS Stand</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 font-bold shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* CASH Specific Controls */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Uang Diterima dari Pembeli:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                  Pilihan Cepat Nominal:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickCashOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setCashTendered(opt.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold text-slate-700 transition-all shadow-2xs active:scale-95"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kembalian Display */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Uang Kembalian:</span>
                <span
                  className={`text-xl font-extrabold ${
                    changeAmount < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {changeAmount < 0
                    ? `Kurang Rp ${Math.abs(changeAmount).toLocaleString('id-ID')}`
                    : `Rp ${changeAmount.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
          )}

          {/* QRIS / Transfer Instructions */}
          {paymentMethod === 'QRIS' && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                <QrCode className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold text-indigo-900">
                Arahkan pembeli untuk scan QRIS Stand Bazar
              </p>
              <p className="text-[11px] text-indigo-700">
                Pastikan nominal Rp {totalAmount.toLocaleString('id-ID')} telah sukses terverifikasi di aplikasi kasir/bank.
              </p>
            </div>
          )}

          {paymentMethod === 'TRANSFER' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <CreditCard className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold text-amber-900">
                Verifikasi Bukti Transfer Bank
              </p>
              <p className="text-[11px] text-amber-700">
                Cek mutasi rekening masuk sebesar Rp {totalAmount.toLocaleString('id-ID')}.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={loading || isCashInsufficient}
            onClick={handlePay}
            className={`flex-2 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${
              loading || isCashInsufficient
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-[0.99]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Memproses...' : 'Selesaikan Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
