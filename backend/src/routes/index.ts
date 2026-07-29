import { Router } from 'express';
import authRoutes from './auth.routes';
import doctorRoutes from './doctor.routes';
import appointmentRoutes from './appointment.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/payments', paymentRoutes);

export default router;
