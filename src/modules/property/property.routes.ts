import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PropertyController } from './property.controller';
import { RentalRequestController } from '../rentalRequest/rentalRequest.controller';

const router = Router();

router.post('/landlord/properties', auth('LANDLORD'), PropertyController.createProperty);

router.get('/properties', PropertyController.getAllProperties);

router.get('/landlord/properties/:id', PropertyController.getSingleProperty);

router.put('/landlord/properties/:id', auth('LANDLORD', 'ADMIN'), PropertyController.updateProperty);

router.delete('/landlord/properties/:id', auth('LANDLORD', 'ADMIN'), PropertyController.deleteProperty);

export const PropertyRoutes = router;