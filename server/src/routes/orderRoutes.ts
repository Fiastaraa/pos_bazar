import { Router } from 'express';
import { orderController } from '../controllers/orderController';

const router = Router();

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);

export default router;
