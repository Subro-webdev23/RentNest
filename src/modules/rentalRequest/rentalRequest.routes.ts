import express from 'express';
import { RentalRequestController } from './rentalRequest.controller';
import auth from '../../middlewares/auth';
import { Role } from '../../../generated/prisma/client';

const router = express.Router();

router.get('/', auth(Role.LANDLORD), RentalRequestController.getRequestsForLandlord);

router.patch('/:id', auth(Role.LANDLORD), RentalRequestController.updateRequestStatus);

export const LandlordRentalRequestRoutes = router;