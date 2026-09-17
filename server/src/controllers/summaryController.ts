import { Request, Response } from 'express';
import { summaryService } from '../services/summaryService';

export const summaryController = {
  // GET /api/summary/daily
  async getDailySummary(req: Request, res: Response) {
    try {
      const summary = await summaryService.getDailySummary();
      return res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/summary/export-excel
  async exportExcel(req: Request, res: Response) {
    try {
      const { excelService } = await import('../services/excelService');
      const workbook = await excelService.generateSalesWorkbook();

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `Laporan-Penjualan-Bazar-${dateStr}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error('Export Excel Error:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengunduh file Excel: ' + error.message });
    }
  },
};
