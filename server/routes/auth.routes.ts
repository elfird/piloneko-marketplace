import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authenticateAdmin } from '../middlewares/auth.middleware';

// --- Manual Dependency Injection Setup ---
const authService = new AuthService();
const authController = new AuthController(authService);
// -----------------------------------------

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticateAdmin, authController.getMe);

export default router;
