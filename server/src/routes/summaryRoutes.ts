import { Router } from 'express';
import { summaryController } from '../controllers/summaryController';

const router = Router();

router.get('/daily', summaryController.getDailySummary);
router.get('/export-excel', summaryController.exportExcel);

export default router;
