import express from 'express';
import { Role } from '../../../generated/prisma/client';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/users', auth(Role.ADMIN), UserController.getAllUsers);

router.patch('/users/:id', auth(Role.ADMIN), UserController.updateUserStatus);

router.get('/rentals', auth(Role.ADMIN), UserController.getAllRentals);

router.get('/properties', auth(Role.ADMIN), UserController.getAllProperties);

export const UserRoutes = router;