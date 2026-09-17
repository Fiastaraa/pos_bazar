# 🛒 Sistem POS Kasir Stand Bazar

Aplikasi Kasir (Point of Sale) modern, sederhana, dan humanis yang dirancang khusus untuk operasional stan bazar makanan, minuman, dan camilan. Dibangun dengan pemisahan arsitektur yang bersih: **Frontend (Client)** dan **Backend (Server)**.

---

## 🏗️ Struktur Proyek

```
c:/koperasi/bazar/
├── client/                     # Frontend SPA
│   ├── src/
│   │   ├── components/         # Header, ProductCard, CartPanel, PaymentModal, ReceiptModal
│   │   ├── pages/              # PosPage (Layar Kasir), ProductsPage (Menu & Stok), SummaryPage (Omset)
│   │   ├── services/           # Axios API Client (api.ts)
│   │   ├── types/              # Definisi TypeScript
│   │   ├── App.tsx             # Root layout & tab switcher
│   │   └── main.tsx            # Entry point Vite
│   ├── package.json
│   ├── tailwind.config.js      # Styling Tailwind CSS
│   └── vite.config.ts          # Konfigurasi Vite & Proxy API
│
└── server/                     # Backend REST API
    ├── prisma/
    │   ├── schema.prisma       # Skema database PostgreSQL
    │   └── seed.ts             # Data awal menu bazar fiktif
    ├── src/
    │   ├── controllers/        # Request & Response handler
    │   ├── services/           # Logika bisnis transaksi & stok
    │   ├── routes/             # Endpoint REST API
    │   ├── lib/prisma.ts       # Singleton Prisma Client
    │   └── index.ts            # Entry point Express.js
    ├── .env                    # Konfigurasi PORT & DATABASE_URL
    ├── package.json
    └── tsconfig.json
```

---

## ⚡ Fitur Unggulan Bazar

1. **Layar Kasir Cepat (Touch / Keyboard Friendly)**:
   - Pencarian instan dan filter kategori (Minuman, Makanan, Camilan, Dessert).
   - Indikator stok real-time (Aman, Menipis, Habis).
   - Panel keranjang dengan pengaturan kuantitas, catatan khusus pembeli, dan input nama pembeli.
2. **Kalkulator Pembayaran & Kembalian Otomatis**:
   - Pilihan metode pembayaran: **Uang Tunai (Cash)**, **QRIS**, dan **Transfer Bank**.
   - Tombol cepat pecahan rupiah (Uang Pas, 10k, 20k, 50k, 100k).
   - Perhitungan kembalian otomatis & validasi uang kurang.
3. **Struk Digital & Cetak (Receipt)**:
   - Tampilan struk kasir profesional dengan nomor transaksi unik (`BZR-YYYYMMDD-XXXX`).
   - Tombol **Cetak Struk** (ramah printer thermal 80mm).
4. **Kelola Menu & Stok Stand**:
   - Tambah/edit harga jual, harga modal (HPP), dan stok.
   - Tombol restock cepat (+10, +50, -10).
5. **Laporan & Analitik Penjualan (BI-Friendly)**:
   - Total Omset Bazar & Volume Transaksi.
   - Nilai rata-rata per belanja (Average Order Value / AOV).
   - Top 5 menu paling laris (kuantitas dan kontribusi omset).
   - Distribusi metode pembayaran & peringatan stok menipis.

---

## 🚀 Cara Menjalankan

### 1. Konfigurasi Database (PostgreSQL)

Buka file [server/.env](file:///c:/koperasi/bazar/server/.env) dan sesuaikan URL koneksi PostgreSQL Anda:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/bazar_pos?schema=public"
```

*(Jika menggunakan Supabase atau Neon DB, cukup salin connection string postgres ke `DATABASE_URL`)*.

### 2. Migrasi Tabel & Seed Data Awal

Masuk ke folder `server` dan jalankan:

```bash
cd server
bun run prisma:push    # atau: npx prisma db push
bun run prisma:seed    # atau: npx prisma db seed
```

> **Catatan**: Script `prisma:seed` akan otomatis menambahkan menu fiktif bazar yang siap langsung dites (Es Teh Manis Jumbo, Kopi Susu Aren, Dimsum Mentai, Sosis Bakar, dll).

### 3. Menjalankan Backend Server

```bash
cd server
bun run dev            # Berjalan di http://localhost:5000
```

### 4. Menjalankan Frontend Client

Buka terminal baru:

```bash
cd client
bun run dev            # Berjalan di http://localhost:3000
```

Buka browser di **`http://localhost:3000`**.

---

## 🧪 Validasi Build

- **Backend Build**: `bun run build` (lulus verifikasi TypeScript tanpa error)
- **Frontend Build**: `bun run build` (lulus verifikasi Vite + Tailwind tanpa error)
