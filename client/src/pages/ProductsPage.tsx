import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, PackagePlus, AlertCircle, Search, RefreshCw, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { Product, Category } from '../types';
import { productService, uploadService } from '../services/api';
import { calculateAdminFeePerUnit } from '../services/adminFee';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCostPrice, setFormCostPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(100);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formError, setFormError] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const prodRes = await productService.getAll();
      setProducts(prodRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    const defaultPrice = 15000;
    setFormPrice(defaultPrice);
    setFormCostPrice(calculateAdminFeePerUnit(defaultPrice));
    setFormStock(50);
    setFormImageUrl('');
    setSelectedFile(null);
    setPreviewUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(p.price);
    setFormCostPrice(calculateAdminFeePerUnit(p.price));
    setFormStock(p.stock);
    setFormImageUrl(p.imageUrl || '');
    setSelectedFile(null);
    setPreviewUrl(p.imageUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran file gambar maksimal 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Nama produk harus diisi');
      return;
    }
    if (formPrice <= 0) {
      setFormError('Harga jual harus lebih dari 0');
      return;
    }

    try {
      setIsUploading(true);

      // Jika ada file gambar baru yang dipilih, upload terlebih dahulu ke server
      let finalImageUrl = formImageUrl;
      if (selectedFile) {
        finalImageUrl = await uploadService.uploadImage(selectedFile);
      } else if (!previewUrl) {
        finalImageUrl = '';
      }

      const payload = {
        name: formName.trim(),
        price: formPrice,
        costPrice: formCostPrice > 0 ? formCostPrice : undefined,
        stock: formStock,
        imageUrl: finalImageUrl.trim() || undefined,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
      } else {
        await productService.create(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menyimpan produk');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickRestock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      await productService.updateStock(product.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      console.error('Gagal update stok:', err);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus menu "${name}"?`)) return;
    try {
      await productService.delete(id);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus produk yang sudah ada riwayat order.');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Menu & Stok Stand Bazar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur harga jual, harga modal, dan update sisa stok secara langsung
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Muat ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama menu atau kategori..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Table of Products */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Menu / Produk</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">Biaya Cas Wajib</th>
                <th className="py-3 px-4">Sisa Stok</th>
                <th className="py-3 px-4">Restock Cepat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat daftar menu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                        <PackagePlus className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">Belum ada menu yang terdaftar</p>
                      <p className="text-xs text-slate-400">Database menu kosong. Silakan tambahkan menu stan bazar Anda.</p>
                      <button
                        onClick={openAddModal}
                        className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Menu Sekarang</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                            {prod.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{prod.name}</div>
                          <div className="text-[10px] text-slate-400">ID #{prod.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      <div>Rp {Math.round(prod.price).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                        Rp {calculateAdminFeePerUnit(prod.price).toLocaleString('id-ID')} / unit
                      </span>
                      <div className="text-[10.5px] text-slate-400 mt-0.5 font-medium">
                        Bersih stan: Rp {(Math.round(prod.price) - calculateAdminFeePerUnit(prod.price)).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          prod.stock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : prod.stock <= 10
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {prod.stock} unit
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleQuickRestock(prod, -10)}
                          disabled={prod.stock <= 0}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] disabled:opacity-40"
                          title="Kurang 10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleQuickRestock(prod, 10)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px]"
                          title="Tambah 10"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleQuickRestock(prod, 50)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px]"
                          title="Tambah 50"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-800">
                {editingProduct ? 'Edit Menu Bazar' : 'Tambah Menu Bazar Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Menu:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Misal: Es Jeruk Peras Murni"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>



              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Harga Jual (Rp):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={formPrice || ''}
                    onChange={(e) => {
                      const newPrice = e.target.value === '' ? 0 : Math.round(Number(e.target.value));
                      setFormPrice(newPrice);
                      setFormCostPrice(calculateAdminFeePerUnit(newPrice));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-tight">
                    Harga otomatis dibulatkan (tanpa desimal).
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Biaya Cas Wajib (Rp):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      readOnly
                      value={formCostPrice}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold cursor-not-allowed select-none"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-[10.5px] text-amber-700 font-medium mt-1 leading-tight">
                    Dipotong dari hasil jual (Stan terima bersih: Rp {Math.max(0, formPrice - formCostPrice).toLocaleString('id-ID')}).
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Stok Awal:
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formStock || ''}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Foto Menu Stand Bazar:
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5 flex items-center space-x-3">
                    <img
                      src={previewUrl}
                      alt="Preview Foto"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-slate-800 truncate">
                        {selectedFile ? selectedFile.name : 'Foto Menu Terpilih'}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        {selectedFile
                          ? `${(selectedFile.size / 1024).toFixed(1)} KB (Siap diunggah)`
                          : 'Foto aktif'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                        >
                          Ganti Foto
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-bold hover:underline"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-1.5 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      <UploadCloud className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="font-bold text-xs text-slate-700 group-hover:text-emerald-700 transition-colors">
                      Klik untuk pilih foto dari perangkat
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Mendukung format JPG, PNG, WEBP (Maksimal 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-200 transition-all disabled:opacity-50"
                >
                  {isUploading ? 'Mengunggah & Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
