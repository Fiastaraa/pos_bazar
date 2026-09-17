import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma';

export const excelService = {
  /**
   * Menghasilkan file Excel (.xlsx) dengan 3 sheet terstruktur:
   * 1. "Ringkasan Eksekutif" -> Ringkasan KPI, omset, breakdown pembayaran & best sellers.
   * 2. "Rincian Transaksi" -> Level header order (per nota/transaksi).
   * 3. "Data Detail Item (Pivot Ready)" -> Level granular item tanpa merge cell, siap untuk Pivot Table / BI Analysis.
   */
  async generateSalesWorkbook(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem POS Kasir Bazar';
    workbook.created = new Date();

    // 1. Ambil seluruh data transaksi lengkap dari database
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Gaya warna standar (Emerald Palette untuk tema Bazar)
    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF15803D' }, // Emerald 700
    };

    const headerFont: Partial<ExcelJS.Font> = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    const subHeaderFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDCFCE7' }, // Emerald 100
    };

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };

    // =========================================================================
    // SHEET 1: RINGKASAN EKSEKUTIF
    // =========================================================================
    const wsSummary = workbook.addWorksheet('Ringkasan Eksekutif', {
      views: [{ showGridLines: true }],
    });

    // Judul Laporan
    wsSummary.mergeCells('B2:F2');
    const titleCell = wsSummary.getCell('B2');
    titleCell.value = 'LAPORAN REKAPITULASI PENJUALAN BAZAR';
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF166534' } };

    wsSummary.getCell('B3').value = `Waktu Penarikan Data: ${new Date().toLocaleString('id-ID')}`;
    wsSummary.getCell('B3').font = { italic: true, color: { argb: 'FF64748B' }, size: 10 };

    // Hitung Metrik Utama
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSubtotal = orders.reduce((sum, o) => sum + (o.subtotal || o.totalAmount), 0);
    const totalAdminFee = orders.reduce((sum, o) => sum + (o.adminFee || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );

    // Tabel KPI Utama
    wsSummary.getCell('B5').value = 'METRIK UTAMA (KPI)';
    wsSummary.getCell('B5').font = { bold: true, color: { argb: 'FF1E293B' }, size: 12 };

    const kpiData = [
      ['Total Penerimaan Kasir (Omset)', totalRevenue, '"Rp "#,##0'],
      ['Total Cas Wajib (Koperasi)', totalAdminFee, '"Rp "#,##0'],
      ['Total Pendapatan Bersih Stan', totalRevenue - totalAdminFee, '"Rp "#,##0'],
      ['Total Transaksi Selesai', totalOrders, '#,##0" Transaksi"'],
      ['Rata-rata Nilai Belanja (AOV)', aov, '"Rp "#,##0'],
      ['Total Produk Terjual', totalItemsSold, '#,##0" Porsi/Unit"'],
    ];

    let currentKpiRow = 6;
    kpiData.forEach(([label, val, fmt]) => {
      const row = wsSummary.getRow(currentKpiRow);
      row.getCell(2).value = label as string;
      row.getCell(2).font = { bold: true };
      row.getCell(2).border = thinBorder;
      row.getCell(2).fill = subHeaderFill;

      row.getCell(3).value = val as number;
      row.getCell(3).numFmt = fmt as string;
      row.getCell(3).font = { bold: true, size: 11 };
      row.getCell(3).border = thinBorder;
      currentKpiRow++;
    });

    // Breakdown Metode Pembayaran
    const payMap = new Map<string, { count: number; total: number }>();
    orders.forEach((o) => {
      const existing = payMap.get(o.paymentMethod) || { count: 0, total: 0 };
      payMap.set(o.paymentMethod, {
        count: existing.count + 1,
        total: existing.total + o.totalAmount,
      });
    });

    const paymentStartRow = currentKpiRow + 2;
    wsSummary.getCell(`B${paymentStartRow}`).value = 'DISTRIBUSI METODE PEMBAYARAN';
    wsSummary.getCell(`B${paymentStartRow}`).font = { bold: true, color: { argb: 'FF1E293B' }, size: 12 };

    const payHeaderRow = wsSummary.getRow(paymentStartRow + 1);
    payHeaderRow.values = ['', 'Metode Pembayaran', 'Jumlah Transaksi', 'Total Nominal', 'Kontribusi (%)'];
    for (let c = 2; c <= 5; c++) {
      const cell = payHeaderRow.getCell(c);
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center' };
    }

    let payRowIdx = paymentStartRow + 2;
    payMap.forEach((val, method) => {
      const r = wsSummary.getRow(payRowIdx);
      const label = method === 'CASH' ? 'Uang Tunai (Cash)' : method;
      r.getCell(2).value = label;
      r.getCell(2).border = thinBorder;

      r.getCell(3).value = val.count;
      r.getCell(3).numFmt = '#,##0';
      r.getCell(3).alignment = { horizontal: 'center' };
      r.getCell(3).border = thinBorder;

      r.getCell(4).value = val.total;
      r.getCell(4).numFmt = '"Rp "#,##0';
      r.getCell(4).border = thinBorder;

      r.getCell(5).value = totalRevenue > 0 ? val.total / totalRevenue : 0;
      r.getCell(5).numFmt = '0.0%';
      r.getCell(5).alignment = { horizontal: 'center' };
      r.getCell(5).border = thinBorder;
      payRowIdx++;
    });

    // Top 10 Menu Paling Laris
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = item.product;
        const key = prod.name;
        const existing = itemMap.get(key) || {
          name: prod.name,
          qty: 0,
          revenue: 0,
        };
        itemMap.set(key, {
          ...existing,
          qty: existing.qty + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });
    });

    const sortedItems = Array.from(itemMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const topStartRow = payRowIdx + 2;
    wsSummary.getCell(`B${topStartRow}`).value = 'PRODUK TERLARIS (TOP 10 BEST SELLERS)';
    wsSummary.getCell(`B${topStartRow}`).font = { bold: true, color: { argb: 'FF1E293B' }, size: 12 };

    const topHeader = wsSummary.getRow(topStartRow + 1);
    topHeader.values = ['', 'Peringkat', 'Nama Menu', 'Kuantitas Terjual', 'Total Omset Produk'];
    for (let c = 2; c <= 5; c++) {
      const cell = topHeader.getCell(c);
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center' };
    }

    let topRowIdx = topStartRow + 2;
    sortedItems.forEach((item, idx) => {
      const r = wsSummary.getRow(topRowIdx);
      r.getCell(2).value = idx + 1;
      r.getCell(2).alignment = { horizontal: 'center' };
      r.getCell(2).border = thinBorder;

      r.getCell(3).value = item.name;
      r.getCell(3).border = thinBorder;

      r.getCell(4).value = item.qty;
      r.getCell(4).numFmt = '#,##0" unit"';
      r.getCell(4).alignment = { horizontal: 'center' };
      r.getCell(4).border = thinBorder;

      r.getCell(5).value = item.revenue;
      r.getCell(5).numFmt = '"Rp "#,##0';
      r.getCell(5).border = thinBorder;
      topRowIdx++;
    });

    wsSummary.getColumn('B').width = 30;
    wsSummary.getColumn('C').width = 22;
    wsSummary.getColumn('D').width = 20;
    wsSummary.getColumn('E').width = 20;
    wsSummary.getColumn('F').width = 24;

    // =========================================================================
    // SHEET 2: RINCIAN TRANSAKSI (Order Level)
    // =========================================================================
    const wsOrders = workbook.addWorksheet('Rincian Transaksi', {
      views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }],
    });

    wsOrders.columns = [
      { header: 'No. Transaksi', key: 'orderNumber', width: 22 },
      { header: 'Tanggal', key: 'date', width: 14 },
      { header: 'Waktu (WIB)', key: 'time', width: 14 },
      { header: 'Nama Pelanggan', key: 'customerName', width: 20 },
      { header: 'Metode Bayar', key: 'paymentMethod', width: 16 },
      { header: 'Subtotal Produk', key: 'subtotal', width: 18 },
      { header: 'Biaya Admin', key: 'adminFee', width: 16 },
      { header: 'Total Belanja', key: 'totalAmount', width: 18 },
      { header: 'Uang Diterima', key: 'cashTendered', width: 18 },
      { header: 'Kembalian', key: 'changeAmount', width: 16 },
      { header: 'Jumlah Item', key: 'itemCount', width: 14 },
      { header: 'Catatan Pesanan', key: 'notes', width: 30 },
    ];

    // Format Header Row Sheet 2
    const orderHeaderRow = wsOrders.getRow(1);
    orderHeaderRow.height = 26;
    orderHeaderRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      const subtotalVal = o.subtotal != null ? o.subtotal : (o.totalAmount - (o.adminFee || 0));
      const adminFeeVal = o.adminFee || 0;

      const row = wsOrders.addRow({
        orderNumber: o.orderNumber,
        date: orderDate.toLocaleDateString('id-ID'),
        time: orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        customerName: o.customerName || 'Umum',
        paymentMethod: o.paymentMethod,
        subtotal: subtotalVal,
        adminFee: adminFeeVal,
        totalAmount: o.totalAmount,
        cashTendered: o.cashTendered || o.totalAmount,
        changeAmount: o.changeAmount || 0,
        itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
        notes: o.notes || '-',
      });

      row.getCell('subtotal').numFmt = '"Rp "#,##0';
      row.getCell('adminFee').numFmt = '"Rp "#,##0';
      row.getCell('totalAmount').numFmt = '"Rp "#,##0';
      row.getCell('cashTendered').numFmt = '"Rp "#,##0';
      row.getCell('changeAmount').numFmt = '"Rp "#,##0';
      row.getCell('itemCount').numFmt = '#,##0';

      row.getCell('orderNumber').alignment = { horizontal: 'center' };
      row.getCell('date').alignment = { horizontal: 'center' };
      row.getCell('time').alignment = { horizontal: 'center' };
      row.getCell('paymentMethod').alignment = { horizontal: 'center' };
      row.getCell('itemCount').alignment = { horizontal: 'center' };

      row.eachCell((c) => (c.border = thinBorder));
    });

    // Total Row Formula untuk Sheet 2
    if (orders.length > 0) {
      const totalRowIndex = orders.length + 2;
      const totalRow = wsOrders.getRow(totalRowIndex);
      totalRow.getCell('customerName').value = 'TOTAL KESELURUHAN:';
      totalRow.getCell('customerName').font = { bold: true };
      totalRow.getCell('customerName').alignment = { horizontal: 'right' };

      totalRow.getCell('subtotal').value = { formula: `SUM(F2:F${totalRowIndex - 1})` };
      totalRow.getCell('subtotal').numFmt = '"Rp "#,##0';
      totalRow.getCell('subtotal').font = { bold: true };

      totalRow.getCell('adminFee').value = { formula: `SUM(G2:G${totalRowIndex - 1})` };
      totalRow.getCell('adminFee').numFmt = '"Rp "#,##0';
      totalRow.getCell('adminFee').font = { bold: true };

      totalRow.getCell('totalAmount').value = { formula: `SUM(H2:H${totalRowIndex - 1})` };
      totalRow.getCell('totalAmount').numFmt = '"Rp "#,##0';
      totalRow.getCell('totalAmount').font = { bold: true };

      totalRow.getCell('itemCount').value = { formula: `SUM(K2:K${totalRowIndex - 1})` };
      totalRow.getCell('itemCount').numFmt = '#,##0';
      totalRow.getCell('itemCount').font = { bold: true };
      totalRow.getCell('itemCount').alignment = { horizontal: 'center' };

      totalRow.eachCell((c) => {
        c.fill = subHeaderFill;
        c.border = thinBorder;
      });
    }

    // =========================================================================
    // SHEET 3: DATA DETAIL ITEM (PIVOT READY / GRANULAR)
    // =========================================================================
    // Catatan untuk BI Analyst:
    // Format tabular bersih tanpa baris kosong atau merged cells,
    // sangat ideal untuk Pivot Table (analisis penjualan per kategori, per jam, per menu).
    const wsItems = workbook.addWorksheet('Data Detail Item (Pivot Ready)', {
      views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }],
    });

    wsItems.columns = [
      { header: 'No. Transaksi', key: 'orderNumber', width: 22 },
      { header: 'Tanggal', key: 'date', width: 14 },
      { header: 'Waktu', key: 'time', width: 12 },
      { header: 'Nama Pelanggan', key: 'customerName', width: 20 },
      { header: 'Nama Menu', key: 'productName', width: 28 },
      { header: 'Harga Satuan (Rp)', key: 'price', width: 18 },
      { header: 'Kuantitas (Qty)', key: 'quantity', width: 16 },
      { header: 'Subtotal Produk (Rp)', key: 'subtotal', width: 20 },
      { header: 'Biaya Admin/Unit (Rp)', key: 'adminPerUnit', width: 20 },
      { header: 'Total Admin Item (Rp)', key: 'totalItemAdmin', width: 20 },
      { header: 'Metode Pembayaran', key: 'paymentMethod', width: 18 },
    ];

    const itemsHeaderRow = wsItems.getRow(1);
    itemsHeaderRow.height = 26;
    itemsHeaderRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    orders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      o.items.forEach((item) => {
        const adminPerUnit = item.price > 0 ? Math.ceil(item.price / 10000) * 500 : 0;
        const totalItemAdmin = adminPerUnit * item.quantity;

        const row = wsItems.addRow({
          orderNumber: o.orderNumber,
          date: orderDate.toLocaleDateString('id-ID'),
          time: orderDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          customerName: o.customerName || 'Umum',
          productName: item.product.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          adminPerUnit,
          totalItemAdmin,
          paymentMethod: o.paymentMethod,
        });

        row.getCell('price').numFmt = '#,##0';
        row.getCell('quantity').numFmt = '#,##0';
        row.getCell('subtotal').numFmt = '#,##0';
        row.getCell('adminPerUnit').numFmt = '#,##0';
        row.getCell('totalItemAdmin').numFmt = '#,##0';

        row.getCell('orderNumber').alignment = { horizontal: 'center' };
        row.getCell('date').alignment = { horizontal: 'center' };
        row.getCell('time').alignment = { horizontal: 'center' };
        row.getCell('quantity').alignment = { horizontal: 'center' };
        row.getCell('adminPerUnit').alignment = { horizontal: 'center' };
        row.getCell('paymentMethod').alignment = { horizontal: 'center' };

        row.eachCell((c) => (c.border = thinBorder));
      });
    });

    return workbook;
  },
};
