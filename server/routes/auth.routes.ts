import express from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticateAdmin, authController.getMe);

export default router;
