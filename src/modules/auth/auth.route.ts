import express from 'express';
import auth from '../../middlewares/auth';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/refresh-token', AuthController.refreshToken);
router.post('/auth/change-password', auth('TENANT', 'LANDLORD', 'ADMIN'), AuthController.changePassword);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/me', auth(), AuthController.getMe);

export const AuthRoutes = router;