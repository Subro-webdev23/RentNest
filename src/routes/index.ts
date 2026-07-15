import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  // Next: /users, /properties, /rental-requests, /payments, /reviews
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;