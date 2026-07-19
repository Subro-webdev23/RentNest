import { Router } from 'express';
import auth from '../../middlewares/auth';
import { PropertyController } from './property.controller';

const router = Router();

router.post('/', auth('LANDLORD'), PropertyController.createProperty);

router.get('/', PropertyController.getAllProperties);

router.get('/:id', PropertyController.getSingleProperty);

router.patch('/:id', auth('LANDLORD', 'ADMIN'), PropertyController.updateProperty);

router.delete('/:id', auth('LANDLORD', 'ADMIN'), PropertyController.deleteProperty);

export const PropertyRoutes = router;