import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  authController,
  loginSchema,
  refreshSchema,
  registerSchema,
} from '../controllers/auth.controller';

const router: Router = Router();

// Strict rate limiting on authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login/register attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiados intentos de autenticación. Por favor intente más tarde.' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
