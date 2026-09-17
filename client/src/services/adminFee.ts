/**
 * Menghitung Biaya Wajib / Admin Koperasi per unit barang:
 * Aturan kelipatan Rp 10.000 = Rp 500 per barang
 * - Rp 1 s/d Rp 10.000      -> Rp 500
 * - Rp 10.001 s/d Rp 20.000 -> Rp 1.000
 * - Rp 20.001 s/d Rp 30.000 -> Rp 1.500
 * - dst.
 */
export const calculateAdminFeePerUnit = (price: number): number => {
  const p = Math.round(price || 0);
  if (p <= 0) return 0;
  return Math.ceil(p / 10000) * 500;
};
