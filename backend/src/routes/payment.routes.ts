import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { paymentController, createPaymentSchema } from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.get('/', paymentController.getMine);
router.post('/', validate(createPaymentSchema), paymentController.create);

export default router;
