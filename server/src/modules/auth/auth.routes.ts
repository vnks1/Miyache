import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import { authJWT } from '../../middlewares/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), (req, res) =>
  authController.register(req, res)
);

// POST /api/auth/login
router.post('/login', validate(loginSchema), (req, res) =>
  authController.login(req, res)
);

// GET /api/auth/me
router.get('/me', authJWT, (req, res) => authController.getMe(req, res));

export default router;
