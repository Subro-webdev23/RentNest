import express from 'express';
import { RentalRequestController } from './rentalRequest.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma/client';

const router = express.Router();

router.get('/landlord/rentals/', auth(Role.LANDLORD), RentalRequestController.getRequestsForLandlord);

router.patch('/landlord/rentals/:id', auth(Role.LANDLORD), RentalRequestController.updateRequestStatus);

router.post('/rentals', auth(Role.TENANT), RentalRequestController.createRentalRequest);

router.get('/rentals', auth(Role.TENANT), RentalRequestController.getRequestsForTenant);

router.get('/rentals/:id', auth(Role.TENANT), RentalRequestController.getRequestDetails);

export const LandlordRentalRequestRoutes = router;